"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";

type Results = {
  products: { name: string; slug: string; brand: { name: string } | null }[];
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
  services: { title: string; slug: string }[];
  posts: { title: string; slug: string }[];
};

export function SearchDialog({ open, onClose, placeholder, empty }: { open: boolean; onClose: () => void; placeholder: string; empty: string }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 50); else { setQ(""); setRes(null); } }, [open]);
  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return; }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctl.signal });
        if (r.ok) setRes(await r.json());
      } catch { /* aborted */ } finally { setLoading(false); }
    }, 200);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);

  const groups: [string, { label: string; href: string; sub?: string }[]][] = res ? [
    ["Products", res.products.map((p) => ({ label: p.name, href: `/products/${p.slug}`, sub: p.brand?.name }))],
    ["Categories", res.categories.map((c) => ({ label: c.name, href: `/products?category=${c.slug}` }))],
    ["Brands", res.brands.map((b) => ({ label: b.name, href: `/products?brand=${b.slug}` }))],
    ["Services", res.services.map((s) => ({ label: s.title, href: `/solutions/${s.slug}` }))],
    ["Articles", res.posts.map((p) => ({ label: p.title, href: `/news/${p.slug}` }))],
  ] : [];
  const total = groups.reduce((n, [, g]) => n + g.length, 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog" aria-modal="true" aria-label="Search"
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
            className="mx-auto mt-20 w-[min(680px,calc(100%-2rem))] overflow-hidden rounded-2xl bg-white shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <form action="/search" className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-5 w-5 text-slate" />
              <input ref={input} name="q" value={q} onChange={(e) => setQ(e.target.value)} maxLength={80} placeholder={placeholder} className="h-14 flex-1 bg-transparent text-base outline-none" autoComplete="off" />
              <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-mist"><X className="h-4 w-4" /></button>
            </form>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {loading && <p className="p-4 text-sm text-slate">Searching…</p>}
              {res && total === 0 && !loading && <p className="p-4 text-sm text-slate">{empty}</p>}
              {groups.map(([title, items]) => items.length > 0 && (
                <div key={title} className="mb-2">
                  <p className="px-3 pt-2 text-[11px] font-bold uppercase tracking-widest text-slate">{title}</p>
                  {items.map((i) => (
                    <Link key={i.href} href={i.href} onClick={onClose} className="group flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-mist">
                      <span className="text-sm font-semibold text-ink">{i.label}{i.sub && <span className="ml-2 text-xs font-medium text-slate">{i.sub}</span>}</span>
                      <ArrowRight className="h-4 w-4 text-slate opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              ))}
              {!res && !loading && <p className="p-4 text-sm text-slate">Try “laptop”, “switch”, “CCTV” or a brand name.</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
