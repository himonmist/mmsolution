"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, FolderTree, Tag, Wrench, Briefcase, Quote, Newspaper, FileText, Image as ImageIcon, Inbox, Settings,
  Users, Activity, Home, Megaphone, Menu, X, LogOut, ExternalLink,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

const ICONS = { LayoutDashboard, Package, FolderTree, Tag, Wrench, Briefcase, Quote, Newspaper, FileText, ImageIcon, Inbox, Settings, Users, Activity, Home, Megaphone };
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number; group: string };

export function AdminShell({ nav, user, children }: { nav: NavItem[]; user: { name: string; email: string; roleLabel: string }; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const groups = Array.from(new Set(nav.map((n) => n.group)));
  const side = (
    <nav className="flex h-full flex-col" aria-label="Admin">
      <Link href="/admin" className="flex items-center gap-2 px-5 py-5"><Image src="/brand/logo-reverse.png" alt="MM Business Solution" width={1226} height={639} className="h-9 w-auto" /><span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">CMS</span></Link>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((g) => (
          <div key={g}>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/35">{g}</p>
            {nav.filter((n) => n.group === g).map((n) => {
              const I = ICONS[n.icon];
              const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${active ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                  <I className="h-4 w-4" />{n.label}
                  {!!n.badge && <span className="ml-auto rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold text-white">{n.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-bold text-white">{user.name}</p>
        <p className="truncate text-xs text-white/50">{user.roleLabel}</p>
        <div className="mt-3 flex gap-2">
          <Link href="/" target="_blank" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/10 px-2 py-2 text-xs font-semibold text-white hover:bg-white/20"><ExternalLink className="h-3.5 w-3.5" />View site</Link>
          <form action={logoutAction} className="flex-1"><button className="flex w-full items-center justify-center gap-1 rounded-lg bg-white/10 px-2 py-2 text-xs font-semibold text-white hover:bg-brand-red"><LogOut className="h-3.5 w-3.5" />Sign out</button></form>
        </div>
      </div>
    </nav>
  );
  return (
    <div className="lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink lg:block">{side}</aside>
      {open && <div className="fixed inset-0 z-40 bg-ink/50 lg:hidden" onClick={() => setOpen(false)}><aside className="h-full w-72 bg-ink" onClick={(e) => e.stopPropagation()}>{side}</aside></div>}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(!open)} aria-label="Menu" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-mist">{open ? <X /> : <Menu />}</button>
        <span className="font-bold text-ink">MM CMS</span>
      </header>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
