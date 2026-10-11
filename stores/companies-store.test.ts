import { beforeEach, describe, expect, it } from "vitest";
import { COMPANIES, type Company } from "@/data/companies";
import { primaryStage } from "@/lib/pipeline";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { useCompaniesStore } from "./companies-store";

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
});
