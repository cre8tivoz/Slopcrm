import Avatar from "@/components/_ui/avatar";
import Tag from "@/components/_ui/tag";
import SegmentBar from "@/components/_common/segment-bar";
import { STAGES, TAG_TONES, ownerByName } from "@/data/companies";
import { UNSTAGED, formatMoney, primaryStage } from "@/lib/companies";
import { useCompaniesStore } from "@/stores/companies-store";
import { cn } from "@/lib/utils";

const weightedOf = (value: number, probability: number) =>
  Math.round((value * probability) / 100);

const KPI_CARD =
  "border-border bg-card/50 flex flex-col gap-1 rounded-xl border p-3.5";

const PANEL =
  "border-border bg-card/50 rounded-xl border p-3.5 flex flex-col gap-3";

const ROW_BUTTON =
  "ease-power3-out flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-[background-color,transform] duration-150 hover:bg-white/4 active:scale-[0.99] focus-visible:ring-ring/60 focus-visible:ring-2 focus-visible:outline-none";

export default function Forecast() {
  const companies = useCompaniesStore((state) => state.companies);
  const openDetail = useCompaniesStore((state) => state.openDetail);
  const openProfile = useCompaniesStore((state) => state.openProfile);

  const totalPipeline = companies.reduce((sum, c) => sum + c.pipelineValue, 0);
  const totalWeighted = companies.reduce(
    (sum, c) => sum + weightedOf(c.pipelineValue, c.winProbability),
    0,
  );
  const avgWin = Math.round(
    companies.reduce((sum, c) => sum + c.winProbability, 0) /
      Math.max(1, companies.length),
  );
  const openDeals = companies.reduce((sum, c) => sum + c.openDeals, 0);

  // Pipeline by stage (primary stage — same rule as the board, so the
  // stage rows sum to exactly the Total pipeline KPI; Unstaged included).
  const grouped = [...STAGES, UNSTAGED].map((stage) => {
    const inStage = companies.filter((c) => primaryStage(c) === stage);
    const value = inStage.reduce((sum, c) => sum + c.pipelineValue, 0);
    const weighted = inStage.reduce(
      (sum, c) => sum + weightedOf(c.pipelineValue, c.winProbability),
      0,
    );
    return { stage, count: inStage.length, value, weighted };
  });
  const byStage = grouped.filter((row) => row.count > 0);
  const maxStageValue = Math.max(1, ...byStage.map((row) => row.value));

  // Top opportunities by weighted value
  const top = [...companies]
    .map((company) => ({
      company,
      weighted: weightedOf(company.pipelineValue, company.winProbability),
    }))
    .sort((a, b) => b.weighted - a.weighted)
    .slice(0, 8);

  // Forecast contribution by owner
  const ownerTotals = new Map<string, { value: number; weighted: number }>();
  for (const company of companies) {
    const entry = ownerTotals.get(company.owner) ?? { value: 0, weighted: 0 };
    entry.value += company.pipelineValue;
    entry.weighted += weightedOf(company.pipelineValue, company.winProbability);
    ownerTotals.set(company.owner, entry);
  }
  const byOwner = [...ownerTotals.entries()]
    .map(([name, totals]) => ({ name, ...totals }))
    .sort((a, b) => b.weighted - a.weighted)
    .slice(0, 6);
  const maxOwnerWeighted = Math.max(1, ...byOwner.map((row) => row.weighted));

  return (
    <section aria-label="Forecast" className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className={KPI_CARD}>
            <span className="caption-style text-muted-foreground">
              Total pipeline
            </span>
            <span className="text-[20px] leading-tight font-semibold tracking-[-0.01em] tabular-nums">
              ${formatMoney(totalPipeline)}
            </span>
          </div>
          <div className={KPI_CARD}>
            <span className="caption-style text-muted-foreground">
              Weighted forecast
            </span>
            <span className="text-[20px] leading-tight font-semibold tracking-[-0.01em] tabular-nums">
              ${formatMoney(totalWeighted)}
            </span>
          </div>
          <div className={KPI_CARD}>
            <span className="caption-style text-muted-foreground">
              Avg win probability
            </span>
            <span className="text-[20px] leading-tight font-semibold tracking-[-0.01em] tabular-nums">
              {avgWin}%
            </span>
          </div>
          <div className={KPI_CARD}>
            <span className="caption-style text-muted-foreground">
              Open deals
            </span>
            <span className="text-[20px] leading-tight font-semibold tracking-[-0.01em] tabular-nums">
              {openDeals}
            </span>
          </div>
        </div>

        <div className={PANEL}>
          <h2 className="lead-style font-medium">Pipeline by stage</h2>
          <ul className="flex flex-col gap-2.5">
            {byStage.map((row, index) => (
              <li
                key={row.stage}
                className="animate-rise"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Tag
                    tone={
                      row.stage === UNSTAGED
                        ? "neutral"
                        : TAG_TONES[row.stage as keyof typeof TAG_TONES]
                    }
                    size="sm"
                    className="w-28"
                  >
                    {row.stage}
                  </Tag>
                  <span className="bg-track h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
                    <span
                      className="bg-primary/70 block h-full rounded-full"
                      style={{
                        width: `${Math.round((row.value / maxStageValue) * 100)}%`,
                      }}
                    />
                  </span>
                  <span className="caption-style w-20 shrink-0 text-right tabular-nums">
                    ${formatMoney(row.value)}
                  </span>
                  <span className="caption-style text-muted-foreground hidden w-28 shrink-0 truncate text-right tabular-nums sm:block">
                    ${formatMoney(row.weighted)} wtd
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={PANEL}>
          <h2 className="lead-style font-medium">Top opportunities</h2>
          <ul className="flex flex-col">
            {top.map(({ company, weighted }, index) => {
              const owner = ownerByName(company.owner);
              const stage = STAGES.find((s) => company.tags.includes(s));
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
                      tone={stage ? TAG_TONES[stage] : "neutral"}
                      size="sm"
                      className="hidden shrink-0 sm:inline-flex"
                    >
                      {stage ?? UNSTAGED}
                    </Tag>
                    <span className="hidden w-24 shrink-0 sm:block">
                      <SegmentBar percent={company.winProbability} />
                    </span>
                    <span className="caption-style hidden w-[3ch] shrink-0 text-right tabular-nums sm:block">
                      {company.winProbability}%
                    </span>
                    <span className="lead-style shrink-0 tabular-nums">
                      ${formatMoney(weighted)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={PANEL}>
          <h2 className="lead-style font-medium">Forecast by owner</h2>
          <ul className="flex flex-col">
            {byOwner.map((row, index) => {
              const owner = ownerByName(row.name);
              return (
                <li
                  key={row.name}
                  className="animate-rise"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => openProfile(row.name)}
                    className={ROW_BUTTON}
                  >
                    <Avatar src={owner.avatar} alt="" className="size-6" />
                    <span className="min-w-0 flex-1">
                      <span className="lead-style block truncate font-medium">
                        {row.name}
                      </span>
                      <span className="caption-style text-muted-foreground block truncate tabular-nums">
                        ${formatMoney(row.value)} pipeline
                      </span>
                    </span>
                    <span className="bg-track h-1.5 w-24 shrink-0 overflow-hidden rounded-full">
                      <span
                        className="bg-primary/70 block h-full rounded-full"
                        style={{
                          width: `${Math.round((row.weighted / maxOwnerWeighted) * 100)}%`,
                        }}
                      />
                    </span>
                    <span
                      className={cn(
                        "lead-style shrink-0 tabular-nums",
                        "font-medium",
                      )}
                    >
                      ${formatMoney(row.weighted)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <span className="caption-style text-muted-foreground">
            Weighted contribution — click an owner for their profile
          </span>
        </div>
      </div>
    </section>
  );
}
