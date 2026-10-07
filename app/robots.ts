import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

const CANONICAL_HOST = new URL(SITE_URL).host;

const BLOCK_ALL: MetadataRoute.Robots = {
  rules: { userAgent: "*", disallow: "/" },
};

// Required by `output: "export"`; on a server the headers() call below still
// makes this per-request.
export const revalidate = false;

export default async function robots(): Promise<MetadataRoute.Robots> {
  // A static export can't see the request host, so it never invites indexing.
  if (process.env.STATIC_EXPORT === "1") return BLOCK_ALL;

  const host = (await headers()).get("host");

  if (host !== CANONICAL_HOST) return BLOCK_ALL;

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
