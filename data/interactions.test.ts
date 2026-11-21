import { describe, expect, it } from "vitest";
import { COMPANIES } from "./companies";
import { INTERACTIONS, generateInteractions } from "./interactions";
import {
  DEMO_HISTORY_DAYS,
  DEMO_TODAY,
  daysSince,
  isoDaysAgo,
} from "@/lib/demo-clock";

describe("seeded interaction log", () => {
  it("is deterministic — same seed data, same log", () => {
    expect(generateInteractions(COMPANIES)).toEqual(INTERACTIONS);
  });

  it("gives every company a history, newest first", () => {
    for (const company of COMPANIES) {
      const log = INTERACTIONS.filter((i) => i.companyId === company.id);
      expect(log.length).toBeGreaterThanOrEqual(3);
      const dates = log.map((i) => i.date);
      expect(dates).toEqual([...dates].sort().reverse());
    }
  });

  it("each company's latest interaction is its Last Interaction", () => {
    for (const company of COMPANIES) {
      const latest = INTERACTIONS.find((i) => i.companyId === company.id);
      expect(latest?.date).toBe(company.lastInteraction.date);
      expect(latest?.type).toBe(company.lastInteraction.label);
    }
  });

  it("never dates an interaction after the demo's today", () => {
    expect(INTERACTIONS.every((i) => i.date <= DEMO_TODAY)).toBe(true);
  });

  it("covers all six months without reaching past the inclusive cutoff", () => {
    const ages = INTERACTIONS.map((i) => daysSince(i.date));
    expect(Math.max(...ages)).toBe(DEMO_HISTORY_DAYS);
    for (let start = 0; start < DEMO_HISTORY_DAYS; start += 30) {
      expect(ages.some((age) => age >= start && age < start + 30)).toBe(true);
    }
  });

  it("includes a dormant account with no touch in the default feed window", () => {
    const log = INTERACTIONS.filter((i) => i.companyId === "lvmh");
    expect(log.every((i) => daysSince(i.date) > 90)).toBe(true);
    expect(log.at(-1)?.date).toBe(isoDaysAgo(DEMO_HISTORY_DAYS));
  });

  it("uses unique ids", () => {
    expect(new Set(INTERACTIONS.map((i) => i.id)).size).toBe(
      INTERACTIONS.length,
    );
  });

  it("is sorted newest first across companies", () => {
    const dates = INTERACTIONS.map((i) => i.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});
