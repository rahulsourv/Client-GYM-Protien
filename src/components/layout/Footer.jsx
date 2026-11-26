import Link from "next/link";
import { brands, categories } from "@/lib/catalog";
import { store } from "@/data/catalog";
import Wordmark from "@/components/ui/Wordmark";
import FssaiBadge from "@/components/ui/FssaiBadge";

const help = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/info/shipping", label: "Shipping" },
  { href: "/info/returns", label: "Returns" },
  { href: "/info/privacy", label: "Privacy policy" },
  { href: "/info/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-obsidian pt-14 md:pt-20">
      <div className="shell grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12">
        <div className="col-span-2 md:col-span-12 lg:col-span-4">
          <Wordmark className="text-xl" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-mute">
            Sports nutrition from {store.city}. Home of HV Nutrition Whey Protein.
          </p>
          <address className="mt-6 flex flex-col gap-1 text-sm not-italic text-mute">
            <span>{store.address}</span>
            <a href={store.phoneHref} className="text-warm hover:text-lime">{store.phone}</a>
            <a href={`mailto:${store.email}`} className="break-all text-warm hover:text-lime">{store.email}</a>
          </address>
          <FssaiBadge compact className="mt-6" />
        </div>
        <FooterCol title="Shop" className="md:col-span-4 lg:col-span-3">
          <FooterLink href="/shop">All products</FooterLink>
          {categories.map((c) => (
            <FooterLink key={c.slug} href={`/collections/${c.slug}`}>{c.name}</FooterLink>
          ))}
        </FooterCol>
        <FooterCol title="Brands" className="md:col-span-4 lg:col-span-2">
          {brands.map((b) => (
            <FooterLink key={b.slug} href={`/collections/${b.slug}`}>{b.name}</FooterLink>
          ))}
        </FooterCol>
        <FooterCol title="Help" className="md:col-span-4 lg:col-span-3">
          {help.map((h) => (
            <FooterLink key={h.href} href={h.href}>{h.label}</FooterLink>
          ))}
        </FooterCol>
      </div>

      <div className="shell mt-12 flex flex-col justify-between md:mt-20 gap-3 border-t border-line py-6 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute md:flex-row">
        <span>© {store.legalName} · {store.city}, {store.region} · FSSAI Reg. {store.fssai.number}</span>
      </div>

      <p aria-hidden className="display pointer-events-none -mb-[0.12em] select-none whitespace-nowrap text-center text-[18.5vw] leading-[0.78] text-graphite">
        HV Nutrition
      </p>
    </footer>
  );
}

function FooterCol({ title, className = "", children }) {
  return (
    <nav aria-label={title} className={className}>
      <p className="eyebrow mb-5 text-mute">{title}</p>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </nav>
  );
}

function FooterLink({ href, children }) {
  return (
    <li>
      <Link href={href} className="text-sm text-warm transition-colors hover:text-lime">
        {children}
      </Link>
    </li>
  );
}
