import { MotionConfig } from "motion/react";
import { SlidingNumber } from "@/components/motion-primitives/sliding-number";
import type { Company } from "@/data/companies";
import { formatMoney } from "@/lib/companies";
import { summarise } from "@/lib/pipeline";

type TableFooterProps = {
  companies: Company[];
};

export default function TableFooter({ companies }: TableFooterProps) {
  const summary = summarise(companies);
  const stats = [
    { label: "Total value", value: `$${formatMoney(summary.total)}` },
    { label: "Likely to land", value: `$${formatMoney(summary.weighted)}` },
    { label: "Avg chance to win", value: `${summary.avgWin}%` },
  ];

  return (
    <div className="caption-style border-border bg-background grid shrink-0 grid-cols-2 gap-px border-b p-px sm:grid-cols-4">
      <div className="outline-border flex items-center gap-2 p-3 outline-1">
        <span className="text-foreground">
          <MotionConfig reducedMotion="user">
            <SlidingNumber value={summary.companies} />
          </MotionConfig>
        </span>
        <span className="text-muted-foreground">Companies in view</span>
      </div>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="outline-border flex items-center gap-2 p-3 outline-1"
        >
          <span className="text-foreground tabular-nums">{stat.value}</span>
          <span className="text-muted-foreground truncate">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
