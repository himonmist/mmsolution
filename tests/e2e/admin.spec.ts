import { test, expect, type Page } from "@playwright/test";
import { E2E_ADMIN } from "./global-setup";

async function login(page: Page, email = E2E_ADMIN.email, password = E2E_ADMIN.password, expectSuccess = true) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  if (expectSuccess) await page.waitForURL(/\/admin$/);
}

test.describe.serial("CMS", () => {
  test("wrong password shows a generic error", async ({ page }) => {
    await login(page, E2E_ADMIN.email, "Wrong-Password-123!", false);
    await expect(page.locator("form [role=alert]")).toHaveText("Invalid email or password.");
  });

  test("session cookie is HttpOnly, Secure and SameSite", async ({ page, context }) => {
    await login(page);
    await expect(page).toHaveURL(/\/admin$/);
    const c = (await context.cookies()).find((x) => x.name === "__Host-mm_session")!;
    expect(c.httpOnly).toBe(true);
    expect(c.secure).toBe(true);
    expect(c.sameSite).toBe("Lax");
  });

  test("create a product and see it on the public site", async ({ page }) => {
    await login(page);
    await page.goto("/admin/products/new");
    await page.getByLabel("Product name").fill("E2E Test Firewall");
    await page.getByLabel("Category").selectOption({ label: "Routers & Switches" });
    await page.getByLabel("Short description").fill("Next-gen firewall for branch offices.");
    await page.getByText("Published").click();
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByRole("status")).toContainText("Saved");
    await page.goto("/products/e2e-test-firewall");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("E2E Test Firewall");
  });

  test("inquiry appears in admin, message is rendered as text, status updates, CSV exports", async ({ page }) => {
    const sub = await page.request.post("/api/inquiries", {
      headers: { Origin: "http://localhost:3100" },
      data: { type: "PRODUCT", name: "E2E Buyer <img src=x onerror=alert(1)>", email: "buyer@example.com", quantity: 25, message: "<script>alert(1)</script>Please quote 25 units." },
    });
    expect(sub.status()).toBe(201);
    await login(page);
    await page.goto("/admin/inquiries");
    await page.getByRole("link", { name: /E2E Buyer/ }).first().click();
    await expect(page.getByText("Please quote 25 units.")).toBeVisible();
    await expect(page.locator("img[src=x]")).toHaveCount(0); // tags stripped, never rendered as HTML
    await page.getByLabel("Status").selectOption("QUOTATION_SENT");
    await expect(page.getByRole("status")).toHaveText("Saved");
    await page.getByLabel("Add internal note").fill("Quote emailed.");
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(page.getByText("Quote emailed.")).toBeVisible();
    const res = await page.request.get("/admin/export");
    expect(res.headers()["content-type"]).toContain("text/csv");
    expect(await res.text()).toContain("E2E Buyer");
  });

  test("RBAC: a content editor cannot reach users, products or exports", async ({ page, browser }) => {
    await login(page);
    await page.goto("/admin/users");
    await page.getByRole("button", { name: "Add user" }).click();
    await page.getByLabel("Name").fill("Editor Person");
    await page.getByLabel("Email").fill("editor@test.local");
    await page.getByLabel("Role").selectOption("content_editor");
    await page.getByLabel(/Password/).fill("Editor-Strong-Pass-1!");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("editor@test.local")).toBeVisible();

    const ctx = await browser.newContext();
    const p2 = await ctx.newPage();
    await login(p2, "editor@test.local", "Editor-Strong-Pass-1!");
    await expect(p2).toHaveURL(/\/admin$/);
    await expect(p2.getByRole("link", { name: "Users & roles" })).toHaveCount(0);
    await p2.goto("/admin/users");
    await expect(p2).toHaveURL(/denied=1/);
    await p2.goto("/admin/products");
    await expect(p2).toHaveURL(/denied=1/);
    expect((await p2.request.get("/admin/export")).status()).toBe(403);
    await ctx.close();
  });

  test("logout invalidates the session server-side", async ({ page, context }) => {
    await login(page);
    const token = (await context.cookies()).find((x) => x.name === "__Host-mm_session")!.value;
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    const replay = await page.request.get("/admin", { headers: { Cookie: `__Host-mm_session=${token}` }, maxRedirects: 0 });
    expect(replay.status()).toBe(307);
    expect(replay.headers()["location"]).toContain("/admin/login");
  });
});
