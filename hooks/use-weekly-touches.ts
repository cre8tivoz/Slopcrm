import { useMemo } from "react";
import { weeklyTouches } from "@/lib/activity";
import { useCompaniesStore } from "@/stores/companies-store";

/** One company's touches per week, straight from the interaction log. */
export function useWeeklyTouches(companyId: string): number[] {
  const interactions = useCompaniesStore((state) => state.interactions);
  return useMemo(
    () =>
      weeklyTouches(
        interactions.filter(
          (interaction) => interaction.companyId === companyId,
        ),
      ),
    [interactions, companyId],
  );
}
