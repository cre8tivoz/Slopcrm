import { afterEach, describe, expect, it, vi } from "vitest";

async function load(basePath?: string) {
  vi.resetModules();
  if (basePath !== undefined) vi.stubEnv("NEXT_PUBLIC_BASE_PATH", basePath);
  return import("./base-path");
}

afterEach(() => vi.unstubAllEnvs());

describe("withBasePath", () => {
  it("leaves paths alone at the domain root", async () => {
    const { withBasePath } = await load();
    expect(withBasePath("/assets/a.png")).toBe("/assets/a.png");
  });

  it("prefixes the subfolder, tolerating a trailing slash", async () => {
    const { withBasePath } = await load("/slopcrm/");
    expect(withBasePath("/assets/a.png")).toBe("/slopcrm/assets/a.png");
  });
});
