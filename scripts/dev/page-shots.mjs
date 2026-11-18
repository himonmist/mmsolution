import { chromium } from "playwright";
const [out, url, prefix = "pg", vw = "1440", vh = "900", startSel] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: +vw, height: +vh } });
const errs = [];
page.on("pageerror", (e) => errs.push("pageerror " + e.message));
page.on("console", (m) => m.type() === "error" && errs.push("console " + m.text().slice(0, 200)));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const start = startSel ? await page.evaluate((s) => { const el = document.querySelector(s); return el ? el.getBoundingClientRect().top + scrollY : 0; }, startSel) : 0;
const total = await page.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = start; y < total && i < 14; y += +vh * 0.95, i++) {
  await page.evaluate((y) => scrollTo(0, y), y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${prefix}-${i}.png` });
}
console.log("shots", i, "height", total, errs.slice(0, 8).join("\n"));
await browser.close();
