import { create } from "zustand";
import {
  COMPANIES,
  type Company,
  type InteractionType,
  type SortKey,
} from "@/data/companies";
import {
  CHANNEL_OF,
  INTERACTIONS,
  type Interaction,
} from "@/data/interactions";
import { NOTIFICATIONS } from "@/data/notifications";
import { DEFAULT_FILTERS } from "@/lib/companies";
import { DEFAULT_VIEW, type ViewId } from "@/lib/views";

type CompaniesState = {
  companies: Company[];
  interactions: Interaction[];
  sortBy: SortKey;
  owner: string;
  stage: string;
  activityWindow: number;
  selectedIds: string[];
  detailId: string | null;
  detailOpen: boolean;
  profileName: string | null;
  profileOpen: boolean;
  newCompanyOpen: boolean;
  sidebarOpen: boolean;
  searchOpen: boolean;
  unreadNotificationIds: string[];
  activeTab: ViewId;
  setSortBy: (sortBy: SortKey) => void;
  setOwner: (owner: string) => void;
  setStage: (stage: string) => void;
  setActivityWindow: (days: number) => void;
  resetFilters: () => void;
  toggleSelected: (id: string) => void;
  setSelected: (ids: string[]) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  openProfile: (name: string) => void;
  closeProfile: () => void;
  setNewCompanyOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setActiveTab: (tab: ViewId) => void;
  addCompany: (company: Company) => void;
};

export const useCompaniesStore = create<CompaniesState>((set) => ({
  companies: COMPANIES,
  interactions: INTERACTIONS,
  ...DEFAULT_FILTERS,
  selectedIds: ["microsoft"],
  detailId: null,
  detailOpen: false,
  profileName: null,
  profileOpen: false,
  newCompanyOpen: false,
  sidebarOpen: false,
  searchOpen: false,
  unreadNotificationIds: NOTIFICATIONS.filter((item) => item.unread).map(
    (item) => item.id,
  ),
  activeTab: DEFAULT_VIEW,
  setSortBy: (sortBy) => set({ sortBy }),
  setOwner: (owner) => set({ owner }),
  setStage: (stage) => set({ stage }),
  setActivityWindow: (activityWindow) => set({ activityWindow }),
  resetFilters: () => set({ ...DEFAULT_FILTERS }),
  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selected) => selected !== id)
        : [...state.selectedIds, id],
    })),
  setSelected: (selectedIds) => set({ selectedIds }),
  openDetail: (detailId) =>
    set({ detailId, detailOpen: true, profileOpen: false }),
  closeDetail: () => set({ detailOpen: false }),
  openProfile: (profileName) =>
    set({ profileName, profileOpen: true, detailOpen: false }),
  closeProfile: () => set({ profileOpen: false }),
  setNewCompanyOpen: (newCompanyOpen) => set({ newCompanyOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  markNotificationRead: (id) =>
    set((state) => ({
      unreadNotificationIds: state.unreadNotificationIds.filter(
        (unread) => unread !== id,
      ),
    })),
  markAllNotificationsRead: () => set({ unreadNotificationIds: [] }),
  setActiveTab: (activeTab) => set({ activeTab }),
  addCompany: (company) =>
    set((state) => {
      // A new company arrives with its first logged touch, so it shows up in
      // the Activities feed and the detail sheet counts straight away.
      const type = company.lastInteraction.label as InteractionType;
      const first: Interaction = {
        id: `${company.id}-0`,
        companyId: company.id,
        date: company.lastInteraction.date,
        type,
        channel: CHANNEL_OF[type] ?? "note",
        owner: company.owner,
      };
      return {
        companies: [company, ...state.companies],
        interactions: [first, ...state.interactions].sort((a, b) =>
          b.date.localeCompare(a.date),
        ),
        newCompanyOpen: false,
      };
    }),
}));
