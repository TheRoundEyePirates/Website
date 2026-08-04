import { useEffect, useRef, useState } from 'react';

const CX = 130;
const CY = 130;
const TREASURE_EVENT = 'rept:treasure';

interface CompassRoseProps {
  height?: number;
  width?: number;
}

/** Alternating-radius star polygon path, centred on the dial. */
function starPath(outer: number, inner: number, points: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const x = CX + Math.cos(a) * radius;
    const y = CY + Math.sin(a) * radius;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `${pts.join(' ')}Z`;
}

const ROSE_PATH = starPath(62, 26, 8);
const CARDINAL_PATH = starPath(50, 5.5, 4);

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
  const major = i % 6 === 0;
  const inner = major ? 103 : 105;
  return {
    x1: CX + Math.cos(a) * inner,
    y1: CY + Math.sin(a) * inner,
    x2: CX + Math.cos(a) * 112,
    y2: CY + Math.sin(a) * 112,
    major,
  };
});

const NUMERALS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180 - Math.PI / 2;
  return {
    value: String(i * 30),
    x: CX + Math.cos(a) * 85,
    y: CY + Math.sin(a) * 85,
  };
});

const LETTERS = ['N', 'E', 'S', 'W'].map((letter, i) => {
  const a = (i * 90 * Math.PI) / 180 - Math.PI / 2;
  return { letter, x: CX + Math.cos(a) * 99, y: CY + Math.sin(a) * 99 };
});

const RIVETS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 4;
  return { x: CX + Math.cos(a) * 122, y: CY + Math.sin(a) * 122 };
});

/**
 * A hand-crafted SVG compass — polished brass bezel with rivets, aged paper
 * dial, engraved ticks and numerals, a golden rose that turns beneath a
 * swaying magnetic needle. Layered gradients give the metal real depth
 * without WebGL. The rose spins up when the treasure easter egg fires.
 */
