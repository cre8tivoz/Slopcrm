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
import { formatMoney } from "@/lib/companies";
import { summarise } from "@/lib/pipeline";
import { followUpQueue } from "@/lib/reporting";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";

const PANEL = "border-border bg-card/50 flex flex-col gap-3 rounded-xl border p-3.5";

const ROW_BUTTON =
  "ease-power3-out fine:min-h-0 focus-visible:ring-ring/60 flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left transition-[background-color,transform] duration-150 hover:bg-white/4 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]";

const INTRO_KEY = "slopcrm:intro-dismissed";
const QUEUE_PREVIEW = 5;

const STEPS = [
  {
    title: "Check who needs you",
    body: "The list below shows accounts you haven't spoken to in a while.",
  },
  {
    title: "Log every touch",
    body: "After a call, email or meeting, tap “Log activity” so the team knows.",
  },
  {
    title: "Move deals forward",
    body: "Open a company and change its stage as the deal progresses.",
  },
];

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

export default function Home() {
  const companies = useCompaniesStore((state) => state.companies);
  const interactions = useCompaniesStore((state) => state.interactions);
  const openDetail = useUiStore((state) => state.openDetail);
  const navigate = useUiStore((state) => state.navigate);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const setNewCompanyOpen = useUiStore((state) => state.setNewCompanyOpen);
  const intro = useIntro();
  const [showAll, setShowAll] = useState(false);

  const queue = followUpQueue(companies);
  const visibleQueue = showAll ? queue : queue.slice(0, QUEUE_PREVIEW);
  const summary = summarise(companies);
  const companyById = new Map(companies.map((c) => [c.id, c]));
  const latest = interactions.slice(0, 5);
  const firstName = CURRENT_USER.name.split(" ")[0];

  const quickActions = [
    {
      label: "Find",
      fullLabel: "Find a company",
      hint: "Search by name",
      onClick: () => setSearchOpen(true),
    },
    {
      label: "Add",
      fullLabel: "Add a company",
      hint: "Start tracking a new account",
      onClick: () => setNewCompanyOpen(true),
    },
    {
      label: "Deals",
      fullLabel: "See all deals",
      hint: "Your pipeline, stage by stage",
      onClick: () => navigate("deals"),
    },
  ];

  return (
    <section aria-label="Today" className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[60em] flex-col gap-5 p-4 pb-10">
        <div className="flex flex-col gap-1.5 pt-1">
          <h2>Welcome back, {firstName}</h2>
          <p className="text-soft">
            {queue.length === 0
              ? "You're all caught up. Every account has been contacted recently."
              : `${queue.length} ${queue.length === 1 ? "account needs" : "accounts need"} a follow-up. Start with the top of the list.`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              aria-label={action.fullLabel}
              className="border-border bg-card/50 ease-power3-out focus-visible:ring-ring/60 flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2.5 text-center transition-[background-color,transform] duration-150 hover:bg-white/4 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] sm:items-start sm:px-3.5 sm:py-3 sm:text-left"
            >
              <span className="lead-style font-medium">
                <span className="sm:hidden">{action.label}</span>
                <span className="hidden sm:inline">{action.fullLabel}</span>
              </span>
              <span className="caption-style text-muted-foreground hidden sm:block">
                {action.hint}
              </span>
            </button>
          ))}
        </div>

        <div className={PANEL}>
          <div className="flex items-center justify-between gap-2 px-1">
            <h3>Follow up next</h3>
            <span className="caption-style text-muted-foreground">
              {queue.length} waiting
            </span>
          </div>
          {queue.length === 0 ? (
            <p className="caption-style text-subtle px-1 pb-1">
              Nothing waiting. Nice work.
            </p>
          ) : (
            <ul className="flex flex-col">
              {visibleQueue.map(({ company, status, daysDormant }, index) => (
                <li
                  key={company.id}
                  className="animate-rise flex items-center gap-1"
                  style={{ animationDelay: `${Math.min(index, 11) * 18}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => openDetail(company.id)}
                    className={ROW_BUTTON}
                  >
                    <CompanyLogo company={company} size="lg" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="lead-style truncate font-medium">
                        {company.name}
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
                    <span className="lead-style hidden shrink-0 tabular-nums sm:block">
                      ${formatMoney(company.pipelineValue)}
                    </span>
                  </button>
                  <Button
                    variant="muted"
                    size="sm"
                    onClick={() => openDetail(company.id, { log: true })}
                    aria-label={`Log activity for ${company.name}`}
                    className="fine:min-h-0 min-h-11 shrink-0"
                  >
                    Log activity
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {queue.length > QUEUE_PREVIEW && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll((value) => !value)}
              className="fine:min-h-0 min-h-11 self-start"
            >
              {showAll ? "Show fewer" : `Show all ${queue.length}`}
            </Button>
          )}
        </div>

        {intro.show && (
          <div className="border-primary/40 bg-primary/10 flex flex-col gap-3 rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <h3>How this works</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={intro.dismiss}
                className="fine:min-h-0 -my-1 min-h-11"
              >
                Got it
              </Button>
            </div>
            <ol className="grid gap-3 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-2.5">
                  <span className="caption-style bg-primary flex size-5 shrink-0 items-center justify-center rounded-full font-medium">
                    {index + 1}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="lead-style font-medium">{step.title}</span>
                    <span className="caption-style text-soft">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <div className={PANEL}>
            <div className="flex items-center justify-between gap-2 px-1">
              <h3>Pipeline at a glance</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("forecast")}
                className="fine:min-h-0 min-h-11"
              >
                Forecast
              </Button>
            </div>
            <dl className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1 px-1">
                <dt className="caption-style text-muted-foreground">
                  Total open deals
                </dt>
                <dd className="text-[20px] leading-tight font-semibold tabular-nums">
                  ${formatMoney(summary.total)}
                </dd>
                <dd className="caption-style text-subtle">
                  {summary.openDeals} deals across {summary.companies} companies
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <dt className="caption-style text-muted-foreground">
                  Likely to close
                </dt>
                <dd className="text-[20px] leading-tight font-semibold tabular-nums">
                  ${formatMoney(summary.weighted)}
                </dd>
                <dd className="caption-style text-subtle">
                  Each deal × its chance to win
                </dd>
              </div>
            </dl>
          </div>

          <div className={PANEL}>
            <div className="flex items-center justify-between gap-2 px-1">
              <h3>Latest activity</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("activities")}
                className="fine:min-h-0 min-h-11"
              >
                See all
              </Button>
            </div>
            <ul className="flex flex-col">
              {latest.map((item) => {
                const company = companyById.get(item.companyId);
                if (!company) return null;
                const owner = ownerByName(item.owner);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(company.id)}
                      className={ROW_BUTTON}
                    >
                      <Avatar src={owner.avatar} alt="" className="size-5" />
                      <span className="caption-style min-w-0 flex-1 truncate">
                        <span className="text-foreground font-medium">
                          {CHANNEL_LABEL[item.channel]}
                        </span>{" "}
                        <span className="text-muted-foreground">with</span>{" "}
                        <span className="text-foreground">{company.name}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {item.type}
                        </span>
                      </span>
                      <span className="caption-style text-subtle shrink-0">
                        {relativeDay(item.date)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
