"use client";

import { useEffect, useState } from "react";
import Button from "@/components/_ui/button";
import { ScrollArea } from "@/components/_ui/scroll-area";
import SidebarNavItem from "./sidebar-nav-item";
import SidebarSection from "./sidebar-section";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";
import Logo from "@/public/assets/images/_common/logo.svg";
import BuildingIcon from "@/public/assets/images/companies/sidebar/building.svg";
import ClipboardIcon from "@/public/assets/images/companies/sidebar/clipboard.svg";
import BarChartIcon from "@/public/assets/images/companies/sidebar/bar-chart.svg";
import ListIcon from "@/public/assets/images/companies/sidebar/list.svg";
import HomeIcon from "@/public/assets/images/companies/sidebar/home.svg";
import BarChartAltIcon from "@/public/assets/images/companies/sidebar/bar-chart-10.svg";
import PlusIcon from "@/public/assets/images/_common/plus.svg";
import { followUpQueue } from "@/lib/reporting";
import { VIEWS, type ViewId } from "@/lib/views";

const WORK_VIEWS: ViewId[] = ["home", "companies", "deals", "activities"];

/** Every view needs a nav icon — a missing entry fails the type check. */
const VIEW_ICONS: Record<ViewId, typeof BuildingIcon> = {
  home: HomeIcon,
  companies: BuildingIcon,
  deals: ClipboardIcon,
  forecast: BarChartIcon,
  reports: BarChartAltIcon,
  activities: ListIcon,
};

export default function SidebarContent() {
  const companies = useCompaniesStore((state) => state.companies);
  const activeView = useUiStore((state) => state.activeView);
  const navigate = useUiStore((state) => state.navigate);
  const setNewCompanyOpen = useUiStore((state) => state.setNewCompanyOpen);
  const resetDemo = useCompaniesStore((state) => state.resetDemo);
  const showToast = useUiStore((state) => state.showToast);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  function reset() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    resetDemo();
    showToast("Back to factory slop");
  }

  const counts: Partial<Record<ViewId, number>> = {
    home: followUpQueue(companies).length,
    companies: companies.length,
  };

  function renderItem(view: (typeof VIEWS)[number]) {
    return (
      <SidebarNavItem
        key={view.id}
        icon={VIEW_ICONS[view.id]}
        label={view.navLabel}
        count={counts[view.id]}
        active={activeView === view.id}
        onClick={() => navigate(view.id)}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-sidebar-border bg-sidebar-accent flex shrink-0 items-center gap-2 border-b p-3">
        <Logo aria-hidden className="size-8 shrink-0 overflow-visible" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="lead-style block truncate font-medium tracking-[-0.01em]">
            Slop CRM
          </span>
          <span className="caption-style text-subtle block truncate">
            Seed data, real-ish vibes
          </span>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Primary">
          <SidebarSection className="border-sidebar-border border-b">
            {VIEWS.filter((view) => WORK_VIEWS.includes(view.id)).map(
              renderItem,
            )}
          </SidebarSection>
          <SidebarSection title="Insights">
            {VIEWS.filter((view) => !WORK_VIEWS.includes(view.id)).map(
              renderItem,
            )}
          </SidebarSection>
        </nav>
      </ScrollArea>

      <div className="border-sidebar-border flex shrink-0 flex-col gap-1 border-t p-3">
        <button
          type="button"
          onClick={reset}
          className="caption-style text-subtle hover:text-foreground data-[confirming=true]:text-danger min-h-11 rounded-lg px-2 text-left transition-colors duration-150 lg:min-h-8"
          data-confirming={confirming}
        >
          {confirming ? "Tap again to wipe your changes" : "Reset demo data"}
        </button>
        <Button
          variant="primary"
          size="md"
          onClick={() => setNewCompanyOpen(true)}
          className="fine:min-h-0 hidden min-h-11 w-full lg:inline-flex"
        >
          <PlusIcon aria-hidden className="size-3.5" />
          New Company
        </Button>
      </div>
    </div>
  );
}