export default function CompassRose({ height, width }: CompassRoseProps) {
  const [boosted, setBoosted] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const onTreasure = () => {
      setBoosted(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setBoosted(false), 3500);
    };
    document.addEventListener(TREASURE_EVENT, onTreasure);
    return () => {
      document.removeEventListener(TREASURE_EVENT, onTreasure);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <svg
      viewBox="0 0 260 260"
      aria-hidden="true"
      className={`block h-full w-full ${boosted ? 'compass-pop' : ''}`}
      style={width && height ? { width, height } : undefined}
    >
      <defs>
        <radialGradient id="bezel" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#f4d692" />
          <stop offset="35%" stopColor="#ddab4f" />
          <stop offset="70%" stopColor="#ae7425" />
          <stop offset="100%" stopColor="#6f4410" />
        </radialGradient>
        <radialGradient id="bezelInner" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#7c4d10" />
          <stop offset="100%" stopColor="#3f2709" />
        </radialGradient>
        <radialGradient id="dialFace" cx="50%" cy="42%" r="68%">
          <stop offset="0%" stopColor="#f5ead0" />
          <stop offset="62%" stopColor="#e7d3a7" />
          <stop offset="100%" stopColor="#c4a574" />
        </radialGradient>
        <linearGradient id="roseGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbe394" />
          <stop offset="45%" stopColor="#d9a94e" />
          <stop offset="100%" stopColor="#94621a" />
        </linearGradient>
        <linearGradient id="roseBronze" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c08a2f" />
          <stop offset="100%" stopColor="#5f3a0c" />
        </linearGradient>
        <linearGradient id="needleNorth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2603c" />
          <stop offset="55%" stopColor="#a9351c" />
          <stop offset="100%" stopColor="#541108" />
        </linearGradient>
        <linearGradient id="needleSouth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a6f76" />
          <stop offset="100%" stopColor="#1a1c1f" />
        </linearGradient>
        <radialGradient id="hubGold" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fbe394" />
          <stop offset="100%" stopColor="#a26a1e" />
        </radialGradient>
        <filter id="lift" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.8" floodColor="#1c1917" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer brass bezel. */}
      <circle cx={CX} cy={CY} r="125" fill="url(#bezel)" />
      <circle cx={CX} cy={CY} r="125" fill="none" stroke="#3a2410" strokeWidth="2" />
      <circle cx={CX} cy={CY} r="124" fill="none" stroke="#f8e19a" strokeOpacity="0.35" strokeWidth="1" />
      {/* Recessed inner lip. */}
      <circle cx={CX} cy={CY} r="119" fill="url(#bezelInner)" />
      <circle cx={CX} cy={CY} r="119" fill="none" stroke="#0f0a04" strokeOpacity="0.7" strokeWidth="1.5" />

      {RIVETS.map((rivet) => (
        <circle
          key={`${rivet.x}-${rivet.y}`}
          cx={rivet.x}
          cy={rivet.y}
          r="2.1"
          fill="url(#bezel)"
          stroke="#5d3a0e"
          strokeWidth="0.7"
        />
      ))}

      {/* Aged paper dial. */}
      <circle cx={CX} cy={CY} r="113" fill="url(#dialFace)" />
      <circle cx={CX} cy={CY} r="112" fill="none" stroke="rgba(90,58,14,0.45)" strokeWidth="2" />
      <circle cx={CX} cy={CY} r="92" fill="none" stroke="rgba(124,77,16,0.3)" strokeWidth="1" />

      {/* Engraved degree ticks. */}
      {TICKS.map((tick) => (
        <line
          key={`${tick.x1}-${tick.y1}`}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke={tick.major ? 'rgba(74,44,18,0.75)' : 'rgba(74,44,18,0.4)'}
          strokeWidth={tick.major ? 1.8 : 0.9}
          strokeLinecap="round"
        />
      ))}

      {/* Numerals every 30°. */}
      {NUMERALS.map((numeral) => (
        <text
          key={numeral.value}
          x={numeral.x}
          y={numeral.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight="600"
          fontFamily="Georgia, 'Times New Roman', serif"
          fill="#5d3a0e"
        >
          {numeral.value}
        </text>
      ))}

      {/* Cardinal letters. */}
      {LETTERS.map((letter) => (
        <text
          key={letter.letter}
          x={letter.x}
          y={letter.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="17"
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
          fill="#4a2c0c"
        >
          {letter.letter}
        </text>
      ))}

      {/* The rose — turns beneath the needle. */}
      <g className={`animate-compass-rose ${boosted ? 'compass-boost' : ''}`}>
        <path d={ROSE_PATH} fill="url(#roseGold)" stroke="#5f3a0c" strokeWidth="1.2" filter="url(#lift)" />
        <path d={CARDINAL_PATH} fill="url(#roseBronze)" stroke="#3f2709" strokeWidth="0.9" />
        <circle cx={CX} cy={CY} r="6" fill="url(#hubGold)" stroke="#5d3a0e" strokeWidth="0.9" />
      </g>

      {/* The magnetic needle, swaying gently at anchor. */}
      <g className="animate-compass-needle">
        <path
          d={`M${CX},${CY} L${CX + 4.5},${CY} L${CX},${CY - 35} L${CX - 4.5},${CY} Z`}
          fill="url(#needleNorth)"
          stroke="#2b0d05"
          strokeWidth="0.7"
          filter="url(#lift)"
        />
        <path
          d={`M${CX},${CY} L${CX + 4.5},${CY} L${CX},${CY + 35} L${CX - 4.5},${CY} Z`}
          fill="url(#needleSouth)"
          stroke="#0d0e10"
          strokeWidth="0.7"
        />
        <circle cx={CX} cy={CY} r="7.5" fill="url(#hubGold)" stroke="#5d3a0e" strokeWidth="1" filter="url(#lift)" />
        <circle cx={CX} cy={CY} r="2.8" fill="#3a2410" />
        <circle cx={CX - 1} cy={CY - 1} r="0.9" fill="#fbe394" opacity="0.9" />
      </g>
    </svg>
  );
}
