import { useId } from 'react';

const TILE_WIDTH = 800;
const TILE_COUNT = 3;
const BAND_HEIGHT = 64;
/** Segments per tile — high enough that the sine reads as a curve, not a zig-zag. */
const SEGMENTS_PER_TILE = 24;
const COPIES = 2;

interface WaveLayer {
  colorClass: string;
  amplitude: number;
  baseY: number;
  duration: number;
  /** Soften the crest with a vertical gradient instead of a hard fill. */
  gradient?: boolean;
}

const LAYERS: WaveLayer[] = [
  { colorClass: 'text-navy', amplitude: 11, baseY: 30, duration: 26 },
  { colorClass: 'text-sand', amplitude: 12, baseY: 46, duration: 16, gradient: true },
];

function wavePath(amplitude: number, baseY: number): string {
  const span = TILE_WIDTH * TILE_COUNT;
  const total = TILE_COUNT * SEGMENTS_PER_TILE;
  const d: string[] = [];
  for (let i = 0; i <= total; i += 1) {
    const x = (i / total) * span;
    const y = baseY + Math.sin((i / total) * Math.PI * 2 * TILE_COUNT) * amplitude;
    d.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  d.push(`L${span} ${BAND_HEIGHT}Z`);
  return d.join(' ');
}

const PATHS: string[] = LAYERS.map((layer) =>
  wavePath(layer.amplitude, layer.baseY),
);

/**
 * Two layered ocean swells that drift sideways forever. The navy swell
 * breaks behind the sand-coloured shore, which fades at its crest so the
 * water meets the beach without a hard seam. Transform-only animation.
 */
export default function SeaWaves({ className = '' }: { className?: string }) {
  const rawId = useId();
  const gradientId = `wave-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative h-16 overflow-hidden md:h-24 ${className}`}
    >
      {LAYERS.map((layer, index) => (
        <div key={layer.colorClass} className={`absolute inset-0 ${layer.colorClass}`}>
          <div
            className="wave-track"
            style={{ animationDuration: `${layer.duration}s` }}
          >
            {Array.from({ length: COPIES }, (_, copy) => (
              <svg
                key={copy}
                viewBox={`0 0 ${TILE_WIDTH * TILE_COUNT} ${BAND_HEIGHT}`}
                preserveAspectRatio="none"
                fill="currentColor"
                aria-hidden="true"
              >
                {copy === 0 && layer.gradient && (
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                      <stop offset="40%" stopColor="currentColor" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                )}
                <path
                  d={PATHS[index]}
                  fill={layer.gradient ? `url(#${gradientId})` : 'currentColor'}
                />
              </svg>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
