import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[80vh] flex-col justify-center gap-8 pt-24">
      <p className="eyebrow text-mute">404</p>
      <h1 className="display text-[20vw] md:text-[12vw]">
        Missed <span className="outline-text">the rep.</span>
      </h1>
      <p className="max-w-sm text-mute">That page doesn’t exist — it may have moved when the store was rebuilt.</p>
      <div className="flex flex-col gap-3 xs:flex-row">
        <LinkButton href="/shop">Go to the shop</LinkButton>
        <LinkButton href="/" variant="ghost">Home</LinkButton>
      </div>
    </section>
  );
}
