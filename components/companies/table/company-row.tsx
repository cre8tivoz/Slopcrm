"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { TableCell, TableRow } from "@/components/_ui/table";
import Sparkline from "@/components/_common/sparkline";
import CompanyLogo from "@/components/company/company-logo";
import { StatusDot, lastContactText } from "@/components/company/deal-status";
import { useWeeklyTouches } from "@/hooks/use-weekly-touches";
import { SEGMENTS, ownerByName, type Company } from "@/data/companies";
import { formatMoney } from "@/lib/companies";
import { UNSTAGED, primaryStage } from "@/lib/pipeline";
import { dealHealth } from "@/lib/reporting";
import { cn } from "@/lib/utils";
import {
  TABLE_CELL_CLASS,
  TABLE_ROW_CLASS,
  columnClass,
  type TableColumnKey,
} from "./table-columns";

type CompanyRowProps = {
  company: Company;
  index: number;
  active: boolean;
  onOpen: () => void;
  onOpenOwner: () => void;
};

function cellClass(key: TableColumnKey) {
  return cn(TABLE_CELL_CLASS, "h-14", columnClass(key));
}

function stop(event: MouseEvent) {
  event.stopPropagation();
}

function handleRowKeyDown(
  event: KeyboardEvent<HTMLTableRowElement>,
  onOpen: () => void,
) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  onOpen();
}

export default function CompanyRow({
  company,
  index,
  active,
  onOpen,
  onOpenOwner,
}: CompanyRowProps) {
  const owner = ownerByName(company.owner);
  const trend = useWeeklyTouches(company.id);
  const stage = primaryStage(company);
  const segment = company.tags.find((tag) =>
    (SEGMENTS as readonly string[]).includes(tag),
  );
  const { status, daysDormant } = dealHealth(company);

  return (
    <TableRow
      role="row"
      tabIndex={0}
      aria-label={`Open ${company.name}`}
      onClick={onOpen}
      onKeyDown={(event) => handleRowKeyDown(event, onOpen)}
      data-active={active}
      style={{ animationDelay: `${Math.min(index, 11) * 18}ms` }}
      className={cn(
        TABLE_ROW_CLASS,
        "animate-rise cursor-pointer border-white/[0.04] hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 data-[active=true]:bg-white/[0.05]",
      )}
    >
      <TableCell role="cell" className={cellClass("name")}>
        <span className="flex items-center gap-3">
          <CompanyLogo company={company} size="md" />
          <span className="flex flex-col gap-1">
            <span className="font-medium">{company.name}</span>
            {segment && (
              <span className="caption-style text-muted-foreground">
                {segment}
              </span>
            )}
          </span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("stage")}>
        <span className={cn(stage === UNSTAGED && "text-muted-foreground")}>
          {stage}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("owner")} onClick={stop}>
        <Button
          variant="ghost"
          size="none"
          onClick={onOpenOwner}
          aria-label={`Open ${owner.name} profile`}
          className="text-soft hover:text-foreground -mx-1.5 gap-2 px-1.5 py-1 font-normal"
        >
          <Avatar src={owner.avatar} alt="" />
          {owner.name}
        </Button>
      </TableCell>
      <TableCell role="cell" className={cellClass("pipelineValue")}>
        ${formatMoney(company.pipelineValue)}
      </TableCell>
      <TableCell role="cell" className={cellClass("winProbability")}>
        <span className="flex items-center gap-2.5">
          <span
            role="meter"
            aria-valuenow={company.winProbability}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Chance to win"
            className="block h-1 w-16 overflow-hidden rounded-full bg-white/8"
          >
            <span
              className="bg-foreground/70 block h-full rounded-full"
              style={{ width: `${company.winProbability}%` }}
            />
          </span>
          <span className="w-[4ch] text-right">{company.winProbability}%</span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("trend")}>
        <Sparkline values={trend} />
      </TableCell>
      <TableCell role="cell" className={cellClass("lastInteraction")}>
        <span className="text-soft flex items-center gap-2">
          <StatusDot status={status} className="size-1.5" />
          {lastContactText(daysDormant)}
        </span>
      </TableCell>
    </TableRow>
  );
}
