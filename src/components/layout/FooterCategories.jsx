"use client";

import Link from "next/link";
import { useNavCategories } from "@/lib/navCategories";

/** Footer "Shop" links for the live categories (same markup as FooterLink). */
export default function FooterCategories() {
  const categories = useNavCategories();
  return categories.map((c) => (
    <li key={c.slug}>
      <Link href={`/collections/${c.slug}`} className="inline-block py-2 text-sm text-warm transition-colors hover:text-lime md:py-0">
        {c.name}
      </Link>
    </li>
  ));
}
