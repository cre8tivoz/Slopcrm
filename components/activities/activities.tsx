import Avatar from "@/components/_ui/avatar";
import Tag from "@/components/_ui/tag";
import CompanyLogo from "@/components/company/company-logo";
import { ownerByName } from "@/data/companies";
import type { InteractionChannel } from "@/data/interactions";
import { groupByDay, withinDays } from "@/lib/activity";
import { formatDate } from "@/lib/companies";
import { daysSince } from "@/lib/demo-clock";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";

const KPI_CARD =
  "border-border bg-card/50 flex flex-col gap-1 rounded-xl border p-3.5";

/** The feed covers the same span as the widest Last-activity filter. */
const FEED_DAYS = 90;

const CHANNEL_LABEL: Record<InteractionChannel, string> = {
  email: "Email",
  meeting: "Meeting",
  call: "Call",
  note: "Internal note",
};

function dayHeading(date: string) {
  const age = daysSince(date);
  if (age === 0) return "Today";
  if (age === 1) return "Yesterday";
  return `${formatDate(date)} · ${age} days ago`;
}

export default function Activities() {
  const companies = useCompaniesStore((state) => state.companies);
  const interactions = useCompaniesStore((state) => state.interactions);
  const openDetail = useUiStore((state) => state.openDetail);

  const companyById = new Map(companies.map((c) => [c.id, c]));
  const lastWeek = withinDays(interactions, 7);
  const lastMonth = withinDays(interactions, 30);

  const typeCounts = new Map<string, number>();
  for (const item of lastMonth) {
    typeCounts.set(item.type, (typeCounts.get(item.type) ?? 0) + 1);
  }
  const topType = [...typeCounts].sort((a, b) => b[1] - a[1])[0];

  const kpis = [
    { label: "Touches · 7 days", value: String(lastWeek.length) },
    { label: "Touches · 30 days", value: String(lastMonth.length) },
    {
      label: "Accounts touched · 30 days",
      value: String(new Set(lastMonth.map((i) => i.companyId)).size),
    },
    { label: "Most frequent · 30 days", value: topType ? topType[0] : "—" },
  ];

  const days = groupByDay(withinDays(interactions, FEED_DAYS));
  let rowIndex = 0;

  return (
    <section aria-label="Activities" className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={KPI_CARD}>
              <span className="caption-style text-muted-foreground">
                {kpi.label}
              </span>
              <span className="truncate text-[20px] leading-tight font-semibold tracking-[-0.01em] tabular-nums">
                {kpi.value}
              </span>
            </div>
          ))}
        </div>

        {days.length === 0 ? (
          <p className="caption-style text-subtle border-border rounded-xl border border-dashed p-6 text-center">
            No interactions in the last {FEED_DAYS} days.
          </p>
        ) : (
          <ol className="flex flex-col gap-4">
            {days.map((day) => (
              <li key={day.date} className="flex flex-col gap-1.5">
                <h2 className="caption-style text-muted-foreground px-1 tabular-nums">
                  {dayHeading(day.date)}
                </h2>
                <ul className="border-border bg-card/50 flex flex-col rounded-xl border p-1.5">
                  {day.items.map((item) => {
                    const company = companyById.get(item.companyId);
                    if (!company) return null;
                    const owner = ownerByName(item.owner);
                    const delay = Math.min(rowIndex++, 11) * 18;
                    return (
                      <li
                        key={item.id}
                        className="animate-rise"
                        style={{ animationDelay: `${delay}ms` }}
                      >
                        <button
                          type="button"
                          onClick={() => openDetail(company.id)}
                          className="ease-power3-out focus-visible:ring-ring/60 flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-[background-color,transform] duration-150 hover:bg-white/4 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
                        >
                          <CompanyLogo company={company} size="lg" />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="lead-style truncate font-medium">
                                {company.name}
                              </span>
                              <Tag
                                tone="neutral"
                                size="sm"
                                className="shrink-0"
                              >
                                {item.type}
                              </Tag>
                            </span>
                            <span className="caption-style text-muted-foreground block truncate">
                              {CHANNEL_LABEL[item.channel]} · {owner.name}
                            </span>
                          </span>
                          <Avatar
                            src={owner.avatar}
                            alt=""
                            className="size-5 shrink-0"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
