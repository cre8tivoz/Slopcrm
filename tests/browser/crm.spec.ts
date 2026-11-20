import { expect, test, type Page } from "@playwright/test";

async function openNewCompany(page: Page, mobile: boolean) {
  if (mobile)
    await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: /^New company/i }).click();
}

async function createCompany(page: Page, name: string) {
  const form = page.getByRole("dialog", { name: "New Company" });
  await form.getByLabel("Company name").fill(name);
  await form.getByRole("button", { name: "Create Company" }).click();
  const sheet = page.getByRole("dialog", { name: "Company", exact: true });
  await expect(sheet.getByRole("heading", { name, exact: true })).toBeVisible();
  return sheet;
}

async function openCompanies(page: Page) {
  await page.getByRole("button", { name: /^Companies\b/ }).click();
}

function company(page: Page, name: string, mobile: boolean) {
  return mobile
    ? page.getByRole("button").filter({ hasText: name })
    : page.getByRole("row", { name: `Open ${name}`, exact: true });
}

test("creates an old account, logs activity, restores focus, reloads and resets", async ({
  page,
  isMobile,
}) => {
  const name = "Browser test account";
  const note = "Send the revised proposal";
  await page.goto("./");
  await openNewCompany(page, isMobile);
  const date = page.getByLabel("Date", { exact: true });
  await date.fill("2026-09-15");
  await page.getByLabel("Company name").fill(name);
  await page.getByRole("button", { name: "Create Company" }).click();
  await expect(date).toHaveAttribute("aria-invalid", "true");
  await date.fill("2026-05-01");
  const sheet = await createCompany(page, name);
  await sheet.getByRole("button", { name: "Close details" }).click();

  await openCompanies(page);
  const row = company(page, name, isMobile);
  await expect(row).toBeVisible();
  await row.focus();
  await page.keyboard.press("Enter");
  await expect(sheet).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(row).toBeFocused();
  await page.keyboard.press("Enter");

  await sheet.getByRole("button", { name: "Log activity" }).click();
  await sheet.getByLabel("Notes").fill(note);
  await sheet.getByRole("button", { name: "Save activity" }).click();
  await expect(
    sheet
      .getByRole("status")
      .filter({ hasText: "Call logged for Browser test account" }),
  ).toHaveCount(1);

  await page.reload();
  await openCompanies(page);
  await row.focus();
  await page.keyboard.press("Enter");
  await expect(sheet.getByText(note, { exact: true })).toBeVisible();
  await sheet.getByRole("button", { name: "Close details" }).click();
  if (isMobile)
    await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page
    .getByRole("button", { name: "Tap again to wipe your changes" })
    .click();
  if (isMobile) await openCompanies(page);
  await expect(row).toHaveCount(0);
  await page.reload();
  await openCompanies(page);
  await expect(row).toHaveCount(0);
});

test("keeps both writes when independently opened tabs save", async ({
  page,
  context,
  isMobile,
}) => {
  const second = await context.newPage();
  await Promise.all([page.goto("./"), second.goto("./")]);
  await openNewCompany(page, isMobile);
  await openNewCompany(second, isMobile);
  const [left, right] = await Promise.all([
    createCompany(page, "Left browser tab"),
    createCompany(second, "Right browser tab"),
  ]);
  await left.getByRole("button", { name: "Close details" }).click();
  await right.getByRole("button", { name: "Close details" }).click();
  for (const tab of [page, second]) {
    await openCompanies(tab);
    await expect(company(tab, "Left browser tab", isMobile)).toBeVisible();
    await expect(company(tab, "Right browser tab", isMobile)).toBeVisible();
  }
  await page.reload();
  await openCompanies(page);
  await expect(company(page, "Left browser tab", isMobile)).toBeVisible();
  await expect(company(page, "Right browser tab", isMobile)).toBeVisible();
});
