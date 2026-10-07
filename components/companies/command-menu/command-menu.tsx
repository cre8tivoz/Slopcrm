"use client";

import { useRef, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Kbd,
} from "@/components/_ui/command";
import { CommandCompanyRow, CommandTableHeader } from "./command-table";
import { useCompaniesStore } from "@/stores/companies-store";
import { useUiStore } from "@/stores/ui-store";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

export default function CommandMenu() {
  const open = useUiStore((state) => state.searchOpen);
  const setOpen = useUiStore((state) => state.setSearchOpen);
  const companies = useCompaniesStore((state) => state.companies);
  const openDetail = useUiStore((state) => state.openDetail);
  const setNewCompanyOpen = useUiStore((state) => state.setNewCompanyOpen);
  const [query, setQuery] = useState("");
  const actionRan = useRef(false);

  function run(action: () => void) {
    actionRan.current = true;
    setOpen(false);
    action();
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search companies by name, owner, segment or stage"
      className="max-w-[960px]"
      onCloseAutoFocus={(event) => {
        if (actionRan.current) event.preventDefault();
        actionRan.current = false;
        setQuery("");
      }}
    >
      <Command>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search companies, owners, stages…"
          trailing={<Kbd>Esc</Kbd>}
        />
        <CommandTableHeader />
        <CommandList>
          <CommandEmpty>No results for “{query}”</CommandEmpty>
          <CommandGroup>
            {companies.map((company) => (
              <CommandCompanyRow
                key={company.id}
                company={company}
                onSelect={() => run(() => openDetail(company.id))}
              />
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              value="new-company"
              keywords={["New Company", "Add", "Create"]}
              onSelect={() => run(() => setNewCompanyOpen(true))}
            >
              <span className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-md shadow-[0px_0px_0px_1px_#232323]">
                <PlusIcon aria-hidden className="text-soft size-3" />
              </span>
              New Company
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            Open
          </span>
        </CommandFooter>
      </Command>
    </CommandDialog>
  );
}
