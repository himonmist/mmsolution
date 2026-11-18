import { test, expect } from "@playwright/test";

test("mobile navigation and no horizontal scroll", async ({ page }) => {
  await page.goto("/products");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
});
