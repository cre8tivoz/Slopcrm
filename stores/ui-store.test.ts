import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_FILTERS } from "@/lib/companies";
import { useUiStore } from "./ui-store";

const initial = useUiStore.getState();
beforeEach(() => useUiStore.setState(initial, true));

describe("ui store", () => {
  it("sets one filter at a time and resets to the defaults", () => {
    const { setFilter, resetFilters } = useUiStore.getState();
    setFilter("owner", "Sarah Nguyen");
    setFilter("activityWindow", 7);
    expect(useUiStore.getState().filters).toEqual({
      ...DEFAULT_FILTERS,
      owner: "Sarah Nguyen",
      activityWindow: 7,
    });
    resetFilters();
    expect(useUiStore.getState().filters).toEqual(DEFAULT_FILTERS);
  });

  it("detail and profile sheets never stack", () => {
    const { openDetail, openProfile } = useUiStore.getState();
    openDetail("stripe");
    openProfile("Noah Lee");
    expect(useUiStore.getState()).toMatchObject({
      profileOpen: true,
      detailOpen: false,
    });
    openDetail("stripe");
    expect(useUiStore.getState()).toMatchObject({
      profileOpen: false,
      detailOpen: true,
      detailId: "stripe",
    });
  });

  it("closing a sheet keeps its subject, so the exit animation has content", () => {
    const { openDetail, closeDetail } = useUiStore.getState();
    openDetail("stripe");
    closeDetail();
    expect(useUiStore.getState()).toMatchObject({
      detailOpen: false,
      detailId: "stripe",
    });
  });

  it("navigating closes the mobile nav", () => {
    const { setSidebarOpen, navigate } = useUiStore.getState();
    setSidebarOpen(true);
    navigate("forecast");
    expect(useUiStore.getState()).toMatchObject({
      activeView: "forecast",
      sidebarOpen: false,
    });
  });

  it("toggles row selection", () => {
    const { toggleSelected, setSelected } = useUiStore.getState();
    setSelected([]);
    toggleSelected("apple");
    toggleSelected("zoom");
    toggleSelected("apple");
    expect(useUiStore.getState().selectedIds).toEqual(["zoom"]);
  });
});
