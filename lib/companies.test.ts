import { describe, expect, it } from "vitest";
import { COMPANIES } from "@/data/companies";
import {
  DEFAULT_FILTERS,
  activeFilterCount,
  filterCompanies,
} from "./companies";
import { daysSince } from "./demo-clock";

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
      2, 5, 9, 18,
    ]);
  });

  it("default view shows every seeded company", () => {
    expect(filterCompanies(COMPANIES, DEFAULT_FILTERS)).toHaveLength(
      COMPANIES.length,
    );
  });

  it("filters by owner and by any tag (segment or stage)", () => {
    const owned = filterCompanies(COMPANIES, {
      ...DEFAULT_FILTERS,
      owner: "Sarah Nguyen",
    });
    expect(owned.length).toBeGreaterThan(0);
    expect(owned.every((c) => c.owner === "Sarah Nguyen")).toBe(true);

    const enterprise = filterCompanies(COMPANIES, {
      ...DEFAULT_FILTERS,
      stage: "Enterprise",
    });
    expect(enterprise.every((c) => c.tags.includes("Enterprise"))).toBe(true);
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
