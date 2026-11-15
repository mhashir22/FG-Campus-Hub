import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, PenLine } from "lucide-react";
import heroImg from "@/assets/campus-hero.jpg";
import { Button } from "@/components/ui/button";
import { EmptyState, EventCard, PostCard } from "@/components/campus-cards";
import { eventsQuery, postsQuery, splitEvents } from "@/lib/campus-queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Hub — FG Degree College Wah Cantt" },
      {
        name: "description",
        content: "Upcoming events and the latest stories from FG Degree College Wah Cantt, all in one place.",
      },
      { property: "og:title", content: "Campus Hub — FG Degree College Wah Cantt" },
      {
        property: "og:description",
        content: "Upcoming events and the latest stories from FG Degree College Wah Cantt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(eventsQuery),
      context.queryClient.ensureQueryData(postsQuery),
    ]),
  component: Home,
});

function Home() {
  const { data: events } = useSuspenseQuery(eventsQuery);
  const { data: posts } = useSuspenseQuery(postsQuery);
  const { upcoming } = splitEvents(events);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="FG Degree College Wah Cantt main building"
          width={1600}
          height={912}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="mx-auto flex min-h-[460px] max-w-6xl flex-col justify-end px-4 pb-12 pt-24 text-forest-foreground sm:min-h-[540px]">
          <p className="animate-rise text-sm font-semibold uppercase tracking-[0.2em] opacity-85">
            FG Degree College · Wah Cantt
          </p>
          <h1 className="animate-rise mt-3 max-w-2xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Everything happening on campus.
          </h1>
          <p className="animate-rise mt-4 max-w-lg text-base opacity-90 sm:text-lg">
            Track upcoming events and read the latest news and stories from our college.
          </p>
          <div className="animate-rise mt-6 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/events">
                <CalendarDays /> See events
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="lg">
              <Link to="/blog">
                <PenLine /> Read the blog
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <SectionHead title="Upcoming events" to="/events" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {upcoming.slice(0, 4).map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
        {upcoming.length === 0 && <EmptyState>No upcoming events yet. Check back soon.</EmptyState>}
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <SectionHead title="Latest from the blog" to="/blog" />
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
        {posts.length === 0 && <EmptyState>No blog posts yet.</EmptyState>}
      </section>
    </>
  );
}

function SectionHead({ title, to }: { title: string; to: "/events" | "/blog" }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
      <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        View all <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
