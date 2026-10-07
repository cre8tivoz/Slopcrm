import { useMemo } from "react";
import { filterCompanies } from "@/lib/companies";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";

/** The companies the current filters let through, sorted. */
export function useVisibleCompanies() {
  const companies = useCompaniesStore((state) => state.companies);
  const filters = useUiStore((state) => state.filters);
  return useMemo(
    () => filterCompanies(companies, filters),
    [companies, filters],
  );
}
