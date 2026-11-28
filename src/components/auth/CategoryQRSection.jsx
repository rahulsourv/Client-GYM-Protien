"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";

const HIDDEN_KEY = "hv-hidden-qr";
const homeQR = { id: "home", name: "Website home", path: "/", filename: "hv-nutrition-home-qr" };

function readHidden() {
  try {
    const value = JSON.parse(localStorage.getItem(HIDDEN_KEY));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveHidden(ids) {
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
  } catch {
    // Storage can be blocked; the change still applies until the page reloads.
  }
}

export default function CategoryQRSection({ categories, error }) {
  // Safe to read on first render: the list only renders after categories load in the browser.
  const [hidden, setHidden] = useState(() => (typeof window === "undefined" ? [] : readHidden()));

  // Inactive categories are hidden from the public catalog, so their QR codes would land on a 404.
  const codes = categories && [
    homeQR,
    ...categories
      .filter((category) => category.status === "ACTIVE")
      .map((category) => ({
        id: category._id,
        name: category.name,
        path: `/categories/qr/${category._id}`,
        filename: `${category.slug}-qr`,
      })),
  ];
  const visible = codes?.filter((code) => !hidden.includes(code.id));
  const hiddenCount = codes ? codes.length - visible.length : 0;

  function update(ids) {
    setHidden(ids);
    saveHidden(ids);
  }

  function remove(code) {
    if (window.confirm(`Delete the "${code.name}" QR code from this list? Printed copies keep working.`)) {
      update([...hidden, code.id]);
    }
  }

  return (
    <section id="qr" aria-labelledby="category-qr-heading" className="scroll-mt-28 space-y-5 border border-line p-6 lg:col-span-2">
      <h2 id="category-qr-heading" className="display text-4xl">QR</h2>
      {error ? (
        <p role="alert">Category QR codes could not be loaded.</p>
      ) : !codes ? (
        <p role="status">Loading category QR codes…</p>
      ) : (
        <>
          {visible.length === 0 ? (
            <p>No QR codes to show.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((code) => <QRCard key={code.id} code={code} onDelete={() => remove(code)} />)}
            </ul>
          )}
          {hiddenCount > 0 && (
            <Button type="button" variant="ghost" onClick={() => update([])}>
              Restore deleted QR codes ({hiddenCount})
            </Button>
          )}
        </>
      )}
    </section>
  );
}

function QRCard({ code: entry, onDelete }) {
  const [code, setCode] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      try {
        const origin = process.env.NEXT_PUBLIC_CATALOG_ORIGIN || window.location.origin;
        const url = new URL(entry.path, origin).href;
        const image = await QRCode.toDataURL(url, { width: 600, margin: 4, errorCorrectionLevel: "M" });
        if (!cancelled) setCode({ url, image });
      } catch {
        if (!cancelled) setError("This QR code could not be generated.");
      }
    }
    generate();
    return () => { cancelled = true; };
  }, [entry.path]);

  async function print() {
    setError("");
    const preview = window.open("", "_blank");
    if (!preview) {
      setError("Allow pop-ups in your browser to print this QR code.");
      return;
    }
    preview.opener = null;
    const doc = preview.document;
    doc.title = `${entry.name} QR`;
    const style = doc.createElement("style");
    style.textContent = "body { margin: 2cm; text-align: center; font: 16px system-ui; color: #000; } img { width: 65mm; height: 65mm; display: block; margin: 0 auto; } p { overflow-wrap: anywhere; }";
    doc.head.append(style);
    const heading = doc.createElement("h1");
    heading.textContent = entry.name;
    const image = doc.createElement("img");
    image.alt = `QR code for ${entry.name}`;
    image.src = code.image;
    const url = doc.createElement("p");
    url.textContent = code.url;
    doc.body.append(heading, image, url);
    try {
      await image.decode();
      if (!preview.closed) {
        preview.focus();
        preview.print();
      }
    } catch {
      preview.close();
      setError("The print preview could not load. Download the PNG to print it.");
    }
  }

  return (
    <li className="flex flex-col items-start gap-3 border border-line p-4">
      <h3 className="text-xl font-medium">{entry.name}</h3>
      {code && (
        <>
          <Image src={code.image} alt={`QR code for ${entry.name}`} width={180} height={180} unoptimized className="bg-white" />
          <p className="text-xs text-mute [overflow-wrap:anywhere]">{code.url}</p>
          <div className="mt-auto flex flex-wrap gap-2">
            <a href={code.image} download={`${entry.filename}.png`} className="inline-flex h-14 items-center bg-gold px-7 font-mono text-xs font-medium uppercase tracking-widest text-ink hover:bg-warm hover:text-obsidian">
              Download PNG
            </a>
            <Button type="button" variant="ghost" onClick={print}>Print</Button>
            <Button type="button" variant="ghost" onClick={onDelete} aria-label={`Delete ${entry.name} QR code`}>Delete</Button>
          </div>
        </>
      )}
      {error && <p role="alert" className="text-sm">{error}</p>}
    </li>
  );
}
