import Avatar from "@/components/_ui/avatar";
import Asset from "@/components/_ui/asset";
import Tag from "@/components/_ui/tag";
import SegmentBar from "@/components/_common/segment-bar";
import { STAGES, TAG_TONES, ownerByName } from "@/data/companies";
import { UNSTAGED, formatMoney, primaryStage } from "@/lib/companies";
import { useCompaniesStore } from "@/stores/companies-store";
import { cn } from "@/lib/utils";

const CARD_CLASS = cn(
  "border-border bg-card/50 flex w-full flex-col gap-2.5 rounded-xl border p-3 text-left",
  "ease-power3-out transition-[background-color,border-color,transform] duration-150",
  "hover:border-line-strong hover:bg-card active:scale-[0.98]",
  "focus-visible:ring-ring/60 focus-visible:ring-2 focus-visible:outline-none",
);

export default function DealsBoard() {
  const companies = useCompaniesStore((state) => state.companies);
  const openDetail = useCompaniesStore((state) => state.openDetail);

  const columns = [
    ...STAGES.map((stage) => ({
      stage,
      companies: companies.filter((c) => primaryStage(c) === stage),
    })),
    {
      stage: UNSTAGED,
      companies: companies.filter((c) => primaryStage(c) === UNSTAGED),
    },
  ];

  const totalPipeline = companies.reduce((sum, c) => sum + c.pipelineValue, 0);
  // Per-company rounding, identical to the forecast KPI — totals always agree.
  const weighted = companies.reduce(
    (sum, c) => sum + Math.round((c.pipelineValue * c.winProbability) / 100),
    0,
  );
  const totalDeals = companies.reduce((sum, c) => sum + c.openDeals, 0);

  return (
    <section aria-label="Deals board" className="flex min-h-0 flex-1 flex-col">
      <div className="border-border flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1.5 border-b px-4 py-3">
        <span className="caption-style text-muted-foreground">
          Total pipeline{" "}
          <span className="lead-style text-foreground font-medium tabular-nums">
            ${formatMoney(totalPipeline)}
          </span>
        </span>
        <span className="caption-style text-muted-foreground">
          Weighted{" "}
          <span className="lead-style text-foreground font-medium tabular-nums">
            ${formatMoney(weighted)}
          </span>
        </span>
        <span className="caption-style text-muted-foreground tabular-nums">
          {totalDeals} open deals
        </span>
      </div>

      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto scroll-smooth p-4 [scrollbar-width:thin]">
        {columns.map((column, columnIndex) => (
          <div
            key={column.stage}
            className="flex w-[272px] shrink-0 flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2 px-0.5">
              <Tag
                tone={
                  column.stage === UNSTAGED
                    ? "neutral"
                    : TAG_TONES[column.stage as keyof typeof TAG_TONES]
                }
                size="sm"
              >
                {column.stage}
              </Tag>
              <span className="caption-style text-muted-foreground tabular-nums">
                {column.companies.length} · $
                {formatMoney(
                  column.companies.reduce((sum, c) => sum + c.pipelineValue, 0),
                )}
              </span>
            </div>

            <ul className="flex flex-col gap-2">
              {column.companies.map((company, index) => {
                const owner = ownerByName(company.owner);
                return (
                  <li
                    key={company.id}
                    className="animate-rise"
                    style={{
                      animationDelay: `${(index + columnIndex) * 18}ms`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => openDetail(company.id)}
                      className={CARD_CLASS}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-lg shadow-[0px_0px_0px_1px#232323]">
                            {company.logo ? (
                              <Asset
                                type="image"
                                src={company.logo}
                                alt=""
                                width={1}
                                height={1}
                                fit="contain"
                                className="size-4"
                              />
                            ) : (
                              <span className="caption-style text-soft">
                                {company.name.slice(0, 1)}
                              </span>
                            )}
                          </span>
                          <span className="lead-style truncate font-medium">
                            {company.name}
                          </span>
                        </span>
                        <span className="lead-style shrink-0 tabular-nums">
                          ${formatMoney(company.pipelineValue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar src={owner.avatar} alt="" className="size-5" />
                        <span className="caption-style text-soft min-w-0 flex-1 truncate">
                          {owner.name}
                        </span>
                        <SegmentBar
                          percent={company.winProbability}
                          className="w-14"
                        />
                        <span className="caption-style w-[3ch] shrink-0 text-right tabular-nums">
                          {company.winProbability}%
                        </span>
                      </div>
                      <div className="caption-style text-muted-foreground tabular-nums">
                        {company.openDeals} open{" "}
                        {company.openDeals === 1 ? "deal" : "deals"}
                      </div>
                    </button>
                  </li>
                );
              })}
              {column.companies.length === 0 && (
                <li className="border-border text-subtle caption-style rounded-xl border border-dashed p-4 text-center">
                  No companies in this stage
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
