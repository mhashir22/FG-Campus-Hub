import { queryOptions } from "@tanstack/react-query";
import { getPost, listEvents, listPosts, type CampusEvent } from "./campus.functions";

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: () => listEvents(),
});

export const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () => listPosts(),
});

export const postQuery = (id: string) =>
  queryOptions({
    queryKey: ["posts", id],
    queryFn: () => getPost({ data: { id } }),
  });

export function splitEvents(events: CampusEvent[], now = new Date()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = events.filter((e) => new Date(e.starts_at) >= startOfToday);
  const past = events.filter((e) => new Date(e.starts_at) < startOfToday).reverse();
  return { upcoming, past };
}

export const EVENT_CATEGORIES = ["General", "Academic", "Sports", "Cultural", "Society", "Exam"];
