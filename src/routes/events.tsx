import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState, EventCard } from "@/components/campus-cards";
import { EVENT_CATEGORIES, eventsQuery, splitEvents } from "@/lib/campus-queries";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Campus Hub, FG Degree College Wah Cantt" },
      { name: "description", content: "Upcoming and past events at FG Degree College Wah Cantt." },
      { property: "og:title", content: "Campus Events — FG Degree College Wah Cantt" },
      { property: "og:description", content: "See what's coming up on campus: sports, academics, culture and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQuery),
  component: EventsPage,
});

function EventsPage() {
  const { data: events } = useSuspenseQuery(eventsQuery);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [category, setCategory] = useState("All");
  const { upcoming, past } = splitEvents(events);
  const list = (tab === "upcoming" ? upcoming : past).filter(
    (e) => category === "All" || e.category === category,
  );

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
    }`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold sm:text-4xl">Campus events</h1>
      <p className="mt-2 text-muted-foreground">Never miss what's happening at FG Degree College Wah Cantt.</p>

      <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={pill(tab === t)}>
            {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["All", ...EVENT_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              category === c
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {list.map((e) => (
          <EventCard key={e.id} event={e} muted={tab === "past"} />
        ))}
        {list.length === 0 && <EmptyState>No {tab} events here.</EmptyState>}
      </div>
    </div>
  );
}
