import Avatar from "@/components/_ui/avatar";
import SegmentBar from "@/components/_common/segment-bar";
import Sparkline from "@/components/_common/sparkline";
import { useWeeklyTouches } from "@/hooks/use-weekly-touches";
import CompanyLogo from "@/components/company/company-logo";
import CompanyTagList from "@/components/company/company-tag-list";
import { ownerByName, type Company } from "@/data/companies";
import { formatDate, formatMoney } from "@/lib/companies";
import { cn } from "@/lib/utils";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";

type CompanyCardProps = {
  company: Company;
  index: number;
  onOpen: () => void;
};

export default function CompanyCard({
  company,
  index,
  onOpen,
}: CompanyCardProps) {
  const owner = ownerByName(company.owner);
  const trend = useWeeklyTouches(company.id);

  return (
    <li
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index, 11) * 18}ms` }}
    >
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "border-border bg-card/50 flex w-full flex-col gap-3 rounded-xl border p-3.5 text-left",
          "ease-power3-out transition-[background-color,border-color,transform] duration-150",
          "hover:border-line-strong hover:bg-card active:scale-[0.98]",
          "focus-visible:ring-ring/60 focus-visible:ring-2 focus-visible:outline-none",
        )}
      >
        <div className="flex items-start gap-3">
          <CompanyLogo company={company} size="lg" labelled />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="lead-style truncate font-medium">
                {company.name}
              </span>
              <span className="lead-style shrink-0 tabular-nums">
                ${formatMoney(company.pipelineValue)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-[3px] overflow-hidden">
              <CompanyTagList tags={company.tags} size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar src={owner.avatar} alt="" className="size-6" />
            <span className="caption-style text-soft truncate">
              {owner.name}
            </span>
          </span>
          <span className="flex flex-1 items-center justify-end gap-2">
            <SegmentBar percent={company.winProbability} className="w-20" />
            <span className="caption-style w-[3ch] shrink-0 text-right tabular-nums">
              {company.winProbability}%
            </span>
          </span>
        </div>

        <div className="caption-style text-muted-foreground flex items-center justify-between gap-2">
          <span className="tabular-nums">
            {company.openDeals} open{" "}
            {company.openDeals === 1 ? "deal" : "deals"}
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Sparkline values={trend} className="shrink-0" />
            <span aria-hidden className="h-2.5 w-px bg-white/15" />
            <span className="flex min-w-0 items-center gap-1">
              <CalendarIcon aria-hidden className="size-3.5 shrink-0" />
              <span className="tabular-nums">
                {formatDate(company.lastInteraction.date)}
              </span>
              <span className="truncate">{company.lastInteraction.label}</span>
            </span>
          </span>
        </div>
      </button>
    </li>
  );
}
