import { describe, expect, it } from "vitest";
import type { Interaction } from "@/data/interactions";
import {
  activityCounts,
  groupByDay,
  relativeDay,
  weeklyTouches,
  withinDays,
} from "./activity";
import { DEMO_HISTORY_DAYS, DEMO_TODAY, isoDaysAgo } from "./demo-clock";

function touch(date: string, channel: Interaction["channel"]): Interaction {
  return {
    id: `${date}-${channel}`,
    companyId: "acme",
    date,
    type: "Demo",
    channel,
    owner: "Sarah Nguyen",
  };
}

const LOG = [
  touch("2026-09-14", "meeting"),
  touch("2026-09-10", "email"),
  touch("2026-09-10", "call"),
  touch("2026-08-01", "note"),
];

describe("activity", () => {
  it("windows are inclusive of the boundary day", () => {
    expect(withinDays(LOG, 4)).toHaveLength(3);
    expect(withinDays(LOG, 3)).toHaveLength(1);
  });

  it("includes the oldest demo day but not older or future touches", () => {
    const boundary = touch(isoDaysAgo(DEMO_HISTORY_DAYS), "email");
    const older = touch(isoDaysAgo(DEMO_HISTORY_DAYS + 1), "call");
    const future = touch(isoDaysAgo(-1), "meeting");
    expect(withinDays([future, boundary, older], DEMO_HISTORY_DAYS)).toEqual([
      boundary,
    ]);
  });

  it("counts touches by channel", () => {
    expect(activityCounts(LOG)).toEqual({
      total: 4,
      email: 1,
      meeting: 1,
      call: 1,
      note: 1,
    });
  });

  it("groups a feed by day, newest day first, preserving order", () => {
    const days = groupByDay(LOG);
    expect(days.map((d) => d.date)).toEqual([
      "2026-09-14",
      "2026-09-10",
      "2026-08-01",
    ]);
    expect(days[1].items).toHaveLength(2);
  });

  it("buckets touches by week, oldest first, this week last", () => {
    const weeks = weeklyTouches(LOG);
    expect(weeks).toHaveLength(14);
    // Sept 14 and both Sept 10 touches are this week; Aug 1 is 44 days ago,
    // so week 6 back.
    expect(weeks[13]).toBe(3);
    expect(weeks[13 - 6]).toBe(1);
    expect(weeks.reduce((sum, n) => sum + n, 0)).toBe(4);
  });

  it("drops touches older than the window", () => {
    expect(weeklyTouches(LOG, 4)).toEqual([0, 0, 0, 3]);
  });
});

describe("relativeDay", () => {
  it("reads like speech", () => {
    expect(relativeDay(DEMO_TODAY)).toBe("today");
    expect(relativeDay(isoDaysAgo(1))).toBe("yesterday");
    expect(relativeDay(isoDaysAgo(12))).toBe("12 days ago");
  });
});
