// Renders every procedural 3D model to a transparent studio product shot.
// Usage: (dev server running) node scripts/render-studio.mjs [baseUrl]
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3000";
const models = ["laptop", "laptop-graphite", "desktop", "tower", "monitor", "components", "printer", "accesspoint", "server", "rack", "switch", "router", "camera", "accessories", "ups", "shield"];
await mkdir("public/media/studio", { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 1 });
for (const m of models) {
  await page.goto(`${base}/studio?m=${m}`, { waitUntil: "networkidle" });
  await page.waitForSelector("body[data-ready='1']", { timeout: 30000 });
  await page.waitForTimeout(1500);
  const png = await page.locator("canvas").screenshot({ omitBackground: true });
  const out = await sharp(png).trim({ threshold: 1 }).extend({ top: 40, bottom: 40, left: 40, right: 40, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: 1000, height: 800, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 88, alphaQuality: 90 }).toFile(`public/media/studio/${m}.webp`);
  console.log(m, out.size);
}
await browser.close();
