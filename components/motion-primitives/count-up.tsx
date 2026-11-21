"use client";

import { useLayoutEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { ease } from "@/kit/easings";

type CountUpProps = {
  value: number;
  format?: (value: number) => string;
  /** Seconds. */
  duration?: number;
  className?: string;
};

/** Render the value on entry; animate changes from the number last displayed. */
export default function CountUp({
  value,
  format = (n) => String(Math.round(n)),
  duration = 0.9,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const current = useRef(value);
  const formatRef = useRef(format);
  useLayoutEffect(() => {
    formatRef.current = format;
  });

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce || current.current === value) {
      current.current = value;
      node.textContent = formatRef.current(value);
      return;
    }
    node.textContent = formatRef.current(current.current);
    const controls = animate(current.current, value, {
      duration,
      ease: ease.power3Out,
      onUpdate: (latest) => {
        current.current = latest;
        node.textContent = formatRef.current(latest);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return (
    <span className={className}>
      <span className="sr-only">{format(value)}</span>
      <span aria-hidden="true" ref={ref}>
        {format(value)}
      </span>
    </span>
  );
}
