/**
 * CHECKOUT INTEGRATION POINT
 * ─────────────────────────────────────────────────────────────────────────────
 * There is no payment backend connected to this frontend. Nothing here places
 * an order or takes payment.
 *
 * To go live, implement `startCheckout(lines)` against your platform, e.g.:
 *   • Shopify Storefront API → cartCreate → redirect to checkoutUrl
 *   • WooCommerce Store API  → POST /wc/store/v1/cart/add-item, then /checkout
 *   • Custom API / Razorpay  → create order server-side, open payment sheet
 * and set CHECKOUT_ENABLED to true.
 */
import { store } from "@/data/catalog";
import { formatPrice, getBrand } from "@/lib/catalog";

export const CHECKOUT_ENABLED = false;

export async function startCheckout(/* lines */) {
  throw new Error("Checkout is not connected. See src/lib/checkout.js");
}

/** Until checkout is connected, customers can send their cart to the store. */
export function orderEnquiryMailto(lines, subtotal) {
  const body = [
    "Hi HV Nutrition, I'd like to order:",
    "",
    ...lines.map(
      (l) =>
        `• ${l.qty} × ${getBrand(l.product.brand)?.name} ${l.product.name}${l.product.flavour ? ` (${l.product.flavour}` : ""}${l.product.size ? `, ${l.product.size})` : l.product.flavour ? ")" : ""} — ${formatPrice(l.lineTotal)}`
    ),
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    "",
    "Name:",
    "Delivery address:",
    "Phone:",
  ].join("\n");
  return `mailto:${store.email}?subject=${encodeURIComponent("Order enquiry")}&body=${encodeURIComponent(body)}`;
}
