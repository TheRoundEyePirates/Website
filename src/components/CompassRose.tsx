import { useEffect } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../lib/useThreeScene';

const GOLD_FRONT = 0xe2b24a;
const GOLD_SIDE = 0x9c6b1c;
const GOLD_DARK = 0x8a5a17;
const NORTH = 0xa33a22;
const SOUTH = 0x4a4a4d;
const RING_SEGMENTS = 96;
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
  const len = 0.52;
  const w = 0.085;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(flip * w, 0);
  shape.lineTo(0, flip * len);
  shape.lineTo(-flip * w, 0);
  shape.closePath();
  return shape;
}

/** 72 fine degree marks around the bezel, emphasised every 15°. */
function tickRingGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const count = 72;
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    const major = i % 3 === 0;
    const r0 = major ? 1.2 : 1.24;
    const r1 = major ? 1.36 : 1.3;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    positions.push(cos * r0, sin * r0, 0.001, cos * r1, sin * r1, 0.001);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function goldStandard(color: number) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.55,
    roughness: 0.3,
    emissive: 0x241603,
    emissiveIntensity: 0.25,
  });
}

function buildRose(group: THREE.Group) {
  // Light rig — warm key + amber rim over a soft ambient fill.
  group.add(new THREE.AmbientLight(0xfff2d4, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2.5, 3, 5);
  group.add(key);
  const rim = new THREE.DirectionalLight(0xffc76a, 0.8);
  rim.position.set(-3, -1.5, 2);
  group.add(rim);

  // The 8-point rose, extruded + bevelled so the bevel catches the light.
  const roseGeo = new THREE.ExtrudeGeometry(starShape(1, 0.42, 8), {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 3,
  });
  const rose = new THREE.Mesh(roseGeo, goldStandard(GOLD_FRONT));
  rose.name = 'rose';
  group.add(rose);

  // Cardinal emphasis, raised slightly above the rose.
  const cardinalGeo = new THREE.ExtrudeGeometry(starShape(0.82, 0.06, 4), {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 2,
  });
  const cardinal = new THREE.Mesh(cardinalGeo, goldStandard(GOLD_DARK));
  cardinal.position.z = 0.05;
  group.add(cardinal);

  // The magnetic needle — fixed in heading while the rose turns beneath it.
  const needleGroup = new THREE.Group();
  needleGroup.name = 'needle';
  const north = new THREE.Mesh(new THREE.ShapeGeometry(needleHalf(1)), new THREE.MeshBasicMaterial({ color: NORTH }));
  const south = new THREE.Mesh(new THREE.ShapeGeometry(needleHalf(-1)), new THREE.MeshBasicMaterial({ color: SOUTH }));
  north.position.z = 0.16;
  south.position.z = 0.16;
  needleGroup.add(north, south);

  const pivot = new THREE.Mesh(
    new THREE.CircleGeometry(0.055, 24),
    new THREE.MeshBasicMaterial({ color: GOLD_FRONT }),
  );
  pivot.position.z = 0.18;
  needleGroup.add(pivot);
  group.add(needleGroup);

  // Bezel + degree ticks, drifting counter to the rose for an instrument feel.
  const outer = new THREE.Group();
  outer.name = 'outer';
  const bezel = new THREE.Mesh(
    new THREE.RingGeometry(1.18, 1.42, RING_SEGMENTS),
    new THREE.MeshBasicMaterial({ color: GOLD_SIDE, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
  );
  outer.add(bezel);
  const tickMaterial = new THREE.LineBasicMaterial({ color: GOLD_DARK, transparent: true, opacity: 0.9 });
  outer.add(new THREE.LineSegments(tickRingGeometry(), tickMaterial));
  group.add(outer);
}

function animateRose(group: THREE.Group, delta: number, elapsed: number) {
  const boostUntil = (group.userData.boostUntil as number | undefined) ?? 0;
  const boost = performance.now() < boostUntil ? 6 : 1;

  const rose = group.getObjectByName('rose');
  const outer = group.getObjectByName('outer');
  const needle = group.getObjectByName('needle');
  const bob = Math.sin(elapsed * 0.6) * 0.05;

  if (rose) {
    rose.rotation.z += delta * 0.15 * boost;
    rose.position.y = bob;
  }
  if (outer) {
    outer.rotation.z -= delta * 0.05;
  }
  if (needle) {
    needle.position.y = bob;
    needle.rotation.z = Math.sin(elapsed * 0.7) * 0.03;
  }
}

/**
 * A machined 3D compass rose: extruded golden star, cardinal accents, a
 * fixed red magnetic needle and a counter-drifting degree bezel. Spins up
 * excitedly when the treasure easter egg fires; pauses off-viewport.
 */
export default function CompassRose({ height = 200, width = 260 }: CompassRoseProps) {
  const { mountRef, groupRef } = useThreeScene({
    width,
    height,
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
