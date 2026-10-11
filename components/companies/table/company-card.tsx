import SegmentBar from "@/components/_common/segment-bar";
import CompanyLogo from "@/components/company/company-logo";
import { StatusDot, lastContactText } from "@/components/company/deal-status";
import { ownerByName, type Company } from "@/data/companies";
import { formatMoney } from "@/lib/companies";
import { primaryStage } from "@/lib/pipeline";
import { dealHealth } from "@/lib/reporting";

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
  const { status, daysDormant } = dealHealth(company);

  return (
    <li
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index, 11) * 18}ms` }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="ease-power3-out focus-visible:ring-ring/60 flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-[background-color] duration-150 hover:bg-white/3 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset active:bg-white/5"
      >
        <CompanyLogo company={company} size="lg" labelled />
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex items-baseline justify-between gap-2">
            <span className="lead-style truncate font-medium">
              {company.name}
            </span>
            <span className="lead-style flex shrink-0 items-center gap-2 tabular-nums">
              <SegmentBar
                percent={company.winProbability}
                segments={10}
                className="w-12"
              />
              ${formatMoney(company.pipelineValue)}
            </span>
          </span>
          <span className="caption-style text-muted-foreground flex items-center justify-between gap-2">
            <span className="truncate">
              {primaryStage(company)} · {owner.name}
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <StatusDot status={status} className="size-1.5" />
              {lastContactText(daysDormant).replace(" of silence", " quiet")}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}
