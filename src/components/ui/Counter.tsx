"use client";
import { animate, useInView } from "framer-motion";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import { useEffect, useRef, useState } from "react";

export function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotionSafe();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) { setN(value); return; }
    if (!inView) return;
    const c = animate(0, value, { duration: 1.6, ease: [0.2, 0.7, 0.2, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value, reduce]);
  return <span ref={ref}>{n.toLocaleString("en-US")}{suffix}</span>;
}
