import { describe, expect, it } from "vitest";
import { COMPANIES } from "@/data/companies";
import { INTERACTIONS } from "@/data/interactions";
import { DEMO_TODAY, isoDaysAgo } from "./demo-clock";
import {
  REPORT_STAGE_ORDER,
  dealHealth,
  followUpQueue,
  getPipelineVelocity,
  getRepPerformance,
  getStagePipeline,
} from "./reporting";

describe("lib/reporting", () => {
  describe("getStagePipeline", () => {
    it("preserves total pipeline and weighted values from summarise", () => {
      const pipeline = getStagePipeline(COMPANIES);
      expect(pipeline.totalPipeline).toBe(5138594);
      expect(pipeline.totalWeighted).toBe(2681163);
      expect(pipeline.totalOpenDeals).toBe(90);
      expect(pipeline.overallWinProbability).toBe(51);
    });

    it("orders stages by lifecycle progression order", () => {
      const pipeline = getStagePipeline(COMPANIES);
      expect(pipeline.stages.map((s) => s.stage)).toEqual(REPORT_STAGE_ORDER);
    });

    it("calculates loss risk as unweighted minus weighted value", () => {
      const pipeline = getStagePipeline(COMPANIES);
      for (const stage of pipeline.stages) {
        expect(stage.lossRisk).toBe(
          stage.summary.total - stage.summary.weighted,
        );
      }
    });

    it("identifies highest value and win stages", () => {
      const pipeline = getStagePipeline(COMPANIES);
      expect(pipeline.highestValueStage).toBeDefined();
      expect(pipeline.highestProbabilityStage).toBeDefined();
    });
  });

  describe("getPipelineVelocity", () => {
    it("computes 14 weekly velocity points with 4-week moving average", () => {
      const velocity = getPipelineVelocity(COMPANIES, INTERACTIONS, 14);
      expect(velocity.weeklyPoints).toHaveLength(14);
      expect(velocity.weeklyPoints[13].label).toBe("This week");
      // Every moving average is positive or zero
      for (const pt of velocity.weeklyPoints) {
        expect(pt.movingAverage4w).toBeGreaterThanOrEqual(0);
        expect(pt.touches).toBeGreaterThanOrEqual(0);
      }
    });

    it("categorizes deals into active, at-risk, and slipping", () => {
      const velocity = getPipelineVelocity(COMPANIES, INTERACTIONS);
      const totalDeals =
        velocity.activeCount + velocity.atRiskCount + velocity.slippingCount;
      expect(totalDeals).toBe(COMPANIES.length);
      expect(velocity.slippingDeals.length).toBeGreaterThan(0);
    });
  });

  describe("getRepPerformance", () => {
    it("aggregates performance by owner and ranks by weighted pipeline", () => {
      const repData = getRepPerformance(COMPANIES, INTERACTIONS);
      expect(repData.reps.length).toBeGreaterThan(0);

      // Verify descending order by weighted pipeline
      for (let i = 0; i < repData.reps.length - 1; i++) {
        expect(repData.reps[i].weightedPipeline).toBeGreaterThanOrEqual(
          repData.reps[i + 1].weightedPipeline,
        );
      }

      expect(repData.topProducer).toBe(repData.reps[0]);
      expect(repData.mostActiveRep).toBeDefined();
      expect(repData.highestWinRep).toBeDefined();
    });
  });

  describe("dealHealth / followUpQueue", () => {
    const at = (id: string, daysAgo: number, value: number) => ({
      ...COMPANIES[0],
      id,
      pipelineValue: value,
      lastInteraction: { date: isoDaysAgo(daysAgo), label: "Demo" },
    });

    it("bands by days since last contact", () => {
      expect(dealHealth(at("a", 14, 1)).status).toBe("active");
      expect(dealHealth(at("b", 15, 1)).status).toBe("at-risk");
      expect(dealHealth(at("c", 46, 1)).status).toBe("slipping");
      expect(dealHealth(at("d", 0, 1)).daysDormant).toBe(0);
    });

    it("lists going-cold deals first, biggest first, and skips on-track ones", () => {
      const queue = followUpQueue([
        at("fresh", 2, 900),
        at("nudge-big", 20, 800),
        at("cold-small", 60, 100),
        at("cold-big", 90, 500),
      ]);
      expect(queue.map((item) => item.company.id)).toEqual([
        "cold-big",
        "cold-small",
        "nudge-big",
      ]);
      expect(DEMO_TODAY).toBe(isoDaysAgo(0));
    });
  });
});
