import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CrewPhotoGalleryProps {
  photos: string[];
  name: string;
}

export default function CrewPhotoGallery({ photos, name }: CrewPhotoGalleryProps) {
  const [active, setActive] = useState<number | null>(null);

  const step = useCallback(
    (dir: 1 | -1) => {
      setActive((current) =>
        current === null ? current : (current + dir + photos.length) % photos.length,
      );
    },
    [photos.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active, step]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photos.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Open ${name} photo ${index + 1}`}
            className="group relative block w-full overflow-hidden border border-ink/20 bg-sand-deep text-left"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="image-fade aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setActive(null)}
        >
          <figure
            className="relative flex max-h-full w-full max-w-4xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex max-h-[75vh] w-full items-center justify-center overflow-hidden border border-gold/30 bg-black/60">
              <img
                src={photos[active]}
                alt=""
                className="image-fade max-h-[75vh] w-auto object-contain"
              />
            </div>
            <figcaption className="mt-3 text-center font-mono text-xs uppercase tracking-[0.25em] text-ink">
              {name} — {active + 1} / {photos.length}
            </figcaption>

            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close photo viewer"
              className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-sand text-ink transition-colors hover:bg-gold hover:text-ink"
            >
              <X size={16} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-0 -translate-x-1/2 rounded-full border border-gold/40 bg-sand p-2 text-ink transition-colors hover:bg-gold hover:text-ink"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-0 translate-x-1/2 rounded-full border border-gold/40 bg-sand p-2 text-ink transition-colors hover:bg-gold hover:text-ink"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </figure>
        </div>
      )}
    </>
  );
}
