import { useEffect } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../lib/useThreeScene';

const GOLD_FRONT = 0xe2b24a;
const GOLD_SIDE = 0x9c6b1c;
const GOLD_DARK = 0x8a5a17;
const NORTH = 0x8e2f1a;
const SOUTH = 0x33363c;
const RING_SEGMENTS = 96;
/** Scale of the whole instrument so the dial just fits the canvas at the default camera. */
const BASE_SCALE = 1.48;
const DIAL_RADIUS = 1.36;
const TREASURE_EVENT = 'rept:treasure';

interface CompassRoseProps {
  height?: number;
  width?: number;
}

/** Deterministic PRNG so the weathering looks the same on every visit. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Classic star polygon — used for both the 8-point rose and 4-point cardinal. */
function starShape(outer: number, inner: number, points: number): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / points + Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  return shape;
}

/** Half of the magnetic needle (a thin rhombus split along its equator). */
function needleHalf(flip: 1 | -1): THREE.Shape {
  const len = 0.48;
  const w = 0.07;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(flip * w, 0);
  shape.lineTo(0, flip * len);
  shape.lineTo(-flip * w, 0);
  shape.closePath();
  return shape;
}

/**
 * The dial face painted in 2D: aged parchment stained with water, engraved
 * ink ticks, numerals every 30° and cardinal letters — an old chart-maker's
 * compass rather than a fresh modern instrument.
 */
function drawDialTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const c = size / 2;
  const r = c;
  const rand = mulberry32(37060);

  // Worn parchment base.
  const face = ctx.createRadialGradient(c, c, r * 0.05, c, c, r * 0.85);
  face.addColorStop(0, '#dcc69e');
  face.addColorStop(0.65, '#cbb07f');
  face.addColorStop(1, '#ab8a5e');
  ctx.fillStyle = face;
  ctx.fillRect(0, 0, size, size);

  // Water stains.
  for (let i = 0; i < 12; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const radius = r * (0.05 + rand() * 0.14);
    const stain = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const alpha = 0.05 + rand() * 0.08;
    stain.addColorStop(0, `rgba(120,84,42,${alpha})`);
    stain.addColorStop(1, 'rgba(120,84,42,0)');
    ctx.fillStyle = stain;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Fibres.
  for (let i = 0; i < 800; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const len = 1 + rand() * 3;
    ctx.strokeStyle = rand() > 0.5 ? 'rgba(90,62,30,0.06)' : 'rgba(255,244,214,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + len);
    ctx.stroke();
  }

  // Engraved guide rings + ticks in aged brown ink.
  const ink = 'rgba(70,44,18,0.8)';
  const inkSoft = 'rgba(70,44,18,0.45)';
  ctx.strokeStyle = inkSoft;
  ctx.lineWidth = 2;
  for (const ratio of [0.72, 0.78]) {
    ctx.beginPath();
    ctx.arc(c, c, r * ratio, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = 0; i < 72; i += 1) {
    const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
    const major = i % 6 === 0;
    const inner = major ? r * 0.82 : r * 0.86;
    const outer = r * 0.9;
    ctx.strokeStyle = major ? ink : inkSoft;
    ctx.lineWidth = major ? 4 : 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * inner, c + Math.sin(a) * inner);
    ctx.lineTo(c + Math.cos(a) * outer, c + Math.sin(a) * outer);
    ctx.stroke();
  }

  // Numerals every 30°.
  ctx.fillStyle = ink;
  ctx.font = '600 52px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const numeralR = r * 0.6;
  for (let deg = 0; deg < 360; deg += 30) {
    const a = (deg * Math.PI) / 180 - Math.PI / 2;
    ctx.fillText(String(deg), c + Math.cos(a) * numeralR, c + Math.sin(a) * numeralR);
  }

  // Cardinal letters — bold old-school serif.
  const letters: Array<[string, number]> = [
    ['N', 0],
    ['E', 90],
    ['S', 180],
    ['W', 270],
  ];
  ctx.font = '700 66px Georgia, "Times New Roman", serif';
  const letterR = r * 0.74;
  for (const [letter, deg] of letters) {
    const a = (deg * Math.PI) / 180 - Math.PI / 2;
    ctx.fillText(letter, c + Math.cos(a) * letterR, c + Math.sin(a) * letterR);
  }

  // Edge vignette — the dial ages into shadow.
  const vignette = ctx.createRadialGradient(c, c, r * 0.5, c, c, r);
  vignette.addColorStop(0, 'rgba(58,34,14,0)');
  vignette.addColorStop(1, 'rgba(58,34,14,0.55)');
  ctx.fillStyle = vignette;
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Weathered brass: scratches, verdigris blotches and pitting so the metal
 * looks like it has spent decades on the water.
 */
function makeBrassTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const rand = mulberry32(37061);

  const base = ctx.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#c99a3e');
  base.addColorStop(0.5, '#e2b24a');
  base.addColorStop(1, '#9c6b1c');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Verdigris tarnish.
  for (let i = 0; i < 26; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const radius = size * (0.04 + rand() * 0.1);
    const stain = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const alpha = 0.12 + rand() * 0.18;
    const green = rand() > 0.4 ? `rgba(82,118,96,${alpha})` : `rgba(64,86,70,${alpha})`;
    stain.addColorStop(0, green);
    stain.addColorStop(1, 'rgba(82,118,96,0)');
    ctx.fillStyle = stain;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Scratches.
  for (let i = 0; i < 120; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const len = size * (0.005 + rand() * 0.02);
    const a = rand() * Math.PI;
    ctx.strokeStyle = rand() > 0.5 ? 'rgba(255,230,160,0.2)' : 'rgba(70,45,10,0.25)';
    ctx.lineWidth = 0.7 + rand() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }

  // Pitting.
  for (let i = 0; i < 200; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    ctx.fillStyle = `rgba(50,32,8,${0.06 + rand() * 0.12})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + rand() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Soft contact shadow so the rose doesn't float above its own dial. */
function makeShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, size * 0.05, c, c, c);
  g.addColorStop(0, 'rgba(0,0,0,0.5)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.28)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

/** Weathered brass — the texture carries the ageing, IBL does the reflections. */
function goldStandard(color: number, map?: THREE.Texture) {
  return new THREE.MeshPhysicalMaterial({
    color: map ? 0xffffff : color,
    map,
    metalness: 1,
    roughness: 0.42,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
    emissive: 0x241603,
    emissiveIntensity: 0.1,
  });
}

function buildRose(group: THREE.Group) {
  const brassTexture = makeBrassTexture();

  // Light rig on top of the baked environment for a little extra punch.
  group.add(new THREE.AmbientLight(0xfff2d4, 0.5));
  const key = new THREE.DirectionalLight(0xfff2e0, 1.2);
  key.position.set(2.5, 3, 5);
  group.add(key);
  const rim = new THREE.DirectionalLight(0xffc76a, 0.5);
  rim.position.set(-3, -1.5, 2);
  group.add(rim);

  // Parchment dial face with ink engravings.
  const dial = new THREE.Mesh(
    new THREE.CircleGeometry(DIAL_RADIUS, RING_SEGMENTS),
    new THREE.MeshStandardMaterial({
      map: drawDialTexture(),
      metalness: 0,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
  );
  dial.position.z = -0.01;
  group.add(dial);

  // Thin brass rim where the dial meets the bezel.
  const dialRim = new THREE.Mesh(
    new THREE.RingGeometry(DIAL_RADIUS, DIAL_RADIUS + 0.02, RING_SEGMENTS),
    goldStandard(GOLD_SIDE, brassTexture),
  );
  dialRim.position.z = -0.005;
  group.add(dialRim);

  // Contact shadow under the rose.
  const roseShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 64),
    new THREE.MeshBasicMaterial({
      map: makeShadowTexture(),
      transparent: true,
      depthWrite: false,
    }),
  );
  roseShadow.position.z = 0.004;
  group.add(roseShadow);

  // The 8-point rose, extruded + bevelled so the bevel catches the light.
  const roseGeo = new THREE.ExtrudeGeometry(starShape(0.8, 0.36, 8), {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
  const rose = new THREE.Mesh(roseGeo, goldStandard(GOLD_FRONT, brassTexture));
  rose.name = 'rose';
  group.add(rose);

  // Cardinal emphasis, raised slightly above the rose.
  const cardinalGeo = new THREE.ExtrudeGeometry(starShape(0.66, 0.06, 4), {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.014,
    bevelSegments: 2,
  });
  const cardinal = new THREE.Mesh(cardinalGeo, goldStandard(GOLD_DARK, brassTexture));
  cardinal.position.z = 0.045;
  group.add(cardinal);

  // The magnetic needle — fixed in heading while the rose turns beneath it.
  const needleGroup = new THREE.Group();
  needleGroup.name = 'needle';
  const north = new THREE.Mesh(
    new THREE.ShapeGeometry(needleHalf(1)),
    new THREE.MeshStandardMaterial({
      color: NORTH,
      metalness: 0.35,
      roughness: 0.55,
      emissive: 0x1a0502,
      emissiveIntensity: 0.1,
    }),
  );
  const south = new THREE.Mesh(
    new THREE.ShapeGeometry(needleHalf(-1)),
    new THREE.MeshStandardMaterial({ color: SOUTH, metalness: 0.7, roughness: 0.45 }),
  );
  north.position.z = 0.16;
  south.position.z = 0.16;
  needleGroup.add(north, south);

  // Brass hub + centre pin over the needle's equator.
  const hub = new THREE.Mesh(
    new THREE.RingGeometry(0.045, 0.085, 32),
    new THREE.MeshStandardMaterial({
      map: brassTexture,
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.5,
      side: THREE.DoubleSide,
    }),
  );
  hub.position.z = 0.18;
  needleGroup.add(hub);
  const pin = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 16, 12),
    goldStandard(GOLD_SIDE, brassTexture),
  );
  pin.position.z = 0.21;
  needleGroup.add(pin);
  group.add(needleGroup);

  // Bezel — a machined brass torus sitting on the dial's rim.
  const outer = new THREE.Group();
  outer.name = 'outer';
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(1.24, 0.04, 16, RING_SEGMENTS),
    goldStandard(GOLD_SIDE, brassTexture),
  );
  bezel.rotation.x = Math.PI / 2;
  outer.add(bezel);
  group.add(outer);

  // Enlarge the instrument to fill the canvas; remember the base scale so the
  // treasure easter egg can pulse it.
  group.scale.setScalar(BASE_SCALE);
}

function animateRose(group: THREE.Group, delta: number, elapsed: number) {
  const boostUntil = (group.userData.boostUntil as number | undefined) ?? 0;
  const boosted = performance.now() < boostUntil;
  const boost = boosted ? 6 : 1;

  // Treasure easter egg gives the whole instrument a quick pulse.
  const targetScale = BASE_SCALE * (boosted ? 1.08 : 1);
  const scale = group.scale.x + (targetScale - group.scale.x) * 0.08;
  group.scale.set(scale, scale, 1);

  const rose = group.getObjectByName('rose');
  const outer = group.getObjectByName('outer');
  const needle = group.getObjectByName('needle');
  const bob = Math.sin(elapsed * 0.6) * 0.05;

  if (rose) {
    rose.rotation.z += delta * 0.18 * boost;
    rose.position.y = bob;
  }
  if (outer) {
    outer.rotation.z -= delta * 0.06;
  }
  if (needle) {
    needle.position.y = bob;
    needle.rotation.z = Math.sin(elapsed * 0.7) * 0.03;
  }
}

/**
 * A weathered 3D compass from the captain's locker: parchment dial with ink
 * engravings, tarnished brass rose and bezel, and a dark iron needle. Baked
 * studio lighting makes the metal read realistically; the camera holds a
 * slight 3/4 view. Spins up excitedly when the treasure easter egg fires.
 */
export default function CompassRose({ height = 220, width = 220 }: CompassRoseProps) {
  const { mountRef, groupRef } = useThreeScene({
    width,
    height,
    cameraPosition: [0.5, 0.6, 5],
    environment: true,
    build: buildRose,
    animate: animateRose,
  });

  useEffect(() => {
    const onTreasure = () => {
      if (groupRef.current) {
        groupRef.current.userData.boostUntil = performance.now() + 3500;
      }
    };
    document.addEventListener(TREASURE_EVENT, onTreasure);
    return () => document.removeEventListener(TREASURE_EVENT, onTreasure);
  }, [groupRef]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="mx-auto"
      style={{ width, height }}
    />
  );
}
