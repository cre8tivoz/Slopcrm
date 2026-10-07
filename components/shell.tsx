"use client";

import { useEffect, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import CompaniesHeader from "./companies/header/header";
import Companies from "./companies/companies";
import CompanyDetail from "./companies/detail/company-detail";
import DealsBoard from "./deals/deals-board";
import Forecast from "./forecast/forecast";
import Reports from "./reports/reports";
import Activities from "./activities/activities";
import type { ViewId } from "@/lib/views";
import { useUiStore } from "@/stores/ui-store";

/** Every view must have a screen — a missing entry fails the type check. */
const VIEW_COMPONENTS: Record<ViewId, ComponentType> = {
  companies: Companies,
  deals: DealsBoard,
  forecast: Forecast,
  reports: Reports,
  activities: Activities,
};

// Interaction-only panels: their code (incl. cmdk) is split out of the
// initial bundle and fetched on first open, then kept mounted so exit
// animations still play on later opens.
const Profile = dynamic(() => import("./companies/profile/profile"));
const NewCompanyDialog = dynamic(
  () => import("./companies/new-company/new-company-dialog"),
);
const CommandMenu = dynamic(
  () => import("./companies/command-menu/command-menu"),
);

/** True from an open flag's first true value onwards (never resets). */
function useEver(open: boolean) {
  const [ever, setEver] = useState(false);
  useEffect(() => {
    // Intentional cascading render: flipping `ever` mounts the lazily-loaded
    // panel while `open` is already true, so it opens without a second gate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setEver(true);
  }, [open]);
  return ever;
}

export default function Shell() {
  const activeView = useUiStore((state) => state.activeView);
  const searchOpen = useUiStore((state) => state.searchOpen);
  const profileOpen = useUiStore((state) => state.profileOpen);
  const newCompanyOpen = useUiStore((state) => state.newCompanyOpen);

  const showCommand = useEver(searchOpen);
  const showProfile = useEver(profileOpen);
  const showNewCompany = useEver(newCompanyOpen);

  // Global ⌘K/Ctrl+K must work before CommandMenu has ever mounted, so the
  // listener lives here instead of inside the lazily-loaded dialog.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
        return;
      }
      event.preventDefault();
      const { searchOpen: open, setSearchOpen } = useUiStore.getState();
      setSearchOpen(!open);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const View = VIEW_COMPONENTS[activeView];

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CompaniesHeader />
      {/* key on view: remounts the view so its entrance rise replays */}
      <div
        key={activeView}
        className="animate-rise flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      >
        <View />
      </div>
      <CompanyDetail />
      {showProfile && <Profile />}
      {showNewCompany && <NewCompanyDialog />}
      {showCommand && <CommandMenu />}
    </div>
  );
}
