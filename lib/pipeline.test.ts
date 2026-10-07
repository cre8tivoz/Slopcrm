import { describe, expect, it } from "vitest";
import { COMPANIES, STAGES, type Company } from "@/data/companies";
import {
  UNSTAGED,
  byOwner,
  byStage,
  primaryStage,
  summarise,
  weightedValue,
} from "./pipeline";

function company(overrides: Partial<Company>): Company {
  return {
    id: "acme",
    name: "Acme",
    tags: ["Enterprise", "New Logo"],
    owner: "Sarah Nguyen",
    openDeals: 2,
    pipelineValue: 1000,
    winProbability: 50,
    trend: [],
    lastInteraction: { date: "2026-09-01", label: "Demo" },
    ...overrides,
  };
}

describe("pipeline", () => {
  it("stage rows add up to exactly the summary totals", () => {
    const total = summarise(COMPANIES);
    const rows = byStage(COMPANIES);

    const sum = (pick: (row: (typeof rows)[number]) => number) =>
      rows.reduce((acc, row) => acc + pick(row), 0);

    expect(sum((row) => row.summary.total)).toBe(total.total);
    expect(sum((row) => row.summary.weighted)).toBe(total.weighted);
    expect(sum((row) => row.summary.openDeals)).toBe(total.openDeals);
    expect(sum((row) => row.companies.length)).toBe(COMPANIES.length);
  });

  it("owner rows add up to exactly the summary totals", () => {
    const total = summarise(COMPANIES);
    const rows = byOwner(COMPANIES);
    expect(rows.reduce((acc, row) => acc + row.summary.weighted, 0)).toBe(
      total.weighted,
    );
  });

  it("orders owners by weighted contribution, largest first", () => {
    const weights = byOwner(COMPANIES).map((row) => row.summary.weighted);
    expect(weights).toEqual([...weights].sort((a, b) => b - a));
  });

  it("primary stage follows the company's own tag order", () => {
    expect(
      primaryStage(company({ tags: ["Land & Expand", "Expansion"] })),
    ).toBe("Land & Expand");
    expect(
      primaryStage(company({ tags: ["Enterprise", "Co-Sell", "Expansion"] })),
    ).toBe("Co-Sell");
  });

  it("companies without a stage tag are Unstaged, never dropped", () => {
    const unstaged = company({ tags: ["Enterprise"] });
    expect(primaryStage(unstaged)).toBe(UNSTAGED);
    const row = byStage([unstaged]).find((r) => r.stage === UNSTAGED);
    expect(row?.companies).toEqual([unstaged]);
  });

  it("byStage lists every stage plus Unstaged, in board order", () => {
    expect(byStage([]).map((row) => row.stage)).toEqual([...STAGES, UNSTAGED]);
  });

  it("weighted value rounds per company", () => {
    expect(
      weightedValue(company({ pipelineValue: 333, winProbability: 50 })),
    ).toBe(167);
  });

  it("summarises an empty list without dividing by zero", () => {
    expect(summarise([])).toEqual({
      companies: 0,
      openDeals: 0,
      total: 0,
      weighted: 0,
      avgWin: 0,
    });
  });

  it("averages win probability across companies, rounded", () => {
    const summary = summarise([
      company({ winProbability: 10 }),
      company({ winProbability: 25 }),
    ]);
    expect(summary.avgWin).toBe(18);
  });
});
