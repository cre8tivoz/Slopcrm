import Tag from "@/components/_ui/tag";
import type { Interaction } from "@/data/interactions";
import { CHANNEL_LABEL, relativeDay } from "@/lib/activity";
import { formatDate } from "@/lib/companies";

const SHOWN = 5;

type RecentActivityProps = {
  /** This company's interaction log, newest first. */
  interactions: Interaction[];
};

export default function RecentActivity({ interactions }: RecentActivityProps) {
  if (interactions.length === 0) {
    return (
      <p className="caption-style text-subtle">
        Nothing logged yet. Use “Log activity” after your first call or email.
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {interactions.slice(0, SHOWN).map((item) => (
        <li
          key={item.id}
          className="border-border flex items-start gap-3 border-b py-2.5 first:pt-0 last:border-b-0 last:pb-0"
        >
          <span className="caption-style text-muted-foreground w-[52px] shrink-0 pt-0.5 tabular-nums">
            {formatDate(item.date)}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="lead-style font-medium">
                {CHANNEL_LABEL[item.channel]}
              </span>
              <Tag tone="neutral" size="sm">
                {item.type}
              </Tag>
              <span className="caption-style text-subtle">
                {relativeDay(item.date)}
              </span>
            </span>
            {item.note && (
              <span className="caption-style text-soft break-words">
                {item.note}
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
