import { ShieldCheck, FileText } from "lucide-react";
import { store } from "@/data/catalog";

const { fssai } = store;

/**
 * FSSAI registration badge. Shows the number and validity; the full
 * certificate (which carries a photo and home address) opens only on click.
 *
 *   compact — one-line badge for the footer / product pages
 */
export default function FssaiBadge({ compact = false, className = "" }) {
  if (compact) {
    return (
      <a
        href={fssai.pdf}
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex items-center gap-3 border border-line px-3 py-2 transition-colors hover:border-lime ${className}`}
        aria-label={`FSSAI registered, number ${fssai.number}. View certificate (PDF, opens in a new tab)`}
      >
        <ShieldCheck className="size-5 shrink-0 text-lime" aria-hidden />
        <span className="flex flex-col leading-tight">
          <span className="eyebrow text-warm">FSSAI Reg. No.</span>
          <span className="font-mono text-xs tabular-nums text-soft/80 group-hover:text-lime">{fssai.number}</span>
        </span>
      </a>
    );
  }

  return (
    <div className={`border border-line bg-charcoal p-5 md:p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center bg-lime text-ink">
          <ShieldCheck className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="eyebrow text-lime">FSSAI registered</p>
          <p className="display mt-1 text-3xl tabular-nums md:text-4xl">{fssai.number}</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Row k="Registered as" v={`${store.legalName} (${fssai.kind})`} wide />
        <Row k="Issued" v={fssai.issuedOn} />
        <Row k="Valid until" v={fssai.validUntil} />
        <Row k="Authority" v={fssai.authority} wide />
      </dl>
      <a
        href={fssai.pdf}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-warm underline decoration-lime underline-offset-4 hover:text-lime"
      >
        <FileText className="size-4" aria-hidden /> View certificate (PDF)
      </a>
    </div>
  );
}

function Row({ k, v, wide }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="eyebrow text-mute">{k}</dt>
      <dd className="mt-1 text-soft/90">{v}</dd>
    </div>
  );
}
