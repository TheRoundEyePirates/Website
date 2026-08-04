const TILE_WIDTH = 800;
const TILE_COUNT = 3;
const WAVE_HEIGHT = 64;

function wavePath(amplitude: number, baseY: number): string {
  const points: string[] = [`M0 ${WAVE_HEIGHT}`];
  const stepsPerTile = 6;
  for (let tile = 0; tile < TILE_COUNT; tile += 1) {
    for (let step = 0; step <= stepsPerTile; step += 1) {
      const t = step / stepsPerTile;
      const x = (tile + t) * TILE_WIDTH;
      const y = baseY + Math.sin(t * Math.PI * 2) * amplitude;
      points.push(`L${x.toFixed(1)} ${y.toFixed(1)}`);
    }
  }
  points.push(`L${TILE_WIDTH * TILE_COUNT} ${WAVE_HEIGHT}Z`);
  return points.join(' ');
}

interface WaveTileProps {
  amplitude: number;
  baseY: number;
}

function WaveTile({ amplitude, baseY }: WaveTileProps) {
  return (
    <svg
      viewBox={`0 0 ${TILE_WIDTH * TILE_COUNT} ${WAVE_HEIGHT}`}
      preserveAspectRatio="none"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={wavePath(amplitude, baseY)} />
    </svg>
  );
}

interface SeaWavesProps {
  className?: string;
}

/**
 * Two layered ocean swells that drift sideways forever. The navy swell
 * breaks behind the sand-coloured shore, so the sea always rolls onto the
 * beach. Uses only transform animation, so it's cheap to run.
 */
export default function SeaWaves({ className = '' }: SeaWavesProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none relative h-16 overflow-hidden md:h-24 ${className}`}>
      <div className="absolute inset-0 text-navy">
        <div className="wave-track" style={{ animationDuration: '26s' }}>
          <WaveTile amplitude={11} baseY={30} />
          <WaveTile amplitude={11} baseY={30} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 text-sand">
        <div className="wave-track wave-track--fast">
          <WaveTile amplitude={13} baseY={44} />
          <WaveTile amplitude={13} baseY={44} />
        </div>
      </div>
    </div>
  );
}
