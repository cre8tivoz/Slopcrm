import { isoDaysAgo } from "@/lib/demo-clock";
import { withBasePath } from "@/lib/base-path";

export const SEGMENTS = [
  "Enterprise",
  "Mid-Market",
  "SMB",
  "Strategic",
] as const;

export const STAGES = [
  "New Logo",
  "Upsell",
  "Expansion",
  "Renewal",
  "Pilot",
  "Co-Sell",
  "Land & Expand",
] as const;

export type Segment = (typeof SEGMENTS)[number];
export type Stage = (typeof STAGES)[number];
export type Tag = Segment | Stage;

export type TagTone =
  | "blue"
  | "purple"
  | "green"
  | "moss"
  | "red"
  | "orange"
  | "amber"
  | "teal"
  | "yellow"
  | "neutral";

export const TAG_TONES: Record<Tag, TagTone> = {
  Enterprise: "blue",
  "Mid-Market": "moss",
  SMB: "yellow",
  Strategic: "red",
  "New Logo": "green",
  Upsell: "purple",
  Expansion: "green",
  Renewal: "green",
  Pilot: "orange",
  "Co-Sell": "amber",
  "Land & Expand": "teal",
};

export type Owner = {
  name: string;
  avatar: string;
  email: string;
  phone: string;
  role: string;
};

const AVATARS = Array.from({ length: 10 }, (_, i) =>
  withBasePath(`/assets/images/_common/avatars/avatar-${i + 1}.png`),
);

const OWNER_NAMES = [
  "Sarah Nguyen",
  "James Taylor",
  "Maria Keller",
  "Nia Jameson",
  "Alex Santos",
  "Mark Darnalds",
  "Drew Nash",
  "Lina Wong",
  "Jamie Fox",
  "Kate Chen",
  "Ricky Brown",
  "Hannah Mills",
  "Emma Green",
  "Oliver Chan",
  "Ava Brooks",
  "Noah Lee",
  "Grace Miller",
  "Chloe Park",
];

export const OWNERS: Owner[] = OWNER_NAMES.map((name, i) => ({
  name,
  avatar: AVATARS[i % AVATARS.length],
  email: `${name.toLowerCase().replace(" ", ".")}@crm.com`,
  phone: `+1 (202) ${String(199 + i).padStart(3, "0")}-${String(5520 + i * 37).slice(-4)}`,
  role: i % 3 === 0 ? "Senior Account Executive" : "Account Executive",
}));

export const CURRENT_USER: Owner = {
  name: "Jensen Ackles",
  avatar: withBasePath("/assets/images/_common/avatars/jensen.png"),
  email: "jensen.ackles@crm.com",
  phone: "+1 (202) 184-5501",
  role: "Head of Sales",
};

export function ownerByName(name: string): Owner {
  return OWNERS.find((owner) => owner.name === name) ?? OWNERS[0];
}

export function profileByName(name: string): Owner {
  return name === CURRENT_USER.name ? CURRENT_USER : ownerByName(name);
}

export type Company = {
  id: string;
  name: string;
  tags: Tag[];
  owner: string;
  openDeals: number;
  pipelineValue: number;
  winProbability: number;
  lastInteraction: { date: string; label: string };
  logo?: string;
};

/**
 * Seed records date their last interaction as "days before DEMO_TODAY" so
 * the whole dataset stays internally consistent (see lib/demo-clock.ts).
 */
type CompanySeed = Omit<Company, "logo" | "lastInteraction"> & {
  lastInteraction: { daysAgo: number; label: InteractionType };
};

