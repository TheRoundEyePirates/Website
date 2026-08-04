import { useEffect } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../lib/useThreeScene';

const GOLD = 0xb45309;
const RING_SEGMENTS = 96;
const TREASURE_EVENT = 'rept:treasure';

interface CompassRoseProps {
  height?: number;
  width?: number;
}

function buildRose(group: THREE.Group) {
  const R = 1;

  // 8 rays: four full cardinal spokes, four diagonal half-spokes.
  const rays: number[] = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    if (i % 2 === 0) {
      rays.push(-cos * R, -sin * R, 0, cos * R, sin * R, 0);
    } else {
      rays.push(cos * R * 0.4, sin * R * 0.4, 0, cos * R, sin * R, 0);
    }
  }

  // Arrowheads at the tip of every ray.
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const tipX = cos * R;
    const tipY = sin * R;
    const baseX = cos * R * 0.84;
    const baseY = sin * R * 0.84;
    const wing = R * 0.14;
    const wx = -sin * wing;
    const wy = cos * wing;
    rays.push(tipX, tipY, 0, baseX + wx, baseY + wy, 0);
    rays.push(tipX, tipY, 0, baseX - wx, baseY - wy, 0);
  }

  const rayGeometry = new THREE.BufferGeometry();
  rayGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rays, 3));
  const rayMaterial = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.95 });
  group.add(new THREE.LineSegments(rayGeometry, rayMaterial));

  // Inner and outer rings.
  const ringPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= RING_SEGMENTS; i += 1) {
    const a = (i / RING_SEGMENTS) * Math.PI * 2;
    ringPoints.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0));
  }

  const innerRingGeometry = new THREE.BufferGeometry().setFromPoints(ringPoints);
  const innerRingMaterial = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55 });
  group.add(new THREE.Line(innerRingGeometry, innerRingMaterial));

  // The outer ring drifts counter to the main rose for a subtle instrument feel.
  const outerGroup = new THREE.Group();
  outerGroup.name = 'outer';
  const outerRingPoints = ringPoints.map((point) => point.clone().multiplyScalar(1.18));
  const outerRingGeometry = new THREE.BufferGeometry().setFromPoints(outerRingPoints);
  const outerRingMaterial = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.3 });
  outerGroup.add(new THREE.Line(outerRingGeometry, outerRingMaterial));
  group.add(outerGroup);

  // Center boss.
  const centerGeometry = new THREE.CircleGeometry(0.035, 20);
  const centerMaterial = new THREE.MeshBasicMaterial({ color: GOLD });
  group.add(new THREE.Mesh(centerGeometry, centerMaterial));
}

function animateRose(group: THREE.Group, delta: number, elapsed: number) {
  const boostUntil = (group.userData.boostUntil as number | undefined) ?? 0;
  const boost = performance.now() < boostUntil ? 6 : 1;
  const outer = group.getObjectByName('outer');
  group.rotation.z += delta * 0.15 * boost;
  if (outer) {
    outer.rotation.z -= delta * 0.05;
  }
  group.position.y = Math.sin(elapsed * 0.6) * 0.05;
}

/**
 * A single, contained low-poly golden compass rose. Rotates slowly about
 * its Z axis with a gentle vertical bob. Spins excitedly for a few seconds
 * whenever the site's treasure easter egg fires. The render loop pauses
 * whenever the element leaves the viewport or the tab is hidden.
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
