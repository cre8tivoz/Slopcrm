"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/_ui/popover";
import { TAB_VIEWS, type ViewId } from "@/lib/views";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import HomeIcon from "@/public/assets/images/companies/sidebar/home.svg";
import BuildingIcon from "@/public/assets/images/companies/sidebar/building.svg";
import ClipboardIcon from "@/public/assets/images/companies/sidebar/clipboard.svg";
import ListIcon from "@/public/assets/images/companies/sidebar/list.svg";
import MenuIcon from "@/public/assets/images/_common/menu.svg";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const TAB_ICONS: Partial<Record<ViewId, Icon>> = {
  home: HomeIcon,
  companies: BuildingIcon,
  deals: ClipboardIcon,
  activities: ListIcon,
};

const TABS = TAB_VIEWS.map((view) => ({
  view: view.id,
  label: view.tab,
  icon: TAB_ICONS[view.id] ?? ListIcon,
}));

const TAB_CLASS =
  "ease-power3-out focus-visible:ring-ring/60 flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] leading-none transition-[color,transform] duration-150 outline-none focus-visible:ring-2 active:scale-[0.94]";

function QuickAdd() {
  const [open, setOpen] = useState(false);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const setNewCompanyOpen = useUiStore((state) => state.setNewCompanyOpen);

  const actions = [
    {
      label: "Log activity",
      hint: "A call, email, meeting or note",
      run: () => setSearchOpen(true, "log"),
    },
    {
      label: "New company",
      hint: "Start tracking an account",
      run: () => setNewCompanyOpen(true),
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Add"
        className={cn(
          "bg-primary text-primary-foreground ease-power3-out focus-visible:ring-ring/60 absolute right-4 bottom-[calc(100%+12px)] flex size-14 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(65,36,251,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-200 outline-none focus-visible:ring-2 active:scale-[0.92]",
          open && "rotate-45",
        )}
      >
        <PlusIcon aria-hidden className="size-5" />
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-60 p-1.5">
        <ul className="flex flex-col">
          {actions.map((action) => (
            <li key={action.label}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  action.run();
                }}
                className="ease-power3-out flex min-h-12 w-full flex-col items-start justify-center gap-1 rounded-lg px-3 py-2 text-left transition-colors duration-150 outline-none hover:bg-white/6 focus-visible:bg-white/6"
              >
                <span className="lead-style font-medium">{action.label}</span>
                <span className="caption-style text-muted-foreground">
                  {action.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export default function MobileNav() {
  const activeView = useUiStore((state) => state.activeView);
  const navigate = useUiStore((state) => state.navigate);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const inMenu = !TABS.some((tab) => tab.view === activeView);

  return (
    <nav
      aria-label="Main"
      className="bg-background/90 relative z-30 shrink-0 px-2 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] shadow-[0_-1px_0_var(--border)] backdrop-blur-xl lg:hidden"
    >
      <QuickAdd />
      <ul className="flex items-stretch">
        {TABS.map(({ view, label, icon: Icon }) => {
          const active = activeView === view;
          return (
            <li key={view} className="flex flex-1">
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => navigate(view)}
                className={cn(
                  TAB_CLASS,
                  active ? "text-foreground" : "text-subtle",
                )}
              >
                <Icon aria-hidden className="size-[18px]" />
                {label}
              </button>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={cn(
              TAB_CLASS,
              inMenu ? "text-foreground" : "text-subtle",
            )}
          >
            <MenuIcon aria-hidden className="size-[18px]" />
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
