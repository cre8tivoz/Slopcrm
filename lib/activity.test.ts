import { describe, expect, it } from "vitest";
import type { Interaction } from "@/data/interactions";
import { activityCounts, groupByDay, withinDays } from "./activity";

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
});
