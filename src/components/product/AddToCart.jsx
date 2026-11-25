"use client";

import { useShop } from "@/store/shop";
import { Button } from "@/components/ui/Button";

export default function AddToCart({ product, qty = 1, className = "", label = "Add to cart" }) {
  const { addToCart } = useShop();
  const soldOut = product.availability === "out_of_stock";
  return (
    <Button className={className} disabled={soldOut} onClick={() => addToCart(product.id, qty)}>
      {soldOut ? "Sold out" : label}
    </Button>
  );
}
