import { cn } from "@/lib/utils";
import KpiCard from "@/components/_common/kpi-card";
import PipelineComparison from "@/components/_common/pipeline-comparison";
import Avatar from "@/components/_ui/avatar";
import Tag from "@/components/_ui/tag";
import SegmentBar from "@/components/_common/segment-bar";
import { ownerByName } from "@/data/companies";
import CountUp from "@/components/motion-primitives/count-up";
import { formatMoney } from "@/lib/companies";
import {
  byOwner,
  byStage,
  primaryStage,
  stageTone,
  summarise,
  topByWeighted,
  weightedValue,
} from "@/lib/pipeline";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";

const money = (v: number) => `$${formatMoney(Math.round(v))}`;

const PANEL = "flex flex-col gap-3";

const ROW_BUTTON =
  "ease-power3-out flex min-h-11 fine:min-h-0 w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-[background-color,transform] duration-150 hover:bg-white/4 active:scale-[0.99] focus-visible:ring-ring/60 focus-visible:ring-2 focus-visible:outline-none";

export default function Forecast() {
  const companies = useCompaniesStore((state) => state.companies);
  const openDetail = useUiStore((state) => state.openDetail);
  const openProfile = useUiStore((state) => state.openProfile);

  const summary = summarise(companies);
  const byStageRows = byStage(companies).filter(
    (row) => row.companies.length > 0,
  );
  const maxStageValue = Math.max(
    1,
    ...byStageRows.map((row) => row.summary.total),
  );
  const top = topByWeighted(companies, 8);
  const byOwnerRows = byOwner(companies).slice(0, 6);
  const maxOwnerTotal = Math.max(
    1,
    ...byOwnerRows.map((row) => row.summary.total),
  );

  const kpis = [
    { label: "Total pipeline", n: summary.total, format: money },
    { label: "Likely to land", n: summary.weighted, format: money },
    {
      label: "Avg chance to win",
      n: summary.avgWin,
      format: (v: number) => `${Math.round(v)}%`,
    },
    {
      label: "Open deals",
      n: summary.openDeals,
      format: (v: number) => String(Math.round(v)),
    },
  ];

  return (
    <section aria-label="Forecast" className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[72em] flex-col gap-10 px-4 pt-2 pb-24 lg:px-8 lg:pt-8 lg:pb-12">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={<CountUp value={kpi.n} format={kpi.format} />}
            />
          ))}
        </dl>

        <div className={PANEL}>
          <h2 className="eyebrow-style text-muted-foreground">
            Pipeline by stage
          </h2>
          {byStageRows.length === 0 && (
            <p className="caption-style text-muted-foreground">
              No stages to compare yet.
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {byStageRows.map((row) => (
              <li
                key={row.stage}
                className="flex min-w-0 flex-col gap-2 rounded-xl bg-white/[0.03] p-3 sm:grid sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-start"
              >
                <Tag tone={stageTone(row.stage)} size="sm" className="w-fit">
                  {row.stage}
                </Tag>
                <PipelineComparison
                  total={row.summary.total}
                  weighted={row.summary.weighted}
                  scale={maxStageValue}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className={PANEL}>
          <h2 className="eyebrow-style text-muted-foreground">
            Top opportunities
          </h2>
          {top.length === 0 && (
            <p className="caption-style text-muted-foreground">
              No opportunities yet.
            </p>
          )}
          <ul aria-label="Top opportunities" className="flex flex-col">
            {top.map((company, index) => {
              const owner = ownerByName(company.owner);
              const stage = primaryStage(company);
              return (
                <li
                  key={company.id}
                  className="animate-rise"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => openDetail(company.id)}
                    className={ROW_BUTTON}
                  >
                    <span className="caption-style text-subtle w-[2ch] shrink-0 tabular-nums">
                      {index + 1}
                    </span>
                    <Avatar src={owner.avatar} alt="" className="size-6" />
                    <span className="min-w-0 flex-1">
                      <span className="lead-style block truncate font-medium">
                        {company.name}
                      </span>
                      <span className="caption-style text-muted-foreground block truncate">
                        {company.owner}
                      </span>
                    </span>
                    <Tag
                      tone={stageTone(stage)}
                      size="sm"
                      className="hidden shrink-0 sm:inline-flex"
                    >
                      {stage}
                    </Tag>
                    <span className="hidden w-24 shrink-0 sm:block">
                      <SegmentBar
                        percent={company.winProbability}
                        animated
                        delay={Math.min(index, 4) * 25}
                        label="Estimated win probability"
                      />
                    </span>
                    <span className="caption-style shrink-0 text-right tabular-nums">
                      {company.winProbability}%
                    </span>
                    <span className="lead-style shrink-0 tabular-nums">
                      ${formatMoney(weightedValue(company))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={PANEL}>
          <h2 className="eyebrow-style text-muted-foreground">
            Forecast by owner
          </h2>
          {byOwnerRows.length === 0 && (
            <p className="caption-style text-muted-foreground">
              No owners to compare yet.
            </p>
          )}
          <ul aria-label="Forecast by owner" className="flex flex-col gap-2">
            {byOwnerRows.map((row, index) => {
              const owner = ownerByName(row.owner);
              return (
                <li key={row.owner} className="rounded-xl bg-white/[0.03] p-2">
                  <button
                    type="button"
                    onClick={() => openProfile(row.owner)}
                    className={cn(
                      ROW_BUTTON,
                      "flex-col items-stretch gap-2 sm:flex-row sm:items-center",
                    )}
                    aria-label={`Open ${row.owner} profile`}
                    aria-describedby={`forecast-owner-amounts-${index}`}
                  >
                    <span className="flex min-w-0 items-center gap-2 sm:w-40 sm:shrink-0">
                      <Avatar src={owner.avatar} alt="" className="size-6" />
                      <span className="lead-style truncate font-medium">
                        {row.owner}
                      </span>
                    </span>
                    <span
                      id={`forecast-owner-amounts-${index}`}
                      className="min-w-0 flex-1"
                    >
                      <PipelineComparison
                        total={row.summary.total}
                        weighted={row.summary.weighted}
                        scale={maxOwnerTotal}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {byOwnerRows.length > 0 && (
            <p className="caption-style text-muted-foreground">
              Ranked by likely value. Select an owner to see their profile.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
