"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useAnimate, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, UserRound } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

// Decorative packshots for the sign-in visual (transparent cut-outs kept just
// for this screen; product pages use the client's original photos).
const TUBS = [
  { src: "/assets/login/isolate-whey.png", alt: "", className: "left-[3%] bottom-[7%] aspect-[3/4] w-[43%] -rotate-[9deg]", delay: 0.25, float: 9 },
  { src: "/assets/login/gold-standard-whey.png", alt: "", className: "right-[3%] bottom-[7%] aspect-[3/4] w-[43%] rotate-[9deg]", delay: 0.35, float: 11 },
  { src: "/assets/HV Nutrition Whey Protein Tub.png", alt: "HV Nutrition Whey Protein", className: "left-1/2 bottom-[2%] z-10 aspect-[3/4] w-[53%] -translate-x-1/2", delay: 0.15, float: 13 },
];

const COPY = {
  login: { eyebrow: "Welcome back", lines: ["Fuel the", "grind."], lead: "Sign in to track orders, verify packs and manage your account." },
  signup: { eyebrow: "New here", lines: ["Join the", "grind."], lead: "Create a free customer account. It takes less than a minute." },
};

/** Field with a label above, 16px text (no iOS zoom) and a 56px touch target. */
function Field({ label, hint, className = "", children }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow mb-2 block text-mute">{label}</label>
      {children(id)}
      {hint && <p className="mt-2 text-xs text-mute">{hint}</p>}
    </div>
  );
}

const inputClass =
  "h-14 w-full rounded-xl border border-line bg-charcoal px-4 text-base text-warm placeholder:text-mute/70 outline-none transition-colors focus:border-lime focus:bg-graphite";