const COMPANY_RECORDS: CompanySeed[] = [
  {
    id: "lvmh",
    name: "LVMH",
    tags: ["Enterprise", "Upsell", "Expansion", "Renewal"],
    owner: "Sarah Nguyen",
    openDeals: 7,
    pipelineValue: 420000,
    winProbability: 70,
    lastInteraction: { daysAgo: 88, label: "QBR Call" },
  },
  {
    id: "disney",
    name: "Disney",
    tags: ["Enterprise", "New Logo"],
    owner: "James Taylor",
    openDeals: 4,
    pipelineValue: 311242,
    winProbability: 51,
    lastInteraction: { daysAgo: 87, label: "Demo" },
  },
  {
    id: "paypal",
    name: "Paypal",
    tags: ["Enterprise"],
    owner: "Maria Keller",
    openDeals: 5,
    pipelineValue: 124232,
    winProbability: 22,
    lastInteraction: { daysAgo: 84, label: "Security" },
  },
  {
    id: "united-airlines",
    name: "United Airlines",
    tags: ["Renewal"],
    owner: "Nia Jameson",
    openDeals: 2,
    pipelineValue: 221231,
    winProbability: 77,
    lastInteraction: { daysAgo: 81, label: "Legal" },
  },
  {
    id: "apple",
    name: "Apple",
    tags: ["Pilot"],
    owner: "Alex Santos",
    openDeals: 6,
    pipelineValue: 530111,
    winProbability: 82,
    lastInteraction: { daysAgo: 83, label: "Exec" },
  },
  {
    id: "microsoft",
    name: "Microsoft",
    tags: ["Strategic", "Expansion"],
    owner: "Mark Darnalds",
    openDeals: 8,
    pipelineValue: 320222,
    winProbability: 86,
    lastInteraction: { daysAgo: 79, label: "Pilot" },
  },
  {
    id: "airbnb",
    name: "Airbnb",
    tags: ["Upsell", "Expansion", "SMB", "Pilot"],
    owner: "Drew Nash",
    openDeals: 3,
    pipelineValue: 122230,
    winProbability: 51,
    lastInteraction: { daysAgo: 78, label: "Pricing" },
  },
  {
    id: "intercom",
    name: "Intercom",
    tags: ["Enterprise", "Mid-Market"],
    owner: "Lina Wong",
    openDeals: 5,
    pipelineValue: 230112,
    winProbability: 61,
    lastInteraction: { daysAgo: 74, label: "Product" },
  },
  {
    id: "attio",
    name: "Attio",
    tags: ["Mid-Market", "Upsell", "Renewal", "Co-Sell"],
    owner: "Jamie Fox",
    openDeals: 2,
    pipelineValue: 420222,
    winProbability: 38,
    lastInteraction: { daysAgo: 58, label: "Pricing" },
  },
  {
    id: "google",
    name: "Google",
    tags: ["SMB", "Enterprise", "Expansion", "Pilot"],
    owner: "Kate Chen",
    openDeals: 8,
    pipelineValue: 112277,
    winProbability: 24,
    lastInteraction: { daysAgo: 62, label: "Renewal" },
  },
  {
    id: "netflix",
    name: "Netflix",
    tags: ["Mid-Market"],
    owner: "Ricky Brown",
    openDeals: 3,
    pipelineValue: 221221,
    winProbability: 72,
    lastInteraction: { daysAgo: 55, label: "Pilot" },
  },
  {
    id: "spotify",
    name: "Spotify",
    tags: ["Land & Expand", "Expansion", "Strategic"],
    owner: "Hannah Mills",
    openDeals: 5,
    pipelineValue: 170991,
    winProbability: 55,
    lastInteraction: { daysAgo: 48, label: "Expansion" },
  },
  {
    id: "shopify",
    name: "Shopify",
    tags: ["Co-Sell", "Expansion"],
    owner: "Emma Green",
    openDeals: 9,
    pipelineValue: 139007,
    winProbability: 45,
    lastInteraction: { daysAgo: 40, label: "Renewal" },
  },
  {
    id: "zoom",
    name: "Zoom",
    tags: ["Expansion", "Land & Expand", "Renewal"],
    owner: "Oliver Chan",
    openDeals: 8,
    pipelineValue: 289921,
    winProbability: 38,
    lastInteraction: { daysAgo: 27, label: "Partner" },
  },
  {
    id: "slack",
    name: "Slack",
    tags: ["Mid-Market", "Co-Sell"],
    owner: "Ava Brooks",
    openDeals: 4,
    pipelineValue: 333221,
    winProbability: 23,
    lastInteraction: { daysAgo: 24, label: "Discovery" },
  },
  {
    id: "stripe",
    name: "Stripe",
    tags: ["Expansion", "SMB", "Upsell", "Pilot"],
    owner: "Noah Lee",
    openDeals: 3,
    pipelineValue: 442231,
    winProbability: 44,
    lastInteraction: { daysAgo: 8, label: "Demo" },
  },
  {
    id: "snowflake",
    name: "Snowflake",
    tags: ["Enterprise", "Mid-Market"],
    owner: "Grace Miller",
    openDeals: 6,
    pipelineValue: 520000,
    winProbability: 24,
    lastInteraction: { daysAgo: 6, label: "Pricing" },
  },
  {
    id: "hubspot",
    name: "Hubspot",
    tags: ["Expansion", "Co-Sell", "Renewal", "Pilot"],
    owner: "Chloe Park",
    openDeals: 2,
    pipelineValue: 210123,
    winProbability: 52,
    lastInteraction: { daysAgo: 2, label: "QBR Call" },
  },
];

