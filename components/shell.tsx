"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CompaniesHeader from "./companies/header/header";
import Companies from "./companies/companies";
import CompanyDetail from "./companies/detail/company-detail";
import DealsBoard from "./deals/deals-board";
import Forecast from "./forecast/forecast";
import Activities from "./activities/activities";
import { useCompaniesStore } from "@/stores/companies-store";

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
  const activeTab = useCompaniesStore((state) => state.activeTab);
  const searchOpen = useCompaniesStore((state) => state.searchOpen);
  const profileOpen = useCompaniesStore((state) => state.profileOpen);
  const newCompanyOpen = useCompaniesStore((state) => state.newCompanyOpen);

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
      const { searchOpen: open, setSearchOpen } = useCompaniesStore.getState();
      setSearchOpen(!open);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CompaniesHeader />
      {/* key on tab: remounts the view so its entrance rise replays */}
      <div
        key={activeTab}
        className="animate-rise flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      >
        {activeTab === "deals" ? (
          <DealsBoard />
        ) : activeTab === "forecast" ? (
          <Forecast />
        ) : activeTab === "activities" ? (
          <Activities />
        ) : (
          <Companies />
        )}
      </div>
      <CompanyDetail />
      {showProfile && <Profile />}
      {showNewCompany && <NewCompanyDialog />}
      {showCommand && <CommandMenu />}
    </div>
  );
}
