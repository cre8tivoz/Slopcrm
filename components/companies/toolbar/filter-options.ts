import {
  ACTIVITY_WINDOWS,
  OWNERS,
  SORT_OPTIONS,
  STAGES,
} from "@/data/companies";
import { ALL_OWNERS, ALL_TIME, ANY_STAGE } from "@/lib/companies";
import { UNSTAGED } from "@/lib/pipeline";

export const OWNER_OPTIONS = [
  { value: ALL_OWNERS, label: "All Owners" },
  ...OWNERS.map((owner) => ({ value: owner.name, label: owner.name })),
];

export const STAGE_OPTIONS = [
  { value: ANY_STAGE, label: "Any" },
  ...[...STAGES, UNSTAGED].map((tag) => ({ value: tag, label: tag })),
];

export const ACTIVITY_OPTIONS = [
  { value: ALL_TIME, label: "All time" },
  ...ACTIVITY_WINDOWS.map((days) => ({
    value: String(days),
    label: `${days} Days`,
  })),
];

export function parseActivityWindow(value: string) {
  return ACTIVITY_WINDOWS.find((days) => String(days) === value) ?? ALL_TIME;
}

export const SORT_MENU_OPTIONS = SORT_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));
