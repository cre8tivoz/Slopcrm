import { describe, expect, it } from "vitest";
import { DEFAULT_VIEW, TAB_VIEWS, VIEWS, isViewId, viewById } from "./views";

describe("views registry", () => {
  it("has unique ids", () => {
    const ids = VIEWS.map((view) => view.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("guards unknown ids (e.g. a stray tab value)", () => {
    expect(isViewId("forecast")).toBe(true);
    expect(isViewId("contacts")).toBe(false);
  });

  it("tab bar keeps registry order and skip sidebar-only views", () => {
    expect(TAB_VIEWS.map((view) => view.id)).toEqual([
      "home",
      "companies",
      "deals",
      "activities",
    ]);
  });

  it("the default view exists and every view has a page title", () => {
    expect(viewById(DEFAULT_VIEW).id).toBe(DEFAULT_VIEW);
    expect(VIEWS.every((view) => view.title.length > 0)).toBe(true);
  });
});
