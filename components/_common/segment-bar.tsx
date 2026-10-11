import { cn } from "@/lib/utils";

type SegmentTone = "auto" | "danger" | "warning" | "success";

type SegmentBarProps = {
  percent: number;
  tone?: SegmentTone;
  className?: string;
};

const TONE_CLASS: Record<Exclude<SegmentTone, "auto">, string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
};

export default function SegmentBar({
  percent,
  tone = "auto",
  className,
}: SegmentBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <span
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn(
        "block h-1 overflow-hidden rounded-full bg-white/8",
        className,
      )}
    >
      <span
        className={cn(
          "block h-full rounded-full",
          tone === "auto" ? "bg-foreground/70" : TONE_CLASS[tone],
        )}
        style={{ width: `${clamped}%` }}
      />
    </span>
  );
}
