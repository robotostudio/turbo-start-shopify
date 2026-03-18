import { expect, test } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator("nav")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});

test("collections page loads", async ({ page }) => {
  await page.goto("/collections");
  await expect(page.locator("h1")).toBeVisible();
});

test("search page loads and accepts input", async ({ page }) => {
  await page.goto("/search");
  await expect(page.locator("h1")).toContainText("Search");
  const searchInput = page.locator(
    'input[type="search"], input[name="q"], input[placeholder*="earch"]',
  );
  if ((await searchInput.count()) > 0) {
    await searchInput.first().fill("test");
  }
});

test("blog page loads", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.locator("h1")).toBeVisible();
});

test("404 page shows for invalid route", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist-12345");
  expect(response?.status()).toBe(404);
  await expect(page.locator("text=404")).toBeVisible();
});
