import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { EmptyState, PostCard } from "@/components/campus-cards";
import { postsQuery } from "@/lib/campus-queries";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Campus Hub, FG Degree College Wah Cantt" },
      { name: "description", content: "News, achievements and stories from FG Degree College Wah Cantt." },
      { property: "og:title", content: "Campus Blog — FG Degree College Wah Cantt" },
      { property: "og:description", content: "News, achievements and stories from our college." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: BlogPage,
});

function BlogPage() {
  const { data: posts } = useSuspenseQuery(postsQuery);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold sm:text-4xl">Campus blog</h1>
      <p className="mt-2 text-muted-foreground">News, achievements and stories from our college.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      {posts.length === 0 && <EmptyState>No blog posts yet.</EmptyState>}
    </div>
  );
}
