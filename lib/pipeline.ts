import {
  STAGES,
  TAG_TONES,
  type Company,
  type Stage,
  type TagTone,
} from "@/data/companies";

/**
 * Pipeline maths, in one place.
 *
 * Every view that shows money (Deals Board, Forecast, Owner Profile) reads
 * from here, so the same company always lands in the same stage and the
 * totals reconcile to the dollar wherever they appear.
 */

export const UNSTAGED = "Unstaged";
export type StageKey = Stage | typeof UNSTAGED;

/** Board column order: every stage, then the Unstaged catch-all. */
export const STAGE_KEYS: readonly StageKey[] = [...STAGES, UNSTAGED];

export type PipelineSummary = {
  companies: number;
  openDeals: number;
  /** Sum of pipeline value. */
  total: number;
  /** Sum of per-company weighted value. */
  weighted: number;
  /** Mean win probability, rounded; 0 for an empty list. */
  avgWin: number;
};

export type PipelineGroup<K extends string> = {
  key: K;
  companies: Company[];
  summary: PipelineSummary;
};

/**
 * First stage tag wins, in the company's own tag order — a company counts in
 * exactly one stage. (Spotify's [Land & Expand, Expansion] is Land & Expand.)
 */
export function primaryStage(company: Company): StageKey {
  const stage = company.tags.find((tag): tag is Stage =>
    (STAGES as readonly string[]).includes(tag),
  );
  return stage ?? UNSTAGED;
}

export function stageTone(stage: StageKey): TagTone {
  return stage === UNSTAGED ? "neutral" : TAG_TONES[stage];
}

/** Pipeline value × win probability, rounded per company so sums reconcile. */
export function weightedValue(company: Company): number {
  return Math.round((company.pipelineValue * company.winProbability) / 100);
}

export function summarise(companies: readonly Company[]): PipelineSummary {
  let openDeals = 0;
  let total = 0;
  let weighted = 0;
  let win = 0;
  for (const company of companies) {
    openDeals += company.openDeals;
    total += company.pipelineValue;
    weighted += weightedValue(company);
    win += company.winProbability;
  }
  return {
    companies: companies.length,
    openDeals,
    total,
    weighted,
    avgWin: companies.length ? Math.round(win / companies.length) : 0,
  };
}

function group<K extends string>(
  companies: readonly Company[],
  keyOf: (company: Company) => K,
  order: readonly K[] = [],
): PipelineGroup<K>[] {
  const buckets = new Map<K, Company[]>(order.map((key) => [key, []]));
  for (const company of companies) {
    const key = keyOf(company);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(company);
    else buckets.set(key, [company]);
  }
  return [...buckets].map(([key, members]) => ({
    key,
    companies: members,
    summary: summarise(members),
  }));
}

/** Every stage (empty ones included) plus Unstaged, in board order. */
export function byStage(companies: readonly Company[]) {
  return group(companies, primaryStage, STAGE_KEYS).map(({ key, ...rest }) => ({
    stage: key,
    ...rest,
  }));
}

/** Owners ranked by weighted contribution, largest first. */
export function byOwner(companies: readonly Company[]) {
  return group(companies, (company) => company.owner)
    .map(({ key, ...rest }) => ({ owner: key, ...rest }))
    .sort((a, b) => b.summary.weighted - a.summary.weighted);
}

/** Highest weighted value first. */
export function topByWeighted(companies: readonly Company[], limit: number) {
  return [...companies]
    .sort((a, b) => weightedValue(b) - weightedValue(a))
    .slice(0, limit);
}
