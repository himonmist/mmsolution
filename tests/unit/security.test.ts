import { describe, it, expect, beforeEach } from "vitest";
import { hashPassword, verifyPassword, checkPasswordPolicy } from "@/lib/security/password";
import { randomToken, sha256 } from "@/lib/security/tokens";
import { RateLimiter } from "@/lib/security/rate-limit";
import { sanitizeRichText, stripTags } from "@/lib/security/sanitize";
import { toCsv } from "@/lib/security/csv";
import { sniffImageType } from "@/lib/security/upload";
import { isSameOrigin } from "@/lib/security/origin";
import { safeJsonLd } from "@/lib/seo";
import { isSafeRedirect, isSafeUrl } from "@/lib/security/url";

describe("password hashing", () => {
  it("hashes with a salt and verifies", async () => {
    const h1 = await hashPassword("Correct-Horse-9!");
    const h2 = await hashPassword("Correct-Horse-9!");
    expect(h1).not.toEqual(h2);
    expect(h1).not.toContain("Correct");
    expect(await verifyPassword("Correct-Horse-9!", h1)).toBe(true);
    expect(await verifyPassword("wrong", h1)).toBe(false);
  });
  it("enforces a strong password policy", () => {
    expect(checkPasswordPolicy("short").ok).toBe(false);
    expect(checkPasswordPolicy("alllowercaseletters").ok).toBe(false);
    expect(checkPasswordPolicy("Password123!").ok).toBe(false); // common
    expect(checkPasswordPolicy("Blue-Rack-Switch-42").ok).toBe(true);
  });
  it("rejects absurdly long passwords (bcrypt 72-byte DoS/truncation)", () => {
    expect(checkPasswordPolicy("A1!" + "x".repeat(200)).ok).toBe(false);
  });
});

describe("tokens", () => {
  it("creates high-entropy url-safe tokens", () => {
    const t = randomToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]{43,}$/);
    expect(randomToken()).not.toEqual(t);
  });
  it("sha256 is deterministic hex", () => {
    expect(sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("rate limiter", () => {
  let rl: RateLimiter;
  beforeEach(() => { rl = new RateLimiter({ limit: 3, windowMs: 1000 }); });
  it("allows up to limit then blocks", () => {
    const now = 10_000;
    expect(rl.hit("ip1", now).allowed).toBe(true);
    expect(rl.hit("ip1", now).allowed).toBe(true);
    expect(rl.hit("ip1", now).allowed).toBe(true);
    const r = rl.hit("ip1", now);
    expect(r.allowed).toBe(false);
    expect(r.retryAfterMs).toBeGreaterThan(0);
    expect(rl.hit("ip2", now).allowed).toBe(true);
  });
  it("resets after the window", () => {
    for (let i = 0; i < 3; i++) rl.hit("k", 0);
    expect(rl.hit("k", 500).allowed).toBe(false);
    expect(rl.hit("k", 1001).allowed).toBe(true);
  });
  it("bounds memory by evicting old keys", () => {
    const small = new RateLimiter({ limit: 1, windowMs: 1000, maxKeys: 100 });
    for (let i = 0; i < 1000; i++) small.hit("k" + i, i);
    expect(small.size()).toBeLessThanOrEqual(100);
  });
});

describe("sanitizer (XSS)", () => {
  it("removes scripts, handlers and javascript: urls", () => {
    const dirty = `<p onclick="x()">Hi<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">l</a><iframe src="//evil"></iframe></p>`;
    const clean = sanitizeRichText(dirty);
    expect(clean).not.toMatch(/script|onerror|onclick|javascript:|iframe/i);
    expect(clean).toContain("<p>Hi");
  });
  it("keeps safe formatting and forces rel on links", () => {
    const clean = sanitizeRichText(`<h2>T</h2><ul><li><strong>a</strong></li></ul><a href="https://x.com">x</a>`);
    expect(clean).toContain("<h2>T</h2>");
    expect(clean).toContain("<strong>a</strong>");
    expect(clean).toMatch(/rel="noopener noreferrer nofollow"/);
  });
  it("blocks data: and svg vectors", () => {
    const clean = sanitizeRichText(`<img src="data:text/html;base64,xx"><svg><script>1</script></svg><style>*{}</style>`);
    expect(clean).not.toMatch(/data:|svg|style/i);
  });
  it("stripTags produces plain text", () => {
    expect(stripTags("<b>Hello</b> <i>world</i><script>x</script>")).toBe("Hello world");
  });
});

describe("csv export", () => {
  it("escapes quotes, commas, newlines", () => {
    expect(toCsv([["a", 'b"c', "d,e", "f\ng"]])).toBe('a,"b""c","d,e","f\ng"\r\n');
  });
  it("neutralises spreadsheet formula injection", () => {
    const out = toCsv([["=HYPERLINK(\"http://evil\")", "+1", "-2", "@SUM(A1)", "\tx", "ok"]]);
    expect(out.startsWith(`"'=HYPERLINK`)).toBe(true);
    expect(out).toContain("'+1");
    expect(out).toContain("'-2");
    expect(out).toContain("'@SUM");
    expect(out).toContain(",ok");
  });
});

describe("upload sniffing", () => {
  it("detects real image types by magic bytes", () => {
    expect(sniffImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe("image/jpeg");
    expect(sniffImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(sniffImageType(Buffer.from("RIFF\0\0\0\0WEBPVP8 ", "latin1"))).toBe("image/webp");
  });
  it("rejects svg, html and executables disguised as images", () => {
    expect(sniffImageType(Buffer.from("<svg xmlns=..."))).toBeNull();
    expect(sniffImageType(Buffer.from("<html><script>"))).toBeNull();
    expect(sniffImageType(Buffer.from("MZ\x90\x00", "latin1"))).toBeNull();
    expect(sniffImageType(Buffer.alloc(0))).toBeNull();
  });
});

describe("origin check (CSRF)", () => {
  const site = "https://mmbusinesssolution.com";
  it("accepts same origin", () => {
    expect(isSameOrigin({ origin: site, host: "mmbusinesssolution.com" }, site)).toBe(true);
  });
  it("rejects cross origin and missing origin on unsafe methods", () => {
    expect(isSameOrigin({ origin: "https://evil.com", host: "mmbusinesssolution.com" }, site)).toBe(false);
    expect(isSameOrigin({ origin: null, host: "mmbusinesssolution.com" }, site)).toBe(false);
    expect(isSameOrigin({ origin: "null", host: "mmbusinesssolution.com" }, site)).toBe(false);
  });
  it("accepts origin matching the request host (dev / preview)", () => {
    expect(isSameOrigin({ origin: "http://localhost:3000", host: "localhost:3000" }, site)).toBe(true);
  });
});

describe("url safety", () => {
  it("only allows relative internal redirects", () => {
    expect(isSafeRedirect("/admin/products")).toBe(true);
    expect(isSafeRedirect("//evil.com")).toBe(false);
    expect(isSafeRedirect("/\\evil.com")).toBe(false);
    expect(isSafeRedirect("https://evil.com")).toBe(false);
    expect(isSafeRedirect("javascript:alert(1)")).toBe(false);
  });
  it("only allows http(s) external urls", () => {
    expect(isSafeUrl("https://hp.com")).toBe(true);
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,x")).toBe(false);
  });
});

describe("JSON-LD escaping", () => {
  it("cannot break out of the script tag", () => {
    const s = safeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(s).not.toContain("</script>");
    expect(s).toContain("\\u003c");
  });
});
