"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Calendar, X } from "lucide-react";

type P = { id: string; title: string; slug: string; category: string; clientName: string | null; summary: string | null; coverImage: string | null; technologies: string[]; completedAt: Date | null; isDemo: boolean };

export function ProjectGrid({ projects }: { projects: P[] }) {
  const cats = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<P | null>(null);
  const list = projects.filter((p) => cat === "All" || p.category === cat);
  if (!projects.length) return <p className="rounded-2xl bg-mist p-8 text-center text-slate">Completed project case studies will be published here.</p>;
  return (
    <>
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${cat === c ? "bg-ink text-white" : "bg-mist text-navy hover:bg-line"}`}>{c}</button>
        ))}
      </div>
      <motion.div layout className="grid auto-rows-[260px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.button layout key={p.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              onClick={() => setOpen(p)} className={`group relative overflow-hidden rounded-3xl bg-ink text-left ${i === 0 && cat === "All" ? "sm:col-span-2 sm:row-span-2" : ""}`}>
              {p.coverImage && <Image src={p.coverImage} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-60" />}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-glow">{p.category}{p.isDemo && " · Sample"}</p>
                <h3 className="mt-2 text-xl font-bold leading-snug">{p.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/80">View details <ArrowUpRight className="h-4 w-4" /></span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div role="dialog" aria-modal="true" aria-label={open.title} onClick={(e) => e.stopPropagation()} initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
              className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white sm:max-w-3xl sm:rounded-3xl">
              <div className="relative aspect-[16/8] bg-ink">
                {open.coverImage && <Image src={open.coverImage} alt={open.title} fill sizes="768px" className="object-cover" />}
                <button onClick={() => setOpen(null)} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-7">
                <p className="eyebrow">{open.category}</p>
                <h3 className="display mt-2 text-3xl text-ink">{open.title}</h3>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate">
                  {open.clientName && <span>Client: <b className="text-ink">{open.clientName}</b></span>}
                  {open.completedAt && <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(open.completedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span>}
                </div>
                <p className="mt-4 leading-relaxed text-slate">{open.summary}</p>
                {open.technologies.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{open.technologies.map((t) => <span key={t} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-navy">{t}</span>)}</div>}
                <Link href={`/projects/${open.slug}`} className="btn btn-blue mt-7">Full case study <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
