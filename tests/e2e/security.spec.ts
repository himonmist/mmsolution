import { test, expect } from "@playwright/test";

test.describe("HTTP security hardening", () => {
  test("security headers and nonce-based CSP are present", async ({ request }) => {
    const r = await request.get("/");
    const h = r.headers();
    expect(h["x-powered-by"]).toBeUndefined();
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toContain("camera=()");
    const csp = h["content-security-policy"];
    expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  test("page renders with no CSP violations or JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error" && !/WebGL|GPU/.test(m.text())) errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/products");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(errors.filter((e) => /Content Security Policy|Refused to/.test(e))).toEqual([]);
  });

  test("admin area requires authentication and is not cacheable/indexable", async ({ request }) => {
    const r = await request.get("/admin/products", { maxRedirects: 0 });
    expect(r.status()).toBe(307);
    expect(r.headers()["location"]).toContain("/admin/login");
    const login = await request.get("/admin/login");
    expect(login.headers()["x-robots-tag"]).toContain("noindex");
    expect(login.headers()["cache-control"]).toContain("no-store");
  });

  test("forged session cookies are rejected", async ({ request }) => {
    const r = await request.get("/admin", { headers: { Cookie: `__Host-mm_session=${"A".repeat(43)}` }, maxRedirects: 0 });
    expect(r.status()).toBe(307);
    expect(r.headers()["location"]).toContain("/admin/login");
  });

  test("CSRF: cross-origin and non-JSON API posts are refused", async ({ request }) => {
    const body = { type: "GENERAL", name: "Evil", email: "e@x.com", message: "hello there" };
    expect((await request.post("/api/inquiries", { data: body, headers: { Origin: "https://evil.example" } })).status()).toBe(403);
    expect((await request.post("/api/inquiries", { data: body })).status()).toBe(403); // no Origin
    expect((await request.post("/api/inquiries", { form: body, headers: { Origin: "http://localhost:3100" } })).status()).toBe(415);
  });

  test("oversized and malformed payloads are refused", async ({ request }) => {
    const h = { Origin: "http://localhost:3100", "Content-Type": "application/json" };
    expect((await request.post("/api/inquiries", { data: Buffer.from("{bad json"), headers: h })).status()).toBe(400);
    expect((await request.post("/api/inquiries", { data: Buffer.from(JSON.stringify({ message: "x".repeat(40_000) })), headers: h })).status()).toBe(413);
  });

  test("path traversal on uploads is blocked", async ({ request }) => {
    for (const p of ["/uploads/..%2f..%2f.env", "/uploads/2026/..%2F..%2Fpackage.json", "/uploads/2026/x.php", "/uploads/../.env"]) {
      expect((await request.get(p)).status()).toBe(404);
    }
  });

  test("SQL-injection style search input is treated as data", async ({ request }) => {
    const r = await request.get(`/api/search?q=${encodeURIComponent("' OR 1=1; DROP TABLE products; --")}`);
    expect(r.status()).toBe(200);
    const d = await r.json();
    expect(d.products).toEqual([]);
    expect((await request.get("/products/hp-business-laptop")).status()).toBe(200); // table still exists
  });

  test("dev-only studio route is disabled in production", async ({ request }) => {
    expect((await request.get("/studio")).status()).toBe(404);
  });
});
