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
