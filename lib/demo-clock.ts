/**
 * The demo's "today".
 *
 * Fixed rather than `new Date()`: the page is prerendered at build time, so a
 * moving clock would render different dates on the server and in the browser
 * (a hydration mismatch) and the demo would slowly age. All seed dates are
 * expressed as "days before DEMO_TODAY", so moving this one line re-dates the
 * whole dataset consistently.
 */
export const DEMO_TODAY = "2026-09-14";

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtc(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** ISO date (YYYY-MM-DD) `days` before `from`. */
export function isoDaysAgo(days: number, from: string = DEMO_TODAY): string {
  return new Date(toUtc(from) - days * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days between an ISO date and `today`; never negative. */
export function daysSince(iso: string, today: string = DEMO_TODAY): number {
  return Math.max(0, Math.round((toUtc(today) - toUtc(iso)) / DAY_MS));
}
