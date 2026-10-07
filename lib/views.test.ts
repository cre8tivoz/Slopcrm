import { describe, expect, it } from "vitest";
import { DEFAULT_VIEW, HEADER_TABS, VIEWS, isViewId, viewById } from "./views";

describe("views registry", () => {
  it("has unique ids", () => {
    const ids = VIEWS.map((view) => view.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("guards unknown ids (e.g. a stray tab value)", () => {
    expect(isViewId("forecast")).toBe(true);
    expect(isViewId("contacts")).toBe(false);
  });

  it("header tabs keep registry order and skip sidebar-only views", () => {
    expect(HEADER_TABS.map((view) => view.id)).toEqual([
      "companies",
      "deals",
      "forecast",
    ]);
  });

  it("the default view exists and every view has a page title", () => {
    expect(viewById(DEFAULT_VIEW).id).toBe(DEFAULT_VIEW);
    expect(VIEWS.every((view) => view.title.length > 0)).toBe(true);
  });
});
