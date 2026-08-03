import TextFlippingBoardDemo from './TextFlippingBoardDemo';
import ShipDivider from './ShipDivider';

export default function Bulletin() {
  return (
    <section id="bulletin" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32">
      <ShipDivider label="Bulletin" />

      <h2 data-animate="blur" className="font-display text-3xl text-ink sm:text-4xl">
        Ship's Bulletin
      </h2>

      <p data-animate="fade-in" data-delay="0.1" className="mt-4 max-w-xl font-mono text-sm leading-7 text-ink/70">
        Arrivals, departures, and words from the crew — straight from the board.
      </p>

      <div data-animate="fade-up" data-delay="0.15" className="mt-10">
        <TextFlippingBoardDemo />
      </div>
    </section>
  );
}
