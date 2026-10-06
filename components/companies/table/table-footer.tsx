import { MotionConfig } from "motion/react";
import { SlidingNumber } from "@/components/motion-primitives/sliding-number";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

type TableFooterProps = {
  count: number;
};

const CALCULATIONS = [
  "Sum of pipeline",
  "Avg win probability",
  "Add Calculation",
];

export default function TableFooter({ count }: TableFooterProps) {
  return (
    <div className="caption-style border-border bg-background grid shrink-0 grid-cols-2 gap-px border-b p-px sm:grid-cols-4">
      <div className="outline-border flex items-center gap-2 p-3 outline-1">
        <span className="text-foreground">
          <MotionConfig reducedMotion="user">
            <SlidingNumber value={count} />
          </MotionConfig>
        </span>
        <span className="text-muted-foreground">Companies in view</span>
      </div>
      {CALCULATIONS.map((label) => (
        <div
          key={label}
          className="text-muted-foreground outline-border flex items-center gap-2 p-3 outline-1"
        >
          <PlusIcon aria-hidden className="text-muted-foreground size-3" />
          {label}
        </div>
      ))}
    </div>
  );
}
