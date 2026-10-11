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

const KPI_CARD = "flex flex-col gap-1.5";

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
  const maxOwnerWeighted = Math.max(
    1,
    ...byOwnerRows.map((row) => row.summary.weighted),
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
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={KPI_CARD}>
              <span className="caption-style text-muted-foreground">
                {kpi.label}
              </span>
              <span className="text-[24px] leading-none font-semibold tracking-[-0.02em] tabular-nums">
                <CountUp value={kpi.n} format={kpi.format} />
              </span>
            </div>
          ))}
        </div>

        <div className={PANEL}>
          <h2 className="eyebrow-style text-muted-foreground">
            Pipeline by stage
          </h2>
          <ul className="flex flex-col gap-2.5">
            {byStageRows.map((row, index) => (
              <li
                key={row.stage}
                className="animate-rise"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Tag tone={stageTone(row.stage)} size="sm" className="w-28">
                    {row.stage}
                  </Tag>
                  <span className="bg-track h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
                    <span
                      className="bg-primary/70 animate-grow-x block h-full origin-left rounded-full"
                      style={{
                        width: `${Math.round((row.summary.total / maxStageValue) * 100)}%`,
                        animationDelay: `${index * 50}ms`,
                      }}
                    />
                  </span>
                  <span className="caption-style w-20 shrink-0 text-right tabular-nums">
                    ${formatMoney(row.summary.total)}
                  </span>
                  <span className="caption-style text-muted-foreground hidden w-28 shrink-0 truncate text-right tabular-nums sm:block">
                    ${formatMoney(row.summary.weighted)} likely
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={PANEL}>
          <h2 className="eyebrow-style text-muted-foreground">
            Top opportunities
          </h2>
          <ul className="flex flex-col">
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
                        delay={index * 50}
                      />
                    </span>
                    <span className="caption-style hidden w-[3ch] shrink-0 text-right tabular-nums sm:block">
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
          <ul className="flex flex-col">
            {byOwnerRows.map((row, index) => {
              const owner = ownerByName(row.owner);
              return (
                <li
                  key={row.owner}
                  className="animate-rise"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => openProfile(row.owner)}
                    className={ROW_BUTTON}
                  >
                    <Avatar src={owner.avatar} alt="" className="size-6" />
                    <span className="min-w-0 flex-1">
                      <span className="lead-style block truncate font-medium">
                        {row.owner}
                      </span>
                      <span className="caption-style text-muted-foreground block truncate tabular-nums">
                        ${formatMoney(row.summary.total)} pipeline
                      </span>
                    </span>
                    <span className="bg-track h-1.5 w-24 shrink-0 overflow-hidden rounded-full">
                      <span
                        className="bg-primary/70 animate-grow-x block h-full origin-left rounded-full"
                        style={{
                          width: `${Math.round((row.summary.weighted / maxOwnerWeighted) * 100)}%`,
                          animationDelay: `${index * 50}ms`,
                        }}
                      />
                    </span>
                    <span className="lead-style shrink-0 font-medium tabular-nums">
                      ${formatMoney(row.summary.weighted)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <span className="caption-style text-muted-foreground">
            Likely to land, per owner. Click one for their profile.
          </span>
        </div>
      </div>
    </section>
  );
}
