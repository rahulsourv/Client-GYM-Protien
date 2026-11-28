"use client";

import { useEffect, useState } from "react";
import { categories, products } from "@/lib/catalog";

const fallback = { products, categories: categories.map(({ slug, name }) => ({ slug, name })) };
let request;

/** Products and categories for search: the built-in list first, then the live catalog from the backend. */
export function useSearchCatalog() {
  const [catalog, setCatalog] = useState(fallback);
  useEffect(() => {
    let alive = true;
    request ??= fetch("/api/search-catalog")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .catch(() => { request = undefined; return null; });
    request.then((live) => alive && live?.products?.length && setCatalog(live));
    return () => { alive = false; };
  }, []);
  return catalog;
}
