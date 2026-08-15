import ShipDivider from './ShipDivider';

const MAP_EMBED_SRC =
  'https://www.google.com/maps?q=Hawke%27s%20Bay%2C%20New%20Zealand&z=10&output=embed';

export default function Location() {
  return (
    <section id="location" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32">
      <ShipDivider label="Location" />

      <h2 data-animate="blur" className="font-display text-fluid-lg text-ink">
        Where we sail
      </h2>

      <p data-animate="fade-in" data-delay="0.1" className="mt-4 max-w-xl font-mono text-sm leading-7 text-ink/70">
        Based in Hastings &amp; Napier, Hawke's Bay — on the east coast of Aotearoa New Zealand.
      </p>

      <div data-animate="fade-up" data-delay="0.15" className="mt-10 border border-ink/25 bg-sand-deep/70 p-2">
        <iframe
          title="Map of Hastings and Napier, Hawke's Bay, New Zealand"
          src={MAP_EMBED_SRC}
          className="h-[420px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
        Hastings · Napier — Hawke's Bay, New Zealand
      </p>
    </section>
  );
}
