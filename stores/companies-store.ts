import { create } from "zustand";
import {
  COMPANIES,
  STAGES,
  type Company,
  type InteractionType,
  type Stage,
} from "@/data/companies";
import {
  CHANNEL_OF,
  INTERACTIONS,
  type Interaction,
  type InteractionChannel,
} from "@/data/interactions";
import { DEMO_TODAY } from "@/lib/demo-clock";
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
  /** Logs a touch dated today; it becomes the company's last interaction. */
  logActivity: (entry: {
    companyId: string;
    type: InteractionType;
    channel: InteractionChannel;
    note?: string;
  }) => void;
  /** Makes `stage` the company's primary stage (its first stage tag). */
  setStage: (companyId: string, stage: Stage) => void;
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
  logActivity: ({ companyId, type, channel, note }) =>
    set((state) => {
      const company = state.companies.find((item) => item.id === companyId);
      if (!company) return state;
      const entry: Interaction = {
        id: `${companyId}-log-${state.interactions.length}`,
        companyId,
        date: DEMO_TODAY,
        type,
        channel,
        owner: company.owner,
        ...(note?.trim() ? { note: note.trim() } : {}),
      };
      return {
        interactions: [entry, ...state.interactions],
        companies: state.companies.map((item) =>
          item.id === companyId
            ? { ...item, lastInteraction: { date: DEMO_TODAY, label: type } }
            : item,
        ),
      };
    }),
  setStage: (companyId, stage) =>
    set((state) => ({
      companies: state.companies.map((item) => {
        if (item.id !== companyId) return item;
        const isStage = (tag: string) =>
          (STAGES as readonly string[]).includes(tag);
        const segments = item.tags.filter((tag) => !isStage(tag));
        const otherStages = item.tags.filter(
          (tag) => isStage(tag) && tag !== stage,
        );
        return { ...item, tags: [...segments, stage, ...otherStages] };
      }),
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      unreadNotificationIds: state.unreadNotificationIds.filter(
        (unread) => unread !== id,
      ),
    })),
  markAllNotificationsRead: () => set({ unreadNotificationIds: [] }),
}));
