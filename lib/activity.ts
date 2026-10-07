import type { Interaction, InteractionChannel } from "@/data/interactions";
import { daysSince } from "./demo-clock";

/** Interactions within the last `days` days (boundary day included). */
export function withinDays(
  interactions: readonly Interaction[],
  days: number,
): Interaction[] {
  return interactions.filter(
    (interaction) => daysSince(interaction.date) <= days,
  );
}

export type ActivityCounts = Record<InteractionChannel, number> & {
  total: number;
};

export function activityCounts(
  interactions: readonly Interaction[],
): ActivityCounts {
  const counts: ActivityCounts = {
    total: interactions.length,
    email: 0,
    meeting: 0,
    call: 0,
    note: 0,
  };
  for (const interaction of interactions) counts[interaction.channel] += 1;
  return counts;
}

/** How many weeks an activity sparkline covers. */
export const TREND_WEEKS = 14;

/**
 * Touches per week for the last `weeks` weeks, oldest week first, so the
 * last bar is "this week" (days 0–6 before DEMO_TODAY). Older touches are
 * ignored. This is what every activity sparkline draws.
 */
export function weeklyTouches(
  interactions: readonly Interaction[],
  weeks: number = TREND_WEEKS,
): number[] {
  const buckets = new Array<number>(weeks).fill(0);
  for (const interaction of interactions) {
    const week = Math.floor(daysSince(interaction.date) / 7);
    if (week >= 0 && week < weeks) buckets[weeks - 1 - week] += 1;
  }
  return buckets;
}

/** Feed sections: one per day, newest day first, input order kept within. */
export function groupByDay(interactions: readonly Interaction[]) {
  const days = new Map<string, Interaction[]>();
  for (const interaction of interactions) {
    const day = days.get(interaction.date);
    if (day) day.push(interaction);
    else days.set(interaction.date, [interaction]);
  }
  return [...days]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}
