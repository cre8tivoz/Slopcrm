/**
 * The app's views — the one place a view is declared.
 *
 * Header tabs, the sidebar, the page title and the shell's view switch all
 * read from here. Components and icons are mapped by `ViewId` in their own
 * files with `Record<ViewId, …>`, so adding a view here without wiring it
 * everywhere is a type error, not a silent dead link.
 */
export const VIEWS = [
  {
    id: "companies",
    title: "Companies",
    navLabel: "Companies",
    tab: "Companies",
  },
  { id: "deals", title: "Deals Board", navLabel: "Deals Board", tab: "Deals" },
  { id: "forecast", title: "Forecast", navLabel: "Forecast", tab: "Forecast" },
  {
    id: "reports",
    title: "Reporting",
    navLabel: "Reporting",
    tab: "Reporting",
  },
  { id: "activities", title: "Activities", navLabel: "Activities", tab: null },
] as const satisfies readonly {
  id: string;
  title: string;
  navLabel: string;
  /** Header tab label; null keeps the view sidebar-only. */
  tab: string | null;
}[];

export type ViewId = (typeof VIEWS)[number]["id"];

export const DEFAULT_VIEW: ViewId = "companies";

export function isViewId(value: string): value is ViewId {
  return VIEWS.some((view) => view.id === value);
}

export function viewById(id: ViewId) {
  return VIEWS.find((view) => view.id === id) ?? VIEWS[0];
}

/** Views that appear as header tabs, in order. */
export const HEADER_TABS = VIEWS.filter(
  (view): view is Extract<(typeof VIEWS)[number], { tab: string }> =>
    view.tab !== null,
);
