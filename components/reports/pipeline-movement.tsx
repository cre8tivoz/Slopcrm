import ActivityChart from "./activity-chart";
import FilterMenu from "@/components/_common/filter-menu";
import Avatar from "@/components/_ui/avatar";
import Tag from "@/components/_ui/tag";
import CompanyLogo from "@/components/company/company-logo";
import { formatMoney } from "@/lib/companies";
import {
  type PipelineVelocitySummary,
  type DealHealthStatus,
  type SlippingDeal,
} from "@/lib/reporting";
import { stageTone } from "@/lib/pipeline";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const PANEL = "flex flex-col gap-3";

const STATUS_BADGE: Record<
  DealHealthStatus,
  { label: string; tone: "danger" | "warning" | "success" }
> = {
  slipping: { label: "Going cold", tone: "danger" },
  "at-risk": { label: "Needs a nudge", tone: "warning" },
  active: { label: "Warm", tone: "success" },
};

export type ReportingWeeks = 14 | 26;
const RANGES: { value: string; label: string }[] = [
  { value: "14", label: "Last 14 weeks" },
  { value: "26", label: "Last 26 weeks" },
];

export default function PipelineMovement({
  velocity,
  weeks,
  onWeeksChange,
  selectedWeekAge,
  onWeekChange,
}: {
  velocity: PipelineVelocitySummary;
  weeks: ReportingWeeks;
  onWeeksChange: (weeks: ReportingWeeks) => void;
  selectedWeekAge: number;
  onWeekChange: (age: number) => void;
}) {
  const openDetail = useUiStore((state) => state.openDetail);
  const openProfile = useUiStore((state) => state.openProfile);

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-8">
      <section aria-label="Weekly activity" className={PANEL}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="eyebrow-style text-muted-foreground">
              Weekly activity
            </h2>
            <p className="caption-style text-muted-foreground">
              Touches in seven-day periods ending at the demo date.
            </p>
          </div>
          <FilterMenu
            label="Chart range"
            value={String(weeks)}
            options={RANGES}
            onChange={(value) => onWeeksChange(value === "26" ? 26 : 14)}
            align="end"
          />
        </div>
        <div className="caption-style text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="bg-trend size-2 rounded-sm" />
            Weekly touches
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-0.5 w-3 bg-[var(--tag-purple-text)]"
            />
            4-week moving average
          </span>
        </div>
        <ActivityChart
          points={velocity.weeklyPoints}
          selectedWeekAge={selectedWeekAge}
          onWeekChange={onWeekChange}
        />
        <p className="caption-style text-muted-foreground">
          Average time since contact: {velocity.averageDaysDormant} days
        </p>
      </section>

      <div className={cn(PANEL, "w-full max-w-full min-w-0")}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="eyebrow-style text-muted-foreground">
              Who needs a follow-up
            </h3>
            <p className="caption-style text-muted-foreground">
              High-value opportunities requiring immediate sales engagement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="caption-style bg-danger/10 text-danger rounded-full px-2 py-0.5 font-medium tabular-nums">
              {velocity.slippingCount} going cold
            </span>
            <span className="caption-style bg-warning/10 text-warning rounded-full px-2 py-0.5 font-medium tabular-nums">
              {velocity.atRiskCount} need a nudge
            </span>
          </div>
        </div>

        {velocity.slippingDeals.length === 0 && (
          <p className="caption-style text-muted-foreground">
            No accounts need a follow-up.
          </p>
        )}
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
                  className="focus-visible:outline-foreground flex min-h-11 min-w-0 items-center gap-3 rounded-sm text-left transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2"
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
                    className="text-muted-foreground hover:text-foreground focus-visible:outline-foreground flex min-h-11 items-center gap-1.5 rounded-sm text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
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
                      ${formatMoney(deal.weightedValue)} likely
                    </span>
                  </div>

                  <span
                    className={cn(
                      "caption-style shrink-0 rounded-full px-2.5 py-1 font-medium",
                      deal.status === "slipping"
                        ? "bg-danger/12 text-danger"
                        : "bg-warning/12 text-warning",
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
