import { describe, expect, it } from "vitest";
import { COMPANIES } from "@/data/companies";
import {
  formatCompactMoney,
  formatLongDate,
  DEFAULT_FILTERS,
  activeFilterCount,
  filterCompanies,
} from "./companies";
import { daysSince, isoDaysAgo } from "./demo-clock";
import { primaryStage } from "./pipeline";

const withWindow = (activityWindow: number) =>
  filterCompanies(COMPANIES, { ...DEFAULT_FILTERS, activityWindow });

describe("filterCompanies", () => {
  it("activity window reads the same date every view displays", () => {
    for (const days of [7, 30, 60, 90]) {
      for (const company of withWindow(days)) {
        expect(daysSince(company.lastInteraction.date)).toBeLessThanOrEqual(
          days,
        );
      }
    }
  });

  it("seed data gives each window a meaningfully different slice", () => {
    expect([7, 30, 60, 90].map((d) => withWindow(d).length)).toEqual([
      2, 5, 9, 17,
    ]);
  });

  it("default view shows every seeded company", () => {
    expect(filterCompanies(COMPANIES, DEFAULT_FILTERS)).toHaveLength(
      COMPANIES.length,
    );
  });

  it("includes accounts older than the largest activity window by default", () => {
    const company = {
      ...COMPANIES[0],
      lastInteraction: { date: isoDaysAgo(91), label: "Demo" },
    };
    expect(filterCompanies([company], DEFAULT_FILTERS)).toEqual([company]);
    expect(
      filterCompanies([company], { ...DEFAULT_FILTERS, activityWindow: 90 }),
    ).toEqual([]);
  });

  it("filters by owner and primary stage, ignoring secondary stage tags", () => {
    const owned = filterCompanies(COMPANIES, {
      ...DEFAULT_FILTERS,
      owner: "Sarah Nguyen",
    });
    expect(owned.length).toBeGreaterThan(0);
    expect(owned.every((c) => c.owner === "Sarah Nguyen")).toBe(true);

    const company = {
      ...COMPANIES[0],
      tags: ["Enterprise", "Renewal", "Pilot"],
    } satisfies (typeof COMPANIES)[number];
    const stage = primaryStage(company);
    expect(filterCompanies([company], { ...DEFAULT_FILTERS, stage })).toEqual([
      company,
    ]);
    expect(
      filterCompanies([company], { ...DEFAULT_FILTERS, stage: "Pilot" }),
    ).toEqual([]);
  });

  it("sorts by most recent interaction", () => {
    const dates = filterCompanies(COMPANIES, {
      ...DEFAULT_FILTERS,
      sortBy: "lastInteraction",
    }).map((c) => c.lastInteraction.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("does not mutate the input list", () => {
    const before = COMPANIES.map((c) => c.id);
    filterCompanies(COMPANIES, { ...DEFAULT_FILTERS, sortBy: "name" });
    expect(COMPANIES.map((c) => c.id)).toEqual(before);
  });

  it("counts only the filters that differ from the defaults", () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(
      activeFilterCount({ ...DEFAULT_FILTERS, owner: "x", activityWindow: 7 }),
    ).toBe(2);
  });
});

describe("headline formatting", () => {
  it("compacts money", () => {
    expect(formatCompactMoney(5_138_594)).toBe("$5.1M");
    expect(formatCompactMoney(420_222)).toBe("$420K");
    expect(formatCompactMoney(950)).toBe("$950");
  });

  it("spells out the demo date", () => {
    expect(formatLongDate("2026-09-14")).toBe("Monday 14 September");
  });
});
