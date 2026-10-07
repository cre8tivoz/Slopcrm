import type { NextConfig } from "next";

/**
 * Static hosting (opt-in): `npm run build:static` sets STATIC_EXPORT=1 and
 * writes plain files to `out/` for any web host, no Node server needed.
 * NEXT_PUBLIC_BASE_PATH mounts the app in a subfolder (e.g. "/slopcrm").
 * Without either, `npm run build` / `next start` behave as before.
 */
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  ...(staticExport && { output: "export", trailingSlash: true }),
  ...(basePath && { basePath }),
  images: {
    // A static export has no image optimiser, so images ship as-is.
    unoptimized: staticExport,
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.builder.io",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true,
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
