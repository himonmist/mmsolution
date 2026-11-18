import { chromium } from "playwright";
const [out, base = "http://localhost:3000"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
await p.goto(base + "/admin/login");
await p.screenshot({ path: `${out}/admin-login.png` });
await p.fill("#email", "admin@mmbusinesssolution.local"); await p.fill("#password", "ChangeMe!2026-Strong");
await p.click("button[type=submit]"); await p.waitForURL(base + "/admin", { timeout: 60000 });
for (const path of ["", "/products", "/products/new", "/inquiries", "/homepage", "/users"]) {
  await p.goto(base + "/admin" + path, { waitUntil: "networkidle" });
  await p.screenshot({ path: `${out}/admin${path.replace(/\//g, "-") || "-dash"}.png` });
}
console.log(errs.join("\n") || "no page errors");
await b.close();
