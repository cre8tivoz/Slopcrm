"use client";

import { useMemo, useState } from "react";
import KpiCard from "@/components/_common/kpi-card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/_ui/tabs";
import CountUp from "@/components/motion-primitives/count-up";
import StagePipeline from "./stage-pipeline";
import PipelineMovement, { type ReportingWeeks } from "./pipeline-movement";
import RepPerformance from "./rep-performance";
import { formatMoney } from "@/lib/companies";
import { getPipelineVelocity, getStagePipeline } from "@/lib/reporting";
import { useCompaniesStore } from "@/stores/companies-store";
import { type ReportingTab, useUiStore } from "@/stores/ui-store";

const TABS: { id: ReportingTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "pipeline", label: "Pipeline by stage" },
  { id: "velocity", label: "Weekly activity" },
  { id: "reps", label: "Rep Performance" },
];

export default function Reports() {
  const activeTab = useUiStore((state) => state.reportingTab);
  const setActiveTab = useUiStore((state) => state.setReportingTab);
  const companies = useCompaniesStore((state) => state.companies);
  const interactions = useCompaniesStore((state) => state.interactions);

  const [weeks, setWeeks] = useState<ReportingWeeks>(14);
  const [selectedWeekAge, setSelectedWeekAge] = useState(0);
  const pipeline = useMemo(() => getStagePipeline(companies), [companies]);
  const velocity = useMemo(
    () => getPipelineVelocity(companies, interactions, weeks),
    [companies, interactions, weeks],
  );
  const movement = (
    <PipelineMovement
      velocity={velocity}
      weeks={weeks}
      selectedWeekAge={selectedWeekAge}
      onWeekChange={setSelectedWeekAge}
      onWeeksChange={(next) => {
        setWeeks(next);
        setSelectedWeekAge((age) => Math.min(age, next - 1));
      }}
    />
  );

  const kpis = [
    {
      label: "Avg chance to win",
      n: pipeline.overallWinProbability,
      format: (v: number) => `${Math.round(v)}%`,
      sub: `${pipeline.totalOpenDeals} open deals`,
    },
    {
      label: "In the pipeline",
      n: pipeline.totalPipeline,
      format: (v: number) => `$${formatMoney(Math.round(v))}`,
      sub: `$${formatMoney(pipeline.totalWeighted)} likely to land`,
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
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={<CountUp value={kpi.n} format={kpi.format} />}
              note={kpi.sub}
            />
          ))}
        </dl>
        <Tabs
          value={activeTab}
          onValueChange={(tab) => setActiveTab(tab as ReportingTab)}
          className="gap-5"
        >
          <TabsList
            aria-label="Reporting views"
            className="grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1 sm:grid-cols-4"
          >
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="focus-visible:ring-foreground/70 m-0 min-h-11 min-w-0 rounded-lg border-0 px-2 py-2 whitespace-normal focus-visible:ring-2 focus-visible:ring-inset data-[state=active]:bg-white/10"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent
            value="overview"
            className="flex min-w-0 flex-col gap-10"
          >
            {activeTab === "overview" && (
              <>
                <StagePipeline pipeline={pipeline} />
                {movement}
                <RepPerformance />
              </>
            )}
          </TabsContent>
          <TabsContent value="pipeline" className="min-w-0">
            {activeTab === "pipeline" && <StagePipeline pipeline={pipeline} />}
          </TabsContent>
          <TabsContent value="velocity" className="min-w-0">
            {activeTab === "velocity" && movement}
          </TabsContent>
          <TabsContent value="reps" className="min-w-0">
            {activeTab === "reps" && <RepPerformance />}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
