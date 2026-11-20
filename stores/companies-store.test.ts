import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COMPANIES, type Company } from "@/data/companies";
import { primaryStage } from "@/lib/pipeline";
import { DEMO_TODAY, isoDaysAgo } from "@/lib/demo-clock";
import { createCompaniesStore, useCompaniesStore } from "./companies-store";
import { useUiStore } from "./ui-store";

const initial = useCompaniesStore.getState();
beforeEach(() => useCompaniesStore.setState(initial, true));

const acme: Company = {
  id: "acme-1",
  name: "Acme",
  tags: ["SMB", "New Logo"],
  owner: "Sarah Nguyen",
  openDeals: 1,
  pipelineValue: 50000,
  winProbability: 40,
  lastInteraction: { date: "2026-09-14", label: "Demo" },
};

describe("companies store", () => {
  it("adds a company to the top of the list", () => {
    useCompaniesStore.getState().addCompany(acme);
    const { companies } = useCompaniesStore.getState();
    expect(companies[0]).toBe(acme);
    expect(companies).toHaveLength(COMPANIES.length + 1);
  });

  it("logs the new company's first touch, keeping the log newest-first", () => {
    useCompaniesStore.getState().addCompany(acme);
    const { interactions } = useCompaniesStore.getState();
    const first = interactions.find((i) => i.companyId === "acme-1");
    expect(first).toMatchObject({
      date: "2026-09-14",
      type: "Demo",
      channel: "meeting",
      owner: "Sarah Nguyen",
    });
    const dates = interactions.map((i) => i.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("marks notifications read, one or all", () => {
    const { unreadNotificationIds, markNotificationRead } =
      useCompaniesStore.getState();
    expect(unreadNotificationIds.length).toBeGreaterThan(1);
    markNotificationRead(unreadNotificationIds[0]);
    expect(useCompaniesStore.getState().unreadNotificationIds).not.toContain(
      unreadNotificationIds[0],
    );
    useCompaniesStore.getState().markAllNotificationsRead();
    expect(useCompaniesStore.getState().unreadNotificationIds).toEqual([]);
  });

  it("logs an activity as today's last interaction", () => {
    useCompaniesStore.getState().logActivity({
      companyId: "apple",
      type: "Pricing",
      channel: "call",
      note: "  Sent revised quote  ",
    });
    const { interactions, companies } = useCompaniesStore.getState();
    expect(interactions[0]).toMatchObject({
      companyId: "apple",
      date: DEMO_TODAY,
      type: "Pricing",
      channel: "call",
      owner: "Alex Santos",
      note: "Sent revised quote",
    });
    expect(companies.find((c) => c.id === "apple")?.lastInteraction).toEqual({
      date: DEMO_TODAY,
      label: "Pricing",
    });
  });

  it("does not move a legacy future last-contact date backwards", () => {
    const company = {
      ...acme,
      lastInteraction: { date: isoDaysAgo(-1), label: "Demo" },
    };
    useCompaniesStore.getState().addCompany(company);
    useCompaniesStore
      .getState()
      .logActivity({ companyId: acme.id, type: "Pricing", channel: "call" });
    const { companies, interactions } = useCompaniesStore.getState();
    expect(
      companies.find((item) => item.id === acme.id)?.lastInteraction,
    ).toEqual(company.lastInteraction);
    expect(
      interactions
        .filter((item) => item.companyId === acme.id)
        .map((item) => item.date),
    ).toEqual([company.lastInteraction.date, DEMO_TODAY]);
  });

  it("ignores an activity for an unknown company", () => {
    const before = useCompaniesStore.getState().interactions;
    useCompaniesStore
      .getState()
      .logActivity({ companyId: "nope", type: "Demo", channel: "meeting" });
    expect(useCompaniesStore.getState().interactions).toBe(before);
  });

  it("changes the primary stage without losing other tags", () => {
    useCompaniesStore.getState().setStage("stripe", "Renewal");
    const stripe = useCompaniesStore
      .getState()
      .companies.find((c) => c.id === "stripe")!;
    expect(primaryStage(stripe)).toBe("Renewal");
    const original = COMPANIES.find((c) => c.id === "stripe")!;
    expect(new Set(stripe.tags)).toEqual(
      new Set([...original.tags, "Renewal"]),
    );
  });

  it("resets everything back to the seed", () => {
    const store = useCompaniesStore.getState();
    store.addCompany(acme);
    store.setStage("stripe", "Renewal");
    useCompaniesStore.getState().resetDemo();
    const { companies, interactions } = useCompaniesStore.getState();
    expect(companies).toBe(COMPANIES);
    expect(interactions).toBe(initial.interactions);
  });

  describe("saving in the browser", () => {
    function fakeBrowser(legacyValue: string | null = null) {
      let json = legacyValue;
      let queue = Promise.resolve();
      return {
        read: () => json,
        write: (value: string) => {
          json = value;
        },
        exclusive: (write: () => void) => {
          const task = queue.then(write);
          queue = task.catch(() => {});
          return task;
        },
      };
    }

    afterEach(() => vi.useRealTimers());

    it("hydrates existing v1 data and serializes stale tabs' edits", async () => {
      const storage = fakeBrowser(
        JSON.stringify({
          version: 1,
          state: {
            companies: [...initial.companies, acme],
            interactions: initial.interactions,
            unreadNotificationIds: [],
          },
        }),
      );
      const left = createCompaniesStore(() => storage);
      const right = createCompaniesStore(() => storage);
      left.getState().refresh();
      right.getState().refresh();
      expect(left.getState().companies.some((c) => c.id === acme.id)).toBe(
        true,
      );
      await Promise.all([
        left.getState().addCompany({ ...acme, id: "left" }),
        right.getState().addCompany({ ...acme, id: "right" }),
      ]);
      for (const tab of [left, right]) {
        tab.getState().refresh();
        expect(tab.getState().companies.map((c) => c.id)).toEqual(
          expect.arrayContaining([acme.id, "left", "right"]),
        );
        expect(tab.getState().unreadNotificationIds).toEqual([]);
      }
      await left.getState().resetDemo();
      await right.getState().addCompany({ ...acme, id: "after-reset" });
      expect(right.getState().companies).toHaveLength(
        initial.companies.length + 1,
      );
      expect(right.getState().companies[0].id).toBe("after-reset");
    });

    it("warns on failed writes and preserves subsequent session edits", async () => {
      vi.useFakeTimers();
      const storage = fakeBrowser();
      storage.write = () => {
        throw new DOMException("full", "QuotaExceededError");
      };
      const store = createCompaniesStore(() => storage);
      useUiStore.getState().dismissToast();
      await store.getState().addCompany(acme);
      await store.getState().addCompany({ ...acme, id: "second" });
      store.getState().refresh();
      useUiStore.getState().showToast("Acme added");
      vi.runAllTimers();
      expect(store.getState().companies).toHaveLength(
        initial.companies.length + 2,
      );
      expect(useUiStore.getState().toast?.message).toMatch(/Couldn't save/);
      expect(storage.read()).toBeNull();
    });
  });
});
