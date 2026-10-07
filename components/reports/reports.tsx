"use client";

import { useState } from "react";
import ConversionFunnel from "./conversion-funnel";
import PipelineMovement from "./pipeline-movement";
import RepPerformance from "./rep-performance";
import { formatMoney } from "@/lib/companies";
import {
  getPipelineVelocity,
  getRepPerformance,
  getStageConversionFunnel,
} from "@/lib/reporting";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

type ReportingTab = "overview" | "conversion" | "velocity" | "reps";

const TABS: { id: ReportingTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "conversion", label: "Conversion & Funnel" },
  { id: "velocity", label: "Pipeline Velocity" },
  { id: "reps", label: "Rep Performance" },
];

const KPI_CARD =
  "border-border bg-card/50 flex flex-col gap-1 rounded-xl border p-3.5";

export default function Reports() {
  const activeTab = useUiStore((state) => state.reportingTab);
  const setActiveTab = useUiStore((state) => state.setReportingTab);
  const companies = useCompaniesStore((state) => state.companies);
  const interactions = useCompaniesStore((state) => state.interactions);

  const funnel = getStageConversionFunnel(companies);
  const velocity = getPipelineVelocity(companies, interactions);
  const repSummary = getRepPerformance(companies, interactions);

  const kpis = [
    {
      label: "Pipeline Win Rate",
      value: `${funnel.overallWinRate}%`,
      sub: `${funnel.totalOpenDeals} total deals`,
    },
    {
      label: "Total Pipeline",
      value: `$${formatMoney(funnel.totalPipeline)}`,
      sub: `$${formatMoney(funnel.totalWeighted)} weighted`,
    },
    {
      label: "4-Wk Touch Pace",
      value: `${velocity.fourWeekMovingAverage}/wk`,
      sub: `${velocity.currentWeekTouches} this week`,
    },
    {
      label: "Accounts Needing Attention",
      value: String(velocity.slippingCount + velocity.atRiskCount),
      sub: `${velocity.slippingCount} slipping, ${velocity.atRiskCount} at risk`,
    },
  ];

  return (
    <section
      aria-label="Reporting"
      className="min-h-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto"
    >
      <div className="flex w-full max-w-full min-w-0 flex-col gap-4 p-4">
        {/* Executive KPI ribbon */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={KPI_CARD}>
              <span className="caption-style text-muted-foreground">
                {kpi.label}
              </span>
              <span className="text-[20px] leading-tight font-semibold tracking-[-0.01em] tabular-nums">
                {kpi.value}
              </span>
              <span className="caption-style text-subtle text-[11px] tabular-nums">
                {kpi.sub}
              </span>
            </div>
          ))}
        </div>

        {/* Sub-tab navigation bar */}
        <div className="border-border bg-card/30 flex max-w-full items-center gap-1.5 overflow-x-auto rounded-lg border p-1 [scrollbar-width:none]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "caption-style ease-power3-out rounded-md px-3 py-1.5 font-medium whitespace-nowrap transition-[background-color,color]",
                activeTab === tab.id
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/4",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab Screen Content */}
        {activeTab === "overview" && (
          <div className="flex w-full max-w-full min-w-0 flex-col gap-6">
            <ConversionFunnel />
            <PipelineMovement />
            <RepPerformance />
          </div>
        )}

        {activeTab === "conversion" && <ConversionFunnel />}
        {activeTab === "velocity" && <PipelineMovement />}
        {activeTab === "reps" && <RepPerformance />}
      </div>
    </section>
  );
}
