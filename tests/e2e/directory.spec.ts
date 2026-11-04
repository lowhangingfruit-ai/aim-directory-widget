import { expect, test } from "@playwright/test";

// Core shopper flows on the market participant directory, against the
// made-up feed in tests/e2e/make-feed.mjs.

test("all markets are grouped by region, and unlisted vendors never appear", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Market Participant Directory" })).toBeVisible();
  for (const region of ["East Bay", "North Bay", "San Francisco"]) {
    await expect(page.getByRole("heading", { level: 2, name: region })).toBeVisible();
  }
  const sunday = page.locator(".mcard", { hasText: "Sunday Marin" });
  await expect(sunday.getByRole("link", { name: /3501 Civic Center Dr/ })).toHaveAttribute("href", /google\.com\/maps\/dir/);

  await page.getByRole("searchbox").fill("Delta Dairy");
  await expect(page.locator(".count")).toContainText("0 market participants");
});

test("searching by market day finds who sells that day", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("Saturday");
  const grid = page.locator(".grid");
  await expect(grid.getByRole("heading", { name: "Alder Creek Farm" })).toBeVisible();
  await expect(grid.getByRole("heading", { name: "Bayside Bakery" })).toBeVisible();
  await expect(grid.getByRole("heading", { name: "Cedar Ridge Ranch" })).toHaveCount(0);
});

test("a market page lists who is there on the chosen date", async ({ page }) => {
  await page.goto("/");
  await page.locator(".mcard", { hasText: "Sunday Marin" }).getByRole("button").click();
  await expect(page).toHaveURL(/marketID=7776/);
  await expect(page.getByRole("heading", { level: 1, name: "Sunday Marin" })).toBeVisible();
  await expect(page.getByRole("link", { name: "All Farmers Markets" }).or(page.getByRole("button", { name: "All Farmers Markets" }))).toBeVisible();

  // Next Sunday: only Alder Creek. The Sunday after: Alder Creek and Cedar Ridge.
  await expect(page.locator(".count")).toContainText("1 market participant at Sunday Marin");
  await page.locator(".day").nth(1).click();
  await expect(page.locator(".count")).toContainText("2 market participants at Sunday Marin");
  const names = await page.locator(".grid h3").allTextContents();
  expect(names).toEqual(["Alder Creek Farm", "Cedar Ridge Ranch"]);
});

test("a profile shows links by name and never a phone number", async ({ page }) => {
  await page.goto("/?marketID=7776");
  await page.getByRole("button", { name: /Alder Creek Farm/ }).click();
  const dialog = page.getByRole("dialog", { name: "Alder Creek Farm" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Website" })).toHaveAttribute("href", "https://aldercreek.example.com");
  await expect(dialog.getByRole("link", { name: "Instagram" })).toBeVisible();
  await expect(dialog).not.toContainText("555");
  await expect(dialog).not.toContainText("1 Private Lane");
  await expect(dialog.getByText(/about \d+ miles from Petaluma/).first()).toBeVisible();
  await expect(dialog.getByText("Certified organic")).toBeVisible();
  await expect(dialog.getByText("What they sell")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("map view opens the map", async ({ page }) => {
  await page.goto("/?marketID=7785");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await expect(page.locator(".mapbox .mapboxgl-map, .mapbox canvas").first()).toBeVisible({ timeout: 15_000 });
});

test("a market's map shows the median distance, and a name in a dot's list opens that profile", async ({ page }) => {
  await page.goto("/?marketID=7776");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await expect(page.locator(".map-summary")).toContainText(/\d+ miles/, { timeout: 15_000 });

  const dot = page.locator(".vendor-dot").first();
  await dot.focus();
  await page.keyboard.press("Enter");
  const first = page.locator(".dot-popup-list button").first();
  await expect(first).toBeFocused();
  const name = (await first.textContent())!;
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name });
  await expect(dialog).toBeVisible();

  // Closing the profile puts focus back on the name in the still-open list.
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".dot-popup-list button", { hasText: name })).toBeFocused();
});

test("the in-season guide opens and a crop searches the directory", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "See what’s in season" }).click();
  const guide = page.getByRole("dialog", { name: "What's in season" });
  await expect(guide).toBeVisible();
  await guide.locator(".crop").first().click();
  await expect(guide).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Remove the .+ filter$/ })).toBeVisible();
});

test("the attendance job refuses callers without the secret, and writes nothing without storage", async ({ request }) => {
  expect((await request.get("/api/cron/attendance")).status()).toBe(401);
  const res = await request.get("/api/cron/attendance", { headers: { authorization: "Bearer test-secret" } });
  expect(res.status()).toBe(500);
  expect(await res.json()).toEqual({ ok: false, error: "Run failed" });
});

test("categories and the organic filter come from Manage My Market", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Farms and produce" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Prepared food" })).toBeVisible();
  await page.getByRole("button", { name: "Certified organic", exact: true }).click();
  const names = await page.locator(".grid h3").allTextContents();
  expect(names).toEqual(["Alder Creek Farm"]);
});

test("without an MMM photo, a picture from the vendor's website stands in, with its source named", async ({ page }) => {
  await page.goto("/?marketID=7786&photos=website");
  const grid = page.locator(".grid");
  // A share photo fills the tile; a logo is shown whole.
  const photo = grid.getByRole("img", { name: "Image from Fernhill Orchard's website" });
  await expect(photo).toBeVisible();
  await expect(photo).toHaveCSS("object-fit", "cover");
  const logo = grid.getByRole("img", { name: "Garnet Creamery logo" });
  await expect(logo).toBeVisible();
  await expect(logo).toHaveCSS("object-fit", "contain");

  await page.getByRole("button", { name: "Fernhill Orchard" }).click();
  const dialog = page.getByRole("dialog", { name: "Fernhill Orchard" });
  await expect(dialog.getByRole("img", { name: "Image from Fernhill Orchard's website" })).toBeVisible();
  await expect(dialog.getByText("Image from their website")).toBeVisible();
  await page.keyboard.press("Escape");

  // A vendor with neither keeps the name tile, and no credit line.
  await page.goto("/?marketID=7776&photos=website");
  await page.getByRole("button", { name: "Alder Creek Farm" }).click();
  await expect(page.getByRole("dialog")).not.toContainText("from their website");
});
