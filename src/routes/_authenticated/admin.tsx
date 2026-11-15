import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CalendarPlus, ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/campus-cards";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { COVER_BUCKET } from "@/lib/campus.functions";
import { EVENT_CATEGORIES, eventsQuery, postsQuery } from "@/lib/campus-queries";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Campus Hub" },
      { name: "description", content: "Manage Campus Hub events and blog posts." },
      { property: "og:title", content: "Admin — Campus Hub" },
      { property: "og:description", content: "Manage Campus Hub events and blog posts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading, user } = useAuth();

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Loading…</div>;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Admins only</h1>
        <p className="mt-2 text-muted-foreground">
          You're signed in as {user?.email}, but this account can't add events or posts. Ask a college admin
          for access.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Admin dashboard</h1>
      <p className="mt-1 text-muted-foreground">Add events and publish blog posts for the whole college.</p>
      <Tabs defaultValue="events" className="mt-6">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="posts">Blog posts</TabsTrigger>
        </TabsList>
        <TabsContent value="events" className="mt-6">
          <EventsAdmin />
        </TabsContent>
        <TabsContent value="posts" className="mt-6">
          <PostsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const panel = "rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6";
const selectCls =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function EventsAdmin() {
  const qc = useQueryClient();
  const { data: events = [] } = useQuery(eventsQuery);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", location: "", category: "General", starts_at: "" });

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("events").insert({
      ...form,
      starts_at: new Date(form.starts_at).toISOString(),
      created_by: u.user?.id ?? null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Event added");
    setForm({ title: "", description: "", location: "", category: "General", starts_at: "" });
    qc.invalidateQueries({ queryKey: ["events"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Event deleted");
    qc.invalidateQueries({ queryKey: ["events"] });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className={`${panel} grid gap-4 sm:grid-cols-2`}>
        <h2 className="flex items-center gap-2 text-xl font-semibold sm:col-span-2">
          <CalendarPlus className="size-5 text-primary" /> New event
        </h2>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ev-title">Title</Label>
          <Input id="ev-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-date">Date & time</Label>
          <Input
            id="ev-date"
            type="datetime-local"
            required
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-cat">Category</Label>
          <select
            id="ev-cat"
            className={selectCls}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ev-loc">Location</Label>
          <Input
            id="ev-loc"
            placeholder="e.g. Main Hall"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ev-desc">Description</Label>
          <Textarea
            id="ev-desc"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <Button type="submit" disabled={busy} className="sm:col-span-2 sm:justify-self-start">
          {busy ? "Saving…" : "Add event"}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">All events ({events.length})</h2>
        {events.map((ev) => (
          <EventCard
            key={ev.id}
            event={ev}
            action={
              <Button size="icon" variant="ghost" aria-label={`Delete ${ev.title}`} onClick={() => remove(ev.id)}>
                <Trash2 className="text-destructive" />
              </Button>
            }
          />
        ))}
      </div>
    </div>
  );
}

function PostsAdmin() {
  const qc = useQueryClient();
  const { data: posts = [] } = useQuery(postsQuery);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const preview = file ? URL.createObjectURL(file) : null;

  async function publish(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      let cover_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `posts/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from(COVER_BUCKET).upload(path, file, {
          contentType: file.type,
        });
        if (upErr) throw upErr;
        cover_url = path;
      }
      const { error } = await supabase.from("posts").insert({
        title,
        content,
        cover_url,
        author_name: author.trim() || "Campus Hub Team",
        created_by: u.user?.id ?? null,
      });
      if (error) throw error;
      toast.success("Post published");
      setTitle("");
      setContent("");
      setAuthor("");
      setFile(null);
      qc.invalidateQueries({ queryKey: ["posts"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, cover: string | null) {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (cover && !cover.startsWith("/") && !cover.startsWith("http")) {
      await supabase.storage.from(COVER_BUCKET).remove([cover]);
    }
    toast.success("Post deleted");
    qc.invalidateQueries({ queryKey: ["posts"] });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={publish} className={`${panel} space-y-4`}>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Upload className="size-5 text-primary" /> New blog post
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="p-title">Title</Label>
          <Input id="p-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-author">Author</Label>
          <Input
            id="p-author"
            placeholder="Campus Hub Team"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-cover">Cover photo</Label>
          <label
            htmlFor="p-cover"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border bg-muted/50 text-sm text-muted-foreground hover:bg-muted"
          >
            {preview ? (
              <img src={preview} alt="Cover preview" className="aspect-[16/9] w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 py-8">
                <ImagePlus className="size-6" /> Choose an image (max 5 MB)
              </span>
            )}
          </label>
          <input
            id="p-cover"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 5 * 1024 * 1024) {
                toast.error("Image must be under 5 MB");
                return;
              }
              setFile(f);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-content">Story</Label>
          <Textarea id="p-content" required rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Publishing…" : "Publish post"}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">All posts ({posts.length})</h2>
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 shadow-card">
            {p.cover_src ? (
              <img src={p.cover_src} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="size-16 shrink-0 rounded-lg bg-secondary" />
            )}
            <div className="min-w-0 flex-1">
              <Link to="/blog/$id" params={{ id: p.id }} className="font-semibold hover:text-primary">
                {p.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {fmtDate(p.created_at)} · {p.author_name}
              </p>
            </div>
            <Button size="icon" variant="ghost" aria-label={`Delete ${p.title}`} onClick={() => remove(p.id, p.cover_url)}>
              <Trash2 className="text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
