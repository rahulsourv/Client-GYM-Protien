"use client";

import { getVariants, formatPrice } from "@/lib/catalog";

/**
 * Flavour × pack selection across a product family. Each variant is its own
 * catalog product (as on the source store), so selecting one calls
 * `onSelect(variantProduct)` — the PDP navigates, the quick view swaps.
 *
 * The pack axis uses servings when every variant has them, otherwise size.
 */
export default function VariantPicker({ product, onSelect }) {
  const variants = getVariants(product);
  const byServings = variants.length > 1 && variants.every((v) => v.servings);
  const packOf = (v) => (byServings ? `${v.servings} servings` : v.size);

  const flavours = [...new Set(variants.map((v) => v.flavour).filter(Boolean))];
  const packs = [...new Set(variants.map(packOf).filter(Boolean))];
  const current = packOf(product);

  const pick = (flavour, pack) => {
    const sameFlavour = variants.filter((v) => v.flavour === flavour);
    const next = sameFlavour.find((v) => packOf(v) === pack) ?? sameFlavour[0];
    if (next && next.id !== product.id) onSelect(next);
  };

  return (
    <div className="flex flex-col gap-5">
      {flavours.length <= 1 ? (
        <p className="eyebrow text-mute">
          Flavour <span className="text-warm">— {product.flavour ?? "—"}</span>
        </p>
      ) : (
        <fieldset>
          <legend className="eyebrow mb-2.5 text-mute">
            Flavour <span className="text-warm">— {product.flavour ?? "—"}</span>
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {flavours.map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={f === product.flavour}
                onClick={() => pick(f, current)}
                className="press border border-line px-3.5 py-2 text-sm hover:border-warm aria-checked:border-lime aria-checked:bg-lime aria-checked:text-ink"
              >
                {f}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="eyebrow mb-2.5 text-mute">
          {byServings ? "Pack" : "Size"} <span className="text-warm">— {[product.size, product.servings && `${product.servings} servings`].filter(Boolean).join(" · ")}</span>
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {(packs.length ? packs : [current]).map((pk) => {
            const v = variants.find((x) => x.flavour === product.flavour && packOf(x) === pk);
            return (
              <button
                key={pk}
                type="button"
                role="radio"
                aria-checked={pk === current}
                disabled={!v}
                onClick={() => pick(product.flavour, pk)}
                className="press flex flex-col items-start border border-line px-3.5 py-2 text-left hover:border-warm disabled:cursor-not-allowed disabled:opacity-30 aria-checked:border-lime aria-checked:bg-lime aria-checked:text-ink"
                title={v ? undefined : `Not available in ${product.flavour}`}
              >
                <span className="text-sm">{pk}</span>
                {v && (
                  <span className="font-mono text-[0.65rem] opacity-70">
                    {byServings && `${v.size} · `}
                    {formatPrice(v.price)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
