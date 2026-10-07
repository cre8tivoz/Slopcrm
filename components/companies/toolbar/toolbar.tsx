"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import {
  ACTIVITY_OPTIONS,
  OWNER_OPTIONS,
  SORT_MENU_OPTIONS,
  STAGE_OPTIONS,
} from "./filter-options";
import type { SortKey } from "@/data/companies";
import { companiesCsvRows } from "@/lib/companies";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { downloadCsv } from "@/lib/csv";
import { useUiStore } from "@/stores/ui-store";
import { useVisibleCompanies } from "@/hooks/use-visible-companies";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

export default function CompaniesToolbar() {
  const filters = useUiStore((state) => state.filters);
  const setFilter = useUiStore((state) => state.setFilter);
  const visible = useVisibleCompanies();
  const setNewCompanyOpen = useUiStore((state) => state.setNewCompanyOpen);

  function exportCsv() {
    downloadCsv(`companies-${DEMO_TODAY}.csv`, companiesCsvRows(visible));
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-4">
      <MobileFilters className="sm:hidden" />

      <div className="hidden min-w-0 flex-wrap gap-2 sm:flex">
        <FilterMenu
          label="Sort by"
          value={filters.sortBy}
          options={SORT_MENU_OPTIONS}
          onChange={(value) => setFilter("sortBy", value as SortKey)}
        />
        <FilterMenu
          label="Filter"
          value={filters.owner}
          options={OWNER_OPTIONS}
          onChange={(value) => setFilter("owner", value)}
        />
        <FilterMenu
          label="Stage"
          value={filters.stage}
          options={STAGE_OPTIONS}
          onChange={(value) => setFilter("stage", value)}
        />
        <FilterMenu
          label="Last Activity"
          value={String(filters.activityWindow)}
          options={ACTIVITY_OPTIONS}
          onChange={(value) => setFilter("activityWindow", Number(value))}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={exportCsv}
          className="fine:min-h-0 min-h-11"
        >
          <ShareIcon aria-hidden className="size-3" />
          Export
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setNewCompanyOpen(true)}
          className="fine:min-h-0 min-h-11"
        >
          <PlusIcon aria-hidden className="size-3" />
          New Company
        </Button>
      </div>
    </div>
  );
}
