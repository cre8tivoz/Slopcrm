import type { Company } from "@/data/companies";
import { dealHealth, type DealHealthStatus } from "@/lib/reporting";
import { cn } from "@/lib/utils";

export const STATUS_COPY: Record<
  DealHealthStatus,
  { label: string; advice: string }
> = {
  active: {
    label: "Warm",
    advice: "You've been in touch recently. Carry on.",
  },
  "at-risk": {
    label: "Needs a nudge",
    advice: "A couple of quiet weeks. A quick check-in keeps it warm.",
  },
  slipping: {
    label: "Going cold",
    advice: "Over six weeks of silence. Someone else is probably calling them.",
  },
};

const DOT: Record<DealHealthStatus, string> = {
  active: "bg-success",
  "at-risk": "bg-warning",
  slipping: "bg-danger",
};

const PANEL: Record<DealHealthStatus, string> = {
  active: "bg-success/10",
  "at-risk": "bg-warning/10",
  slipping: "bg-danger/10",
};

export function lastContactText(days: number) {
  if (days === 0) return "Talked today";
  if (days === 1) return "Talked yesterday";
  return `${days} days of silence`;
}

export function StatusDot({
  status,
  className,
}: {
  status: DealHealthStatus;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block size-2 shrink-0 rounded-full",
        DOT[status],
        className,
      )}
    />
  );
}

export function DealStatusPanel({ company }: { company: Company }) {
  const { status, daysDormant } = dealHealth(company);
  const copy = STATUS_COPY[status];
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col gap-1.5 rounded-xl px-3.5 py-3",
        PANEL[status],
      )}
    >
      <span className="lead-style flex items-center gap-2 font-medium">
        <StatusDot status={status} />
        {copy.label}
        <span className="text-soft font-normal">
          · {lastContactText(daysDormant)}
        </span>
      </span>
      <span className="caption-style text-soft">{copy.advice}</span>
    </div>
  );
}
