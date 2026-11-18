"use client";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export type InquiryType = "GENERAL" | "PRODUCT" | "NETWORKING_PROJECT" | "CORPORATE_QUOTE";
export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  GENERAL: "General contact",
  PRODUCT: "Product inquiry",
  NETWORKING_PROJECT: "Networking project",
  CORPORATE_QUOTE: "Corporate IT quotation",
};

type Props = { type: InquiryType; product?: { id: string; name: string }; onDone?: () => void; compact?: boolean };

export function InquiryForm({ type, product, onDone, compact }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string | null)?.trim() || undefined;
    const meta: Record<string, string> = {};
    for (const k of ["location", "sites", "nodes", "timeline", "budget", "services"]) { const v = get(k); if (v) meta[k] = v; }
    const body = {
      type, name: get("name"), company: get("company"), email: get("email"), phone: get("phone"),
      productId: product?.id, productName: product?.name ?? get("productName"), quantity: get("quantity"), subject: get("subject"),
      message: get("message"), meta: Object.keys(meta).length ? meta : undefined, website: get("website"),
    };
    setState("sending"); setError(""); setFieldErrors({});
    try {
      const r = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setFieldErrors(d.fieldErrors ?? {}); throw new Error(d.error ?? "Something went wrong."); }
      setState("done");
    } catch (err) { setError((err as Error).message); setState("error"); }
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h3 className="display mt-4 text-2xl text-ink">Thank you — we&apos;ve received your inquiry.</h3>
        <p className="mt-2 max-w-sm text-slate">Our team will get back to you shortly. For urgent requests, reach us on WhatsApp.</p>
        {onDone && <button onClick={onDone} className="btn btn-outline mt-6">Close</button>}
      </div>
    );
  }

  const err = (k: string) => fieldErrors[k]?.[0];
  const F = ({ name, label, type: t = "text", required, placeholder, autoComplete, max = 160 }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string; autoComplete?: string; max?: number }) => (
    <div key={name}>
      <label htmlFor={`f-${name}`} className="label">{label}{required && <span className="text-brand-red"> *</span>}</label>
      <input id={`f-${name}`} name={name} type={t} required={required} maxLength={max} placeholder={placeholder} autoComplete={autoComplete}
        aria-invalid={!!err(name)} aria-describedby={err(name) ? `e-${name}` : undefined} className={`field ${err(name) ? "!border-brand-red" : ""}`} />
      {err(name) && <p id={`e-${name}`} className="mt-1 text-xs text-brand-red">{err(name)}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate={false} className="relative grid gap-4">
      {/* Honeypot — hidden from humans and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {product && (
        <div className="rounded-xl bg-mist px-4 py-3 text-sm"><span className="text-slate">Product: </span><span className="font-bold text-ink">{product.name}</span></div>
      )}
      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        {F({ name: "name", label: "Full name", required: true, autoComplete: "name", max: 120 })}
        {F({ name: "company", label: "Company / Organization", autoComplete: "organization" })}
        {F({ name: "email", label: "Email", type: "email", required: true, autoComplete: "email" })}
        {F({ name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", placeholder: "+880 1XXX-XXXXXX", max: 24 })}
        {type === "PRODUCT" && F({ name: "quantity", label: "Required quantity", type: "number" })}
        {type === "PRODUCT" && !product && F({ name: "productName", label: "Product name", max: 200 })}
        {type === "NETWORKING_PROJECT" && <>{F({ name: "location", label: "Project location", max: 200 })}{F({ name: "nodes", label: "Approx. network points / users", max: 40 })}</>}
        {type === "CORPORATE_QUOTE" && <>{F({ name: "services", label: "Products / services required", max: 300 })}{F({ name: "timeline", label: "Expected timeline", max: 100 })}</>}
        {type === "GENERAL" && F({ name: "subject", label: "Subject", max: 200 })}
      </div>
      <div>
        <label htmlFor="f-message" className="label">Message<span className="text-brand-red"> *</span></label>
        <textarea id="f-message" name="message" required minLength={5} maxLength={5000} rows={compact ? 3 : 5} className={`field ${err("message") ? "!border-brand-red" : ""}`}
          placeholder={type === "PRODUCT" ? "Configuration, delivery location, any other requirement…" : "Tell us about your requirement…"} />
        {err("message") && <p className="mt-1 text-xs text-brand-red">{err("message")}</p>}
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn btn-primary w-full sm:w-auto sm:justify-self-start">
        {state === "sending" ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Submit inquiry"}
      </button>
      <p className="text-xs text-slate">We use your details only to respond to this inquiry. See our <a href="/privacy-policy" className="underline">Privacy Policy</a>.</p>
    </form>
  );
}
