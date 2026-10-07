"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { Checkbox } from "@/components/_ui/checkbox";
import { TableCell, TableRow } from "@/components/_ui/table";
import SegmentBar from "@/components/_common/segment-bar";
import Sparkline from "@/components/_common/sparkline";
import CompanyTagList from "@/components/company/company-tag-list";
import { ownerByName, type Company } from "@/data/companies";
import { formatDate, formatMoney } from "@/lib/companies";
import { cn } from "@/lib/utils";
import {
  TABLE_CELL_CLASS,
  TABLE_ROW_CLASS,
  columnClass,
  type TableColumnKey,
} from "./table-columns";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";
import DotsIcon from "@/public/assets/images/companies/table/dots-horizontal.svg";

type CompanyRowProps = {
  company: Company;
  index: number;
  selected: boolean;
  active: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onOpenOwner: () => void;
};

function cellClass(key: TableColumnKey) {
  return cn(TABLE_CELL_CLASS, columnClass(key));
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
  selected,
  active,
  onToggle,
  onOpen,
  onOpenOwner,
}: CompanyRowProps) {
  const owner = ownerByName(company.owner);

  return (
    <TableRow
      role="row"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => handleRowKeyDown(event, onOpen)}
      data-active={active || selected}
      style={{ animationDelay: `${Math.min(index, 11) * 18}ms` }}
      className={cn(
        TABLE_ROW_CLASS,
        "animate-rise hover:bg-card/60 data-[active=true]:border-card data-[active=true]:bg-card cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2",
      )}
    >
      <TableCell role="cell" className={cellClass("name")}>
        <span className="flex items-center gap-5">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            onClick={stop}
            aria-label={`Select ${company.name}`}
          />
          {company.name}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("segment")}>
        <span className="flex items-center gap-[3px]">
          <CompanyTagList tags={company.tags} />
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("owner")} onClick={stop}>
        <Button
          variant="ghost"
          size="none"
          onClick={onOpenOwner}
          aria-label={`Open ${owner.name} profile`}
          className="text-foreground -mx-1.5 gap-1.5 px-1.5 py-1 font-normal"
        >
          <Avatar src={owner.avatar} alt="" />
          {owner.name}
        </Button>
      </TableCell>
      <TableCell role="cell" className={cellClass("openDeals")}>
        {company.openDeals}
      </TableCell>
      <TableCell role="cell" className={cellClass("pipelineValue")}>
        <span className="flex items-center gap-1">
          <span className="text-muted-foreground">$</span>
          {formatMoney(company.pipelineValue)}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("winProbability")}>
        <span className="flex items-center gap-2">
          <SegmentBar percent={company.winProbability} className="w-[74px]" />
          <span className="w-[4ch] text-right">{company.winProbability}%</span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("trend")}>
        <Sparkline values={company.trend} />
      </TableCell>
      <TableCell role="cell" className={cellClass("lastInteraction")}>
        <span className="flex items-center gap-1">
          <CalendarIcon
            aria-hidden
            className="text-foreground size-3.5 shrink-0"
          />
          <span className="tabular-nums">
            {formatDate(company.lastInteraction.date)}
          </span>
          <span aria-hidden className="mx-[3px] h-2 w-px bg-white/15" />
          {company.lastInteraction.label}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("action")} onClick={stop}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn("tap-target text-foreground", active && "bg-white/6")}
          aria-label={`Open ${company.name} details`}
          onClick={onOpen}
        >
          <DotsIcon aria-hidden className="size-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
