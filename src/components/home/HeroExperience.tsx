"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
const LABELS = [
  ["laptops", "Laptops & Notebooks"], ["monitors", "Monitors & Displays"], ["desktops", "Desktop Workstations"], ["peripherals", "Peripherals"],
  ["servers", "Servers & Storage"], ["switching", "Core Switching"], ["routers", "Routers & Firewalls"], ["wifi", "Enterprise Wi-Fi"], ["cctv", "CCTV & Surveillance"],
] as const;

type Cta = { label: string; href: string };
type Props = { eyebrow: string; heading: string; description: string; primary: Cta; secondary: Cta };

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** fade in over [a,b], out over [c,d] */
const win = (p: number, a: number, b: number, c: number, d: number) => smooth(clamp((p - a) / (b - a))) * (1 - smooth(clamp((p - c) / (d - c))));

const CHAPTERS = [
  { label: "Technology", at: 0 },
  { label: "Computing", at: 0.33 },
  { label: "Networking", at: 0.6 },
  { label: "Ecosystem", at: 0.79 },
];

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

export function HeroExperience({ eyebrow, heading, description, primary, secondary }: Props) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const labels = useRef<Record<string, HTMLElement | null>>({});
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");
  const [mobile, setMobile] = useState(false);
  const [active, setActive] = useState(true);
  const s1 = useRef<HTMLDivElement>(null), s2 = useRef<HTMLDivElement>(null), s3 = useRef<HTMLDivElement>(null), s4 = useRef<HTMLDivElement>(null);
  const canvasWrap = useRef<HTMLDivElement>(null), cue = useRef<HTMLDivElement>(null), rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMobile(window.matchMedia("(max-width: 767px), (pointer: coarse)").matches);
    setMode(reduce || !webglOk() ? "static" : "3d");
  }, []);

  useEffect(() => {
    if (mode !== "3d" || !section.current) return;
    let killed = false;
    let cleanup = () => {};
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);
      const setO = (el: HTMLElement | null, o: number, y = 0) => {
        if (!el) return;
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${y}px, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      };
      const st = ScrollTrigger.create({
        trigger: section.current, start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          progress.current = p;
          const o1 = 1 - smooth(clamp((p - 0.06) / 0.08));
          setO(s1.current, o1, -Math.min(p, 0.14) * 260);
          const o2 = win(p, 0.2, 0.26, 0.42, 0.46); setO(s2.current, o2, (1 - o2) * 24);
          const o3 = win(p, 0.53, 0.58, 0.66, 0.7); setO(s3.current, o3, (1 - o3) * 24);
          const o4 = win(p, 0.72, 0.78, 0.93, 0.98); setO(s4.current, o4, (1 - o4) * 30);
          if (canvasWrap.current) {
            const out = smooth(clamp((p - 0.9) / 0.1));
            canvasWrap.current.style.opacity = String(1 - out * 0.85);
            canvasWrap.current.style.transform = `scale(${1 - out * 0.08})`;
          }
          if (cue.current) cue.current.style.opacity = String(1 - clamp(p / 0.04));
          rail.current?.querySelectorAll<HTMLElement>("[data-at]").forEach((el, i) => {
            const at = CHAPTERS[i].at, next = CHAPTERS[i + 1]?.at ?? 1;
            el.dataset.active = String(p >= at - 0.02 && p < next - 0.02);
          });
        },
      });
      const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
      io.observe(section.current!);
      cleanup = () => { st.kill(); io.disconnect(); };
    })();
    return () => { killed = true; cleanup(); };
  }, [mode]);

  const jump = (at: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.offsetTop + at * (el.offsetHeight - window.innerHeight) + 2;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const intro = (
    <div ref={s1} className="relative z-10 flex h-full flex-col overflow-hidden pb-12 pt-[96px] [mask-image:linear-gradient(to_bottom,transparent_72px,black_104px)] max-md:bg-gradient-to-b max-md:from-ink/30 max-md:via-ink/75 max-md:to-transparent">
      <div className="container-x my-auto">
        <div className="max-w-xl md:max-w-[40rem] lg:max-w-[36rem] xl:max-w-[40rem]">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="eyebrow eyebrow-dot !text-white/70">{eyebrow}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
            className="display mt-5 text-[clamp(2.2rem,min(10vw,7.2vh),2.6rem)] text-white sm:text-[clamp(2.4rem,min(7vw,8.5vh),3.75rem)] lg:text-[clamp(2.6rem,min(5.2vw,9vh),4.4rem)]">
            <span className="text-gradient">{heading}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg [@media(max-height:620px)]:mt-4 [@media(max-height:620px)]:line-clamp-3 [@media(max-height:620px)]:text-[15px]">
            {description}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-wrap gap-3">
            <Link href={primary.href} className="btn btn-primary">{primary.label}<ArrowRight className="h-4 w-4" /></Link>
            <Link href={secondary.href} className="btn btn-ghost">{secondary.label}</Link>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const backdrop = (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_70%_40%,rgba(8,101,197,0.35),transparent_60%),radial-gradient(700px_400px_at_10%_90%,rgba(237,16,24,0.18),transparent_60%)]" />
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
    </>
  );

  if (mode === "static") {
    return (
      <section className="relative min-h-[100svh] overflow-hidden bg-ink" aria-label="Introduction">
        {backdrop}
        <div className="absolute inset-y-0 right-0 hidden w-1/2 md:block">
          <Image src="/media/laptop-performance.webp" alt="Performance business laptop" fill priority sizes="50vw" className="object-cover [mask-image:linear-gradient(to_left,black_55%,transparent)]" />
        </div>
        <div className="relative h-[100svh]">{intro}</div>
      </section>
    );
  }

  return (
    <section ref={section} className="relative h-[560vh] bg-ink" aria-label="Introduction">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {backdrop}
        <div ref={canvasWrap} className="absolute inset-0 will-change-transform">
          {mode === "3d" && <HeroScene progress={progress} mobile={mobile} active={active} labels={labels} />}
          <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden>
            {LABELS.map(([id, text]) => (
              <div key={id} ref={(el) => { labels.current[id] = el; }} className="hero-chip absolute left-0 top-0 opacity-0 will-change-transform">
                <span className="hero-chip-dot" />{text}
              </div>
            ))}
          </div>
        </div>
        {/* Scene captions */}
        <div ref={s2} className="pointer-events-none invisible absolute inset-x-0 top-24 z-10 opacity-0 md:top-28">
          <div className="container-x">
            <p className="eyebrow !text-glow">01 — Computing Solutions</p>
            <h2 className="display mt-3 max-w-xl text-4xl text-white md:text-6xl">Every desk, <span className="text-white/50">fully equipped.</span></h2>
            <p className="mt-4 max-w-md text-white/60">Business laptops, desktop workstations, monitors and peripherals — standardised for your whole team.</p>
          </div>
        </div>
        <div ref={s3} className="pointer-events-none invisible absolute inset-x-0 top-24 z-10 opacity-0 md:top-28">
          <div className="container-x text-center md:text-left">
            <p className="eyebrow !text-glow">02 — Networking Infrastructure</p>
            <h2 className="display mt-3 text-4xl text-white md:max-w-xl md:text-6xl">Networks engineered <span className="text-white/50">to never blink.</span></h2>
          </div>
        </div>
        <div ref={s4} className="pointer-events-none invisible absolute inset-0 z-10 flex items-start justify-center pt-28 opacity-0 md:pt-32">
          <div className="container-x text-center">
            <p className="eyebrow !text-glow">03 — Complete IT Ecosystem</p>
            <h2 className="display mx-auto mt-4 max-w-4xl text-[2.6rem] text-white md:text-7xl">One Partner.<br /><span className="text-gradient">Complete IT Solutions.</span></h2>
            <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2 text-[11px] font-bold tracking-[0.18em] text-white/80 sm:text-xs">
              {["WE SUPPLY TECHNOLOGY", "WE BUILD IT INFRASTRUCTURE", "WE POWER BUSINESS GROWTH"].map((t, i) => (
                <span key={t} className="glass rounded-full px-4 py-2"><span className={i === 1 ? "text-brand-red" : "text-glow"}>●</span> {t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0">{intro}</div>

        <div ref={rail} className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 lg:flex" aria-label="Story chapters">
          {CHAPTERS.map((c) => (
            <button key={c.label} data-at={c.at} data-active="false" onClick={() => jump(c.at)}
              className="group flex items-center justify-end gap-3 text-[11px] font-semibold uppercase tracking-widest text-white/40 transition data-[active=true]:text-white">
              <span className="opacity-0 transition group-hover:opacity-100 group-data-[active=true]:opacity-100">{c.label}</span>
              <span className="h-2 w-2 rounded-full bg-white/30 transition group-data-[active=true]:h-6 group-data-[active=true]:bg-brand-red" />
            </button>
          ))}
        </div>
        <div ref={cue} className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
          Scroll to explore <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>
    </section>
  );
}
