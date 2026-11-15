import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type CampusEvent = Database["public"]["Tables"]["events"]["Row"];
export type BlogPost = Database["public"]["Tables"]["posts"]["Row"] & { cover_src: string | null };

export const COVER_BUCKET = "blog-covers";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// Covers are either bundled images ("/images/...") or files in the private covers bucket.
async function withCovers(
  sb: ReturnType<typeof publicClient>,
  rows: Database["public"]["Tables"]["posts"]["Row"][],
): Promise<BlogPost[]> {
  const storagePaths = rows
    .map((r) => r.cover_url)
    .filter((c): c is string => !!c && !c.startsWith("/") && !c.startsWith("http"));
  const signed = new Map<string, string>();
  if (storagePaths.length) {
    const { data } = await sb.storage
      .from(COVER_BUCKET)
      .createSignedUrls(storagePaths, 60 * 60 * 24 * 7);
    const serverUrl = (process.env["SUPABASE_URL"] ?? "").replace(/\/+$/, "");
    const browserUrl = (import.meta.env["VITE_SUPABASE_URL"] ?? serverUrl).replace(/\/+$/, "");
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) {
        signed.set(item.path, item.signedUrl.replace(serverUrl, browserUrl));
      }
    }
  }
  return rows.map((r) => ({
    ...r,
    cover_src: r.cover_url
      ? r.cover_url.startsWith("/") || r.cover_url.startsWith("http")
        ? r.cover_url
        : (signed.get(r.cover_url) ?? null)
      : null,
  }));
}

export const listEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("posts").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return withCovers(sb, data ?? []);
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb.from("posts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const [post] = await withCovers(sb, [row]);
    return post;
  });
