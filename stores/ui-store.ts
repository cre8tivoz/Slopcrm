import { create } from "zustand";
import { DEFAULT_FILTERS, type CompanyFilters } from "@/lib/companies";
import { DEFAULT_VIEW, type ViewId } from "@/lib/views";

export type ReportingTab = "overview" | "conversion" | "velocity" | "reps";

/**
 * What the interface is doing: current view, open panels, table filters. Nothing here is business data — that lives in
 * `companies-store`, which is the part a real backend would replace.
 */
type UiState = {
  activeView: ViewId;
  reportingTab: ReportingTab;
  sidebarOpen: boolean;
  searchOpen: boolean;
  /** "log": picking a company opens it straight onto the log form. */
  searchIntent: "open" | "log";
  newCompanyOpen: boolean;
  /** Kept after close so the sheet still has content while animating out. */
  detailId: string | null;
  detailOpen: boolean;
  /** The detail sheet opens straight onto its "Log activity" form. */
  logFormOpen: boolean;
  toast: { id: number; message: string } | null;
  profileName: string | null;
  profileOpen: boolean;
  filters: CompanyFilters;

  /** Switch view; also closes the mobile nav sheet. */
  navigate: (view: ViewId) => void;
  setReportingTab: (tab: ReportingTab) => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean, intent?: "open" | "log") => void;
  setNewCompanyOpen: (open: boolean) => void;
  /** Opening the detail sheet closes the profile sheet, and vice versa. */
  openDetail: (id: string, options?: { log?: boolean }) => void;
  setLogFormOpen: (open: boolean) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
  closeDetail: () => void;
  openProfile: (name: string) => void;
  closeProfile: () => void;
  setFilter: <K extends keyof CompanyFilters>(
    key: K,
    value: CompanyFilters[K],
  ) => void;
  resetFilters: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeView: DEFAULT_VIEW,
  reportingTab: "overview",
  sidebarOpen: false,
  searchOpen: false,
  searchIntent: "open",
  newCompanyOpen: false,
  detailId: null,
  detailOpen: false,
  logFormOpen: false,
  toast: null,
  profileName: null,
  profileOpen: false,
  filters: DEFAULT_FILTERS,

  navigate: (activeView) => set({ activeView, sidebarOpen: false }),
  setReportingTab: (reportingTab) => set({ reportingTab }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchOpen: (searchOpen, intent) =>
    set((state) => ({
      searchOpen,
      searchIntent: searchOpen ? (intent ?? "open") : state.searchIntent,
    })),
  setNewCompanyOpen: (newCompanyOpen) => set({ newCompanyOpen }),
  openDetail: (detailId, options) =>
    set({
      detailId,
      detailOpen: true,
      profileOpen: false,
      logFormOpen: options?.log ?? false,
    }),
  setLogFormOpen: (logFormOpen) => set({ logFormOpen }),
  showToast: (message) =>
    set((state) => ({
      toast: { id: (state.toast?.id ?? 0) + 1, message },
    })),
  dismissToast: () => set({ toast: null }),
  closeDetail: () => set({ detailOpen: false }),
  openProfile: (profileName) =>
    set({ profileName, profileOpen: true, detailOpen: false }),
  closeProfile: () => set({ profileOpen: false }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
