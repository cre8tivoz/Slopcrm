"use client";

import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import Notifications from "./notifications/notifications";
import { CURRENT_USER } from "@/data/companies";
import { useCompaniesStore } from "@/stores/companies-store";
import MenuIcon from "@/public/assets/images/_common/menu.svg";
import ActiveDot from "@/public/assets/images/companies/header/active-dot.svg";
import SearchIcon from "@/public/assets/images/_common/search.svg";

const TABS = [
  { value: "companies", label: "Companies" },
  { value: "deals", label: "Deals" },
  { value: "forecast", label: "Forecast" },
];

export default function CompaniesHeader() {
  const activeTab = useCompaniesStore((state) => state.activeTab);
  const setActiveTab = useCompaniesStore((state) => state.setActiveTab);
  const setSidebarOpen = useCompaniesStore((state) => state.setSidebarOpen);
  const setSearchOpen = useCompaniesStore((state) => state.setSearchOpen);
  const openProfile = useCompaniesStore((state) => state.openProfile);

  return (
    <header className="shrink-0">
      <div className="flex items-center justify-between gap-1.5 px-4 py-[14px] sm:gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="tap-target fine:size-[30px] size-11 lg:hidden"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon aria-hidden className="size-3.5" />
          </Button>
          <h1 className="truncate">Companies</h1>
          <span className="caption-style bg-muted hidden shrink-0 items-center gap-0.5 rounded-full border border-[#363636] py-[3px] pr-[5px] pl-[3px] sm:inline-flex">
            <ActiveDot aria-hidden className="size-3" />
            Active
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="tap-target fine:size-[30px] size-11"
            aria-label="Search"
            aria-keyshortcuts="Meta+K Control+K"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon aria-hidden className="size-3.5" />
          </Button>
          <Notifications />
          <Button
            variant="secondary"
            size="none"
            className="caption-style tap-target fine:h-[30px] h-11 gap-1.5 py-[5px] pr-[7px] pl-[5px] font-normal"
            aria-label={`Open profile for ${CURRENT_USER.name}`}
            onClick={() => openProfile(CURRENT_USER.name)}
          >
            <Avatar src={CURRENT_USER.avatar} alt="" />
            <span className="hidden sm:inline">{CURRENT_USER.name}</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-border border-b px-4">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.value !== "companies"}
              title={tab.value !== "companies" ? "Coming soon" : undefined}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </header>
  );
}
