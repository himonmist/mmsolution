"use client";
import { useEffect, useState } from "react";

/**
 * Hydration-safe reduced-motion flag: false on the server and the first client render,
 * then the real preference after mount (avoids SSR/CSR markup mismatches).
 */
export function useReducedMotionSafe() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}
