import { describe, expect, it } from "vitest";
import { DEMO_TODAY, daysSince, isoDaysAgo } from "./demo-clock";

describe("demo clock", () => {
  it("counts back whole days from the demo's today", () => {
    expect(isoDaysAgo(0)).toBe(DEMO_TODAY);
    expect(isoDaysAgo(14, "2026-09-14")).toBe("2026-08-31");
    expect(isoDaysAgo(1, "2026-03-01")).toBe("2026-02-28");
  });

  it("round-trips with daysSince", () => {
    for (const days of [0, 1, 7, 30, 88, 365]) {
      expect(daysSince(isoDaysAgo(days))).toBe(days);
    }
  });

  it("never reports a negative age", () => {
    expect(daysSince("2999-01-01")).toBe(0);
  });
});
