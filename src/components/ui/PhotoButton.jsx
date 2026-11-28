"use client";

import { ImagePlus } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";

/**
 * A file picker that looks like a button. The real <input type="file"> stays in
 * the form (so FormData still sees it) but is visually hidden; the label opens it.
 */
export default function PhotoButton({ children = "Add photos", disabled, variant = "ghost", className = "", ...inputProps }) {
  return (
    <label
      className={`${buttonClass(variant)} cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${disabled ? "pointer-events-none opacity-40" : ""} ${className}`}
      aria-disabled={disabled || undefined}
    >
      <ImagePlus className="size-4 shrink-0" aria-hidden />
      <span>{children}</span>
      <input type="file" className="sr-only" disabled={disabled} {...inputProps} />
    </label>
  );
}
