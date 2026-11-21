import type { KeyboardEvent } from "react";
import Button from "@/components/_ui/button";
import { formatDate } from "@/lib/companies";
import type { WeeklyVelocityPoint } from "@/lib/reporting";
import { cn } from "@/lib/utils";

const WIDTH = 520;
const BASELINE = 144;
const TOP = 6;

function weekDates(point: WeeklyVelocityPoint) {
  return `${formatDate(point.startDate)} – ${formatDate(point.endDate)}`;
}

export default function ActivityChart({
  points,
  selectedWeekAge,
  onWeekChange,
}: {
  points: readonly WeeklyVelocityPoint[];
  selectedWeekAge: number;
  onWeekChange: (age: number) => void;
}) {
  if (!points.length) return <p>No activity data for this period.</p>;

  const selectedIndex =
    points.length - 1 - Math.min(selectedWeekAge, points.length - 1);
  const selected = points[selectedIndex];
  const peak = Math.max(
    0,
    ...points.map((point) => Math.max(point.touches, point.movingAverage4w)),
  );
  const ceiling = Math.max(2, Math.ceil(peak / 2) * 2);
  const step = WIDTH / points.length;
  const center = (index: number) => step * (index + 0.5);
  const y = (value: number) => BASELINE - (value / ceiling) * (BASELINE - TOP);

  function handleWeekKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? points.length - 1
          : event.key === "ArrowLeft"
            ? Math.max(0, index - 1)
            : event.key === "ArrowRight"
              ? Math.min(points.length - 1, index + 1)
              : null;
    if (next === null) return;
    event.preventDefault();
    onWeekChange(points.length - 1 - next);
    (
      event.currentTarget.parentElement?.children[next] as
        | HTMLButtonElement
        | undefined
    )?.focus();
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl bg-white/[0.035] p-3 sm:p-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
        <div
          aria-hidden="true"
          className="text-muted-foreground flex h-40 flex-col justify-between pt-0.5 text-right text-[11px] tabular-nums sm:h-48"
        >
          <span>{ceiling}</span>
          <span>{ceiling / 2}</span>
          <span>0</span>
        </div>
        <div className="relative h-40 min-w-0 sm:h-48">
          <svg
            aria-hidden="true"
            className="block size-full overflow-visible"
            viewBox={`0 0 ${WIDTH} ${BASELINE}`}
            preserveAspectRatio="none"
          >
            {[0, ceiling / 2, ceiling].map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={WIDTH}
                y1={y(tick)}
                y2={y(tick)}
                className="stroke-border"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              x1={center(selectedIndex)}
              x2={center(selectedIndex)}
              y1={TOP}
              y2={BASELINE}
              className="stroke-muted-foreground/60"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
            {points.map((point, index) => (
              <rect
                key={point.endDate}
                x={center(index) - step * 0.28}
                y={y(point.touches)}
                width={step * 0.56}
                height={BASELINE - y(point.touches)}
                className={cn(
                  "fill-trend/70 motion-safe:transition-[y,height] motion-safe:duration-300",
                  index === selectedIndex && "fill-trend",
                )}
              />
            ))}
            <polyline
              points={points
                .map(
                  (point, index) =>
                    `${center(index)},${y(point.movingAverage4w)}`,
                )
                .join(" ")}
              fill="none"
              stroke="var(--tag-purple-text)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div
            role="group"
            aria-label="Explore weeks with the arrow keys"
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))`,
            }}
          >
            {points.map((point, index) => (
              <button
                key={point.endDate}
                type="button"
                aria-label={weekDates(point)}
                aria-pressed={index === selectedIndex}
                tabIndex={index === selectedIndex ? 0 : -1}
                onClick={() => onWeekChange(points.length - 1 - index)}
                onKeyDown={(event) => handleWeekKey(event, index)}
                className="focus-visible:outline-foreground min-w-0 rounded-sm hover:bg-white/8 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1"
              />
            ))}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="caption-style text-muted-foreground col-start-2 mt-1 flex justify-between"
        >
          <span>{formatDate(points[0].startDate)}</span>
          <span>{formatDate(points.at(-1)!.endDate)}</span>
        </div>
      </div>
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-t pt-2">
        <div
          className="caption-style flex flex-wrap gap-x-4 gap-y-1"
          role="status"
          aria-atomic="true"
        >
          <span className="text-foreground font-medium">
            {weekDates(selected)}
          </span>
          <span className="text-trend tabular-nums">
            {selected.touches} {selected.touches === 1 ? "touch" : "touches"}
          </span>
          <span className="text-[color:var(--tag-purple-text)] tabular-nums">
            {selected.movingAverage4w.toFixed(1)} / wk · 4-week average
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="none"
            aria-label="Previous week"
            className="size-11"
            disabled={selectedIndex === 0}
            onClick={() => onWeekChange(points.length - selectedIndex)}
          >
            ←
          </Button>
          <Button
            variant="ghost"
            size="none"
            aria-label="Next week"
            className="size-11"
            disabled={selectedIndex === points.length - 1}
            onClick={() => onWeekChange(points.length - 2 - selectedIndex)}
          >
            →
          </Button>
        </div>
      </div>
      {points.every((point) => point.touches === 0) && (
        <p className="caption-style text-muted-foreground">
          No touches in this period.
        </p>
      )}
    </div>
  );
}
