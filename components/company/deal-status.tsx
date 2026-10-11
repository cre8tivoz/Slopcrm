import type { Company } from "@/data/companies";
import { dealHealth, type DealHealthStatus } from "@/lib/reporting";
import { cn } from "@/lib/utils";

export const STATUS_COPY: Record<
  DealHealthStatus,
  { label: string; advice: string }
> = {
  active: {
    label: "On track",
    advice: "You've been in touch recently. Keep it up.",
  },
  "at-risk": {
    label: "Needs a nudge",
    advice: "It's been a couple of weeks. A quick check-in keeps things warm.",
  },
  slipping: {
    label: "Going cold",
    advice: "No contact in over 6 weeks. Reach out before this deal stalls.",
  },
};

const DOT: Record<DealHealthStatus, string> = {
  active: "bg-success",
  "at-risk": "bg-warning",
  slipping: "bg-danger",
};

const PANEL: Record<DealHealthStatus, string> = {
  active: "border-success/30 bg-success/8",
  "at-risk": "border-warning/30 bg-warning/8",
  slipping: "border-danger/30 bg-danger/8",
};

export function lastContactText(days: number) {
  if (days === 0) return "Last contact today";
  if (days === 1) return "Last contact yesterday";
  return `No contact for ${days} days`;
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
      className={cn("block size-2 shrink-0 rounded-full", DOT[status], className)}
    />
  );
}

export function DealStatusPanel({ company }: { company: Company }) {
  const { status, daysDormant } = dealHealth(company);
  const copy = STATUS_COPY[status];
  return (
    <div
      role="status"
      className={cn("flex flex-col gap-1 rounded-xl border p-3.5", PANEL[status])}
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
