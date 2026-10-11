"use client";

import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Notifications from "./notifications/notifications";
import { CURRENT_USER } from "@/data/companies";
import { viewById } from "@/lib/views";
import { useUiStore } from "@/stores/ui-store";
import SearchIcon from "@/public/assets/images/_common/search.svg";

export default function CompaniesHeader() {
  const activeView = useUiStore((state) => state.activeView);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const openProfile = useUiStore((state) => state.openProfile);

  return (
    <header className="lg:border-border shrink-0 lg:border-b">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2 lg:py-[14px]">
        <h1 className="truncate text-[28px] leading-none font-semibold tracking-[-0.03em] lg:text-[16px] lg:font-medium lg:tracking-normal">
          {viewById(activeView).title}
        </h1>

        <div className="-mr-1.5 flex shrink-0 items-center gap-1 lg:mr-0 lg:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="fine:size-[30px] text-foreground size-11"
            aria-label="Search"
            aria-keyshortcuts="Meta+K Control+K"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon aria-hidden className="size-4 lg:size-3.5" />
          </Button>
          <Notifications />
          <Button
            variant="ghost"
            size="none"
            className="caption-style fine:h-[30px] fine:min-w-0 text-foreground h-11 min-w-11 gap-1.5 py-[5px] pr-[7px] pl-[5px] font-normal"
            aria-label={`Open profile for ${CURRENT_USER.name}`}
            onClick={() => openProfile(CURRENT_USER.name)}
          >
            <Avatar
              src={CURRENT_USER.avatar}
              alt=""
              className="size-7 lg:size-5"
            />
            <span className="hidden lg:inline">{CURRENT_USER.name}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
