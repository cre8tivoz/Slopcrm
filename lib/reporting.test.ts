import { describe, expect, it } from "vitest";
import { COMPANIES } from "@/data/companies";
import { INTERACTIONS } from "@/data/interactions";
import {
  FUNNEL_STAGE_ORDER,
  getPipelineVelocity,
  getRepPerformance,
  getStageConversionFunnel,
} from "./reporting";

describe("lib/reporting", () => {
  describe("getStageConversionFunnel", () => {
    it("preserves total pipeline and weighted values from summarise", () => {
      const funnel = getStageConversionFunnel(COMPANIES);
      expect(funnel.totalPipeline).toBe(5138594);
      expect(funnel.totalWeighted).toBe(2681163);
      expect(funnel.totalOpenDeals).toBe(90);
      expect(funnel.overallWinRate).toBe(51);
    });

    it("orders stages by lifecycle progression order", () => {
      const funnel = getStageConversionFunnel(COMPANIES);
      expect(funnel.stages.map((s) => s.stage)).toEqual(FUNNEL_STAGE_ORDER);
    });

    it("calculates loss risk as unweighted minus weighted value", () => {
      const funnel = getStageConversionFunnel(COMPANIES);
      for (const stage of funnel.stages) {
        expect(stage.lossRisk).toBe(
          stage.summary.total - stage.summary.weighted,
        );
      }
    });

    it("identifies highest value and win stages", () => {
      const funnel = getStageConversionFunnel(COMPANIES);
      expect(funnel.highestValueStage).toBeDefined();
      expect(funnel.highestWinStage).toBeDefined();
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
});
