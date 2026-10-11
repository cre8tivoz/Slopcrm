"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { ease } from "@/kit/easings";

type CountUpProps = {
  value: number;
  format?: (value: number) => string;
  /** Seconds. */
  duration?: number;
  className?: string;
};

/** Counts from 0 to `value` once on mount; jumps straight there for reduced motion. */
export default function CountUp({
  value,
  format = (n) => String(Math.round(n)),
  duration = 0.9,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const formatRef = useRef(format);
  useEffect(() => {
    formatRef.current = format;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) {
      node.textContent = formatRef.current(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: ease.power3Out,
      onUpdate: (latest) => {
        node.textContent = formatRef.current(latest);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
