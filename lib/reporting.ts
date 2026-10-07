import {
  STAGES,
  ownerByName,
  type Company,
  type Owner,
  type Stage,
  type TagTone,
} from "@/data/companies";
import type { Interaction } from "@/data/interactions";
import { daysSince } from "./demo-clock";
import {
  STAGE_KEYS,
  UNSTAGED,
  byStage,
  primaryStage,
  stageTone,
  summarise,
  weightedValue,
  type PipelineSummary,
  type StageKey,
} from "./pipeline";

/**
 * Natural lifecycle progression order for stages.
 * Early discovery -> evaluation -> partnership -> initial contract -> growth -> retention.
 */
export const FUNNEL_STAGE_ORDER: readonly StageKey[] = [
  "New Logo",
  "Pilot",
  "Co-Sell",
  "Land & Expand",
  "Upsell",
  "Expansion",
  "Renewal",
  UNSTAGED,
];

export type StageConversionMetric = {
  stage: StageKey;
  tone: TagTone;
  companies: Company[];
  summary: PipelineSummary;
  /** Mean win probability for this stage (0-100%). */
  winRate: number;
  /** Estimated loss / unrealized risk ($ total - $ weighted). */
  lossRisk: number;
  /** Average deal size (total / openDeals, or 0 if no deals). */
  avgDealSize: number;
  /** Percentage of total active pipeline value. */
  pipelineShare: number;
};

export type ConversionFunnelSummary = {
  stages: StageConversionMetric[];
  totalPipeline: number;
  totalWeighted: number;
  overallWinRate: number;
  totalOpenDeals: number;
  highestValueStage: StageKey;
  highestWinStage: StageKey;
};

/**
 * Computes win/loss and conversion metrics by stage across the pipeline.
 */
export function getStageConversionFunnel(
  companies: readonly Company[],
): ConversionFunnelSummary {
  const overall = summarise(companies);
  const stageGroups = byStage(companies);
  const stageMap = new Map(stageGroups.map((g) => [g.stage, g]));

  const stages: StageConversionMetric[] = FUNNEL_STAGE_ORDER.map((stage) => {
    const group = stageMap.get(stage);
    const summary = group ? group.summary : summarise([]);
    const compList = group ? group.companies : [];
    const avgDealSize =
      summary.openDeals > 0 ? Math.round(summary.total / summary.openDeals) : 0;
    const lossRisk = summary.total - summary.weighted;
    const pipelineShare =
      overall.total > 0 ? Math.round((summary.total / overall.total) * 100) : 0;

    return {
      stage,
      tone: stageTone(stage),
      companies: compList,
      summary,
      winRate: summary.avgWin,
      lossRisk,
      avgDealSize,
      pipelineShare,
    };
  });

  const activeStages = stages.filter((s) => s.summary.total > 0);
  const highestValueStage =
    activeStages.length > 0
      ? [...activeStages].sort((a, b) => b.summary.total - a.summary.total)[0]
          .stage
      : UNSTAGED;
  const highestWinStage =
    activeStages.length > 0
      ? [...activeStages].sort((a, b) => b.winRate - a.winRate)[0].stage
      : UNSTAGED;

  return {
    stages,
    totalPipeline: overall.total,
    totalWeighted: overall.weighted,
    overallWinRate: overall.avgWin,
    totalOpenDeals: overall.openDeals,
    highestValueStage,
    highestWinStage,
  };
}

export type WeeklyVelocityPoint = {
  weekIndex: number;
  /** Week label e.g. "W-13" (oldest) to "This week". */
  label: string;
  touches: number;
  /** 4-week simple moving average of touches. */
  movingAverage4w: number;
};

export type DealHealthStatus = "active" | "at-risk" | "slipping";

export type SlippingDeal = {
  company: Company;
  daysDormant: number;
  pipelineValue: number;
  weightedValue: number;
  status: DealHealthStatus;
  owner: Owner;
  stage: StageKey;
};

export type PipelineVelocitySummary = {
  weeklyPoints: WeeklyVelocityPoint[];
  currentWeekTouches: number;
  fourWeekMovingAverage: number;
  averageDaysDormant: number;
  momentumScore: number;
  activeCount: number;
  atRiskCount: number;
  slippingCount: number;
  slippingDeals: SlippingDeal[];
};

/**
 * Computes pipeline movement, 4-week moving average and dormancy/slipping deals.
 */
