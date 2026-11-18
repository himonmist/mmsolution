import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({ eyebrow, title, body, align = "left", dark, action }: { eyebrow: string; title: ReactNode; body?: ReactNode; align?: "left" | "center"; dark?: boolean; action?: ReactNode }) {
  return (
    <Reveal className={`mb-12 flex flex-col gap-6 md:flex-row md:items-end ${align === "center" ? "items-center text-center md:flex-col md:items-center" : "md:justify-between"}`}>
      <div className={align === "center" ? "max-w-3xl" : "max-w-2xl"}>
        <p className={`eyebrow eyebrow-dot ${dark ? "!text-glow" : ""}`}>{eyebrow}</p>
        <h2 className={`display mt-4 text-4xl md:text-5xl ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
        {body && <p className={`mt-4 text-base leading-relaxed md:text-lg ${dark ? "text-white/60" : "text-slate"}`}>{body}</p>}
      </div>
      {action}
    </Reveal>
  );
}
