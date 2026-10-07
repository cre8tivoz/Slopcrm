import type { ComponentType, SVGProps } from "react";
import Sparkline from "@/components/_common/sparkline";
import type { Interaction } from "@/data/interactions";
import { activityCounts, weeklyTouches, withinDays } from "@/lib/activity";
import { formatDate } from "@/lib/companies";
import CursorClickIcon from "@/public/assets/images/companies/detail/cursor-click.svg";
import MailIcon from "@/public/assets/images/companies/detail/mail-03.svg";
import CalendarIcon from "@/public/assets/images/companies/detail/calendar.svg";
import PhoneCallIcon from "@/public/assets/images/companies/detail/phone-call.svg";

type ActivityTrendProps = {
  /** This company's interaction log, newest first. */
  interactions: Interaction[];
  /** Window in days, from the section's period picker. */
  days: number;
};

type Stat = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
};

export default function ActivityTrend({
  interactions,
  days,
}: ActivityTrendProps) {
  const counts = activityCounts(withinDays(interactions, days));
  const stats: Stat[] = [
    { icon: MailIcon, label: "Emails", value: counts.email },
    { icon: CalendarIcon, label: "Meetings", value: counts.meeting },
    { icon: PhoneCallIcon, label: "Calls", value: counts.call },
    { icon: CursorClickIcon, label: "Notes", value: counts.note },
  ];
  const latest = interactions[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-[3px]">
          <span className="block text-[24px] leading-none tabular-nums">
            {counts.total}
          </span>
          <Sparkline
            values={weeklyTouches(interactions)}
            className="h-[22px]"
          />
        </div>
        <span className="caption-style text-soft block">
          {counts.total === 1 ? "Touch" : "Touches"} in the last {days} days
          {latest && ` · last: ${latest.type}, ${formatDate(latest.date)}`}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-line-strong flex flex-col gap-3 rounded-lg border p-[11px]"
          >
            <span className="caption-style text-soft flex items-center gap-1">
              <stat.icon aria-hidden className="size-3 shrink-0" />
              {stat.label}
            </span>
            <span className="lead-style block tabular-nums">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
