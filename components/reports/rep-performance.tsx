import Avatar from "@/components/_ui/avatar";
import Tag from "@/components/_ui/tag";
import SegmentBar from "@/components/_common/segment-bar";
import CompanyLogo from "@/components/company/company-logo";
import { formatMoney } from "@/lib/companies";
import { getRepPerformance, type RepPerformanceRow } from "@/lib/reporting";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const PANEL =
  "border-border bg-card/50 rounded-xl border p-3.5 flex flex-col gap-3";

export default function RepPerformance() {
  const companies = useCompaniesStore((state) => state.companies);
  const interactions = useCompaniesStore((state) => state.interactions);
  const openDetail = useUiStore((state) => state.openDetail);
  const openProfile = useUiStore((state) => state.openProfile);

  const repSummary = getRepPerformance(companies, interactions);

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-4">
      {/* Highlights / Podium Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {repSummary.topProducer && (
          <div className="border-border bg-card/40 flex flex-col gap-2 rounded-xl border p-3.5">
            <span className="caption-style text-muted-foreground">
              Top Pipeline Producer
            </span>
            <div className="flex items-center gap-2.5">
              <Avatar
                src={repSummary.topProducer.owner.avatar}
                alt=""
                className="size-8"
              />
              <div className="min-w-0 flex-1">
                <span className="lead-style block truncate font-medium">
                  {repSummary.topProducer.owner.name}
                </span>
                <span className="caption-style text-muted-foreground block truncate text-[11px]">
                  ${formatMoney(repSummary.topProducer.weightedPipeline)} wtd
                </span>
              </div>
            </div>
          </div>
        )}

        {repSummary.mostActiveRep && (
          <div className="border-border bg-card/40 flex flex-col gap-2 rounded-xl border p-3.5">
            <span className="caption-style text-muted-foreground">
              Highest Activity Pace (30d)
            </span>
            <div className="flex items-center gap-2.5">
              <Avatar
                src={repSummary.mostActiveRep.owner.avatar}
                alt=""
                className="size-8"
              />
              <div className="min-w-0 flex-1">
                <span className="lead-style block truncate font-medium">
                  {repSummary.mostActiveRep.owner.name}
                </span>
                <span className="caption-style text-muted-foreground block truncate text-[11px]">
                  {repSummary.mostActiveRep.touches30d} touches in 30 days
                </span>
              </div>
            </div>
          </div>
        )}

        {repSummary.highestWinRep && (
          <div className="border-border bg-card/40 flex flex-col gap-2 rounded-xl border p-3.5">
            <span className="caption-style text-muted-foreground">
              Highest Win Probability
            </span>
            <div className="flex items-center gap-2.5">
              <Avatar
                src={repSummary.highestWinRep.owner.avatar}
                alt=""
                className="size-8"
              />
              <div className="min-w-0 flex-1">
                <span className="lead-style block truncate font-medium">
                  {repSummary.highestWinRep.owner.name}
                </span>
                <span className="caption-style text-success block truncate text-[11px] font-medium">
                  {repSummary.highestWinRep.avgWinRate}% win probability
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rep Leaderboard Table */}
      <div className={PANEL}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="lead-style font-medium">Sales Rep Leaderboard</h2>
            <p className="caption-style text-muted-foreground">
              Ranked by weighted pipeline. Click any rep to open their profile.
            </p>
          </div>
          <span className="caption-style text-muted-foreground">
            {repSummary.reps.length} active reps
          </span>
        </div>

        <ul className="divide-border flex flex-col divide-y pt-1">
          {repSummary.reps.map((rep: RepPerformanceRow, index) => (
            <li
              key={rep.owner.name}
              className="animate-rise flex flex-col gap-3 py-3 first:pt-1 last:pb-1 lg:flex-row lg:items-center lg:justify-between"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="caption-style text-muted-foreground w-4 text-center font-medium">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => openProfile(rep.owner.name)}
                  className="flex items-center gap-3 text-left transition-opacity hover:opacity-85"
                  aria-label={`Open profile for ${rep.owner.name}`}
                >
                  <Avatar src={rep.owner.avatar} alt="" className="size-9" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="lead-style font-medium">
                        {rep.owner.name}
                      </span>
                      <span
                        className={cn(
                          "caption-style py-0.2 rounded px-1.5 text-[10px] font-medium",
                          rep.status === "High Pace" &&
                            "bg-success/15 text-success",
                          rep.status === "Steady" && "bg-muted text-foreground",
                          rep.status === "Action Needed" &&
                            "bg-warning/15 text-warning",
                        )}
                      >
                        {rep.status}
                      </span>
                    </div>
                    <span className="caption-style text-muted-foreground block text-xs">
                      {rep.owner.role} · {rep.companiesCount}{" "}
                      {rep.companiesCount === 1 ? "account" : "accounts"} ·{" "}
                      {rep.openDeals} deals
                    </span>
                  </div>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 lg:justify-end">
                {/* Win rate indicator */}
                <div className="flex items-center gap-2">
                  <span className="caption-style text-muted-foreground text-xs">
                    Win:
                  </span>
                  <span className="caption-style font-semibold tabular-nums">
                    {rep.avgWinRate}%
                  </span>
                  <SegmentBar
                    percent={rep.avgWinRate}
                    segments={8}
                    className="w-14"
                  />
                </div>

                {/* 30-day touch count */}
                <div className="text-right">
                  <span className="caption-style block font-medium tabular-nums">
                    {rep.touches30d} touches / 30d
                  </span>
                  <span className="caption-style text-muted-foreground block text-[11px] tabular-nums">
                    {rep.activityRatio} touches / deal
                  </span>
                </div>

                {/* Pipeline & weighted values */}
                <div className="w-28 text-right">
                  <span className="caption-style block font-semibold tabular-nums">
                    ${formatMoney(rep.totalPipeline)}
                  </span>
                  <span className="caption-style text-muted-foreground block text-[11px] tabular-nums">
                    ${formatMoney(rep.weightedPipeline)} wtd
                  </span>
                </div>

                {/* Top deal shortcut */}
                {rep.topCompany && (
                  <button
                    type="button"
                    onClick={() => openDetail(rep.topCompany!.id)}
                    className="border-border bg-card ease-power3-out hidden items-center gap-1.5 rounded border px-2 py-1 text-xs transition-[background-color,transform] hover:bg-white/5 active:scale-[0.98] sm:inline-flex"
                    aria-label={`View ${rep.topCompany.name}`}
                  >
                    <CompanyLogo company={rep.topCompany} size="xs" />
                    <span className="max-w-[90px] truncate font-medium">
                      {rep.topCompany.name}
                    </span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
