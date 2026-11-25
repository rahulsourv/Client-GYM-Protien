"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";

/** Editorial page opener used by inner pages. */
export default function PageHeader({ eyebrow, lines, description, meta, crumbs = [], children, tone = "dark" }) {
  const root = useRef(null);
  useGSAP(() => setupReveals(), { scope: root });
  const light = tone === "light";
  return (
    <header ref={root} className={`relative pb-12 pt-28 md:pb-16 md:pt-40 ${light ? "bg-warm text-obsidian" : ""}`}>
      <div className="shell">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className={`eyebrow flex flex-wrap gap-2 ${light ? "text-obsidian/55" : "text-mute"}`}>
              <li>
                <Link href="/" className="hover:underline">Home</Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex gap-2">
                  <span aria-hidden>/</span>
                  {c.href ? <Link href={c.href} className="hover:underline">{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            {eyebrow && <p className={`eyebrow ${light ? "text-obsidian/55" : "text-mute"}`}>{eyebrow}</p>}
            <Lines as="h1" className="display mt-4 text-[16vw] md:text-[9vw]" lines={lines} />
          </div>
          <div className="flex flex-col gap-4 md:col-span-4 md:items-end md:text-right">
            {description && (
              <p data-reveal="fade" className={`max-w-sm text-[0.95rem] leading-relaxed ${light ? "text-obsidian/70" : "text-soft/75"}`}>
                {description}
              </p>
            )}
            {meta}
          </div>
        </div>
        {children}
      </div>
    </header>
  );
}
