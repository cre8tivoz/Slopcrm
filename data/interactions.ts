import {
  COMPANIES,
  INTERACTION_TYPES,
  type Company,
  type InteractionType,
} from "./companies";
import { DEMO_HISTORY_DAYS, daysSince, isoDaysAgo } from "@/lib/demo-clock";

/**
 * Seeded interaction history — every touch with every company.
 *
 * Deterministic (a tiny seeded PRNG keyed on the company id, never
 * Math.random), so the server prerender and the browser agree and the demo
 * reproduces exactly. Each company's newest entry IS its Last Interaction;
 * the older entries are generated backwards from there, so the Activities
 * feed, the detail sheet counts and the Last-activity filter all tell the
 * same story.
 */

export type InteractionChannel = "email" | "meeting" | "call" | "note";

export type Interaction = {
  id: string;
  companyId: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  type: InteractionType;
  channel: InteractionChannel;
  owner: string;
  /** Free-text summary, only on touches logged in the app. */
  note?: string;
};

/** How each kind of touch usually happens. */
export const CHANNEL_OF: Record<InteractionType, InteractionChannel> = {
  Discovery: "call",
  Demo: "meeting",
  Pricing: "email",
  Security: "email",
  Legal: "email",
  Product: "meeting",
  Pilot: "meeting",
  Exec: "meeting",
  "QBR Call": "call",
  Partner: "email",
  Renewal: "call",
  Expansion: "meeting",
};

const ARCHIVE_AFTER_DAYS = 90;
const ARCHIVE_CADENCES = [
  [4, 9],
  [10, 18],
  [19, 31],
] as const;

/** mulberry32 — small, fast, good enough for demo data. */
function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string) {
  let h = 2166136261;
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}

function historyFor(company: Company): Interaction[] {
  const seed = hash(company.id);
  const rng = createRng(seed);
  const between = (min: number, max: number) =>
    min + Math.floor(rng() * (max - min + 1));

  const latestType = company.lastInteraction.label as InteractionType;
  const entries: Interaction[] = [
    {
      id: `${company.id}-0`,
      companyId: company.id,
      date: company.lastInteraction.date,
      type: latestType,
      channel: CHANNEL_OF[latestType] ?? "note",
      owner: company.owner,
    },
  ];

  function addEarlierTouch(age: number) {
    const type = INTERACTION_TYPES[between(0, INTERACTION_TYPES.length - 1)];
    entries.push({
      id: `${company.id}-${entries.length}`,
      companyId: company.id,
      date: isoDaysAgo(age),
      type,
      // Roughly one in five earlier touches is an internal note.
      channel: rng() < 0.2 ? "note" : CHANNEL_OF[type],
      owner: company.owner,
    });
  }

  // Busier accounts get more touches around their most recent engagement.
  let lastAge = daysSince(company.lastInteraction.date);
  for (let n = 0; n < 3 + company.openDeals; n++) {
    const nextAge = lastAge + between(2, 12);
    if (nextAge > DEMO_HISTORY_DAYS) break;
    addEarlierTouch(nextAge);
    lastAge = nextAge;
  }

  // Backfill the older months without inflating the recent activity KPIs.
  // Different cadences leave some accounts with a quiet gap before they re-engage.
  const [minGap, maxGap] =
    ARCHIVE_CADENCES[(seed >>> 0) % ARCHIVE_CADENCES.length];
  for (
    let age = Math.max(lastAge, ARCHIVE_AFTER_DAYS) + between(minGap, maxGap);
    age <= DEMO_HISTORY_DAYS;
    age += between(minGap, maxGap)
  ) {
    addEarlierTouch(age);
    lastAge = age;
  }

  // The dormant LVMH account anchors the inclusive 180-day cutoff.
  if (company.id === "lvmh" && lastAge < DEMO_HISTORY_DAYS) {
    addEarlierTouch(DEMO_HISTORY_DAYS);
  }
  return entries;
}

/** Newest first; ties keep company order. */
export function generateInteractions(companies: readonly Company[]) {
  return companies
    .flatMap(historyFor)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const INTERACTIONS: Interaction[] = generateInteractions(COMPANIES);
