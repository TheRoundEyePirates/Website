import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { MediaItem } from '../lib/media';

interface MediaGalleryProps {
  media: MediaItem[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  const [active, setActive] = useState<number | null>(null);
  const [videoRatios, setVideoRatios] = useState<Record<string, number>>({});

  const step = useCallback(
    (dir: 1 | -1) => {
      setActive((current) =>
        current === null ? current : (current + dir + media.length) % media.length,
      );
    },
    [media.length],
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

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-ink/30 bg-sand-deep/40 px-6 py-16 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink/50">
          The album is empty
        </span>
        <p className="max-w-md font-mono text-sm leading-7 text-ink/60">
          We'll fix that — the album should be full of builds and matches soon.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((item, index) => {
          const ratio =
            item.type === 'image' && item.width && item.height
              ? `${item.width} / ${item.height}`
              : item.type === 'video' && videoRatios[item.src]
                ? `${videoRatios[item.src]}`
                : undefined;
          const aspectStyle = ratio ? { aspectRatio: ratio } : undefined;

          return (
            <li key={item.src}>
              {item.type === 'video' ? (
                <figure
                  className="group relative overflow-hidden border border-ink/20 bg-sand-deep"
                  style={aspectStyle}
                >
                  <video
                    src={item.src}
                    controls
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                      const video = event.currentTarget;
                      if (video.videoWidth && video.videoHeight) {
                        setVideoRatios((prev) => ({
                          ...prev,
                          [item.src]: video.videoWidth / video.videoHeight,
                        }));
                      }
                    }}
                    className="h-full w-full object-cover"
                  />
                </figure>
              ) : (
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Open ${item.caption}`}
                  className="group relative block w-full overflow-hidden border border-ink/20 bg-sand-deep text-left"
                  style={aspectStyle}
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    className="image-fade h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ink transition-transform duration-300 group-hover:translate-y-0">
                    {item.caption}
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setActive(null)}
        >
          <figure
            className="relative flex max-h-full w-full max-w-4xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex max-h-[75vh] w-full items-center justify-center overflow-hidden border border-gold/30 bg-black/60">
              {media[active].type === 'video' ? (
                <video
                  src={media[active].src}
                  controls
                  autoPlay
                  className="max-h-[75vh] w-full object-contain"
                />
              ) : (
                <img
                  src={media[active].src}
                  alt={media[active].caption}
                  className="image-fade max-h-[75vh] w-auto object-contain"
                />
              )}
            </div>
            <figcaption className="mt-3 text-center font-mono text-xs uppercase tracking-[0.25em] text-ink">
              {media[active].caption} — {active + 1} / {media.length}
            </figcaption>

            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close media viewer"
              className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-sand text-ink transition-colors hover:bg-gold hover:text-ink"
            >
              <X size={16} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous media"
              className="absolute top-1/2 left-0 -translate-x-1/2 rounded-full border border-gold/40 bg-sand p-2 text-ink transition-colors hover:bg-gold hover:text-ink"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next media"
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
