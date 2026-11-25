import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import Placeholder from "@/components/ui/Placeholder";
import { store } from "@/data/catalog";

/**
 * Policy pages. The current site publishes none of these, so each is a
 * clearly-marked placeholder. Replace `body` with the store's real policy.
 */
const pages = {
  shipping: {
    title: "Shipping",
    known: [store.shippingNote],
    body: "Delivery areas, rates outside Surat, dispatch times and courier partners.",
  },
  returns: { title: "Returns", known: [], body: "Return window, condition requirements, refunds and how to start a return." },
  privacy: { title: "Privacy policy", known: [], body: "What personal data is collected, why, how it’s stored and customers’ rights." },
  terms: { title: "Terms", known: [], body: "Terms of sale and use of the website." },
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return pages[slug] ? { title: pages[slug].title, robots: { index: false } } : {};
}

export default async function InfoPage({ params }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();
  return (
    <>
      <PageHeader eyebrow="Help" lines={[page.title]} crumbs={[{ label: page.title }]} />
      <section className="shell max-w-3xl pb-28">
        {page.known.length > 0 && (
          <div className="mb-10 border-l-2 border-lime pl-5">
            {page.known.map((k) => (
              <p key={k} className="text-lg">{k}</p>
            ))}
            <p className="mt-2 text-xs text-mute">As stated on hvnutrition.in.</p>
          </div>
        )}
        <div className="flex flex-col items-start gap-4 border border-dashed border-line p-8">
          <Placeholder>Policy not yet provided</Placeholder>
          <p className="text-soft/80">This page will cover: {page.body}</p>
          <p className="text-sm text-mute">
            Until it’s published, contact the store at{" "}
            <a href={store.phoneHref} className="text-warm underline decoration-lime underline-offset-4">{store.phone}</a> or{" "}
            <a href={`mailto:${store.email}`} className="break-all text-warm underline decoration-lime underline-offset-4">{store.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
