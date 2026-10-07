import { cn } from "@/lib/utils";

type SparklineProps = {
  /** Touches per week, oldest first (see `weeklyTouches`). */
  values: number[];
  className?: string;
};

/**
 * Fixed scale, not per-company: one touch is always the same height, so rows
 * compare at a glance. Quiet weeks stay as a muted stub.
 */
const HEIGHT_BY_COUNT = ["h-px", "h-1.5", "h-2.5", "h-3.5"];

export default function Sparkline({ values, className }: SparklineProps) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return (
    <span
      role="img"
      aria-label={`${total} ${total === 1 ? "touch" : "touches"} in the last ${values.length} weeks`}
      className={cn("flex h-[14px] items-end gap-px", className)}
    >
      {values.map((value, index) => (
        <span
          key={index}
          className={cn(
            "w-1 shrink-0 rounded-[1px]",
            HEIGHT_BY_COUNT[Math.min(value, HEIGHT_BY_COUNT.length - 1)],
            value > 0 ? "bg-trend" : "bg-trend-muted",
          )}
        />
      ))}
    </span>
  );
}
