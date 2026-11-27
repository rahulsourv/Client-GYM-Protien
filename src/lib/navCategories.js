"use client";

import { useEffect, useState } from "react";
import { categories, byCategory } from "@/lib/catalog";

const fallback = categories.map(({ slug, name }) => ({ slug, name, count: byCategory(slug).length }));
let request;

/** Categories for site navigation: the static list first, then the live one from the backend. */
export function useNavCategories() {
  const [list, setList] = useState(fallback);
  useEffect(() => {
    let alive = true;
    request ??= fetch("/api/nav-categories")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .catch(() => { request = undefined; return null; });
    request.then((live) => alive && live?.length && setList(live));
    return () => { alive = false; };
  }, []);
  return list;
}
