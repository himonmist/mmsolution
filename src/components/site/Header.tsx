"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Search, X, ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/icons";
import type { Dict, Locale } from "@/lib/i18n/dict";
import { SearchDialog } from "./SearchDialog";

type NavCat = { name: string; slug: string; icon: string | null; count: number };
type NavService = { title: string; slug: string; icon: string | null; summary: string | null };

export function Header({ dict, locale, categories, services }: { dict: Dict; locale: Locale; categories: NavCat[]; services: NavService[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<null | "products" | "solutions">(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setOpen(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(null); setMobile(false); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; }, [mobile]);

  const solid = scrolled || open !== null || mobile;
  const enter = (m: "products" | "solutions") => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(m); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(null), 140); };
  const toggleLang = () => {
    document.cookie = `lang=${locale === "en" ? "bn" : "en"}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  const links: { href: string; label: string; menu?: "products" | "solutions" }[] = [
    { href: "/about", label: dict.nav.about },
    { href: "/products", label: dict.nav.products, menu: "products" },
    { href: "/solutions", label: dict.nav.solutions, menu: "solutions" },
    { href: "/brands", label: dict.nav.brands },
    { href: "/projects", label: dict.nav.projects },
    { href: "/news", label: dict.nav.news },
    { href: "/contact", label: dict.nav.contact },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${solid ? "bg-white/85 shadow-[0_1px_0_rgb(9_45_96/0.08)] backdrop-blur-xl" : "bg-transparent"}`}
      >
        <div className="container-x flex h-[72px] items-center gap-4">
          <Link href="/" className="relative flex shrink-0 items-center" aria-label="MM Business Solution — Home">
            <Image src={solid ? "/brand/logo.png" : "/brand/logo-reverse.png"} alt="MM Business Solution" width={1226} height={639} priority className="h-11 w-auto" />
          </Link>

          <nav className="ml-auto hidden xl:block" aria-label="Main">
            <ul className="flex items-center gap-0.5">
              {links.map((l) => {
                const active = pathname === l.href || pathname.startsWith(l.href + "/");
                return (
                  <li key={l.href} onMouseEnter={l.menu ? () => enter(l.menu!) : undefined} onMouseLeave={l.menu ? leave : undefined}>
                    <Link
                      href={l.href}
                      aria-expanded={l.menu ? open === l.menu : undefined}
                      onFocus={l.menu ? () => enter(l.menu!) : undefined}
                      className={`relative flex items-center gap-1 rounded-full px-3 py-2 text-[13.5px] font-semibold transition-colors ${solid ? "text-navy hover:text-brand-blue" : "text-white/85 hover:text-white"} ${active ? (solid ? "text-brand-blue" : "text-white") : ""}`}
                    >
                      {l.label}
                      {l.menu && <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === l.menu ? "rotate-180" : ""}`} />}
                      {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-red" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 xl:ml-2">
            <button onClick={() => setSearch(true)} aria-label={dict.common.search} className={`grid h-10 w-10 place-items-center rounded-full transition ${solid ? "text-navy hover:bg-mist" : "text-white hover:bg-white/10"}`}>
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button onClick={toggleLang} className={`hidden h-10 rounded-full px-3 text-xs font-bold sm:block ${solid ? "text-navy hover:bg-mist" : "text-white hover:bg-white/10"}`} aria-label="Switch language">
              {dict.common.language}
            </button>
            <Link href="/quote" className="btn btn-primary hidden !min-h-10 !py-2 sm:inline-flex">{dict.cta.quote}</Link>
            <button onClick={() => setMobile((v) => !v)} aria-label="Menu" aria-expanded={mobile} className={`grid h-10 w-10 place-items-center rounded-full xl:hidden ${solid ? "text-navy" : "text-white"}`}>
              {mobile ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              key={open}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
              onMouseEnter={() => enter(open)} onMouseLeave={leave}
              className="absolute inset-x-0 top-full hidden border-t border-line bg-white/95 shadow-lift backdrop-blur-xl xl:block"
            >
              <div className="container-x grid grid-cols-12 gap-8 py-8">
                {open === "products" ? (
                  <>
                    <div className="col-span-9 grid grid-cols-3 gap-1">
                      {categories.map((c) => (
                        <Link key={c.slug} href={`/products?category=${c.slug}`} className="group flex items-center gap-3 rounded-xl p-3 hover:bg-mist">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-mist text-brand-blue transition group-hover:bg-brand-blue group-hover:text-white"><Icon name={c.icon} className="h-5 w-5" /></span>
                          <span>
                            <span className="block text-sm font-bold text-ink">{c.name}</span>
                            <span className="text-xs text-slate">{c.count} {dict.common.products}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link href="/products" className="group relative col-span-3 overflow-hidden rounded-2xl bg-ink p-6 text-white">
                      <Image src="/media/laptop-performance-sm.webp" alt="" fill sizes="300px" className="object-cover opacity-70 transition duration-700 group-hover:scale-105" />
                      <div className="relative flex h-full flex-col justify-end">
                        <span className="eyebrow !text-glow">Catalogue</span>
                        <span className="display mt-2 text-2xl">Browse every product line</span>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="col-span-8 grid grid-cols-2 gap-2">
                      {services.map((s) => (
                        <Link key={s.slug} href={`/solutions/${s.slug}`} className="group flex gap-3 rounded-xl p-3 hover:bg-mist">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mist text-brand-red transition group-hover:bg-brand-red group-hover:text-white"><Icon name={s.icon} className="h-5 w-5" /></span>
                          <span>
                            <span className="block text-sm font-bold text-ink">{s.title}</span>
                            <span className="line-clamp-2 text-xs text-slate">{s.summary}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="col-span-4 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-navy to-brand-blue p-6 text-white">
                      <div>
                        <span className="eyebrow !text-white/70">Project inquiry</span>
                        <p className="display mt-2 text-2xl">Planning a network, server room or CCTV rollout?</p>
                      </div>
                      <Link href="/contact?type=NETWORKING_PROJECT" className="btn btn-primary mt-6 self-start">Talk to an engineer</Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 top-[72px] z-40 overflow-y-auto bg-white xl:hidden">
            <nav className="container-x py-6" aria-label="Mobile">
              <ul className="divide-y divide-line">
                <li><Link href="/" className="block py-4 text-lg font-bold text-ink">{dict.nav.home}</Link></li>
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block py-4 text-lg font-bold text-ink">{l.label}</Link>
                    {l.menu === "products" && (
                      <div className="grid grid-cols-2 gap-2 pb-4">
                        {categories.slice(0, 8).map((c) => (
                          <Link key={c.slug} href={`/products?category=${c.slug}`} className="flex items-center gap-2 rounded-lg bg-mist p-2.5 text-[13px] font-semibold text-navy">
                            <Icon name={c.icon} className="h-4 w-4 text-brand-blue" />{c.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-3">
                <Link href="/quote" className="btn btn-primary">{dict.cta.quote}</Link>
                <button onClick={toggleLang} className="btn btn-outline">{dict.common.language}</button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchDialog open={search} onClose={() => setSearch(false)} placeholder={dict.common.searchPlaceholder} empty={dict.common.noResults} />
    </>
  );
}
