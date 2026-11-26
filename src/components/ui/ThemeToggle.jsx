"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

const KEY = "hv-theme";

// The theme lives on <html data-theme>; read it from there so every toggle stays in sync.
function subscribe(callback) {
  const mo = new MutationObserver(callback);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
const getTheme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

/** Switches between the dark (default) and light colour themes; the choice is remembered. */
export default function ThemeToggle({ className = "" }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark");
  const next = theme === "dark" ? "light" : "dark";

  const toggle = () => {
    const html = document.documentElement;
    if (next === "light") html.dataset.theme = "light";
    else delete html.dataset.theme;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable — theme still applies for this visit */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`relative flex size-11 items-center justify-center overflow-hidden text-warm transition-colors hover:text-lime ${className}`}
    >
      <Sun
        aria-hidden
        className={`absolute size-5 transition-all duration-500 ease-[var(--ease-out-expo)] ${theme === "dark" ? "rotate-0 opacity-100" : "-rotate-90 scale-50 opacity-0"}`}
      />
      <Moon
        aria-hidden
        className={`absolute size-5 transition-all duration-500 ease-[var(--ease-out-expo)] ${theme === "light" ? "rotate-0 opacity-100" : "rotate-90 scale-50 opacity-0"}`}
      />
    </button>
  );
}
