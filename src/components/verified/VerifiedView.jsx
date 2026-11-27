"use client";

import { useRef } from "react";
import { ShieldCheck, FileText, ExternalLink, Phone } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Placeholder from "@/components/ui/Placeholder";
import { LinkButton } from "@/components/ui/Button";
import { store } from "@/data/catalog";
import { VerificationForm } from "@/components/verified/ProductVerification";

const { fssai } = store;

/** The /verified page body: the FSSAI registration, front and centre. */
export default function VerifiedView() {
  const root = useRef(null);

  useGSAP(
    () => {
      setupReveals();
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      // Seal: ring text turns slowly, shield pops in.
      gsap.to(q("[data-ring]"), { rotation: 360, duration: 28, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      gsap.from(q("[data-shield]"), { scale: 0.4, autoAlpha: 0, duration: 1.4, ease: "back.out(1.8)", delay: 0.3 });
      // Registration number types in digit by digit.
      const digits = q("[data-digit]");
      gsap.from(digits, { yPercent: 110, autoAlpha: 0, duration: 0.9, stagger: 0.04, ease: "expo.out", delay: 0.4 });
      // Certificate card tilts in on scroll.
      gsap.fromTo(
        q("[data-cert]"),
        { rotateX: 14, y: 60, autoAlpha: 0 },
        { rotateX: 0, y: 0, autoAlpha: 1, ease: "power2.out", scrollTrigger: { trigger: q("[data-cert]")[0], start: "top 90%", end: "top 45%", scrub: 0.8 } }
      );
    },
    { scope: root }
  );

  const details = [
    ["Registered business", store.legalName],
    ["Food business operator", store.founder],
    ["Kind of business", fssai.kind],
    ["Premises", store.address],
    ["Issued on", fssai.issuedOn],
    ["Valid until", fssai.validUntil],
    ["Registering authority", fssai.authority],
    ["Current status", fssai.status],
  ];

  return (
    <div ref={root}>
      {/* ── Seal + number ─────────────────────────────────────── */}
      <section className="shell pb-16 md:pb-24">
        <div className="relative overflow-hidden border border-lime/40 bg-[radial-gradient(70%_120%_at_0%_0%,color-mix(in_srgb,var(--color-lime)_16%,transparent),transparent_70%)] p-6 md:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <Seal />
            <div className="lg:col-span-8">
              <p className="eyebrow flex items-center gap-2 text-lime">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full bg-lime" />
                </span>
                Food Safety and Standards Authority of India
              </p>
              <p className="eyebrow mt-6 text-mute">Registration number</p>
              <p className="display mt-2 flex flex-wrap overflow-hidden text-[12.5vw] leading-[0.9] tabular-nums md:text-[7vw] lg:text-[5.4vw]" aria-label={fssai.number}>
                {[...fssai.number].map((d, i) => (
                  <span key={i} data-digit aria-hidden className={`inline-block ${i < 5 ? "text-lime" : ""}`}>
                    {d}
                  </span>
                ))}
              </p>
              <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-soft/80">
                HV Nutrition is the trading name of {store.legalName}, registered under the FSS Act, 2006 as a food {fssai.kind.toLowerCase()} in{" "}
                {store.city}, {store.region}.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton href={fssai.pdf} target="_blank" rel="noopener noreferrer" arrow={false}>
                  <span className="flex items-center gap-2"><FileText className="size-4" aria-hidden /> View certificate (PDF)</span>
                </LinkButton>
                <LinkButton href={fssai.portal} target="_blank" rel="noopener noreferrer" variant="ghost" arrow={false}>
                  <span className="flex items-center gap-2"><ExternalLink className="size-4" aria-hidden /> Verify on FSSAI FoSCoS</span>
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Certificate details ───────────────────────────────── */}
      <section className="border-t border-line bg-charcoal py-20 md:py-28 [perspective:1400px]">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-mute">(01) The certificate</p>
            <h2 className="display mt-4 text-6xl md:text-7xl">What it says.</h2>
            <p data-reveal="fade" className="mt-6 max-w-sm text-sm leading-relaxed text-soft/75">
              Copied from the registration certificate issued by the Government of West Bengal, Department of Health and Family Welfare.
            </p>
          </div>
          <div data-cert className="border border-line bg-obsidian p-6 md:p-8 lg:col-span-8">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-6 text-lime" aria-hidden />
                <span className="eyebrow text-warm">Registration certificate · FSS Act, 2006</span>
              </div>
              <span className="hidden font-mono text-xs text-mute sm:inline">{fssai.number}</span>
            </div>
            <dl>
              {details.map(([k, v]) => (
                <div key={k} className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4">
                  <dt className="eyebrow text-mute">{k}</dt>
                  <dd className="text-soft/90">{v}</dd>
                </div>
              ))}
              <div className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4">
                <dt className="eyebrow text-mute">Registered food categories</dt>
                <dd className="flex flex-col gap-1 text-soft/90">
                  {fssai.categories.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── Check it yourself ─────────────────────────────────── */}
      <section className="shell py-20 md:py-28">
        <p className="eyebrow text-mute">(02) Don’t take our word for it</p>
        <h2 className="display mt-4 text-6xl md:text-7xl">
          Check it <span className="text-lime">yourself.</span>
        </h2>
        <ol className="mt-12 grid gap-px border border-line bg-line md:grid-cols-3">
          {[
            ["Open FoSCoS", "Go to the FSSAI Food Safety Compliance System at foscos.fssai.gov.in."],
            ["Search the number", `Look up registration number ${fssai.number}.`],
            ["Match the details", `It should show ${store.legalName}, ${store.city}, valid until ${fssai.validUntil}.`],
          ].map(([t, d], i) => (
            <li key={t} data-reveal="fade" className="flex flex-col gap-4 bg-obsidian p-6 md:p-8">
              <span className="display text-6xl text-lime">{String(i + 1).padStart(2, "0")}</span>
              <span className="display text-3xl">{t}</span>
              <span className="text-sm leading-relaxed text-soft/75">{d}</span>
            </li>
          ))}
        </ol>

        <div data-reveal="fade" className="mt-16 grid gap-8 border-t border-line pt-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow text-mute">Product authenticity</p>
            <p className="display mt-3 text-4xl">Where our stock comes from.</p>
          </div>
          <div className="flex flex-col items-start gap-4 md:col-span-7">
            <p className="text-sm leading-relaxed text-soft/80">
              For questions about HV Nutrition Whey Protein or its packaging, contact HV Nutrition.
            </p>
            <Placeholder>Owner to provide sourcing & authenticity statement</Placeholder>
            <VerificationForm />
            <a href={store.phoneHref} className="mt-2 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-warm underline decoration-lime underline-offset-4 hover:text-lime">
              <Phone className="size-4" aria-hidden /> Questions? Call {store.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Seal() {
  const ring = "FSSAI REGISTERED • HIGH VOLTAGE NUTRITION • ";
  return (
    <div className="mx-auto lg:col-span-4">
      <div className="relative size-56 md:size-64">
        <svg data-ring viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <path id="seal-circle" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
          </defs>
          <circle cx="100" cy="100" r="97" fill="none" stroke="var(--color-lime)" strokeWidth="1" strokeDasharray="2 5" />
          <text fill="var(--color-lime)" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11.5, letterSpacing: 3 }}>
            <textPath href="#seal-circle">{ring}</textPath>
          </text>
        </svg>
        <div data-shield className="absolute inset-[22%] grid place-items-center rounded-full bg-lime text-ink shadow-[0_0_60px_-10px_var(--color-lime)]">
          <div className="flex flex-col items-center">
            <ShieldCheck className="size-12 md:size-14" strokeWidth={1.8} aria-hidden />
            <span className="mt-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.2em]">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
