import { expect, test, type Page } from "@playwright/test";

async function navigateTo(
  page: Page,
  mobile: boolean,
  name: "Reporting" | "Forecast",
) {
  if (mobile)
    await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name, exact: true }).click();
  return page.getByRole("region", { name, exact: true });
}

for (const motion of ["no-preference", "reduce"] as const) {
  test(`inspects Reporting weeks and updates the chart after a touch (${motion})`, async ({
    page,
    isMobile,
  }) => {
    if (isMobile) await page.setViewportSize({ width: 320, height: 700 });
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto("./");
    const report = await navigateTo(page, isMobile, "Reporting");
    const overview = report.getByRole("tab", { name: "Overview" });
    await expect(overview).toHaveAttribute("aria-selected", "true");
    const activityTab = report.getByRole("tab", { name: "Weekly activity" });
    await overview.focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      report.getByRole("tab", { name: "Pipeline by stage" }),
    ).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(activityTab).toHaveAttribute("aria-selected", "true");

    const chart = report.getByRole("region", { name: "Weekly activity" });
    const readout = chart.getByRole("status");
    const weeks = chart
      .getByRole("group", { name: /Explore weeks/ })
      .getByRole("button");
    const latestText = (await readout.textContent()) ?? "";
    await expect(weeks).toHaveCount(14);
    await chart.getByRole("button", { name: /Chart range.*14 weeks/ }).click();
    await page.getByRole("menuitemradio", { name: "Last 26 weeks" }).click();
    await expect(weeks).toHaveCount(26);
    await expect(readout).toHaveText(latestText);
    await expect(chart.locator("svg polyline")).toHaveCount(1);
    await weeks.last().focus();
    await page.keyboard.press("ArrowLeft");
    await expect(weeks.nth(24)).toBeFocused();
    await expect(weeks.nth(24)).toHaveAttribute("aria-pressed", "true");
    const earlierWeek = weeks.nth(12);
    if (isMobile) await earlierWeek.tap();
    else await earlierWeek.click();
    await expect(earlierWeek).toHaveAttribute("aria-pressed", "true");
    await report.getByRole("tab", { name: "Rep Performance" }).click();
    await activityTab.click();
    await expect(weeks).toHaveCount(26);
    await expect(earlierWeek).toHaveAttribute("aria-pressed", "true");
    await chart.getByRole("button", { name: "Next week" }).click();
    await expect(weeks.nth(13)).toHaveAttribute("aria-pressed", "true");
    await weeks.nth(13).focus();
    await page.keyboard.press("End");
    await expect(weeks.last()).toHaveAttribute("aria-pressed", "true");

    const touchCount = readout.getByText(/^\d+ touch(?:es)?$/);
    const before = Number((await touchCount.innerText()).split(" ")[0]);
    expect(Number.isFinite(before)).toBe(true);
    const account = report
      .getByRole("button", { name: /Open details for/ })
      .first();
    await account.click();
    const sheet = page.getByRole("dialog", { name: "Company", exact: true });
    await sheet
      .getByRole("button", { name: "Log activity", exact: true })
      .click();
    await sheet.getByRole("button", { name: "Save activity" }).click();
    await expect(
      sheet.getByRole("status").filter({ hasText: /logged for/ }),
    ).toHaveCount(1);
    await sheet.getByRole("button", { name: "Close details" }).click();
    await expect(touchCount).toHaveText(`${before + 1} touches`);
  });
}

test("shows both Forecast amounts on a narrow screen and restores drill-down focus", async ({
  page,
  isMobile,
}) => {
  if (isMobile) await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("./");
  const forecast = await navigateTo(page, isMobile, "Forecast");
  await expect(
    forecast
      .getByText(/likely to land/i)
      .filter({ hasText: /\$/ })
      .first(),
  ).toBeVisible();
  expect(
    await forecast.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const opportunity = forecast
    .getByRole("list", { name: "Top opportunities" })
    .getByRole("button")
    .first();
  await opportunity.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Company", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(opportunity).toBeFocused();
  const owner = forecast
    .getByRole("button", { name: /Open .* profile/ })
    .first();
  await owner.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Owner Profile" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(owner).toBeFocused();
});

async function seedEmptyCrm(page: Page) {
  await page.addInitScript(() =>
    localStorage.setItem(
      "slopcrm:data",
      JSON.stringify({
        version: 1,
        state: { companies: [], interactions: [], unreadNotificationIds: [] },
      }),
    ),
  );
}

test("draws empty activity at zero and explains the empty state", async ({
  page,
  isMobile,
}) => {
  await seedEmptyCrm(page);
  await page.goto("./");
  const report = await navigateTo(page, isMobile, "Reporting");
  await report.getByRole("tab", { name: "Weekly activity" }).click();
  const chart = report.getByRole("region", { name: "Weekly activity" });
  await expect(chart.getByText("No touches in this period.")).toBeVisible();
  await expect(chart.locator('svg rect[height="0"]')).toHaveCount(14);
  await expect(chart.getByRole("status")).toContainText("0 touches");
});

test("explains an empty Forecast without showing fabricated comparisons", async ({
  page,
  isMobile,
}) => {
  await seedEmptyCrm(page);
  await page.goto("./");
  const forecast = await navigateTo(page, isMobile, "Forecast");
  await expect(forecast.getByText("No stages to compare yet.")).toBeVisible();
  await expect(forecast.getByText("No opportunities yet.")).toBeVisible();
  await expect(forecast.getByText("No owners to compare yet.")).toBeVisible();
  await expect(forecast.getByRole("button")).toHaveCount(0);
});
