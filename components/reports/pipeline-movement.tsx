import Avatar from "@/components/_ui/avatar";
import Tag from "@/components/_ui/tag";
import CompanyLogo from "@/components/company/company-logo";
import { formatMoney } from "@/lib/companies";
import {
  getPipelineVelocity,
  type DealHealthStatus,
  type SlippingDeal,
} from "@/lib/reporting";
import { stageTone } from "@/lib/pipeline";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const PANEL =
  "border-border bg-card/50 rounded-xl border p-3.5 flex flex-col gap-3";

const STATUS_BADGE: Record<
  DealHealthStatus,
  { label: string; tone: "danger" | "warning" | "success" }
> = {
  slipping: { label: "Slipping", tone: "danger" },
  "at-risk": { label: "At Risk", tone: "warning" },
  active: { label: "Active", tone: "success" },
};

export default function PipelineMovement() {
  const companies = useCompaniesStore((state) => state.companies);
  const interactions = useCompaniesStore((state) => state.interactions);
  const openDetail = useUiStore((state) => state.openDetail);
  const openProfile = useUiStore((state) => state.openProfile);

  const velocity = getPipelineVelocity(companies, interactions, 14);
  const maxWeeklyTouches = Math.max(
    1,
    ...velocity.weeklyPoints.map((pt) =>
      Math.max(pt.touches, pt.movingAverage4w),
    ),
  );

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-4">
      {/* Velocity and 14-week trend */}
      <div className={cn(PANEL, "w-full max-w-full min-w-0")}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="lead-style font-medium">
              Pipeline Activity Velocity
            </h2>
            <p className="caption-style text-muted-foreground">
              Touches per week over the 14-week window, overlaid with a 4-week
              rolling moving average.
            </p>
          </div>
          <div className="flex items-center gap-4 self-start text-right sm:self-auto">
            <div>
              <span className="caption-style text-muted-foreground block text-[11px]">
                4-Wk Moving Avg
              </span>
              <span className="lead-style text-foreground font-semibold tabular-nums">
                {velocity.fourWeekMovingAverage} / wk
              </span>
            </div>
            <div>
              <span className="caption-style text-muted-foreground block text-[11px]">
                Current Week
              </span>
              <span className="lead-style text-foreground font-semibold tabular-nums">
                {velocity.currentWeekTouches} touches
              </span>
            </div>
          </div>
        </div>

        {/* 14-Week Bar + Moving Average visual */}
        <div className="border-border bg-card/30 flex w-full max-w-full min-w-0 flex-col gap-3 rounded-lg border p-3 sm:p-4">
          <div className="w-full max-w-full min-w-0 overflow-x-auto [scrollbar-width:none]">
            <div className="flex h-36 min-w-[280px] items-end gap-1 sm:gap-2.5">
              {velocity.weeklyPoints.map((pt) => {
                const barHeightPct = Math.max(
                  4,
                  Math.round((pt.touches / maxWeeklyTouches) * 100),
                );
                const maHeightPct = Math.max(
                  4,
                  Math.round((pt.movingAverage4w / maxWeeklyTouches) * 100),
                );

                return (
                  <div
                    key={pt.label}
                    className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    {/* Tooltip on hover */}
                    <div className="border-border bg-popover/90 text-popover-foreground pointer-events-none absolute -top-8 z-10 hidden rounded border px-2 py-0.5 text-[10px] whitespace-nowrap shadow group-hover:block">
                      {pt.label}: {pt.touches} touches (4w MA:{" "}
                      {pt.movingAverage4w})
                    </div>

                    {/* 4w Moving Average tick marker */}
                    <div
                      className="bg-primary/90 absolute z-10 h-1 w-full rounded-full transition-all"
                      style={{ bottom: `${maHeightPct}%` }}
                      title={`4-week MA: ${pt.movingAverage4w}`}
                    />

                    {/* Weekly touch bar */}
                    <div
                      className={cn(
                        "w-full rounded-t transition-all duration-300",
                        pt.touches > 0 ? "bg-trend" : "bg-trend-muted",
                      )}
                      style={{ height: `${barHeightPct}%` }}
                    />

                    <span className="text-muted-foreground block truncate text-[9px] tabular-nums sm:text-[10px]">
                      {pt.label === "This week" ? "Now" : pt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-border flex flex-wrap items-center justify-between gap-2 border-t pt-2">
            <div className="text-muted-foreground flex items-center gap-3 text-xs sm:gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-trend inline-block size-2 rounded-[1px]" />
                Weekly Touches
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-primary inline-block h-1 w-3 rounded-full" />
                4-Week Moving Average
              </span>
            </div>
            <span className="caption-style text-muted-foreground text-[11px] tabular-nums">
              Avg deal dormancy: {velocity.averageDaysDormant} days
            </span>
          </div>
        </div>
      </div>

      {/* Slipping & At-Risk Deals Radar */}
      <div className={cn(PANEL, "w-full max-w-full min-w-0")}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="lead-style font-medium">Slipping & At-Risk Deals</h3>
            <p className="caption-style text-muted-foreground">
              High-value opportunities requiring immediate sales engagement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="caption-style bg-danger/10 text-danger border-danger/30 rounded-full border px-2 py-0.5 font-medium tabular-nums">
              {velocity.slippingCount} Slipping
            </span>
            <span className="caption-style bg-warning/10 text-warning border-warning/30 rounded-full border px-2 py-0.5 font-medium tabular-nums">
              {velocity.atRiskCount} At Risk
            </span>
          </div>
        </div>

        <ul className="divide-border flex w-full max-w-full min-w-0 flex-col divide-y pt-1">
          {velocity.slippingDeals.map((deal: SlippingDeal, index) => {
            const badge = STATUS_BADGE[deal.status];

            return (
              <li
                key={deal.company.id}
                className="animate-rise flex w-full max-w-full min-w-0 flex-col gap-2 py-3 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <button
                  type="button"
                  onClick={() => openDetail(deal.company.id)}
                  className="flex min-w-0 items-center gap-3 text-left transition-opacity hover:opacity-85"
                  aria-label={`Open details for ${deal.company.name}`}
                >
                  <CompanyLogo company={deal.company} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="lead-style truncate font-medium">
                        {deal.company.name}
                      </span>
                      <Tag tone={stageTone(deal.stage)} size="sm">
                        {deal.stage}
                      </Tag>
                    </div>
                    <span className="caption-style text-muted-foreground block truncate text-xs">
                      Last interaction: {deal.company.lastInteraction.label} ·{" "}
                      <span className="text-foreground font-medium tabular-nums">
                        {deal.daysDormant} days ago
                      </span>
                    </span>
                  </div>
                </button>

                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-4">
                  <button
                    type="button"
                    onClick={() => openProfile(deal.owner.name)}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
                    aria-label={`Open profile for ${deal.owner.name}`}
                  >
                    <Avatar src={deal.owner.avatar} alt="" className="size-5" />
                    <span className="max-w-[120px] truncate">
                      {deal.owner.name}
                    </span>
                  </button>

                  <div className="text-right">
                    <span className="caption-style block font-semibold tabular-nums">
                      ${formatMoney(deal.pipelineValue)}
                    </span>
                    <span className="caption-style text-muted-foreground block text-[11px] tabular-nums">
                      ${formatMoney(deal.weightedValue)} wtd
                    </span>
                  </div>

                  <span
                    className={cn(
                      "caption-style shrink-0 rounded px-2 py-0.5 text-[11px] font-medium tracking-wider uppercase",
                      deal.status === "slipping"
                        ? "bg-danger/15 text-danger border-danger/30 border"
                        : "bg-warning/15 text-warning border-warning/30 border",
                    )}
                  >
                    {badge.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
