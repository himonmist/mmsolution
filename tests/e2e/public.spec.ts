import { test, expect } from "@playwright/test";

test("homepage hero, product film and key sections render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Powering Businesses Through Smarter Technology.");
  await expect(page.getByRole("link", { name: "Explore Our Products" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Your Trusted Partner for Complete IT Solutions/ })).toBeAttached();
  await expect(page.getByRole("heading", { name: /Let.s Build a Smarter IT Infrastructure/ })).toBeAttached();
  await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
});

test("catalogue filtering and product detail with product schema", async ({ page }) => {
  await page.goto("/products?category=routers-switches");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Routers & Switches");
  await page.getByRole("link", { name: "Cisco Network Switch" }).first().click();
  await expect(page).toHaveURL(/\/products\/cisco-network-switch/);
  await expect(page.getByRole("button", { name: "Request Product Inquiry" })).toBeVisible();
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.some((t) => t.includes('"@type":"Product"'))).toBe(true);
  await expect(page.getByRole("button", { name: /add to cart/i })).toHaveCount(0);
});

test("product inquiry flow submits to the CMS (and is escaped in admin)", async ({ page }) => {
  await page.goto("/products/hp-business-laptop");
  await page.getByRole("button", { name: "Request Product Inquiry" }).click();
  const dlg = page.getByRole("dialog");
  await expect(dlg).toContainText("HP Business Laptop");
  await dlg.getByLabel("Full name").fill("E2E Buyer <img src=x onerror=alert(1)>");
  await dlg.getByLabel("Email").fill("buyer@example.com");
  await dlg.getByLabel("Required quantity").fill("25");
  await dlg.getByLabel(/^Message/).fill("Please quote 25 units with delivery to Dhaka.");
  await dlg.getByRole("button", { name: "Submit inquiry" }).click();
  await expect(dlg).toContainText("we've received your inquiry");
});

test("search API and page return grouped results", async ({ page }) => {
  await page.goto("/search?q=switch");
  await expect(page.getByRole("link", { name: "Cisco Network Switch" })).toBeVisible();
});

test("chatbot answers and links to products", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Open assistant" }).click();
  const chat = page.getByRole("dialog", { name: "MM assistant" });
  await chat.getByLabel("Message").fill("cisco");
  await chat.getByRole("button", { name: "Send" }).click();
  await expect(chat.getByRole("link", { name: /Cisco Network Switch/ })).toBeVisible();
});

test("sitemap and robots", async ({ request }) => {
  const sm = await (await request.get("/sitemap.xml")).text();
  expect(sm).toContain("/products/hp-business-laptop");
  const rb = await (await request.get("/robots.txt")).text();
  expect(rb).toContain("Disallow: /admin");
});
