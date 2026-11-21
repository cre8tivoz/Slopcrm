import type { ReactNode } from "react";

export default function KpiCard({
  label,
  value,
  note,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 motion-safe:transition-opacity motion-safe:duration-200 motion-safe:starting:opacity-70">
      <dt className="caption-style text-muted-foreground">{label}</dt>
      <dd className="text-[clamp(1.125rem,5vw,1.5rem)] leading-none font-semibold tracking-[-0.02em] break-words tabular-nums">
        {value}
      </dd>
      {note && (
        <dd className="caption-style text-subtle text-[11px]">{note}</dd>
      )}
    </div>
  );
}
