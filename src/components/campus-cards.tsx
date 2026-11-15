import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import type { BlogPost, CampusEvent } from "@/lib/campus.functions";
import { excerpt, fmtDate, fmtDateTime, fmtDay, fmtMonth } from "@/lib/format";
import type { ReactNode } from "react";

export function EventCard({ event, action, muted }: { event: CampusEvent; action?: ReactNode; muted?: boolean }) {
  return (
    <article
      className={`flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card ${muted ? "opacity-70" : ""}`}
    >
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary py-2 text-primary-foreground">
        <span className="text-xs uppercase tracking-wider opacity-80">{fmtMonth(event.starts_at)}</span>
        <span className="font-display text-2xl font-semibold leading-none">{fmtDay(event.starts_at)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
            {event.category}
          </span>
          {action}
        </div>
        <h3 className="mt-1.5 text-lg font-semibold leading-snug">{event.title}</h3>
        {event.description && <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {fmtDateTime(event.starts_at)}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> {event.location}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$id"
      params={{ id: post.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-transform hover:-translate-y-0.5"
    >
      <div className="aspect-[16/9] overflow-hidden bg-muted">
        {post.cover_src ? (
          <img
            src={post.cover_src}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center bg-secondary font-display text-3xl text-moss">
            Campus Hub
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted-foreground">
          {fmtDate(post.created_at)} · {post.author_name}
        </p>
        <h3 className="mt-1 text-xl font-semibold leading-snug group-hover:text-primary">{post.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{excerpt(post.content)}</p>
      </div>
    </Link>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
