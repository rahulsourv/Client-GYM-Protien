import PageHeader from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { store } from "@/data/catalog";

export const metadata = {
  title: "Contact",
  description: `Contact HV Nutrition in Surat — ${store.phone}, ${store.email}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const rows = [
    { k: "Phone", v: <a href={store.phoneHref} className="hover:text-lime">{store.phone}</a>, note: store.founder },
    { k: "Email", v: <a href={`mailto:${store.email}`} className="break-all hover:text-lime">{store.email}</a> },
    { k: "Address", v: store.address },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        lines={["Talk to", "a person."]}
        description="Product questions, supplement recommendations or an order — reach the team directly."
        crumbs={[{ label: "Contact" }]}
      />
      <section className="shell pb-28">
        <dl className="border-t border-line">
          {rows.map((r) => (
            <div key={r.k} className="grid gap-2 border-b border-line py-8 md:grid-cols-[240px_1fr]">
              <dt className="eyebrow pt-3 text-mute">{r.k}</dt>
              <dd>
                <span className="display block text-4xl md:text-6xl">{r.v}</span>
                {r.note && <span className="mt-2 block text-sm text-mute">{r.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-12 flex flex-col gap-3 xs:flex-row">
          <LinkButton href={store.phoneHref}>Call now</LinkButton>
          <LinkButton href={`mailto:${store.email}`} variant="ghost">Send an email</LinkButton>
        </div>
      </section>
    </>
  );
}
