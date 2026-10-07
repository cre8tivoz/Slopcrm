import Avatar from "@/components/_ui/avatar";
import Asset from "@/components/_ui/asset";
import Tag from "@/components/_ui/tag";
import { ownerByName } from "@/data/companies";
import { formatDate, formatMoney } from "@/lib/companies";
import { useCompaniesStore } from "@/stores/companies-store";

const KPI_CARD =
  "border-border bg-card/50 flex flex-col gap-1 rounded-xl border p-3.5";

export default function Activities() {
  const companies = useCompaniesStore((state) => state.companies);
  const openDetail = useCompaniesStore((state) => state.openDetail);

  // Most recent interaction first (ISO dates sort lexicographically).
  const feed = [...companies].sort((a, b) =>
    b.lastInteraction.date.localeCompare(a.lastInteraction.date),
  );

  const labels = new Set(feed.map((c) => c.lastInteraction.label));
  const latest = feed[0]?.lastInteraction;
  const earliest = feed[feed.length - 1]?.lastInteraction;

  return (
    <section aria-label="Activities" className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className={KPI_CARD}>
            <span className="caption-style text-muted-foreground">
              Interactions logged
            </span>
            <span className="text-[20px] leading-tight font-semibold tracking-[-0.01em] tabular-nums">
              {feed.length}
            </span>
          </div>
          <div className={KPI_CARD}>
            <span className="caption-style text-muted-foreground">
              Interaction types
            </span>
            <span className="text-[20px] leading-tight font-semibold tracking-[-0.01em] tabular-nums">
              {labels.size}
            </span>
          </div>
          <div className={KPI_CARD}>
            <span className="caption-style text-muted-foreground">Latest</span>
            <span className="text-[20px] leading-tight font-semibold tracking-[-0.01em] tabular-nums">
              {latest ? formatDate(latest.date) : "—"}
            </span>
          </div>
          <div className={KPI_CARD}>
            <span className="caption-style text-muted-foreground">
              Span (demo data)
            </span>
            <span className="text-[20px] leading-tight font-semibold tracking-[-0.01em] tabular-nums">
              {earliest && latest
                ? `${formatDate(earliest.date)} – ${formatDate(latest.date)}`
                : "—"}
            </span>
          </div>
        </div>

        <div className="border-border bg-card/50 flex flex-col gap-1 rounded-xl border p-2">
          <ul className="flex flex-col">
            {feed.map((company, index) => {
              const owner = ownerByName(company.owner);
              return (
                <li
                  key={company.id}
                  className="animate-rise"
                  style={{ animationDelay: `${Math.min(index, 11) * 18}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => openDetail(company.id)}
                    className="ease-power3-out focus-visible:ring-ring/60 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-[background-color,transform] duration-150 hover:bg-white/4 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
                  >
                    <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-[10px] shadow-[0px_4px_4px_0px_rgba(15,15,15,0.24),0px_0px_0px_1px#232323]">
                      {company.logo ? (
                        <Asset
                          type="image"
                          src={company.logo}
                          alt=""
                          width={1}
                          height={1}
                          fit="contain"
                          className="size-6"
                        />
                      ) : (
                        <span className="lead-style text-soft">
                          {company.name.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="lead-style truncate font-medium">
                          {company.name}
                        </span>
                        <Tag tone="neutral" size="sm" className="shrink-0">
                          {company.lastInteraction.label}
                        </Tag>
                      </span>
                      <span className="caption-style text-muted-foreground block truncate tabular-nums">
                        ${formatMoney(company.pipelineValue)} pipeline ·{" "}
                        {company.openDeals} open{" "}
                        {company.openDeals === 1 ? "deal" : "deals"}
                      </span>
                    </span>
                    <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                      <span className="caption-style text-soft tabular-nums">
                        {formatDate(company.lastInteraction.date)}
                      </span>
                      <Avatar src={owner.avatar} alt="" className="size-5" />
                    </span>
                    <span className="shrink-0 sm:hidden">
                      <span className="caption-style text-soft tabular-nums">
                        {formatDate(company.lastInteraction.date)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