export function getPipelineVelocity(
  companies: readonly Company[],
  interactions: readonly Interaction[],
  weeks = 14,
): PipelineVelocitySummary {
  // 1. Weekly touch buckets
  const rawBuckets = new Array<number>(weeks).fill(0);
  for (const item of interactions) {
    const ageWeeks = Math.floor(daysSince(item.date) / 7);
    if (ageWeeks >= 0 && ageWeeks < weeks) {
      rawBuckets[weeks - 1 - ageWeeks] += 1;
    }
  }

  const weeklyPoints: WeeklyVelocityPoint[] = rawBuckets.map((touches, idx) => {
    // 4-week simple moving average up to this index
    const windowStart = Math.max(0, idx - 3);
    const windowItems = rawBuckets.slice(windowStart, idx + 1);
    const avg =
      Math.round(
        (windowItems.reduce((sum, n) => sum + n, 0) / windowItems.length) * 10,
      ) / 10;

    const weeksAgo = weeks - 1 - idx;
    const label = weeksAgo === 0 ? "This week" : `W-${weeksAgo}`;
    return {
      weekIndex: idx,
      label,
      touches,
      movingAverage4w: avg,
    };
  });

  const currentWeekTouches = rawBuckets[weeks - 1] ?? 0;
  const fourWeekMovingAverage =
    weeklyPoints[weeklyPoints.length - 1]?.movingAverage4w ?? 0;

  // 2. Deal velocity & dormancy
  const dealHealthList: SlippingDeal[] = companies.map((company) => {
    const daysDormant = daysSince(company.lastInteraction.date);
    let status: DealHealthStatus = "active";
    if (daysDormant > 45) {
      status = "slipping";
    } else if (daysDormant > 14) {
      status = "at-risk";
    }

    return {
      company,
      daysDormant,
      pipelineValue: company.pipelineValue,
      weightedValue: weightedValue(company),
      status,
      owner: ownerByName(company.owner),
      stage: primaryStage(company),
    };
  });

  const totalDormantDays = dealHealthList.reduce(
    (sum, d) => sum + d.daysDormant,
    0,
  );
  const averageDaysDormant =
    companies.length > 0 ? Math.round(totalDormantDays / companies.length) : 0;

  const activeCount = dealHealthList.filter(
    (d) => d.status === "active",
  ).length;
  const atRiskCount = dealHealthList.filter(
    (d) => d.status === "at-risk",
  ).length;
  const slippingCount = dealHealthList.filter(
    (d) => d.status === "slipping",
  ).length;

  // Slipping deals ranked by deal risk (highest pipeline value with longest dormancy)
  const slippingDeals = dealHealthList
    .filter((d) => d.status === "slipping" || d.status === "at-risk")
    .sort((a, b) => b.pipelineValue - a.pipelineValue);

  // Momentum score: touches in last 30d vs prior 30d (or relative velocity)
  const touches30d = interactions.filter((i) => daysSince(i.date) <= 30).length;
  const touches90d = interactions.filter((i) => daysSince(i.date) <= 90).length;
  const momentumScore =
    touches90d > 0 ? Math.round((touches30d / (touches90d / 3)) * 100) : 100;

  return {
    weeklyPoints,
    currentWeekTouches,
    fourWeekMovingAverage,
    averageDaysDormant,
    momentumScore,
    activeCount,
    atRiskCount,
    slippingCount,
    slippingDeals,
  };
}

export type RepPerformanceRow = {
  owner: Owner;
  companiesCount: number;
  openDeals: number;
  totalPipeline: number;
  weightedPipeline: number;
  avgWinRate: number;
  touches30d: number;
  touches90d: number;
  activityRatio: number;
  topCompany: Company | null;
  status: "High Pace" | "Steady" | "Action Needed";
};

export type RepPerformanceSummary = {
  reps: RepPerformanceRow[];
  topProducer: RepPerformanceRow | null;
  mostActiveRep: RepPerformanceRow | null;
  highestWinRep: RepPerformanceRow | null;
};

/**
 * Computes sales representative performance scorecard and leaderboard.
 */
export function getRepPerformance(
  companies: readonly Company[],
  interactions: readonly Interaction[],
): RepPerformanceSummary {
  const companyOwnerMap = new Map<string, Company[]>();
  for (const c of companies) {
    const list = companyOwnerMap.get(c.owner) ?? [];
    list.push(c);
    companyOwnerMap.set(c.owner, list);
  }

  const interactionsByOwner = new Map<string, Interaction[]>();
  for (const item of interactions) {
    const list = interactionsByOwner.get(item.owner) ?? [];
    list.push(item);
    interactionsByOwner.set(item.owner, list);
  }

  const reps: RepPerformanceRow[] = [...companyOwnerMap.entries()].map(
    ([ownerName, repCompanies]) => {
      const owner = ownerByName(ownerName);
      const summary = summarise(repCompanies);
      const repInteractions = interactionsByOwner.get(ownerName) ?? [];
      const touches30d = repInteractions.filter(
        (i) => daysSince(i.date) <= 30,
      ).length;
      const touches90d = repInteractions.filter(
        (i) => daysSince(i.date) <= 90,
      ).length;

      const activityRatio =
        summary.openDeals > 0
          ? Math.round((touches30d / summary.openDeals) * 10) / 10
          : 0;

      const topCompany =
        repCompanies.length > 0
          ? [...repCompanies].sort(
              (a, b) => b.pipelineValue - a.pipelineValue,
            )[0]
          : null;

      // Rep status based on activity and pipeline health
      const avgDaysDormant =
        repCompanies.length > 0
          ? Math.round(
              repCompanies.reduce(
                (sum, c) => sum + daysSince(c.lastInteraction.date),
                0,
              ) / repCompanies.length,
            )
          : 0;

      let status: RepPerformanceRow["status"] = "Steady";
      if (touches30d >= 3 || avgDaysDormant <= 20) {
        status = "High Pace";
      } else if (avgDaysDormant > 50) {
        status = "Action Needed";
      }

      return {
        owner,
        companiesCount: repCompanies.length,
        openDeals: summary.openDeals,
        totalPipeline: summary.total,
        weightedPipeline: summary.weighted,
        avgWinRate: summary.avgWin,
        touches30d,
        touches90d,
        activityRatio,
        topCompany,
        status,
      };
    },
  );

  // Rank by weighted pipeline descending
  reps.sort((a, b) => b.weightedPipeline - a.weightedPipeline);

  const topProducer = reps[0] ?? null;
  const mostActiveRep =
    reps.length > 0
      ? [...reps].sort((a, b) => b.touches30d - a.touches30d)[0]
      : null;
  const highestWinRep =
    reps.length > 0
      ? [...reps].sort((a, b) => b.avgWinRate - a.avgWinRate)[0]
      : null;

  return {
    reps,
    topProducer,
    mostActiveRep,
    highestWinRep,
  };
}
