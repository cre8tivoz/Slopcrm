"use client";

import { useId, useMemo, useState } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import { ScrollArea } from "@/components/_ui/scroll-area";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import FilterMenu from "@/components/_common/filter-menu";
import CompanyLogo from "@/components/company/company-logo";
import { DealStatusPanel } from "@/components/company/deal-status";
import DetailSection from "./detail-section";
import ActivityTrend from "./activity-trend";
import LogActivityForm from "./log-activity-form";
import RecentActivity from "./recent-activity";
import {
  STAGES,
  TAG_TONES,
  TREND_WINDOWS,
  ownerByName,
  type Stage,
} from "@/data/companies";
import { formatMoney } from "@/lib/companies";
import { UNSTAGED, primaryStage, weightedValue } from "@/lib/pipeline";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";
import BuildingIcon from "@/public/assets/images/companies/detail/building.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";
import MailIcon from "@/public/assets/images/companies/detail/mail-04.svg";
import PhoneIcon from "@/public/assets/images/companies/detail/phone.svg";

const WINDOW_OPTIONS = TREND_WINDOWS.map((days) => ({
  value: String(days),
  label: `Last ${days} Days`,
}));
const DEFAULT_WINDOW = String(TREND_WINDOWS[1]);

function Fact({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border-border bg-card/50 flex flex-col gap-1 rounded-xl border p-3">
      <span className="caption-style text-muted-foreground">{label}</span>
      <span className="text-[18px] leading-tight font-semibold tabular-nums">
        {value}
      </span>
      {hint && <span className="caption-style text-subtle">{hint}</span>}
    </div>
  );
}

export default function CompanyDetail() {
  const stageId = useId();
  const detailId = useUiStore((state) => state.detailId);
  const detailOpen = useUiStore((state) => state.detailOpen);
  const companies = useCompaniesStore((state) => state.companies);
  const interactions = useCompaniesStore((state) => state.interactions);
  const setStage = useCompaniesStore((state) => state.setStage);
  const closeDetail = useUiStore((state) => state.closeDetail);
  const openProfile = useUiStore((state) => state.openProfile);
  const logFormOpen = useUiStore((state) => state.logFormOpen);
  const setLogFormOpen = useUiStore((state) => state.setLogFormOpen);
  const showToast = useUiStore((state) => state.showToast);
  const [trendWindow, setTrendWindow] = useState(DEFAULT_WINDOW);

  const company = companies.find((item) => item.id === detailId);
  const owner = company ? ownerByName(company.owner) : null;
  const stage = company ? primaryStage(company) : UNSTAGED;
  const companyLog = useMemo(
    () => interactions.filter((item) => item.companyId === detailId),
    [interactions, detailId],
  );

  return (
    <Sheet
      open={detailOpen && company !== undefined}
      onOpenChange={(open) => !open && closeDetail()}
    >
      <SheetContent side="right" className="sm:w-[560px] sm:max-w-[560px]">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <BuildingIcon aria-hidden className="text-icon size-3.5" />
            <SheetTitle>Company</SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Deal status, key numbers, stage, owner and activity history
          </SheetDescription>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="tap-target -mr-1"
              aria-label="Close details"
            >
              <XIcon aria-hidden className="text-foreground size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {company && owner && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="stagger-children">
              <div className="flex items-start gap-3 p-5 shadow-[inset_0_-1px_0_var(--line-strong)]">
                <CompanyLogo company={company} size="xl" labelled />
                <div className="flex min-w-0 flex-col gap-3">
                  <h2 className="truncate">{company.name}</h2>
                  <div className="flex flex-wrap items-center gap-[3px]">
                    {company.tags.map((tag) => (
                      <Tag key={tag} tone={TAG_TONES[tag]} size="sm">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 p-5 shadow-[inset_0_-1px_0_var(--line-strong)]">
                <DealStatusPanel company={company} />
                {logFormOpen ? (
                  <LogActivityForm
                    company={company}
                    onDone={() => setLogFormOpen(false)}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Fact
                      label="Deal value"
                      value={`$${formatMoney(company.pipelineValue)}`}
                      hint={`${company.openDeals} open ${company.openDeals === 1 ? "deal" : "deals"}`}
                    />
                    <Fact
                      label="Chance to win"
                      value={`${company.winProbability}%`}
                      hint={`Likely worth $${formatMoney(weightedValue(company))}`}
                    />
                  </div>
                )}
              </div>

              <DetailSection title="Stage">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={stageId}
                    className="caption-style text-muted-foreground"
                  >
                    Where is this deal right now?
                  </label>
                  <Select
                    value={stage === UNSTAGED ? undefined : stage}
                    onValueChange={(value) => {
                      setStage(company.id, value as Stage);
                      showToast(`${company.name} moved to ${value}`);
                    }}
                  >
                    <SelectTrigger id={stageId}>
                      <SelectValue placeholder="Choose a stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DetailSection>

              <DetailSection title="Account owner">
                <div className="lead-style flex flex-wrap items-center gap-x-4 gap-y-3">
                  <Button
                    variant="ghost"
                    size="none"
                    onClick={() => openProfile(owner.name)}
                    aria-label={`Open ${owner.name} profile`}
                    className="lead-style text-foreground -mx-1.5 gap-1.5 px-1.5 py-1 font-medium"
                  >
                    <Avatar src={owner.avatar} alt="" />
                    {owner.name}
                  </Button>
                  <a
                    href={`mailto:${owner.email}`}
                    className="hover:text-foreground flex items-center gap-1 underline-offset-2 hover:underline"
                  >
                    <MailIcon aria-hidden className="text-soft size-3" />
                    {owner.email}
                  </a>
                  <a
                    href={`tel:${owner.phone.replace(/[^+\d]/g, "")}`}
                    className="hover:text-foreground flex items-center gap-1 underline-offset-2 hover:underline"
                  >
                    <PhoneIcon aria-hidden className="text-soft size-3" />
                    {owner.phone}
                  </a>
                </div>
              </DetailSection>

              <DetailSection title="Recent activity">
                <RecentActivity interactions={companyLog} />
              </DetailSection>

              <DetailSection
                title="Activity trend"
                className="shadow-none"
                action={
                  <FilterMenu
                    value={trendWindow}
                    options={WINDOW_OPTIONS}
                    onChange={setTrendWindow}
                    align="end"
                  />
                }
              >
                <ActivityTrend
                  interactions={companyLog}
                  days={Number(trendWindow)}
                />
              </DetailSection>
            </div>
          </ScrollArea>
        )}

        <SheetFooter>
          <SheetClose asChild>
            <Button
              variant="subtle"
              size="sm"
              className="fine:min-h-0 min-h-11"
            >
              Close
            </Button>
          </SheetClose>
          {!logFormOpen && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setLogFormOpen(true)}
              className="fine:min-h-0 min-h-11"
            >
              Log activity
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
