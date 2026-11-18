"use client";
import { useState } from "react";
import { InquiryForm, INQUIRY_TYPE_LABELS, type InquiryType } from "./InquiryForm";

export function ContactTabs({ initial = "GENERAL", types = ["GENERAL", "PRODUCT", "NETWORKING_PROJECT", "CORPORATE_QUOTE"] }: { initial?: InquiryType; types?: InquiryType[] }) {
  const [t, setT] = useState<InquiryType>(initial);
  return (
    <div>
      <div role="tablist" className="no-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-full bg-mist p-1">
        {types.map((x) => (
          <button key={x} role="tab" aria-selected={t === x} onClick={() => setT(x)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${t === x ? "bg-white text-ink shadow-card" : "text-slate hover:text-ink"}`}>{INQUIRY_TYPE_LABELS[x]}</button>
        ))}
      </div>
      <InquiryForm key={t} type={t} />
    </div>
  );
}
