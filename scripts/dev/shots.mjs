import { chromium } from "playwright";
const out = process.argv[2], url = process.argv[3] ?? "http://localhost:3000/";
const vw = Number(process.argv[4] ?? 1440), vh = Number(process.argv[5] ?? 900);
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: vw, height: vh } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.type() + ": " + m.text().slice(0, 300)); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
const H = await page.evaluate(() => document.querySelector("section[aria-label=Introduction]")?.offsetHeight ?? 0);
const stops = [0, 0.33, 0.6, 0.8, 0.97];
for (const [i, s] of stops.entries()) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(s * (H - vh)));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/hero-${vw}-${i}.png` });
}
console.log(errors.slice(0, 15).join("\n"));
await browser.close();
