"use client";
import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, name }: { images: { url: string; alt: string | null }[]; name: string }) {
  const [i, setI] = useState(0);
  const cur = images[i];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-[radial-gradient(circle_at_50%_45%,#fff,#e8f0fa)]">
        {cur && <Image src={cur.url} alt={cur.alt ?? name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-contain p-10" />}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((im, k) => (
            <button key={im.url} onClick={() => setI(k)} aria-label={`Image ${k + 1}`} aria-pressed={k === i}
              className={`relative h-20 w-20 overflow-hidden rounded-xl border bg-white ${k === i ? "border-brand-blue ring-2 ring-brand-blue/20" : "border-line"}`}>
              <Image src={im.url} alt="" fill sizes="80px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
