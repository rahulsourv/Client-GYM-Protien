"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const states = {
  REGISTERED_PRODUCT: "Registered product",
  PRODUCT_INACTIVE: "This product is inactive.",
  QR_DISABLED: "Verification is disabled for this QR code.",
};

export function VerificationForm() {
  const router = useRouter();

  return (
    <form
      className="flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const token = new FormData(event.currentTarget).get("token").trim();
        if (token && token !== "." && token !== "..") {
          router.push(`/verify/product/${encodeURIComponent(token)}`);
        }
      }}
    >
      <label className="block w-full">
        Product verification code
        <input name="token" className="mt-2 w-full border border-line bg-obsidian p-3" required />
      </label>
      <Button>Verify product</Button>
    </form>
  );
}

export default function ProductVerification() {
  const { token } = useParams();
  return <VerificationResult key={token} token={token} />;
}

function VerificationResult({ token }) {
  const eventId = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scanError, setScanError] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const path = `/verify/product/${encodeURIComponent(token)}`;

    async function verify() {
      try {
        const data = await api(path, { signal });
        if (signal.aborted) return;
        const state = data.state ?? data.verificationState ?? data.verificationStatus ?? data.status;
        setResult({ product: data.product, state });

        if (state === "REGISTERED_PRODUCT") {
          try {
            eventId.current ??= crypto.randomUUID();
            await api(`${path}/scan`, { method: "POST", body: { eventId: eventId.current }, signal });
          } catch {
            if (!signal.aborted) setScanError("The product was found, but the scan could not be recorded.");
          }
        }
      } catch (requestError) {
        if (!signal.aborted) {
          const message = Object.hasOwn(states, requestError.code) && states[requestError.code];
          // A malformed code fails backend validation (400); to the customer it is simply not found.
          const notFound = requestError.status === 404 || requestError.status === 400;
          setError(message || (notFound ? "Product code not found. Check the code and try again." : requestError.message));
        }
      } finally {
        if (!signal.aborted) setBusy(false);
      }
    }

    verify();
    return () => controller.abort();
  }, [token, attempt]);

  const product = result?.product;
  const state = result?.state;
  return (
    <section className="shell pb-24">
      <div className="max-w-lg space-y-5 border border-line p-6">
        {busy && <p role="status">Checking product code…</p>}
        {error && <p role="alert">{error}</p>}
        {result && (
          <div role="status">
            <p>{Object.hasOwn(states, state) ? states[state] : "Verification status unavailable."}</p>
            {product?.name && <h2 className="display mt-2 text-3xl">{product.name}</h2>}
            {product?.sku && <p>SKU {product.sku}</p>}
            {product?.flavour && <p>{product.flavour}</p>}
            {product?.weight != null && <p>{product.weight} {product.weightUnit}</p>}
          </div>
        )}
        {scanError && <p role="alert">{scanError}</p>}
        {(error || scanError) && (
          <Button disabled={busy} onClick={() => {
            setBusy(true);
            setError("");
            setScanError("");
            setResult(null);
            setAttempt(attempt + 1);
          }}>Try again</Button>
        )}
        <VerificationForm />
      </div>
    </section>
  );
}
