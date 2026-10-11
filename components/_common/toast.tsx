"use client";

import { useEffect } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useUiStore } from "@/stores/ui-store";

const VISIBLE_MS = 3200;

export default function Toast() {
  const toast = useUiStore((state) => state.toast);
  const dismissToast = useUiStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismissToast, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4"
    >
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="popLayout">
          {toast && (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.215, 0.61, 0.355, 1] }}
              className="lead-style bg-popover border-line-strong shadow-overlay pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-full border py-2.5 pr-4 pl-3"
            >
              <span
                aria-hidden
                className="bg-success flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-black"
              >
                ✓
              </span>
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
}
