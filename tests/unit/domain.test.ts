import { describe, it, expect } from "vitest";
import { can, PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/auth/rbac";
import { inquirySchema, productSchema, loginSchema } from "@/lib/validation";
import { whatsappLink } from "@/lib/whatsapp";
import { priceLabel } from "@/lib/price";
import { slugify } from "@/lib/slug";

describe("RBAC", () => {
  it("super admin can do everything", () => {
    for (const p of PERMISSIONS) expect(can("super_admin", p)).toBe(true);
  });
  it("content editor cannot manage users or products", () => {
    expect(can("content_editor", "pages.write")).toBe(true);
    expect(can("content_editor", "users.manage")).toBe(false);
    expect(can("content_editor", "products.write")).toBe(false);
  });
  it("inquiry manager only handles inquiries", () => {
    expect(can("inquiry_manager", "inquiries.manage")).toBe(true);
    expect(can("inquiry_manager", "inquiries.export")).toBe(true);
    expect(can("inquiry_manager", "products.write")).toBe(false);
  });
  it("product manager manages catalogue", () => {
    expect(can("product_manager", "products.write")).toBe(true);
    expect(can("product_manager", "brands.write")).toBe(true);
    expect(can("product_manager", "settings.manage")).toBe(false);
  });
  it("only super admin manages users", () => {
    expect(can("admin", "users.manage")).toBe(false);
    expect(ROLE_PERMISSIONS.super_admin.length).toBe(PERMISSIONS.length);
  });
  it("unknown roles get nothing", () => {
    expect(can("hacker" as never, "products.write")).toBe(false);
  });
});

describe("inquiry validation", () => {
  const base = { type: "PRODUCT", name: "Rahim Uddin", email: "rahim@example.com", phone: "+8801711000000", message: "Need 20 units for office.", quantity: 20 };
  it("accepts a valid inquiry", () => {
    expect(inquirySchema.safeParse(base).success).toBe(true);
  });
  it("rejects bad email, empty message, absurd quantity", () => {
    expect(inquirySchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...base, message: "" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...base, quantity: -1 }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...base, quantity: 10_000_000 }).success).toBe(false);
  });
  it("rejects oversized fields", () => {
    expect(inquirySchema.safeParse({ ...base, message: "x".repeat(5001) }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...base, name: "x".repeat(200) }).success).toBe(false);
  });
  it("rejects unknown types and strips unknown keys (mass assignment)", () => {
    expect(inquirySchema.safeParse({ ...base, type: "ADMIN" }).success).toBe(false);
    const r = inquirySchema.safeParse({ ...base, status: "COMPLETED", assigneeId: "x" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect("status" in r.data).toBe(false);
      expect("assigneeId" in r.data).toBe(false);
    }
  });
  it("validates phone format", () => {
    expect(inquirySchema.safeParse({ ...base, phone: "<script>" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...base, phone: "01711-000000" }).success).toBe(true);
  });
  it("trims and normalises email", () => {
    const r = inquirySchema.parse({ ...base, email: "  Rahim@Example.COM " });
    expect(r.email).toBe("rahim@example.com");
  });
});

describe("product validation", () => {
  it("requires a name and category; slug must be safe", () => {
    expect(productSchema.safeParse({ name: "", categoryId: "c1" }).success).toBe(false);
    expect(productSchema.safeParse({ name: "HP", categoryId: "c1", slug: "../etc/passwd" }).success).toBe(false);
    expect(productSchema.safeParse({ name: "HP ProBook", categoryId: "c1", slug: "hp-probook" }).success).toBe(true);
  });
  it("treats an empty slug from the form as 'generate one'", () => {
    const r = productSchema.safeParse({ name: "X", categoryId: "c", slug: "", brandId: "", price: undefined });
    expect(r.success).toBe(true);
    if (r.success) { expect(r.data.slug).toBeUndefined(); expect(r.data.brandId).toBeUndefined(); }
  });
  it("price must be non-negative when shown", () => {
    expect(productSchema.safeParse({ name: "X", categoryId: "c", priceMode: "SHOW_PRICE", price: -5 }).success).toBe(false);
  });
});

describe("login validation", () => {
  it("bounds credentials", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x".repeat(300) }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "secret-pass" }).success).toBe(true);
  });
});

describe("whatsapp link", () => {
  it("builds an encoded wa.me link and strips non-digits from the number", () => {
    const l = whatsappLink("+880 1711-000000", "Hi, I'm interested in HP ProBook & more?");
    expect(l).toBe("https://wa.me/8801711000000?text=Hi%2C%20I'm%20interested%20in%20HP%20ProBook%20%26%20more%3F");
  });
  it("returns null without a number", () => {
    expect(whatsappLink("", "x")).toBeNull();
  });
});

describe("price label", () => {
  it("respects price modes and never fabricates a price", () => {
    expect(priceLabel({ priceMode: "SHOW_PRICE", price: 85000, currency: "BDT" })).toBe("৳85,000");
    expect(priceLabel({ priceMode: "SHOW_PRICE", price: null, currency: "BDT" })).toBe("Request a Quote");
    expect(priceLabel({ priceMode: "CALL_FOR_PRICE", price: 1, currency: "BDT" })).toBe("Call for Price");
    expect(priceLabel({ priceMode: "REQUEST_QUOTE", price: 1, currency: "BDT" })).toBe("Request a Quote");
    expect(priceLabel({ priceMode: "HIDE", price: 1, currency: "BDT" })).toBeNull();
  });
});

describe("slugify", () => {
  it("creates url-safe slugs", () => {
    expect(slugify("HP Business Laptop 14\" (G10)")).toBe("hp-business-laptop-14-g10");
    expect(slugify("  ../../Etc  ")).toBe("etc");
    expect(slugify("ল্যাপটপ")).toMatch(/^[a-z0-9-]*$/);
  });
});
