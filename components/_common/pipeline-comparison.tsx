import { formatMoney } from "@/lib/companies";

export default function PipelineComparison({
  total,
  weighted,
  scale,
}: {
  total: number;
  weighted: number;
  scale: number;
}) {
  const width = (amount: number) => `${(amount / Math.max(1, scale)) * 100}%`;
  return (
    <span className="flex min-w-0 flex-col gap-1.5">
      <span
        aria-hidden="true"
        className="bg-track relative h-2 overflow-hidden rounded-full"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--tag-purple-text)]/35 motion-safe:transition-[width] motion-safe:duration-300"
          style={{ width: width(total) }}
        />
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--tag-purple-text)] motion-safe:transition-[width] motion-safe:duration-300"
          style={{ width: width(weighted) }}
        />
      </span>
      <span className="caption-style text-muted-foreground flex flex-wrap justify-between gap-x-4 gap-y-1 tabular-nums">
        <span>
          Total pipeline{" "}
          <strong className="text-foreground font-medium">
            ${formatMoney(total)}
          </strong>
        </span>
        <span>
          Likely to land{" "}
          <strong className="font-medium text-[color:var(--tag-purple-text)]">
            ${formatMoney(weighted)}
          </strong>
        </span>
      </span>
    </span>
  );
}
