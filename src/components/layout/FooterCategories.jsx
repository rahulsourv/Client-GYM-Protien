"use client";

import Link from "next/link";
import { useNavCategories } from "@/lib/navCategories";

/** Footer "Shop" links for the live categories (same markup as FooterLink). */
export default function FooterCategories() {
  const categories = useNavCategories();
  return categories.map((c) => (
    <li key={c.slug}>
      <Link href={`/collections/${c.slug}`} className="text-sm text-warm transition-colors hover:text-lime">
        {c.name}
      </Link>
    </li>
  ));
}
