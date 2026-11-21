import {
  ownerByName,
  type Company,
  type Owner,
  type TagTone,
} from "@/data/companies";
import type { Interaction } from "@/data/interactions";
import { weeklyTouches } from "./activity";
import { daysSince, isWithinDemoDays, isoDaysAgo } from "./demo-clock";
import {
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
export const REPORT_STAGE_ORDER: readonly StageKey[] = [
  "New Logo",
  "Pilot",
  "Co-Sell",
  "Land & Expand",
  "Upsell",
  "Expansion",
  "Renewal",
  UNSTAGED,
];

export type StagePipelineMetric = {
  stage: StageKey;
  tone: TagTone;
  companies: Company[];
  summary: PipelineSummary;
  /** Mean win probability for this stage (0-100%). */
  winProbability: number;
  /** Estimated loss / unrealized risk ($ total - $ weighted). */
  lossRisk: number;
  /** Average deal size (total / openDeals, or 0 if no deals). */
  avgDealSize: number;
  /** Percentage of total active pipeline value. */
  pipelineShare: number;
};

export type StagePipelineSummary = {
  stages: StagePipelineMetric[];
  totalPipeline: number;
  totalWeighted: number;
  overallWinProbability: number;
  totalOpenDeals: number;
  highestValueStage: StageKey;
  highestProbabilityStage: StageKey;
};

/**
 * Summarizes current pipeline value and estimated win probability by primary stage.
 */
export function getStagePipeline(
  companies: readonly Company[],
): StagePipelineSummary {
  const overall = summarise(companies);
  const stageGroups = byStage(companies);
  const stageMap = new Map(stageGroups.map((g) => [g.stage, g]));

  const stages: StagePipelineMetric[] = REPORT_STAGE_ORDER.map((stage) => {
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
      winProbability: summary.avgWin,
      lossRisk,
      avgDealSize,
      pipelineShare,
    };
  });

  const activeStages = stages.filter(
    (s) => s.companies.length > 0 || s.summary.openDeals > 0,
  );
  const highestValueStage =
    activeStages.length > 0
      ? [...activeStages].sort((a, b) => b.summary.total - a.summary.total)[0]
          .stage
      : UNSTAGED;
  const highestProbabilityStage =
    activeStages.length > 0
      ? [...activeStages].sort((a, b) => b.winProbability - a.winProbability)[0]
          .stage
      : UNSTAGED;

  return {
    stages,
    totalPipeline: overall.total,
    totalWeighted: overall.weighted,
    overallWinProbability: overall.avgWin,
    totalOpenDeals: overall.openDeals,
    highestValueStage,
    highestProbabilityStage,
  };
}

export type WeeklyVelocityPoint = {
  weekIndex: number;
  /** Week label e.g. "W-13" (oldest) to "This week". */
  label: string;
  startDate: string;
  endDate: string;
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

/** Days since last contact and the health band it falls in. */
export function dealHealth(company: Company): {
  daysDormant: number;
  status: DealHealthStatus;
} {
  const daysDormant = daysSince(company.lastInteraction.date);
  const status: DealHealthStatus =
    daysDormant > 45 ? "slipping" : daysDormant > 14 ? "at-risk" : "active";
  return { daysDormant, status };
}

/**
 * Companies that need a follow-up: going cold first, then needing a nudge,
 * biggest deal first within each band. On-track companies are left out.
 */
export function followUpQueue(companies: readonly Company[]) {
  const rank: Record<DealHealthStatus, number> = {
    slipping: 0,
    "at-risk": 1,
    active: 2,
  };
  return companies
    .map((company) => ({ company, ...dealHealth(company) }))
    .filter((item) => item.status !== "active")
    .sort(
      (a, b) =>
        rank[a.status] - rank[b.status] ||
        b.company.pipelineValue - a.company.pipelineValue,
    );
}

/**
 * Computes pipeline movement, 4-week moving average and dormancy/slipping deals.
 */
export function getPipelineVelocity(
  companies: readonly Company[],
  interactions: readonly Interaction[],
  weeks = 14,
): PipelineVelocitySummary {
  // Include three preceding buckets so changing the visible range never
  // changes the average for a week shown in both ranges.
  const lookback = 3;
  const rawBuckets = weeklyTouches(interactions, weeks + lookback);
  const weeklyPoints: WeeklyVelocityPoint[] = rawBuckets
    .slice(lookback)
    .map((touches, idx) => {
      const window = rawBuckets.slice(idx, idx + lookback + 1);
      const weeksAgo = weeks - 1 - idx;
      return {
        weekIndex: idx,
        label: weeksAgo === 0 ? "This week" : `W-${weeksAgo}`,
        startDate: isoDaysAgo(weeksAgo * 7 + 6),
        endDate: isoDaysAgo(weeksAgo * 7),
        touches,
        movingAverage4w:
          Math.round(
            (window.reduce((sum, n) => sum + n, 0) / window.length) * 10,
          ) / 10,
      };
    });

  const currentWeekTouches = weeklyPoints.at(-1)?.touches ?? 0;
  const fourWeekMovingAverage =
    weeklyPoints[weeklyPoints.length - 1]?.movingAverage4w ?? 0;

  // 2. Deal velocity & dormancy
  const dealHealthList: SlippingDeal[] = companies.map((company) => {
    const { daysDormant, status } = dealHealth(company);

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
  const touches30d = interactions.filter((i) =>
    isWithinDemoDays(i.date, 30),
  ).length;
  const touches90d = interactions.filter((i) =>
    isWithinDemoDays(i.date, 90),
  ).length;
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
  avgWinProbability: number;
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
      let touches30d = 0;
      let touches90d = 0;
      for (const interaction of repInteractions) {
        if (isWithinDemoDays(interaction.date, 90)) touches90d++;
        if (isWithinDemoDays(interaction.date, 30)) touches30d++;
      }

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
        avgWinProbability: summary.avgWin,
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
      ? [...reps].sort((a, b) => b.avgWinProbability - a.avgWinProbability)[0]
      : null;

  return {
    reps,
    topProducer,
    mostActiveRep,
    highestWinRep,
  };
}
