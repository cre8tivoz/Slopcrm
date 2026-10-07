import Tag from "@/components/_ui/tag";
import SegmentBar from "@/components/_common/segment-bar";
import CompanyLogo from "@/components/company/company-logo";
import { formatMoney } from "@/lib/companies";
import {
  getStageConversionFunnel,
  type StageConversionMetric,
} from "@/lib/reporting";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const PANEL =
  "border-border bg-card/50 rounded-xl border p-3.5 flex flex-col gap-3";

export default function ConversionFunnel() {
  const companies = useCompaniesStore((state) => state.companies);
  const openDetail = useUiStore((state) => state.openDetail);

  const funnel = getStageConversionFunnel(companies);
  const activeStages = funnel.stages.filter(
    (s) => s.companies.length > 0 || s.summary.openDeals > 0,
  );
  const maxTotal = Math.max(1, ...activeStages.map((s) => s.summary.total));

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-4">
      {/* Funnel Visualisation */}
      <div className={cn(PANEL, "w-full max-w-full min-w-0")}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="lead-style font-medium">Stage Conversion Funnel</h2>
            <p className="caption-style text-muted-foreground">
              Lifecycle progression from early discovery to renewal, with win
              rates and expected yields.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="caption-style text-muted-foreground">
              Total Yield:{" "}
              <span className="text-foreground font-semibold tabular-nums">
                ${formatMoney(funnel.totalWeighted)}
              </span>
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-3 pt-1">
          {activeStages.map((metric, index) => {
            const widthPct = Math.max(
              12,
              Math.round((metric.summary.total / maxTotal) * 100),
            );

            return (
              <li
                key={metric.stage}
                className="border-border bg-card/30 animate-rise flex flex-col gap-2 rounded-lg border p-3"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Tag tone={metric.tone} size="sm">
                      {metric.stage}
                    </Tag>
                    <span className="caption-style text-muted-foreground tabular-nums">
                      {metric.summary.openDeals} deals ·{" "}
                      {metric.companies.length}{" "}
                      {metric.companies.length === 1 ? "account" : "accounts"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="caption-style text-muted-foreground">
                        Win Prob:
                      </span>
                      <span className="caption-style text-foreground font-medium tabular-nums">
                        {metric.winRate}%
                      </span>
                      <SegmentBar
                        percent={metric.winRate}
                        segments={10}
                        className="w-16"
                      />
                    </div>
                    <div className="w-24 text-right">
                      <span className="caption-style block font-semibold tabular-nums">
                        ${formatMoney(metric.summary.total)}
                      </span>
                      <span className="caption-style text-muted-foreground block text-[11px] tabular-nums">
                        ${formatMoney(metric.summary.weighted)} wtd
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="bg-track h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary/80 h-full rounded-full transition-all duration-300"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                {/* Companies in this stage chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="caption-style text-muted-foreground text-[11px]">
                    Accounts:
                  </span>
                  {metric.companies.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openDetail(c.id)}
                      className="border-border bg-card ease-power3-out inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs transition-[background-color,transform] hover:bg-white/5 active:scale-[0.98]"
                      aria-label={`View details for ${c.name}`}
                    >
                      <CompanyLogo company={c} size="xs" />
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground text-[10px] tabular-nums">
                        ${formatMoney(c.pipelineValue)}
                      </span>
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Conversion Breakdown & Risk Analysis */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={PANEL}>
          <h3 className="lead-style font-medium">Stage Yield & Risk</h3>
          <p className="caption-style text-muted-foreground">
            Comparison between potential contract value and weighted
            probability.
          </p>

          <div className="flex flex-col gap-2 pt-1">
            {activeStages.map((metric) => (
              <div
                key={metric.stage}
                className="border-border flex items-center justify-between border-b py-1.5 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <Tag tone={metric.tone} size="sm">
                    {metric.stage}
                  </Tag>
                  <span className="caption-style text-muted-foreground tabular-nums">
                    Avg Deal: ${formatMoney(metric.avgDealSize)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="caption-style text-success block font-medium tabular-nums">
                      +${formatMoney(metric.summary.weighted)} yield
                    </span>
                    <span className="caption-style text-danger/80 block text-[11px] tabular-nums">
                      -${formatMoney(metric.lossRisk)} at risk
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={PANEL}>
          <h3 className="lead-style font-medium">
            Funnel Efficiency Highlights
          </h3>
          <div className="flex flex-col gap-3 pt-1">
            <div className="border-border bg-card/30 flex items-start justify-between rounded-lg border p-3">
              <div>
                <span className="caption-style text-muted-foreground block">
                  Top Volume Stage
                </span>
                <span className="lead-style text-foreground font-semibold">
                  {funnel.highestValueStage}
                </span>
              </div>
              <span className="caption-style text-foreground font-semibold tabular-nums">
                $
                {formatMoney(
                  activeStages.find((s) => s.stage === funnel.highestValueStage)
                    ?.summary.total ?? 0,
                )}
              </span>
            </div>

            <div className="border-border bg-card/30 flex items-start justify-between rounded-lg border p-3">
              <div>
                <span className="caption-style text-muted-foreground block">
                  Highest Win Probability Stage
                </span>
                <span className="lead-style text-foreground font-semibold">
                  {funnel.highestWinStage}
                </span>
              </div>
              <span className="caption-style text-success font-semibold tabular-nums">
                {activeStages.find((s) => s.stage === funnel.highestWinStage)
                  ?.winRate ?? 0}
                % win rate
              </span>
            </div>

            <div className="border-border bg-card/30 flex items-start justify-between rounded-lg border p-3">
              <div>
                <span className="caption-style text-muted-foreground block">
                  Overall Pipeline Win Rate
                </span>
                <span className="lead-style text-foreground font-semibold">
                  {funnel.overallWinRate}%
                </span>
              </div>
              <span className="caption-style text-muted-foreground tabular-nums">
                Across {funnel.totalOpenDeals} active deals
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
