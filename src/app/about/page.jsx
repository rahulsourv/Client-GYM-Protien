import Image from "next/image";
import PageHeader from "@/components/layout/PageHeader";
import Placeholder from "@/components/ui/Placeholder";
import { LinkButton } from "@/components/ui/Button";
import { store } from "@/data/catalog";
import { brands } from "@/lib/catalog";

export const metadata = {
  title: "About HV Nutrition",
  description: `HV Nutrition was founded in Surat by ${store.founder}, with ${store.yearsInNutrition} years in gym supplements and nutritional products.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        lines={["Built in", "Surat."]}
        description="A sports nutrition store with its own whey — and the experience to tell you what’s worth buying."
        crumbs={[{ label: "About" }]}
      />

      <section className="shell grid gap-12 pb-24 md:grid-cols-12" aria-labelledby="founder">
        <div className="grain relative aspect-[4/5] overflow-hidden bg-graphite md:col-span-5">
          <Image src="/assets/Black HV Nutrition Whey Protein Tub.png" alt="HV Nutrition Whey Protein tub" fill sizes="(min-width:768px) 40vw, 100vw" className="object-contain p-[12%]" />
        </div>
        <div className="flex flex-col gap-8 md:col-span-6 md:col-start-7">
          <h2 id="founder" className="display text-6xl md:text-7xl">
            {store.founder}
            <span className="mt-2 block text-2xl text-mute">Founder & owner</span>
          </h2>
          <dl className="grid grid-cols-2 border-y border-line">
            <div className="border-r border-line py-6 pr-4">
              <dd className="display text-7xl">{store.yearsInNutrition}<span className="text-lime">yrs</span></dd>
              <dt className="mt-2 text-sm text-mute">In gym supplements & nutritional products</dt>
            </div>
            <div className="py-6 pl-6">
              <dd className="display text-7xl">{store.yearsInBodybuilding}<span className="text-lime">yrs</span></dd>
              <dt className="mt-2 text-sm text-mute">In the bodybuilding field</dt>
            </div>
          </dl>
          <div className="flex flex-col gap-4 text-[1.02rem] leading-relaxed text-soft/85">
            <p>
              Founded by {store.founder}, a fitness and bodybuilding expert with over {store.yearsInNutrition} years of experience,
              HV Nutrition is dedicated to helping people reach their health and fitness goals.
            </p>
            <p>
              We provide genuine supplements and guidance to support muscle growth, performance, recovery and overall wellness —
              so every customer can train harder, recover well and reach their potential.
            </p>
            <p className="text-xs text-mute">Adapted from the About page on hvnutrition.in.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-charcoal py-20" aria-labelledby="shelf">
        <div className="shell grid gap-10 md:grid-cols-12">
          <h2 id="shelf" className="display text-6xl md:col-span-4 md:text-7xl">On our shelf</h2>
          <ul className="md:col-span-8">
            {brands.map((b) => (
              <li key={b.slug} className="grid gap-2 border-b border-line py-6 md:grid-cols-[220px_1fr]">
                <span className="display text-4xl">{b.name}</span>
                <span className="text-sm leading-relaxed text-soft/75">{b.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell flex flex-col items-start gap-6 py-24" aria-labelledby="values">
        <h2 id="values" className="eyebrow text-mute">What we stand for</h2>
        <p className="display max-w-5xl text-5xl md:text-7xl">Honest products. Straight answers. A tub we’d use ourselves.</p>
        <Placeholder>Draft values statement — edit in app/about/page.jsx</Placeholder>
        <div className="flex flex-col gap-3 xs:flex-row">
          <LinkButton href="/shop">Visit the shop</LinkButton>
          <LinkButton href="/contact" variant="ghost">Contact us</LinkButton>
        </div>
      </section>
    </>
  );
}