function PasswordInput({ id, signup }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name="password"
        type={shown ? "text" : "password"}
        autoComplete={signup ? "new-password" : "current-password"}
        minLength={signup ? 12 : undefined}
        maxLength={72}
        placeholder={signup ? "At least 12 characters" : "Your password"}
        className={`${inputClass} pr-14`}
        required
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        className="absolute inset-y-0 right-0 grid w-14 place-items-center text-mute transition-colors hover:text-warm"
      >
        {shown ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
}

/** Customer / Admin switch: real radio inputs, styled as a segmented control. */
function AccountType({ value, onChange }) {
  const options = [
    { value: "CUSTOMER", label: "Customer", Icon: UserRound },
    { value: "ADMIN", label: "Admin", Icon: ShieldCheck },
  ];
  // The gold pill springs across (follow-through) and squashes as it lands (squash & stretch).
  const [pill, animate] = useAnimate();
  const moved = useRef(false);
  useEffect(() => {
    const x = value === "ADMIN" ? "100%" : "0%";
    if (!moved.current) {
      moved.current = true;
      animate(pill.current, { x }, { duration: 0 });
      return;
    }
    animate(pill.current, { x }, { type: "spring", stiffness: 520, damping: 24 });
    animate(pill.current, { scaleX: [1, 1.22, 0.94, 1], scaleY: [1, 0.84, 1.05, 1] }, { duration: 0.45, ease: "easeInOut" });
  }, [animate, pill, value]);

  return (
    <fieldset>
      <legend className="eyebrow mb-2 text-mute">Sign in as</legend>
      <div className="relative grid grid-cols-2 rounded-xl border border-line bg-charcoal p-1">
        <span ref={pill} aria-hidden className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-gold" />
        {options.map(({ value: v, label, Icon }) => (
          <label key={v} className="relative z-10 cursor-pointer">
            <input type="radio" name="accountType" value={v} checked={value === v} onChange={() => onChange(v)} className="peer sr-only" />
            <span
              className={`flex h-12 items-center justify-center gap-2 rounded-lg font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-lime ${
                value === v ? "text-ink" : "text-mute hover:text-warm"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Login and customer signup. Phones: a product hero band with the form as a
 * sheet sliding up over it. Desktop: split screen, visual left, form right.
 */
export default function AuthScreen({ signup = false, busy, error, notice, checking, onSubmit }) {
  const mode = signup ? "signup" : "login";
  const copy = COPY[mode];
  const reduce = useReducedMotion();
  const [accountType, setAccountType] = useState("CUSTOMER");

  // Exaggerated feedback: the form shakes its head when sign-in fails.
  const form = useRef(null);
  useEffect(() => {
    const el = form.current;
    if (!error || !el) return;
    el.classList.remove("fx-shake");
    void el.offsetWidth; // restart the animation for a repeated error
    el.classList.add("fx-shake");
    const done = () => el.classList.remove("fx-shake");
    el.addEventListener("animationend", done, { once: true });
    return () => el.removeEventListener("animationend", done);
  }, [error]);

  function submit(event) {
    event.preventDefault();
    onSubmit(signup ? "register" : "login", Object.fromEntries(new FormData(event.currentTarget)));
  }

  // Slide only, no fade: the form must be visible before JavaScript loads on slow phones.
  const rise = (delay) => ({
    initial: reduce ? false : { y: 16 },
    animate: { y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <section className="relative lg:grid lg:min-h-[100svh] lg:grid-cols-[1.05fr_1fr]">
      {/* ── Visual ── */}
      <div className="palette-fixed grain relative flex h-[54svh] min-h-[420px] flex-col overflow-hidden bg-charcoal lg:sticky lg:top-0 lg:h-[100svh]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "radial-gradient(60% 55% at 50% 78%, rgba(255,179,0,0.32), transparent 70%), radial-gradient(90% 60% at 50% 0%, rgba(255,255,255,0.05), transparent 60%)" }}
        />
        <p aria-hidden className="display outline-text pointer-events-none absolute inset-x-0 bottom-[-0.12em] select-none text-center text-[38vw] leading-none opacity-20 [--stroke:var(--color-lime)] lg:text-[19vw]">
          HV
        </p>

        <div className="shell relative z-20 pt-[5.75rem] lg:pt-28">
          <motion.p {...rise(0.05)} className="eyebrow text-lime">{copy.eyebrow}</motion.p>
          <h1 className="display mt-3 text-[14vw] text-warm sm:text-7xl lg:text-[min(6.5vw,11svh)]">
            {copy.lines.map((line, i) => (
              <span key={line} className="line-mask">
                <motion.span
                  initial={reduce ? false : { y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, delay: 0.1 + i * 0.08, ease: EASE }}
                  className={i ? "text-lime" : undefined}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p {...rise(0.3)} className="mt-5 hidden max-w-md text-lg font-medium leading-relaxed text-warm/85 lg:block xl:text-xl">{copy.lead}</motion.p>
        </div>

        {/* Fills the space left under the text (and above the form sheet on phones), so nothing overlaps. */}
        <div aria-hidden className="relative mb-12 mt-3 min-h-[140px] w-full flex-1 lg:mb-14 lg:mt-4 lg:min-h-[200px]">
          {/* Fixed-proportion stage, so the three tubs keep one arrangement at every screen size. */}
          <div className="relative mx-auto aspect-[5/4] h-full max-w-full">
          {TUBS.map((tub) => (
            <motion.div
              key={tub.src}
              initial={reduce ? false : { opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: tub.delay, ease: EASE }}
              className={`absolute ${tub.className}`}
            >
              <motion.div
                className="relative h-full w-full"
                animate={reduce ? undefined : { y: [0, -tub.float, 0] }}
                transition={{ duration: 4 + tub.float / 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image src={tub.src} alt={tub.alt} fill sizes="(min-width:1024px) 22vw, 40vw" priority className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" />
              </motion.div>
            </motion.div>
          ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 hidden border-t border-line/60 bg-charcoal/70 backdrop-blur lg:block">
          <ul className="shell grid grid-cols-3 divide-x divide-line/60 py-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mute">
            <li className="pr-4">FSSAI registered</li>
            <li className="px-4">Verify every pack</li>
            <li className="pl-4">Made in Uttarpara</li>
          </ul>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="relative z-30 -mt-10 rounded-t-[28px] border-t border-line bg-obsidian pb-[max(3rem,env(safe-area-inset-bottom))] lg:mt-0 lg:flex lg:items-center lg:rounded-none lg:border-t-0 lg:pb-16 lg:pt-28">
        <span aria-hidden className="mx-auto mt-3 block h-1 w-10 rounded-full bg-line lg:hidden" />
        <div className="mx-auto w-full max-w-md px-5 pt-6 sm:px-8 lg:pt-0">
          <motion.nav {...rise(0.2)} aria-label="Account" className="grid grid-cols-2 border-b border-line">
            {[
              ["/login", "Sign in", !signup],
              ["/signup", "Create account", signup],
            ].map(([href, label, active]) => (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative pb-3 text-center font-mono text-xs uppercase tracking-[0.14em] transition-colors ${active ? "text-warm" : "text-mute hover:text-warm"}`}
              >
                {label}
                {active && <motion.span layoutId="auth-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-lime" />}
              </Link>
            ))}
          </motion.nav>

          <motion.div {...rise(0.28)} className="mt-8">
            <h2 className="display text-4xl sm:text-6xl">{signup ? "Create account" : "Sign in"}</h2>
            <p className="mt-3 text-sm text-mute lg:hidden">{copy.lead}</p>
          </motion.div>

          {(error || notice) && (
            <p
              role={error ? "alert" : "status"}
              className={`mt-6 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-lime/40 bg-lime/10 text-warm"}`}
            >
              {error || notice}
            </p>
          )}

          {checking ? (
            <p role="status" className="mt-8 flex items-center gap-3 text-mute">
              <Loader2 className="size-5 animate-spin" aria-hidden /> Checking your session…
            </p>
          ) : (
            <motion.form ref={form} {...rise(0.36)} method="post" onSubmit={submit} className="mt-8 space-y-5">
              {signup ? (
                <Field label="Full name">
                  {(id) => <input id={id} name="name" autoComplete="name" maxLength={120} placeholder="Your name" className={inputClass} required />}
                </Field>
              ) : (
                <AccountType value={accountType} onChange={setAccountType} />
              )}
              <Field label="Email">
                {(id) => (
                  <input id={id} name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" className={inputClass} required />
                )}
              </Field>
              <Field label="Password" hint={signup ? "Use at least 12 characters." : undefined}>
                {(id) => <PasswordInput id={id} signup={signup} />}
              </Field>

              <button
                disabled={busy}
                className="press group flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gold font-mono text-sm font-medium uppercase tracking-[0.14em] text-ink hover:bg-warm hover:text-obsidian disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                    {signup ? "Creating account…" : "Signing in…"}
                  </>
                ) : (
                  <>
                    {signup ? "Create account" : "Sign in"}
                    <ArrowRight className="size-5 transition-transform duration-500 ease-[var(--ease-anticipate)] group-hover:translate-x-2" aria-hidden />
                  </>
                )}
              </button>

              <p className="pt-2 text-center text-sm text-mute">
                {signup ? "Already have an account? " : "New to HV Nutrition? "}
                <Link href={signup ? "/login" : "/signup"} className="text-warm underline decoration-lime underline-offset-4 hover:text-lime">
                  {signup ? "Sign in" : "Create a customer account"}
                </Link>
              </p>
              {!signup && accountType === "ADMIN" && (
                <p className="text-center text-xs text-mute">Admin accounts are created by a super admin.</p>
              )}
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}
