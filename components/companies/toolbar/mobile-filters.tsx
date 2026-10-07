"use client";

import { useState } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
import Field from "@/components/_ui/field";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/_ui/sheet";
import {
  ACTIVITY_OPTIONS,
  OWNER_OPTIONS,
  SORT_MENU_OPTIONS,
  STAGE_OPTIONS,
} from "./filter-options";
import { ownerByName, type SortKey } from "@/data/companies";
import { ALL_OWNERS, activeFilterCount } from "@/lib/companies";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { useVisibleCompanies } from "@/hooks/use-visible-companies";
import FilterIcon from "@/public/assets/images/_common/filter.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

type MobileFiltersProps = {
  className?: string;
};

export default function MobileFilters({ className }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const filters = useUiStore((state) => state.filters);
  const setFilter = useUiStore((state) => state.setFilter);
  const resetFilters = useUiStore((state) => state.resetFilters);
  const resultCount = useVisibleCompanies().length;
  const activeCount = activeFilterCount(filters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={
          activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"
        }
        className={cn(
          "data-[active=true]:bg-muted fine:min-h-0 min-h-11",
          className,
        )}
        data-active={activeCount > 0}
      >
        <FilterIcon aria-hidden className="size-3" />
        Filters
        {activeCount > 0 && <CountBadge>{activeCount}</CountBadge>}
      </Button>

      <SheetContent side="bottom">
        <SheetHeader className="px-4">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Sort and filter the companies table
          </SheetDescription>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="tap-target -mr-1"
              aria-label="Close filters"
            >
              <XIcon aria-hidden className="text-foreground size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <ScrollArea viewportClassName="max-h-[calc(85dvh-118px)]">
          <div className="flex flex-col gap-4 p-4">
            <Field label="Sort by" htmlFor="mobile-sort">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilter("sortBy", value as SortKey)}
              >
                <SelectTrigger id="mobile-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_MENU_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Account owner" htmlFor="mobile-owner">
              <Select
                value={filters.owner}
                onValueChange={(value) => setFilter("owner", value)}
              >
                <SelectTrigger id="mobile-owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OWNER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === ALL_OWNERS ? (
                        option.label
                      ) : (
                        <span className="flex items-center gap-2">
                          <Avatar
                            src={ownerByName(option.value).avatar}
                            alt=""
                          />
                          {option.label}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Stage" htmlFor="mobile-stage">
              <Select
                value={filters.stage}
                onValueChange={(value) => setFilter("stage", value)}
              >
                <SelectTrigger id="mobile-stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Last activity" htmlFor="mobile-activity">
              <Select
                value={String(filters.activityWindow)}
                onValueChange={(value) =>
                  setFilter("activityWindow", Number(value))
                }
              >
                <SelectTrigger id="mobile-activity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </ScrollArea>

        <SheetFooter className="px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={activeCount === 0 && filters.sortBy === "pipelineValue"}
            className="fine:min-h-0 -ml-1.5 min-h-11"
          >
            Reset
          </Button>
          <SheetClose asChild>
            <Button
              variant="primary"
              size="sm"
              className="fine:min-h-0 min-h-11"
            >
              Show {resultCount} {resultCount === 1 ? "company" : "companies"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
