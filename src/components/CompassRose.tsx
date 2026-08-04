import { useEffect } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../lib/useThreeScene';

const GOLD_FRONT = 0xe2b24a;
const GOLD_SIDE = 0x9c6b1c;
const GOLD_DARK = 0x8a5a17;
const NORTH = 0xb33a1f;
const SOUTH = 0x3a3d42;
const RING_SEGMENTS = 96;
/** Scale of the whole instrument so the dial just fits the canvas at the default camera. */
const BASE_SCALE = 1.48;
const DIAL_RADIUS = 1.36;
const TREASURE_EVENT = 'rept:treasure';

interface CompassRoseProps {
  height?: number;
  width?: number;
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
 * The dial face painted in 2D: brushed navy plate, engraved degree ticks,
 * numerals every 30° and a vignette — far sharper than extruded geometry.
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

  const face = ctx.createRadialGradient(c, c, r * 0.05, c, c, r);
  face.addColorStop(0, '#1a3054');
  face.addColorStop(0.55, '#12233c');
  face.addColorStop(1, '#0c1626');
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(226,178,74,0.3)';
  ctx.lineWidth = 2;
  for (const ratio of [0.72, 0.78]) {
    ctx.beginPath();
    ctx.arc(c, c, r * ratio, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = 0; i < 72; i += 1) {
    const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
    const major = i % 6 === 0;
    const inner = major ? r * 0.8 : r * 0.85;
    const outer = r * 0.9;
    ctx.strokeStyle = major ? 'rgba(242,210,145,0.95)' : 'rgba(242,210,145,0.5)';
    ctx.lineWidth = major ? 5 : 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * inner, c + Math.sin(a) * inner);
    ctx.lineTo(c + Math.cos(a) * outer, c + Math.sin(a) * outer);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(242,210,145,0.92)';
  ctx.font = '600 58px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const labelR = r * 0.6;
  for (let deg = 0; deg < 360; deg += 30) {
    const a = (deg * Math.PI) / 180 - Math.PI / 2;
    ctx.fillText(String(deg), c + Math.cos(a) * labelR, c + Math.sin(a) * labelR);
  }

  const vignette = ctx.createRadialGradient(c, c, r * 0.55, c, c, r);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vignette;
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.fill();

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

/** Polished brass — image-based lighting does the reflective work. */
function goldStandard(color: number) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: 0.24,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    emissive: 0x241603,
    emissiveIntensity: 0.12,
  });
}

function buildRose(group: THREE.Group) {
  // Light rig on top of the baked environment for a little extra punch.
  group.add(new THREE.AmbientLight(0xfff2d4, 0.5));
  const key = new THREE.DirectionalLight(0xfff2e0, 1.2);
  key.position.set(2.5, 3, 5);
  group.add(key);
  const rim = new THREE.DirectionalLight(0xffc76a, 0.5);
  rim.position.set(-3, -1.5, 2);
  group.add(rim);

  // Dial face with engraved ticks + numerals.
  const dial = new THREE.Mesh(
    new THREE.CircleGeometry(DIAL_RADIUS, RING_SEGMENTS),
    new THREE.MeshStandardMaterial({
      map: drawDialTexture(),
      metalness: 0.3,
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
  );
  dial.position.z = -0.01;
  group.add(dial);

  // Thin brass rim where the dial meets the bezel.
  const dialRim = new THREE.Mesh(
    new THREE.RingGeometry(DIAL_RADIUS, DIAL_RADIUS + 0.02, RING_SEGMENTS),
    goldStandard(GOLD_SIDE),
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
  const rose = new THREE.Mesh(roseGeo, goldStandard(GOLD_FRONT));
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
  const cardinal = new THREE.Mesh(cardinalGeo, goldStandard(GOLD_DARK));
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
      roughness: 0.4,
      emissive: 0x1a0502,
      emissiveIntensity: 0.1,
    }),
  );
  const south = new THREE.Mesh(
    new THREE.ShapeGeometry(needleHalf(-1)),
    new THREE.MeshStandardMaterial({ color: SOUTH, metalness: 0.7, roughness: 0.3 }),
  );
  north.position.z = 0.16;
  south.position.z = 0.16;
  needleGroup.add(north, south);

  // Brass hub + centre pin over the needle's equator.
  const hub = new THREE.Mesh(
    new THREE.RingGeometry(0.045, 0.085, 32),
    new THREE.MeshBasicMaterial({ color: GOLD_FRONT, side: THREE.DoubleSide }),
  );
  hub.position.z = 0.18;
  needleGroup.add(hub);
  const pin = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 16, 12),
    goldStandard(GOLD_SIDE),
  );
  pin.position.z = 0.21;
  needleGroup.add(pin);
  group.add(needleGroup);

  // Bezel — a machined brass torus sitting on the dial's rim.
  const outer = new THREE.Group();
  outer.name = 'outer';
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(1.24, 0.04, 16, RING_SEGMENTS),
    goldStandard(GOLD_SIDE),
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
 * A machined 3D compass: brass bezel, painted dial with degree ticks and
 * numerals, an extruded golden rose and a fixed red magnetic needle. Baked
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
