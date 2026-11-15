import { format } from "date-fns";

export const fmtDay = (iso: string) => format(new Date(iso), "d");
export const fmtMonth = (iso: string) => format(new Date(iso), "MMM");
export const fmtDateTime = (iso: string) => format(new Date(iso), "EEE, d MMM yyyy · h:mm a");
export const fmtDate = (iso: string) => format(new Date(iso), "d MMMM yyyy");

export function excerpt(text: string, len = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > len ? clean.slice(0, len).trimEnd() + "…" : clean;
}
