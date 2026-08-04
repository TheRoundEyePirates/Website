import { useId } from 'react';

const TILE_WIDTH = 800;
const TILE_COUNT = 3;
const BAND_HEIGHT = 64;
/** Segments per tile — high enough that the sine reads as a curve, not a zig-zag. */
const SEGMENTS_PER_TILE = 32;
const COPIES = 2;

interface GradientStop {
  offset: string;
  color: string;
  opacity?: number;
}

interface WaveLayer {
  amplitude: number;
  baseY: number;
  duration: number;
  /** Vertical shading: 0% is the crest, 100% the base of the swell. */
  gradientStops: GradientStop[];
  /** Trace the crest with a soft white stroke (whitecaps). */
  foam?: boolean;
}

const LAYERS: WaveLayer[] = [
  {
    amplitude: 13,
    baseY: 40,
    duration: 28,
    gradientStops: [
      { offset: '0%', color: '#2b5180' },
      { offset: '55%', color: '#1e3a5f' },
      { offset: '100%', color: '#14293f' },
    ],
  },
  {
    amplitude: 14,
    baseY: 58,
    duration: 18,
    foam: true,
    gradientStops: [
      { offset: '0%', color: '#e9dcc0', opacity: 0 },
      { offset: '45%', color: '#e9dcc0', opacity: 0.55 },
      { offset: '100%', color: '#d8c6a1' },
    ],
  },
];

function buildCrest(amplitude: number, baseY: number): string {
  const span = TILE_WIDTH * TILE_COUNT;
  const total = TILE_COUNT * SEGMENTS_PER_TILE;
  const d: string[] = [];
  for (let i = 0; i <= total; i += 1) {
    const x = (i / total) * span;
    const y = baseY + Math.sin((i / total) * Math.PI * 2 * TILE_COUNT) * amplitude;
    d.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return d.join(' ');
}

const PATHS = LAYERS.map((layer) => {
  const crest = buildCrest(layer.amplitude, layer.baseY);
  return { crest, fill: `${crest}L${TILE_WIDTH * TILE_COUNT} ${BAND_HEIGHT}Z` };
});

/**
 * Two layered ocean swells that drift sideways forever. The deep navy swell
 * is shaded for depth; the sand-coloured shore fades at its crest so the
 * water meets the beach without a hard seam, and a foam stroke follows the
 * breaking line. Transform-only animation, disabled under reduced motion.
 */
export default function SeaWaves({ className = '' }: { className?: string }) {
  const idBase = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative h-16 overflow-hidden md:h-24 ${className}`}
    >
      {LAYERS.map((layer, index) => (
        <div key={index} className="absolute inset-0">
          <div className="wave-track" style={{ animationDuration: `${layer.duration}s` }}>
            {Array.from({ length: COPIES }, (_, copy) => {
              const gradientId = `wave-${idBase}-${index}-${copy}`;
              return (
                <svg
                  key={copy}
                  viewBox={`0 0 ${TILE_WIDTH * TILE_COUNT} ${BAND_HEIGHT}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      {layer.gradientStops.map((stop) => (
                        <stop
                          key={stop.offset}
                          offset={stop.offset}
                          stopColor={stop.color}
                          stopOpacity={stop.opacity ?? 1}
                        />
                      ))}
                    </linearGradient>
                  </defs>
                  <path d={PATHS[index].fill} fill={`url(#${gradientId})`} />
                  {layer.foam && (
                    <path
                      d={PATHS[index].crest}
                      fill="none"
                      stroke="#fff8eb"
                      strokeOpacity="0.7"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                </svg>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
