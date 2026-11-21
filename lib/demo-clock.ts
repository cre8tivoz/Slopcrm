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
/** Oldest seeded touch, in days before DEMO_TODAY (inclusive). */
export const DEMO_HISTORY_DAYS = 180;

const DAY_MS = 24 * 60 * 60 * 1000;

const utcCache = new Map<string, number>();

function toUtc(iso: string): number {
  let cached = utcCache.get(iso);
  if (cached === undefined) {
    const [year, month, day] = iso.split("-").map(Number);
    cached = Date.UTC(year, month - 1, day);
    utcCache.set(iso, cached);
  }
  return cached;
}

const DEMO_TODAY_UTC = toUtc(DEMO_TODAY);

/** ISO date (YYYY-MM-DD) `days` before `from`. */
export function isoDaysAgo(days: number, from: string = DEMO_TODAY): string {
  const fromUtc = from === DEMO_TODAY ? DEMO_TODAY_UTC : toUtc(from);
  return new Date(fromUtc - days * DAY_MS).toISOString().slice(0, 10);
}

/** Valid calendar date in the same YYYY-MM-DD format used by the demo. */
export function isIsoDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = new Date(`${iso}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso
  );
}

export function isWithinDemoDays(iso: string, days: number): boolean {
  return iso <= DEMO_TODAY && daysSince(iso) <= days;
}

/** Whole days between an ISO date and `today`; never negative. */
export function daysSince(iso: string, today: string = DEMO_TODAY): number {
  const todayUtc = today === DEMO_TODAY ? DEMO_TODAY_UTC : toUtc(today);
  return Math.max(0, Math.round((todayUtc - toUtc(iso)) / DAY_MS));
}
