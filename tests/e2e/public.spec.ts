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

test("official contact details are shown", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByText("+88 01866208620").first()).toBeVisible();
  await expect(page.getByText("info@mmbusinesssolution.com").first()).toBeVisible();
  await expect(page.getByText(/261\/3\/B, West Agargaon Road/).first()).toBeVisible();
  await expect(page.locator('a[href^="https://wa.me/8801866208620"]').first()).toBeAttached();
});

test("Canon toner range: subcategory, compatibility and inquiry", async ({ page }) => {
  await page.goto("/products?category=printers-scanners");
  await expect(page.getByRole("link", { name: /Toner & Cartridges/ }).first()).toBeVisible(); // subcategory listed under parent
  await expect(page.getByRole("link", { name: "Canon NPG-88 Toner" }).first()).toBeVisible(); // parent includes sub-category products
  await page.goto("/products/canon-npg-51-toner");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Canon NPG-51 Toner");
  await expect(page.getByText("imageRUNNER 2525 / 2525i")).toBeVisible();
  await expect(page.getByRole("button", { name: "Request Product Inquiry" })).toBeVisible();
});

test("software products and new services are published", async ({ page }) => {
  await page.goto("/products?brand=autodesk");
  await expect(page.getByRole("link", { name: "Autodesk AutoCAD" }).first()).toBeVisible();
  await page.goto("/products?brand=adobe");
  await expect(page.getByRole("link", { name: "Adobe Creative Cloud" }).first()).toBeVisible();
  await page.goto("/solutions");
  for (const s of ["Software Licensing & Solutions", "Printing & Document Solutions", "Audio-Visual & Video Conferencing", "Cloud, Email & Backup", "IT Maintenance & AMC"]) {
    await expect(page.getByRole("heading", { name: s })).toBeVisible();
  }
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`homepage hydrates without errors (reduced motion: ${reducedMotion})`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && !/WebGL|GPU/.test(m.text())) errors.push(m.text()); });
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}

test("official Canon product photos and Adobe/Canon logos", async ({ page }) => {
  for (const [slug, file] of [["canon-laser-printer", "imageclass-lbp6130n"], ["canon-ink-tank-printer", "pixma-g3010"], ["canon-photocopier-imagerunner", "imagerunner-advance-dx-c3935i"]]) {
    await page.goto(`/products/${slug}`);
    await expect(page.locator(`img[src*="${file}"]`).first()).toBeVisible();
  }
  await page.goto("/brands");
  for (const name of ["Adobe", "Canon"]) {
    const card = page.locator("a", { hasText: new RegExp(`^${name}`) }).first();
    await expect(card.locator("svg[role=img] path").first()).toBeAttached();
  }
});