export const COMPANIES: Company[] = COMPANY_RECORDS.map(
  ({ lastInteraction, ...company }) => ({
    ...company,
    lastInteraction: {
      date: isoDaysAgo(lastInteraction.daysAgo),
      label: lastInteraction.label,
    },
    logo: withBasePath(`/assets/images/companies/logos/${company.id}.svg`),
  }),
);

export const SORT_OPTIONS = [
  { value: "pipelineValue", label: "Pipeline Value" },
  { value: "winProbability", label: "Win Probability" },
  { value: "openDeals", label: "Open Deals" },
  { value: "lastInteraction", label: "Last Interaction" },
  { value: "name", label: "Company Name" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export const INTERACTION_TYPES = [
  "Discovery",
  "Demo",
  "Pricing",
  "Security",
  "Legal",
  "Product",
  "Pilot",
  "Exec",
  "QBR Call",
  "Partner",
  "Renewal",
  "Expansion",
] as const;

export type InteractionType = (typeof INTERACTION_TYPES)[number];

export const ACTIVITY_WINDOWS = [7, 30, 60, 90] as const;

export type ActivityWindow = (typeof ACTIVITY_WINDOWS)[number];

/** Period picker windows (days) on the company detail sheet. */
export const TREND_WINDOWS = [7, 30, 90] as const;

export type ScoreCard = {
  title: string;
  description: string;
  reviewer: string;
  reviewerAvatar: string;
  updated: string;
  verdict: string;
  stars: number;
};

export const SCORE_CARDS: ScoreCard[] = [
  {
    title: "Business fit",
    description:
      "Evaluates how well the company aligns with our ideal customer profile.",
    reviewer: "Emma Green",
    reviewerAvatar: withBasePath("/assets/images/_common/avatars/detail-2.png"),
    updated: "Updated 2h ago",
    verdict: "High potential SN",
    stars: 4,
  },
  {
    title: "Technical fit",
    description:
      "Evaluates technical compatibility, security requirements, and integration readiness.",
    reviewer: "Ricky Brown",
    reviewerAvatar: withBasePath("/assets/images/_common/avatars/detail-3.png"),
    updated: "Updated 2h ago",
    verdict: "High potential SN",
    stars: 4,
  },
  {
    title: "Technical fit",
    description:
      "Evaluates technical compatibility, security requirements, and integration readiness.",
    reviewer: "Taylor Leroy",
    reviewerAvatar: withBasePath("/assets/images/_common/avatars/detail-1.png"),
    updated: "Updated 2h ago",
    verdict: "High potential SN",
    stars: 4,
  },
];
