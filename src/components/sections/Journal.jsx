"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import Placeholder from "@/components/ui/Placeholder";
import ArticleCover from "@/components/journal/ArticleCover";
import { articles } from "@/data/journal";

/** 10 — Journal. Sample drafts laid out for future editorial content. */
export default function Journal() {
  const root = useRef(null);
  useGSAP(() => setupReveals(), { scope: root });
  const [lead, ...rest] = articles;
  return (
    <section ref={root} aria-labelledby="journal-title" className="bg-warm py-24 text-obsidian md:py-36">
      <div className="shell">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="eyebrow text-obsidian/60">(10) Journal</span>
            <Lines as="h2" id="journal-title" className="display mt-4 text-[15vw] md:text-[7vw]" lines={["Read before", "you scoop."]} />
          </div>
          <Placeholder className="text-obsidian/60">Sample articles — drafts</Placeholder>
        </div>
        <div className="grid gap-10 md:grid-cols-12 md:gap-6">
          <ArticleLink a={lead} className="md:col-span-7" coverClass="aspect-[4/3] md:aspect-[5/4]" big />
          <div className="flex flex-col gap-10 md:col-span-5 md:gap-6">
            {rest.map((a) => (
              <ArticleLink key={a.slug} a={a} coverClass="aspect-[16/9]" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticleLink({ a, className = "", coverClass, big }) {
  return (
    <Link href={`/journal/${a.slug}`} className={`group block ${className}`}>
      <div data-reveal="clip">
        <ArticleCover article={a} className={coverClass} big={big} />
      </div>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <h3 className={`display ${big ? "text-5xl" : "text-3xl"} transition-colors group-hover:text-obsidian/60`}>{a.title}</h3>
          <p className="mt-2 max-w-md text-sm text-obsidian/65">{a.excerpt}</p>
        </div>
        <span className="eyebrow mt-2 shrink-0 text-obsidian/50 transition-transform group-hover:translate-x-1">Read →</span>
      </div>
    </Link>
  );
}
