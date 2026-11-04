import { expect, test, type Page } from "@playwright/test";

// Keyboard and screen reader behaviour of the directory, plus an axe-core
// scan (WCAG 2.2 AA and best practice) of each view.

const AXE = require.resolve("axe-core/axe.min.js");

async function axeViolations(page: Page) {
  await page.addScriptTag({ path: AXE });
  return page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (ctx: Document, opts: object) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe;
    const r = await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
    });
    return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`);
  });
}

test("the home page, a filtered list, a market page and a profile have no axe violations", async ({ page }) => {
  // Colors fade over 0.12s after a click; with reduced motion they don't, so
  // axe never measures a pill halfway between two colors.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await axeViolations(page)).toEqual([]);

  await page.getByRole("button", { name: "Farms and produce" }).click();
  expect(await axeViolations(page)).toEqual([]);

  await page.goto("/?marketID=7776");
  await expect(page.locator(".grid")).toBeVisible();
  expect(await axeViolations(page)).toEqual([]);

  await page.getByRole("button", { name: "Alder Creek Farm" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await axeViolations(page)).toEqual([]);

  // Pictures from vendors' websites, in the grid and in a profile.
  await page.goto("/?marketID=7786");
  await expect(page.locator(".grid")).toBeVisible();
  expect(await axeViolations(page)).toEqual([]);
  await page.getByRole("button", { name: "Garnet Creamery" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await axeViolations(page)).toEqual([]);
});

test("a profile keeps focus inside it, and hands it back to the card on close", async ({ page }) => {
  await page.goto("/?marketID=7776");
  const card = page.getByRole("button", { name: "Alder Creek Farm" });
  await card.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "Alder Creek Farm" });
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await expect(page.locator("main")).toHaveJSProperty("inert", true);

  // However far you tab, either way, focus stays in the pop-up.
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest(".modal"))).toBe(true);
  }
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Shift+Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest(".modal"))).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
  await expect(page.locator("main")).toHaveJSProperty("inert", false);
});

test("vendor and market names are headings, and cards don't repeat them", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 3, name: "Sunday Marin" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sunday Marin", exact: true })).toBeVisible();

  await page.getByRole("searchbox").fill("Alder");
  await expect(page.getByRole("heading", { level: 3, name: "Alder Creek Farm" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Alder Creek Farm", exact: true })).toBeVisible();
});

test("changing market moves focus to the new heading and names the page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sunday Marin", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "Sunday Marin" })).toBeFocused();
  await expect(page).toHaveTitle("Sunday Marin Farmers Market | AIM Market Participant Directory");

  await page.getByRole("button", { name: "All Farmers Markets" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Market Participant Directory" })).toBeFocused();
  await expect(page).toHaveTitle("AIM Market Participant Directory");

  // A market page loaded directly carries its title from the server.
  const html = await (await page.request.get("/?marketID=7785")).text();
  expect(html).toContain("<title>Grand Lake Farmers Market | AIM Market Participant Directory</title>");
});

test("result counts are announced as filters change", async ({ page }) => {
  await page.goto("/");
  const status = page.getByRole("status");
  await expect(status).toHaveText("");
  await page.getByRole("searchbox").fill("Saturday");
  await expect(status).toHaveText("2 market participants matching “Saturday”");

  await page.goto("/?marketID=7776");
  await expect(page.locator(".day").first()).toHaveAccessibleName(/^Next/);
  await page.locator(".day").nth(1).click();
  await expect(page.getByRole("status")).toContainText("2 market participants at Sunday Marin");
});

test("the EBT link moves focus to the benefits section", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Using CalFresh EBT/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Shopping with EBT, WIC, and senior benefits" })).toBeFocused();
  await expect(page).toHaveURL(/\/$/);
});

test("picking a crop from the in-season guide moves focus to the results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "See what’s in season" }).click();
  await page.getByRole("dialog", { name: "What's in season" }).locator(".crop").first().click();
  await expect(page.locator("#aimdir-count")).toBeFocused();
  await expect(page.locator("main")).toHaveJSProperty("inert", false);
});

test("the search field has a visible label", async ({ page }) => {
  await page.goto("/");
  const label = page.locator("label[for=aimdir-q]");
  await expect(label).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Search market participants" })).toBeVisible();
});

test("map dots are named buttons that open their vendor list from the keyboard", async ({ page }) => {
  await page.goto("/?marketID=7776");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  const dot = page.locator(".vendor-dot", { has: page.locator("span") }).first();
  await expect(dot).toBeVisible({ timeout: 15_000 });
  await expect(dot).toHaveAttribute("role", "button");
  await expect(dot).toHaveAccessibleName(/: \d+ vendors?\. /);
  await dot.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".mapboxgl-popup")).toBeVisible();
});
