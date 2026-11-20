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
import { useUiStore } from "./ui-store";

/**
 * Business data: companies, their interaction log and notification read
 * state. Seeded from `data/`; this is the store a real backend would replace.
 * Interface state (views, panels, filters, selection) lives in `ui-store`.
 */
type Snapshot = {
  companies: Company[];
  interactions: Interaction[];
  unreadNotificationIds: string[];
};

type Mutation = (state: Snapshot) => Partial<Snapshot>;
type ActionResult = void | Promise<void>;

type CompaniesState = Snapshot & {
  addCompany: (company: Company) => ActionResult;
  logActivity: (entry: {
    companyId: string;
    type: InteractionType;
    channel: InteractionChannel;
    note?: string;
  }) => ActionResult;
  setStage: (companyId: string, stage: Stage) => ActionResult;
  markNotificationRead: (id: string) => ActionResult;
  markAllNotificationsRead: () => ActionResult;
  resetDemo: () => ActionResult;
  refresh: () => void;
};

export const STORAGE_KEY = "slopcrm:data";

export type BrowserStorage = {
  read: () => string | null;
  write: (value: string) => void;
  exclusive: (write: () => void) => Promise<void>;
};

const browserStorage = (): BrowserStorage | undefined =>
  typeof window === "undefined"
    ? undefined
    : {
        read: () => window.localStorage.getItem(STORAGE_KEY),
        write: (value) => window.localStorage.setItem(STORAGE_KEY, value),
        exclusive: (write) => {
          if (!navigator.locks) {
            return Promise.reject(new Error("Web Locks unavailable"));
          }
          return navigator.locks.request(STORAGE_KEY, write);
        },
      };

const SEED = {
  companies: COMPANIES,
  interactions: INTERACTIONS,
  unreadNotificationIds: NOTIFICATIONS.filter((item) => item.unread).map(
    (item) => item.id,
  ),
};

function readSnapshot(storage: BrowserStorage): Snapshot {
  const raw = storage.read();
  if (raw === null) return SEED;
  // Same key and v1 payload as Zustand persist: existing data needs no rewrite.
  const { state, version } = JSON.parse(raw);
  if (
    version !== 1 ||
    !Array.isArray(state?.companies) ||
    !Array.isArray(state?.interactions) ||
    !Array.isArray(state?.unreadNotificationIds)
  ) {
    throw new Error("Unsupported saved Slopcrm data");
  }
  return {
    companies: state.companies,
    interactions: state.interactions,
    unreadNotificationIds: state.unreadNotificationIds,
  };
}

function warnUnsaved() {
  // Let the existing interaction feedback run before showing the save warning.
  setTimeout(() =>
    useUiStore
      .getState()
      .showToast("Couldn't save in this browser. Changes reset on reload."),
  );
}

export function createCompaniesStore(getStorage = browserStorage) {
  return create<CompaniesState>()((set, get) => {
    let sessionOnly = false;
    const mutate = (update: Mutation): ActionResult => {
      const storage = getStorage();
      if (!storage) return set(update(get()));
      const applyInMemory = () => {
        sessionOnly = true;
        set(update(get()));
        warnUnsaved();
      };
      if (sessionOnly) return applyInMemory();
      // Read, apply the action and write under one origin-wide lock. Reading
      // the latest snapshot here (not from this tab's UI) prevents lost edits.
      return storage
        .exclusive(() => {
          if (sessionOnly) return applyInMemory();
          const base = readSnapshot(storage);
          const next = { ...base, ...update(base) };
          try {
            storage.write(JSON.stringify({ state: next, version: 1 }));
          } catch {
            sessionOnly = true;
            warnUnsaved();
          }
          set(next);
        })
        .catch(applyInMemory);
    };

    return {
      ...SEED,
      refresh: () => {
        const storage = getStorage();
        if (!storage || sessionOnly) return;
        try {
          set(readSnapshot(storage));
        } catch {
          // Do not overwrite unreadable data. A write will warn and stay local.
        }
      },
      addCompany: (company) =>
        mutate((state) => {
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
        mutate((state) => {
          const company = state.companies.find((item) => item.id === companyId);
          if (!company) return {};
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
            interactions: [entry, ...state.interactions].sort((a, b) =>
              b.date.localeCompare(a.date),
            ),
            companies: state.companies.map((item) =>
              item.id === companyId && item.lastInteraction.date <= DEMO_TODAY
                ? {
                    ...item,
                    lastInteraction: { date: DEMO_TODAY, label: type },
                  }
                : item,
            ),
          };
        }),
      setStage: (companyId, stage) =>
        mutate((state) => ({
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
        mutate((state) => ({
          unreadNotificationIds: state.unreadNotificationIds.filter(
            (unread) => unread !== id,
          ),
        })),
      markAllNotificationsRead: () =>
        mutate(() => ({ unreadNotificationIds: [] })),
      resetDemo: () => mutate(() => SEED),
    };
  });
}

export const useCompaniesStore = createCompaniesStore();
