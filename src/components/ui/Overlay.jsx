"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { lockScroll, unlockScroll } from "@/lib/lenis";

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Accessible overlay shell: backdrop, Escape to close, scroll lock, focus
 * containment and focus restore. `side` controls the panel entrance.
 */
export default function Overlay({ open, onClose, label, side = "right", className = "", children }) {
  return (
    <AnimatePresence>
      {open && (
        <Panel onClose={onClose} label={label} side={side} className={className}>
          {children}
        </Panel>
      )}
    </AnimatePresence>
  );
}

const enter = {
  right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
  top: { initial: { y: "-100%" }, animate: { y: 0 }, exit: { y: "-100%" } },
  center: { initial: { opacity: 0, y: 30, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 20, scale: 0.98 } },
  full: { initial: { clipPath: "inset(0 0 100% 0)" }, animate: { clipPath: "inset(0 0 0% 0)" }, exit: { clipPath: "inset(0 0 100% 0)" } },
};

function Panel({ onClose, label, side, className, children }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const prev = document.activeElement;
    lockScroll();
    const first = ref.current?.querySelector("[data-autofocus]") ?? ref.current?.querySelector(FOCUSABLE);
    first?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab" && ref.current) {
        const els = [...ref.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        if (!els.length) return;
        const [a, b] = [els[0], els[els.length - 1]];
        if (e.shiftKey && document.activeElement === a) (e.preventDefault(), b.focus());
        else if (!e.shiftKey && document.activeElement === b) (e.preventDefault(), a.focus());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockScroll();
      prev?.focus?.({ preventScroll: true });
    };
  }, []);

  const v = enter[side];
  return (
    <div className="fixed inset-0 z-[80]" role="presentation">
      <motion.div
        className="absolute inset-0 bg-obsidian/70 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onClose}
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-lenis-prevent
        className={className}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
