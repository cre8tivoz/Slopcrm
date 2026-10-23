import { describe, expect, it } from "vitest";
import {
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_WIDTH_SCRIPT,
  SIDEBAR_WIDTH_STORAGE_KEY,
  SIDEBAR_WIDTH_VAR,
  clampSidebarWidth,
} from "./sidebar";

describe("sidebar helpers", () => {
  it("clampSidebarWidth clamps width within min and max bounds", () => {
    expect(clampSidebarWidth(100)).toBe(SIDEBAR_MIN_WIDTH);
    expect(clampSidebarWidth(500)).toBe(SIDEBAR_MAX_WIDTH);
    expect(clampSidebarWidth(250)).toBe(250);
  });

  it("SIDEBAR_WIDTH_SCRIPT contains valid script content and expected constants", () => {
    expect(SIDEBAR_WIDTH_SCRIPT).toContain(SIDEBAR_WIDTH_STORAGE_KEY);
    expect(SIDEBAR_WIDTH_SCRIPT).toContain(SIDEBAR_WIDTH_VAR);
    expect(SIDEBAR_WIDTH_SCRIPT).toContain(String(SIDEBAR_MIN_WIDTH));
    expect(SIDEBAR_WIDTH_SCRIPT).toContain(String(SIDEBAR_MAX_WIDTH));
  });
});
