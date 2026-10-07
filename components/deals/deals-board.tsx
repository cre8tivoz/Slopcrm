import Avatar from "@/components/_ui/avatar";
import Tag from "@/components/_ui/tag";
import SegmentBar from "@/components/_common/segment-bar";
import CompanyLogo from "@/components/company/company-logo";
import { ownerByName } from "@/data/companies";
import { formatMoney } from "@/lib/companies";
import { byStage, stageTone, summarise } from "@/lib/pipeline";
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

  const columns = byStage(companies);
  const summary = summarise(companies);

  return (
    <section aria-label="Deals board" className="flex min-h-0 flex-1 flex-col">
      <div className="border-border flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1.5 border-b px-4 py-3">
        <span className="caption-style text-muted-foreground">
          Total pipeline{" "}
          <span className="lead-style text-foreground font-medium tabular-nums">
            ${formatMoney(summary.total)}
          </span>
        </span>
        <span className="caption-style text-muted-foreground">
          Weighted{" "}
          <span className="lead-style text-foreground font-medium tabular-nums">
            ${formatMoney(summary.weighted)}
          </span>
        </span>
        <span className="caption-style text-muted-foreground tabular-nums">
          {summary.openDeals} open deals
        </span>
      </div>

      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto scroll-smooth p-4 [scrollbar-width:thin]">
        {columns.map((column, columnIndex) => (
          <div
            key={column.stage}
            className="flex w-[272px] shrink-0 flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2 px-0.5">
              <Tag tone={stageTone(column.stage)} size="sm">
                {column.stage}
              </Tag>
              <span className="caption-style text-muted-foreground tabular-nums">
                {column.companies.length} · ${formatMoney(column.summary.total)}
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
                          <CompanyLogo company={company} size="sm" />
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
