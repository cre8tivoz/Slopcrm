/**
 * Where the app is mounted, e.g. "/slopcrm" when hosted in a subfolder.
 * Empty at the domain root. Set NEXT_PUBLIC_BASE_PATH at build time; it is
 * also passed to `basePath` in next.config.ts.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/+$/,
  "",
);

/**
 * Prefix a `public/` path with the base path. Next adds `basePath` to its own
 * routes and `_next` assets, but not to plain `src` strings in data, so every
 * hard-coded image path goes through this.
 */
export function withBasePath(path: string) {
  return `${BASE_PATH}${path}`;
}
