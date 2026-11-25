import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCover from "@/components/journal/ArticleCover";
import Placeholder from "@/components/ui/Placeholder";
import { articles, getArticle } from "@/data/journal";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = getArticle(slug);
  // Drafts stay out of search results until they're real.
  return a ? { title: a.title, description: a.excerpt, robots: { index: false } } : {};
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const others = articles.filter((x) => x.slug !== a.slug);
  return (
    <article className="pb-28 pt-28 md:pt-36">
      <header className="shell">
        <p className="eyebrow text-mute">
          <Link href="/#journal-title" className="hover:text-warm">Journal</Link> · {a.category} · {a.readTime}
        </p>
        <h1 className="display mt-4 max-w-5xl text-[15vw] md:text-[8vw]">{a.title}</h1>
        <Placeholder className="mt-6">Sample article — draft, not reviewed</Placeholder>
      </header>
      <ArticleCover article={a} big className="mt-12 aspect-[16/7] md:mx-[var(--gutter)]" />
      <div className="shell mt-16 grid gap-10 md:grid-cols-12">
        <p className="display text-4xl md:col-span-4">{a.excerpt}</p>
        <div className="flex flex-col gap-6 text-[1.08rem] leading-[1.75] text-soft/85 md:col-span-6 md:col-start-6">
          {a.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="border-t border-line pt-6 text-sm text-mute">
            This article is general information, not medical advice. Speak to a qualified professional about your own needs.
          </p>
        </div>
      </div>
      <nav aria-label="More articles" className="shell mt-24 grid gap-6 md:grid-cols-2">
        {others.map((o) => (
          <Link key={o.slug} href={`/journal/${o.slug}`} className="group block">
            <ArticleCover article={o} className="aspect-[16/9]" />
            <p className="display mt-4 text-3xl group-hover:text-lime">{o.title}</p>
          </Link>
        ))}
      </nav>
    </article>
  );
}
