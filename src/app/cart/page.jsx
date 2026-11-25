import PageHeader from "@/components/layout/PageHeader";
import CartView from "./CartView";

export const metadata = {
  title: "Cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <>
      <PageHeader eyebrow="Your bag" lines={["Cart"]} crumbs={[{ label: "Cart" }]} />
      <CartView />
    </>
  );
}
