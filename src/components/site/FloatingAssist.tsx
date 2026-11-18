"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X } from "lucide-react";
import { WhatsappIcon } from "@/components/ui/icons";

type Msg = { from: "bot" | "me"; text: string; links?: { label: string; href: string }[] };

export function FloatingAssist({ whatsapp, greeting, chatbot }: { whatsapp: string | null; greeting: string; chatbot: boolean }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: greeting }]);
  const [suggest, setSuggest] = useState(["Browse laptops", "Networking project", "Request a quote", "Contact details"]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);

  async function send(text: string) {
    const t = text.trim().slice(0, 300);
    if (!t || busy) return;
    setMsgs((m) => [...m, { from: "me", text: t }]);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: t }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMsgs((m) => [...m, { from: "bot", text: d.reply, links: d.links }]);
      setSuggest(d.suggestions ?? []);
    } catch (e) {
      setMsgs((m) => [...m, { from: "bot", text: (e as Error).message || "Sorry, something went wrong. Please try again." }]);
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[55] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && chatbot && (
          <motion.div
            role="dialog" aria-label="MM assistant"
            initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="flex h-[min(540px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-lift"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-ink to-navy px-4 py-3.5 text-white">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><Bot className="h-5 w-5" /></span>
              <div className="flex-1">
                <p className="text-sm font-bold">MM Assistant</p>
                <p className="text-[11px] text-white/60">Automated help · replies instantly</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <div ref={list} className="flex-1 space-y-3 overflow-y-auto bg-mist/60 p-4" aria-live="polite">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.from === "me" ? "rounded-br-md bg-brand-blue text-white" : "rounded-bl-md bg-white text-ink shadow-card"}`}>
                    {m.text}
                    {m.links && m.links.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {m.links.map((l) => l.href.startsWith("/") ? (
                          <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] font-semibold text-brand-blue hover:bg-mist">{l.label} →</Link>
                        ) : (
                          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] font-semibold text-[#128C7E] hover:bg-mist">{l.label} →</a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {busy && <div className="w-14 rounded-2xl bg-white px-3 py-2.5 text-center text-sm text-slate shadow-card">···</div>}
            </div>
            {suggest.length > 0 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-line bg-white px-3 pt-3">
                {suggest.map((s) => (
                  <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:border-brand-blue hover:text-brand-blue">{s}</button>
                ))}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 bg-white p-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={300} placeholder="Ask about products or services…" aria-label="Message" className="field !min-h-11 flex-1 !rounded-full" />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="grid h-11 w-11 place-items-center rounded-full bg-brand-red text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
            className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,.7)] transition hover:scale-105">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" />
            <WhatsappIcon className="relative h-7 w-7" />
          </a>
        )}
        {chatbot && (
          <button onClick={() => setOpen((v) => !v)} aria-label={open ? "Close assistant" : "Open assistant"} aria-expanded={open}
            className="grid h-14 w-14 place-items-center rounded-full bg-ink text-white shadow-lift ring-1 ring-white/10 transition hover:scale-105">
            {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </button>
        )}
      </div>
    </div>
  );
}
