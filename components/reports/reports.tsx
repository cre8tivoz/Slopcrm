"use client";

import CountUp from "@/components/motion-primitives/count-up";
import ConversionFunnel from "./conversion-funnel";
import PipelineMovement from "./pipeline-movement";
import RepPerformance from "./rep-performance";
import { formatMoney } from "@/lib/companies";
import { getPipelineVelocity, getStageConversionFunnel } from "@/lib/reporting";
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

const KPI_CARD = "flex flex-col gap-1.5";

export default function Reports() {
  const activeTab = useUiStore((state) => state.reportingTab);
  const setActiveTab = useUiStore((state) => state.setReportingTab);
  const companies = useCompaniesStore((state) => state.companies);
  const interactions = useCompaniesStore((state) => state.interactions);

  const funnel = getStageConversionFunnel(companies);
  const velocity = getPipelineVelocity(companies, interactions);

  const kpis = [
    {
      label: "Avg chance to win",
      n: funnel.overallWinRate,
      format: (v: number) => `${Math.round(v)}%`,
      sub: `${funnel.totalOpenDeals} open deals`,
    },
    {
      label: "In the pipeline",
      n: funnel.totalPipeline,
      format: (v: number) => `$${formatMoney(Math.round(v))}`,
      sub: `$${formatMoney(funnel.totalWeighted)} likely to land`,
    },
    {
      label: "Touches per week",
      n: velocity.fourWeekMovingAverage,
      format: (v: number) => `${v.toFixed(1)}/wk`,
      sub: `${velocity.currentWeekTouches} this week`,
    },
    {
      label: "Need a follow-up",
      n: velocity.slippingCount + velocity.atRiskCount,
      format: (v: number) => String(Math.round(v)),
      sub: `${velocity.slippingCount} going cold, ${velocity.atRiskCount} need a nudge`,
    },
  ];

  return (
    <section
      aria-label="Reporting"
      className="min-h-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto"
    >
      <div className="mx-auto flex w-full max-w-[72em] min-w-0 flex-col gap-8 px-4 pt-2 pb-24 lg:px-8 lg:pt-8 lg:pb-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={KPI_CARD}>
              <span className="caption-style text-muted-foreground">
                {kpi.label}
              </span>
              <span className="text-[24px] leading-none font-semibold tracking-[-0.02em] tabular-nums">
                <CountUp value={kpi.n} format={kpi.format} />
              </span>
              <span className="caption-style text-subtle text-[11px] tabular-nums">
                {kpi.sub}
              </span>
            </div>
          ))}
        </div>

        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-white/5 p-1 [scrollbar-width:none]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "caption-style ease-power3-out min-h-9 rounded-lg px-3 font-medium whitespace-nowrap transition-[background-color,color]",
                activeTab === tab.id
                  ? "text-foreground bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/4",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div key={activeTab} className="animate-rise min-w-0">
          {activeTab === "overview" && (
            <div className="flex w-full max-w-full min-w-0 flex-col gap-12">
              <ConversionFunnel />
              <PipelineMovement />
              <RepPerformance />
            </div>
          )}

          {activeTab === "conversion" && <ConversionFunnel />}
          {activeTab === "velocity" && <PipelineMovement />}
          {activeTab === "reps" && <RepPerformance />}
        </div>
      </div>
    </section>
  );
}
