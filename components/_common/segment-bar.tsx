import { cn } from "@/lib/utils";

type SegmentTone = "auto" | "danger" | "warning" | "success";

type SegmentBarProps = {
  percent: number;
  segments?: number;
  tone?: SegmentTone;
  className?: string;
  segmentClassName?: string;
  trackClassName?: string;
  /** Accessible name for the meter, e.g. "Chance to win". */
  label?: string;
  /** Light the filled segments up left to right on mount. */
  animated?: boolean;
  /** Extra delay before the light-up starts, in ms (for staggering rows). */
  delay?: number;
};

const TONE_CLASS: Record<Exclude<SegmentTone, "auto">, string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
};

function autoTone(index: number, filled: number) {
  const red = Math.floor(filled / 3);
  const amber = Math.ceil(filled / 3);
  if (index < red) return TONE_CLASS.danger;
  if (index < red + amber) return TONE_CLASS.warning;
  return TONE_CLASS.success;
}

export default function SegmentBar({
  percent,
  segments = 17,
  tone = "auto",
  className,
  segmentClassName,
  trackClassName = "bg-track",
  animated = false,
  delay = 0,
  label,
}: SegmentBarProps) {
  const filled = Math.round((percent / 100) * segments);

  return (
    <span
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}%`}
      aria-label={label}
      className={cn(
        "flex h-[14px] items-center gap-[2px] overflow-hidden rounded-[2px] bg-white/8 px-[2px]",
        className,
      )}
    >
      {Array.from({ length: segments }, (_, index) => (
        <span
          key={index}
          style={
            animated && index < filled
              ? { animationDelay: `${delay + index * 28}ms` }
              : undefined
          }
          className={cn(
            "h-[10px] min-w-px flex-1 rounded-[1px]",
            animated && index < filled && "animate-segment-in",
            segmentClassName,
            index < filled
              ? tone === "auto"
                ? autoTone(index, filled)
                : TONE_CLASS[tone]
              : trackClassName,
          )}
        />
      ))}
    </span>
  );
}
