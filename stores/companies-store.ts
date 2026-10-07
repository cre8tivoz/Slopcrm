import { create } from "zustand";
import {
  COMPANIES,
  type Company,
  type InteractionType,
} from "@/data/companies";
import {
  CHANNEL_OF,
  INTERACTIONS,
  type Interaction,
} from "@/data/interactions";
import { NOTIFICATIONS } from "@/data/notifications";

/**
 * Business data: companies, their interaction log and notification read
 * state. Seeded from `data/`; this is the store a real backend would replace.
 * Interface state (views, panels, filters, selection) lives in `ui-store`.
 */
type CompaniesState = {
  companies: Company[];
  interactions: Interaction[];
  unreadNotificationIds: string[];
  /** Adds the company and logs its first touch. */
  addCompany: (company: Company) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
};

export const useCompaniesStore = create<CompaniesState>((set) => ({
  companies: COMPANIES,
  interactions: INTERACTIONS,
  unreadNotificationIds: NOTIFICATIONS.filter((item) => item.unread).map(
    (item) => item.id,
  ),
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
      };
    }),
  markNotificationRead: (id) =>
    set((state) => ({
      unreadNotificationIds: state.unreadNotificationIds.filter(
        (unread) => unread !== id,
      ),
    })),
  markAllNotificationsRead: () => set({ unreadNotificationIds: [] }),
}));
