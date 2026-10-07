import { afterEach, describe, expect, it, vi } from "vitest";

async function load(siteUrl: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
  return import("./seo");
}

afterEach(() => vi.unstubAllEnvs());

describe("absoluteUrl", () => {
  it("resolves against a domain root as before", async () => {
    const { absoluteUrl } = await load("https://example.com");
    expect(absoluteUrl("/")).toBe("https://example.com/");
    expect(absoluteUrl("/sitemap.xml")).toBe("https://example.com/sitemap.xml");
  });

  it("keeps a subfolder in the site URL", async () => {
    const { absoluteUrl } = await load("https://witchdaddylabs.com/slopcrm");
    expect(absoluteUrl("/")).toBe("https://witchdaddylabs.com/slopcrm/");
    expect(absoluteUrl("/opengraph-image.jpg")).toBe(
      "https://witchdaddylabs.com/slopcrm/opengraph-image.jpg",
    );
  });
});
