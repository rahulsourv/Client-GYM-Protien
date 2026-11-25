import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const base =
  "group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-[transform,background-color,color,border-color] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

const variants = {
  primary: "bg-lime text-ink h-14 px-7 hover:bg-warm hover:text-obsidian",
  light: "bg-warm text-obsidian h-14 px-7 hover:bg-lime hover:text-ink",
  ghost: "h-14 px-7 border border-warm/25 text-warm hover:border-warm hover:bg-warm hover:text-obsidian",
  dark: "bg-obsidian text-warm h-14 px-7 hover:bg-graphite",
  inline: "h-auto px-0 text-warm",
};

/** Label that slides up and is replaced by a duplicate on hover — tactile, not flashy. */
function Label({ children, arrow }) {
  return (
    <>
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-y-0"
        >
          {children}
        </span>
      </span>
      {arrow && (
        <span aria-hidden className="relative block size-4 overflow-hidden">
          <ArrowUpRight className="absolute inset-0 size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:-translate-y-full group-hover/btn:translate-x-full" />
          <ArrowUpRight className="absolute inset-0 size-4 -translate-x-full translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0 group-hover/btn:translate-y-0" />
        </span>
      )}
    </>
  );
}

export function Button({ variant = "primary", arrow = false, className = "", children, ...props }) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      <Label arrow={arrow}>{children}</Label>
    </button>
  );
}

export function LinkButton({ href, variant = "primary", arrow = true, className = "", children, ...props }) {
  const external = /^(mailto:|tel:|https?:)/.test(href);
  const Comp = external ? "a" : Link;
  return (
    <Comp href={href} className={`${base} ${variants[variant]} ${className}`} {...props}>
      <Label arrow={arrow}>{children}</Label>
    </Comp>
  );
}

/** Underlined text link with a sweeping rule. */
export function TextLink({ href, className = "", children, ...props }) {
  return (
    <Link
      href={href}
      className={`group/tl relative inline-flex items-center gap-2 pb-1 ${className}`}
      {...props}
    >
      {children}
      <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover/tl:-translate-y-0.5 group-hover/tl:translate-x-0.5" />
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-[0.3] bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/tl:scale-x-100"
      />
    </Link>
  );
}
