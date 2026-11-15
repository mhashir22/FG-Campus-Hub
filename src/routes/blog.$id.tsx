import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { postQuery } from "@/lib/campus-queries";
import { excerpt, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/blog/$id")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(postQuery(params.id));
    if (!post) throw notFound();
    return { title: post.title, description: excerpt(post.content, 150) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Campus Hub` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Post unavailable — Campus Hub" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">Post not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">
        Back to the blog
      </Link>
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(id));
  if (!post) return null;
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="size-4" /> All posts
      </Link>
      <p className="mt-6 text-sm text-muted-foreground">
        {fmtDate(post.created_at)} · {post.author_name}
      </p>
      <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
      {post.cover_src && (
        <img src={post.cover_src} alt="" className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover shadow-card" />
      )}
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground/90">
        {post.content.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}
