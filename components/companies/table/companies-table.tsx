"use client";
import { useMemo } from "react";
import Button from "@/components/_ui/button";
import { Checkbox } from "@/components/_ui/checkbox";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import CompanyRow from "./company-row";
import CompanyCard from "./company-card";
import TableFooter from "./table-footer";
import {
  TABLE_CELL_CLASS,
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_ROW_CLASS,
} from "./table-columns";
import { filterCompanies } from "@/lib/companies";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import FilterIcon from "@/public/assets/images/_common/filter.svg";

function EmptyState() {
  const resetFilters = useCompaniesStore((state) => state.resetFilters);

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="bg-muted flex size-11 items-center justify-center rounded-full shadow-[0px_0px_0px_1px_#232323]">
        <FilterIcon aria-hidden className="text-soft size-5" />
      </span>
      <span className="flex flex-col gap-1.5">
        <span className="lead-style font-medium">
          No companies match these filters
        </span>
        <span className="caption-style text-muted-foreground block max-w-64">
          Try a wider activity window, or clear the filters to see every
          account.
        </span>
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={resetFilters}
        className="fine:min-h-0 min-h-11"
      >
        Clear filters
      </Button>
    </div>
  );
}

export default function CompaniesTable() {
  const companies = useCompaniesStore((state) => state.companies);
  const sortBy = useCompaniesStore((state) => state.sortBy);
  const owner = useCompaniesStore((state) => state.owner);
  const stage = useCompaniesStore((state) => state.stage);
  const activityWindow = useCompaniesStore((state) => state.activityWindow);
  const selectedIds = useCompaniesStore((state) => state.selectedIds);
  const detailId = useCompaniesStore((state) => state.detailId);
  const detailOpen = useCompaniesStore((state) => state.detailOpen);
  const toggleSelected = useCompaniesStore((state) => state.toggleSelected);
  const setSelected = useCompaniesStore((state) => state.setSelected);
  const openDetail = useCompaniesStore((state) => state.openDetail);
  const openProfile = useCompaniesStore((state) => state.openProfile);

  const visible = useMemo(
    () => filterCompanies(companies, { sortBy, owner, stage, activityWindow }),
    [companies, sortBy, owner, stage, activityWindow],
  );

  const selectedVisible = visible.filter((company) =>
    selectedIds.includes(company.id),
  );
  const allSelected =
    visible.length > 0 && selectedVisible.length === visible.length;
  const someSelected = selectedVisible.length > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? [] : visible.map((company) => company.id));
  }

  return (
    <div className="border-border flex min-h-0 flex-1 flex-col border-t">
      <ScrollArea orientation="both" className="min-h-0 flex-1">
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-2.5 p-3 lg:hidden">
            {visible.map((company, index) => (
              <CompanyCard
                key={company.id}
                company={company}
                index={index}
                onOpen={() => openDetail(company.id)}
              />
            ))}
          </ul>
        )}

        {visible.length > 0 && (
          <Table
            role="table"
            className={cn(TABLE_GRID_CLASS, "hidden w-full lg:grid")}
          >
            <TableHeader role="rowgroup" className="contents">
              <TableRow role="row" className={TABLE_ROW_CLASS}>
                {TABLE_COLUMNS.map((column) => (
                  <TableHead
                    key={column.key}
                    role="columnheader"
                    className={cn(TABLE_CELL_CLASS, column.className)}
                  >
                    {column.key === "name" ? (
                      <span className="flex items-center gap-5">
                        <Checkbox
                          checked={
                            allSelected
                              ? true
                              : someSelected
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={toggleAll}
                          aria-label="Select all companies"
                        />
                        {column.label}
                      </span>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody role="rowgroup" className="contents">
              {visible.map((company, index) => (
                <CompanyRow
                  key={company.id}
                  company={company}
                  index={index}
                  selected={selectedIds.includes(company.id)}
                  active={detailOpen && detailId === company.id}
                  onToggle={() => toggleSelected(company.id)}
                  onOpen={() => openDetail(company.id)}
                  onOpenOwner={() => openProfile(company.owner)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
      <TableFooter count={visible.length} />
    </div>
  );
}
