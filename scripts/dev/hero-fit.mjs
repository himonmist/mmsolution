// Checks that the hero intro never sits under the fixed header, across window sizes.
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000/";
const out = process.argv[3];
const sizes = [[1365, 640], [1241, 582], [1092, 512], [1280, 560], [1440, 900], [1920, 1080], [1024, 600], [768, 1024], [390, 664], [360, 560]];
const b = await chromium.launch();
let bad = 0;
for (const [w, h] of sizes) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(base, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const s = document.querySelector("section[aria-label=Introduction]");
    const e = s.querySelector(".eyebrow"), btn = s.querySelector("a.btn-ghost"), hd = document.querySelector("header");
    return { eyebrowTop: Math.round(e.getBoundingClientRect().top), headerBottom: Math.round(hd.getBoundingClientRect().bottom), ctaBottom: Math.round(btn.getBoundingClientRect().bottom), vh: innerHeight };
  });
  const ok = r.eyebrowTop >= r.headerBottom + 8 && r.ctaBottom <= r.vh;
  if (!ok) bad++;
  console.log(`${w}x${h}`.padEnd(10), ok ? "OK  " : "FAIL", JSON.stringify(r));
  if (out) await p.screenshot({ path: `${out}/fit-${w}x${h}.png` });
  await p.close();
}
await b.close();
process.exit(bad ? 1 : 0);
