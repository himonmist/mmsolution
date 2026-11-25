"use client";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, className, y = 24 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div className={className} initial={{ opacity: 0, y: reduce ? 0 : y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={reduce ? { duration: 0 } : { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}
