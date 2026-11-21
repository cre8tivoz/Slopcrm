import { expect, test, type Page } from "@playwright/test";
import { COMPANIES } from "../../data/companies";
import { INTERACTIONS } from "../../data/interactions";

async function showFullFeed(page: Page, isMobile: boolean) {
  await page
    .getByRole("button", {
      name: isMobile ? "Activity" : "Activities",
      exact: true,
    })
    .click();
  const feed = page.getByRole("region", { name: "Activities" });
  const oldest = feed.getByRole("heading", { name: /180 days ago/ });
  const range = feed.getByRole("button", { name: /Feed range.*90 days/ });
  await expect(range).toBeVisible();
  await expect(oldest).toHaveCount(0);
  await range.click();
  await page.getByRole("menuitemradio", { name: "Last 180 days" }).click();
  await expect(oldest).toBeVisible();
  return { feed, oldest };
}

test("explores six months without changing the fixed 14-week sparkline", async ({
  page,
  isMobile,
}) => {
  await page.goto("./");
  const { oldest } = await showFullFeed(page, isMobile);
  await oldest.scrollIntoViewIfNeeded();
  await expect(oldest).toBeInViewport();
  await oldest.locator("..").getByRole("button", { name: /LVMH/ }).click();

  const sheet = page.getByRole("dialog", { name: "Company", exact: true });
  await expect(sheet.getByText("0 Touches in the last 30 days")).toBeVisible();
  const trend = sheet.getByRole("img", {
    name: "0 touches in the last 14 weeks",
  });
  await expect(trend).toBeVisible();
  await expect(sheet.getByText("Last 14 weeks", { exact: true })).toBeVisible();
  await sheet.getByRole("button", { name: /Count range.*30 days/ }).click();
  await page.getByRole("menuitemradio", { name: "Last 180 days" }).click();
  await expect(
    sheet.getByText(/[1-9]\d* Touches in the last 180 days/),
  ).toBeVisible();
  await expect(trend).toBeVisible();
});

test("profiles loading, scrolling and switching views with a larger local fixture", async ({
  page,
  isMobile,
}) => {
  test.skip(
    process.env.SLOPCRM_STRESS !== "1",
    "Opt-in local profiling fixture",
  );
  const copies = Array.from({ length: 12 }, (_, index) => `-load-${index + 1}`);
  const companies = copies.flatMap((suffix) =>
    COMPANIES.map((company) => ({
      ...company,
      id: company.id + suffix,
    })),
  );
  const interactions = copies
    .flatMap((suffix) =>
      INTERACTIONS.map((touch) => ({
        ...touch,
        id: touch.id + suffix,
        companyId: touch.companyId + suffix,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const saved = JSON.stringify({
    state: { companies, interactions, unreadNotificationIds: [] },
    version: 1,
  });
  await page.addInitScript((snapshot) => {
    if (localStorage.getItem("slopcrm:data") === null) {
      localStorage.setItem("slopcrm:data", snapshot);
    }
  }, saved);

  const started = performance.now();
  await page.goto("./");
  const { feed, oldest } = await showFullFeed(page, isMobile);
  await expect(feed.locator("ol > li > ul > li")).toHaveCount(
    interactions.length,
  );
  const feedReady = performance.now();
  await oldest.scrollIntoViewIfNeeded();
  await expect(oldest).toBeInViewport();
  const scrolled = performance.now();
  await page.getByRole("button", { name: /^Companies\b/ }).click();
  if (isMobile) {
    await expect(page.locator("#companies ul > li:visible")).toHaveCount(
      companies.length,
    );
  } else {
    await expect(page.getByRole("row", { name: /^Open / })).toHaveCount(
      companies.length,
    );
  }
  const tableReady = performance.now();
  // These include browser automation overhead and aren't pass/fail thresholds.
  console.log(
    `${isMobile ? "mobile" : "desktop"}: ${companies.length} companies, ${interactions.length} touches, ${saved.length} JSON chars; load + full feed ${Math.round(feedReady - started)} ms, scroll to oldest ${Math.round(scrolled - feedReady)} ms, Companies ${Math.round(tableReady - scrolled)} ms`,
  );
});
