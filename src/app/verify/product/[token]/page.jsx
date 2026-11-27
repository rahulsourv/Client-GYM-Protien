import { Suspense } from "react";
import PageHeader from "@/components/layout/PageHeader";
import ProductVerification from "@/components/verified/ProductVerification";

export const metadata = {
  title: "Verify a product",
  robots: { index: false },
};

export default function VerifyProductPage() {
  return (
    <>
      <PageHeader lines={["Verify a product"]} crumbs={[{ label: "Product verification" }]} />
      <Suspense fallback={<p className="shell pb-24" role="status">Checking product code…</p>}>
        <ProductVerification />
      </Suspense>
    </>
  );
}
