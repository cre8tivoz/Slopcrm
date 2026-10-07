"use client";

import { useMemo, useState } from "react";
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
import FilterMenu from "@/components/_common/filter-menu";
import CompanyLogo from "@/components/company/company-logo";
import DetailSection from "./detail-section";
import PipelineHealth from "./pipeline-health";
import ActivityTrend from "./activity-trend";
import ScoreCard from "./score-card";
import {
  SCORE_CARDS,
  TAG_TONES,
  TREND_WINDOWS,
  ownerByName,
} from "@/data/companies";
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

export default function CompanyDetail() {
  const detailId = useUiStore((state) => state.detailId);
  const detailOpen = useUiStore((state) => state.detailOpen);
  const companies = useCompaniesStore((state) => state.companies);
  const interactions = useCompaniesStore((state) => state.interactions);
  const closeDetail = useUiStore((state) => state.closeDetail);
  const openProfile = useUiStore((state) => state.openProfile);
  const [trendWindow, setTrendWindow] = useState(DEFAULT_WINDOW);
  const [scoreWindow, setScoreWindow] = useState(DEFAULT_WINDOW);

  const company = companies.find((item) => item.id === detailId);
  const owner = company ? ownerByName(company.owner) : null;
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
            <SheetTitle>Companies Detail</SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Account summary, pipeline health, activity and score cards
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

              <DetailSection title="Account summary">
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
                  <span className="flex items-center gap-1">
                    <MailIcon aria-hidden className="text-soft size-3" />
                    {owner.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <PhoneIcon aria-hidden className="text-soft size-3" />
                    {owner.phone}
                  </span>
                </div>
              </DetailSection>

              <DetailSection title="Pipeline health">
                <PipelineHealth company={company} />
              </DetailSection>

              <DetailSection
                title="Activity trend"
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

              <DetailSection
                title="Score card"
                className="gap-3 shadow-none"
                action={
                  <FilterMenu
                    value={scoreWindow}
                    options={WINDOW_OPTIONS}
                    onChange={setScoreWindow}
                    align="end"
                    className="shadow-[0px_4px_4px_0px_rgba(15,15,15,0.24),0px_0px_0px_1px_#393939]"
                  />
                }
              >
                <div className="flex flex-col gap-2">
                  {SCORE_CARDS.map((card, index) => (
                    <ScoreCard key={`${card.title}-${index}`} card={card} />
                  ))}
                </div>
              </DetailSection>
            </div>
          </ScrollArea>
        )}

        <SheetFooter>
          <Button variant="link" size="none" href="#" className="lead-style">
            Need help? Ask us.
          </Button>
          <div className="flex items-center gap-2">
            <SheetClose asChild>
              <Button
                variant="subtle"
                size="sm"
                className="fine:min-h-0 min-h-11"
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              variant="primary"
              size="sm"
              onClick={closeDetail}
              className="fine:min-h-0 min-h-11"
            >
              Save Update
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
