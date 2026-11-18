"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Apple-style product film: three hero photographs pinned and scrubbed by scroll
 * (zoom-in reveal, clip-path wipe, parallax copy, background tone shift).
 */
const SCENES = [
  {
    img: "/media/laptop-performance.webp", alt: "Performance laptop with illuminated keyboard", tone: "#03060d",
    eyebrow: "Laptops & Notebooks", title: ["Performance,", "unboxed."], body: "Business and performance laptops from the brands you trust — sourced genuine and configured for your team before they arrive.",
    cta: { label: "Explore laptops", href: "/products?category=laptop-notebook" }, dark: true, side: "left" as const,
  },
  {
    img: "/media/workstation-set.webp", alt: "Desktop workstation set with monitor, tower, keyboard, mouse and laptop", tone: "#f4f6f9",
    eyebrow: "Desktop Workstations", title: ["The complete", "desk."], body: "Desktops, monitors, keyboards and peripherals delivered as one standardised workstation — ready to plug in on day one.",
    cta: { label: "Explore desktops", href: "/products?category=desktop-computers" }, dark: false, side: "right" as const,
  },
  {
    img: "/media/server-rack.webp", alt: "Enterprise server rack with structured blue network cabling", tone: "#050b18",
    eyebrow: "Servers & Infrastructure", title: ["Infrastructure", "that just runs."], body: "Racks, switching and structured cabling — engineered, labelled and documented by our implementation team.",
    cta: { label: "Server & data solutions", href: "/solutions/server-data-infrastructure" }, dark: true, side: "left" as const,
  },
];

const c01 = (xs: number[]) => xs.map((v) => Math.min(1, Math.max(0, v)));

function Scene({ i, p, s }: { i: number; p: MotionValue<number>; s: (typeof SCENES)[number] }) {
  const n = SCENES.length;
  const a = i / n, b = (i + 1) / n;
  const first = i === 0, last = i === n - 1;
  const opacity = useTransform(p, c01(first ? [0, b - 0.04, b] : last ? [a - 0.04, a, 1] : [a - 0.04, a, b - 0.04, b]), first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]);
  const scale = useTransform(p, c01([a - 0.05, b]), [1.22, 1]);
  const clip = useTransform(p, c01([a - 0.05, a + 0.08]), first ? ["inset(0% 0% 0% 0% round 0px)", "inset(0% 0% 0% 0% round 0px)"] : ["inset(18% 22% 18% 22% round 28px)", "inset(0% 0% 0% 0% round 0px)"]);
  const textY = useTransform(p, c01([a, b]), [60, -60]);
  const textO = useTransform(p, c01([a, a + 0.06, b - 0.08, b - 0.02]), first ? [1, 1, 1, 0] : [0, 1, 1, 0]);
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <motion.div style={{ clipPath: clip, backgroundColor: s.tone }} className="absolute inset-0">
        <motion.div style={{ scale }} className="absolute inset-0">
          <Image src={s.img} alt={s.alt} fill sizes="100vw" className={`object-contain md:object-cover ${s.side === "left" ? "md:object-right" : "md:object-left"}`} priority={first} />
        </motion.div>
        <div className={`absolute inset-0 ${s.dark ? (s.side === "left" ? "bg-gradient-to-r from-black/85 via-black/40 to-transparent" : "bg-gradient-to-l from-black/85 via-black/40 to-transparent") : s.side === "left" ? "bg-gradient-to-r from-white/95 via-white/60 to-transparent" : "bg-gradient-to-l from-white/95 via-white/70 to-transparent"} max-md:bg-gradient-to-t`} />
      </motion.div>
      <motion.div style={{ y: textY, opacity: textO }} className={`absolute inset-0 flex items-end pb-24 md:items-center md:pb-0 ${s.side === "right" ? "md:justify-end" : ""}`}>
        <div className="container-x">
          <div className={`max-w-md ${s.side === "right" ? "md:ml-auto" : ""}`}>
            <p className={`eyebrow ${s.dark ? "!text-glow" : ""}`}>{String(i + 1).padStart(2, "0")} · {s.eyebrow}</p>
            <h2 className={`display mt-4 text-5xl md:text-7xl ${s.dark ? "text-white" : "text-ink"}`}>{s.title[0]}<br /><span className={s.dark ? "text-white/45" : "text-slate/70"}>{s.title[1]}</span></h2>
            <p className={`mt-5 text-base leading-relaxed md:text-lg ${s.dark ? "text-white/70" : "text-slate"}`}>{s.body}</p>
            <Link href={s.cta.href} className={`btn mt-7 ${s.dark ? "btn-ghost" : "btn-blue"}`}>{s.cta.label}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProductFilm() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (reduce) {
    return (
      <section className="bg-ink py-20">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {SCENES.map((s) => (
            <Link key={s.img} href={s.cta.href} className="group overflow-hidden rounded-3xl bg-ink-2">
              <div className="relative aspect-square"><Image src={s.img} alt={s.alt} fill sizes="33vw" className="object-cover" /></div>
              <div className="p-6 text-white"><p className="eyebrow !text-glow">{s.eyebrow}</p><p className="display mt-2 text-2xl">{s.title.join(" ")}</p></div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[330vh] bg-ink" aria-label="Featured product lines">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {SCENES.map((s, i) => <Scene key={s.img} i={i} p={scrollYProgress} s={s} />)}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10"><motion.div style={{ width: bar }} className="h-full bg-gradient-to-r from-brand-blue to-brand-red" /></div>
      </div>
    </section>
  );
}
