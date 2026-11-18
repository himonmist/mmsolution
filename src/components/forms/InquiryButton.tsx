"use client";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { InquiryForm, type InquiryType, INQUIRY_TYPE_LABELS } from "./InquiryForm";

export function InquiryButton({ product, type = "PRODUCT", className, children }: { product?: { id: string; name: string }; type?: InquiryType; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>{children}</button>
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
              <motion.div role="dialog" aria-modal="true" aria-labelledby="inq-title" onClick={(e) => e.stopPropagation()}
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
                className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:max-w-2xl sm:rounded-3xl sm:p-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow eyebrow-dot">{INQUIRY_TYPE_LABELS[type]}</p>
                    <h2 id="inq-title" className="display mt-2 text-2xl text-ink">{type === "PRODUCT" ? "Request product inquiry" : "Tell us what you need"}</h2>
                  </div>
                  <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-mist"><X className="h-5 w-5" /></button>
                </div>
                <InquiryForm type={type} product={product} onDone={() => setOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>, document.body)}
    </>
  );
}
