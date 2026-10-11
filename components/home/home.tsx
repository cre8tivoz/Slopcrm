"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import CompanyLogo from "@/components/company/company-logo";
import {
  STATUS_COPY,
  StatusDot,
  lastContactText,
} from "@/components/company/deal-status";
import { CURRENT_USER, ownerByName } from "@/data/companies";
import { CHANNEL_LABEL, relativeDay } from "@/lib/activity";
import { formatCompactMoney, formatLongDate } from "@/lib/companies";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { summarise } from "@/lib/pipeline";
import { followUpQueue } from "@/lib/reporting";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";

const ROW =
  "ease-power3-out focus-visible:ring-ring/60 -mx-2 flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-[background-color,transform] duration-150 hover:bg-white/4 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]";

const SECTION_TITLE =
  "eyebrow-style text-muted-foreground flex items-center justify-between gap-2";

const INTRO_KEY = "slopcrm:intro-dismissed";
const QUEUE_PREVIEW = 5;

function useIntro() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(INTRO_KEY) === "1";
    } catch {}
    // Read after mount: the prerendered HTML can't know what this browser stored.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(!dismissed);
  }, []);
  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {}
  }
  return { show, dismiss };
}

function headline(waiting: number) {
  if (waiting === 0) return "Nothing on fire. Suspicious, but enjoy it.";
  if (waiting === 1) return "One account is waiting on you. It's noticed.";
  return `${waiting} accounts are waiting on you. They've noticed.`;
}

export default function Home() {
  const companies = useCompaniesStore((state) => state.companies);
  const interactions = useCompaniesStore((state) => state.interactions);
  const openDetail = useUiStore((state) => state.openDetail);
  const navigate = useUiStore((state) => state.navigate);
  const intro = useIntro();
  const [showAll, setShowAll] = useState(false);

  const queue = followUpQueue(companies);
  const visibleQueue = showAll ? queue : queue.slice(0, QUEUE_PREVIEW);
  const summary = summarise(companies);
  const companyById = new Map(companies.map((c) => [c.id, c]));
  const latest = interactions.slice(0, 5);
  const firstName = CURRENT_USER.name.split(" ")[0];

  return (
    <section aria-label="Today" className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[64em] flex-col gap-8 px-4 pt-2 pb-24 lg:px-8 lg:pt-8 lg:pb-12">
        <div className="flex flex-col gap-3">
          <span className="caption-style text-muted-foreground">
            {formatLongDate(DEMO_TODAY)}
          </span>
          <h2 className="text-[22px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance lg:text-[28px]">
            Morning, {firstName}.{" "}
            <span className="text-muted-foreground">
              {headline(queue.length)}
            </span>
          </h2>
          <div className="mt-2 flex gap-8">
            <button
              type="button"
              onClick={() => navigate("forecast")}
              className="ease-power3-out flex flex-col items-start gap-1.5 text-left transition-transform duration-150 active:scale-[0.97]"
            >
              <span className="caption-style text-muted-foreground block">
                In the pipeline
              </span>
              <span className="block text-[28px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                {formatCompactMoney(summary.total)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("forecast")}
              className="ease-power3-out flex flex-col items-start gap-1.5 text-left transition-transform duration-150 active:scale-[0.97]"
            >
              <span className="caption-style text-muted-foreground">
                Likely to land
              </span>
              <span className="block text-[28px] leading-none font-semibold tracking-[-0.03em] text-[#9b8bff] tabular-nums">
                {formatCompactMoney(summary.weighted)}
              </span>
            </button>
          </div>
        </div>

        {intro.show && (
          <div className="bg-primary/12 flex flex-col gap-2 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">Welcome to Slop CRM</h3>
              <button
                type="button"
                onClick={intro.dismiss}
                className="caption-style text-soft hover:text-foreground -m-2 min-h-11 px-2"
              >
                Got it
              </button>
            </div>
            <p className="text-soft leading-snug">
              The companies are fake, the numbers are real-ish. Open anyone
              below, log a call, move a deal along. It all saves in this
              browser, and “Reset demo data” in the menu puts it back.
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
          <section aria-labelledby="follow-up" className="flex flex-col gap-2">
            <h3 id="follow-up" className={SECTION_TITLE}>
              Follow up next
              <span className="tracking-normal normal-case">
                {queue.length} waiting
              </span>
            </h3>
            {queue.length === 0 ? (
              <p className="text-soft py-6">
                Everyone&apos;s been spoken to. Go outside.
              </p>
            ) : (
              <ul className="divide-border flex flex-col divide-y">
                {visibleQueue.map(({ company, status, daysDormant }, index) => (
                  <li
                    key={company.id}
                    className="animate-rise flex items-center gap-2"
                    style={{
                      animationDelay: `${Math.min(index, 11) * 18}ms`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => openDetail(company.id)}
                      className={ROW}
                    >
                      <CompanyLogo company={company} size="lg" />
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="lead-style truncate font-medium">
                            {company.name}
                          </span>
                          <span className="lead-style text-soft shrink-0 tabular-nums">
                            {formatCompactMoney(company.pipelineValue)}
                          </span>
                        </span>
                        <span className="caption-style text-muted-foreground flex items-center gap-1.5">
                          <StatusDot status={status} />
                          <span className="sr-only">
                            {STATUS_COPY[status].label}:
                          </span>
                          <span className="truncate">
                            {lastContactText(daysDormant)}
                          </span>
                        </span>
                      </span>
                    </button>
                    <Button
                      variant="muted"
                      size="sm"
                      onClick={() => openDetail(company.id, { log: true })}
                      aria-label={`Log activity for ${company.name}`}
                      className="fine:min-h-0 min-h-10 min-w-11 shrink-0 bg-white/8 px-3.5 shadow-none hover:bg-white/12"
                    >
                      Log
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {queue.length > QUEUE_PREVIEW && (
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="caption-style text-soft hover:text-foreground min-h-11 self-start"
              >
                {showAll ? "Show fewer" : `Show all ${queue.length}`}
              </button>
            )}
          </section>

          <section aria-labelledby="latest" className="flex flex-col gap-2">
            <h3 id="latest" className={SECTION_TITLE}>
              Latest activity
              <button
                type="button"
                onClick={() => navigate("activities")}
                className="text-soft hover:text-foreground -my-3 min-h-11 tracking-normal normal-case"
              >
                See all
              </button>
            </h3>
            <ul className="flex flex-col">
              {latest.map((item) => {
                const company = companyById.get(item.companyId);
                if (!company) return null;
                const owner = ownerByName(item.owner);
                return (
                  <li key={item.id} className="flex">
                    <button
                      type="button"
                      onClick={() => openDetail(company.id)}
                      className={ROW}
                    >
                      <Avatar
                        src={owner.avatar}
                        alt=""
                        className="size-7 shrink-0"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="lead-style truncate">
                          {CHANNEL_LABEL[item.channel]} with{" "}
                          <span className="font-medium">{company.name}</span>
                        </span>
                        <span className="caption-style text-muted-foreground truncate">
                          {item.type} · {relativeDay(item.date)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
