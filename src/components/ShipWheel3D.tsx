import * as THREE from 'three';
import { useThreeScene } from '../lib/useThreeScene';

const GOLD = 0xd4a02c;
const DARK_GOLD = 0xa87a1f;

interface ShipWheel3DProps {
  height?: number;
  width?: number;
}

function buildWheel(group: THREE.Group) {
  const spokeCount = 8;
  const spokeLength = 1.5;

  // Spokes radiating from the hub.
  const spokeGeometry = new THREE.BoxGeometry(0.07, spokeLength, 0.05);
  const spokeMaterial = new THREE.MeshBasicMaterial({ color: GOLD });
  for (let i = 0; i < spokeCount; i += 1) {
    const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
    spoke.rotation.z = (i / spokeCount) * Math.PI;
    group.add(spoke);
  }

  // Outer rim ring.
  const rimGeometry = new THREE.TorusGeometry(0.98, 0.045, 10, 64);
  const rimMaterial = new THREE.MeshBasicMaterial({ color: DARK_GOLD });
  group.add(new THREE.Mesh(rimGeometry, rimMaterial));

  // Grip knobs at the tips of the spokes.
  const knobGeometry = new THREE.SphereGeometry(0.075, 10, 8);
  const knobMaterial = new THREE.MeshBasicMaterial({ color: DARK_GOLD });
  for (let i = 0; i < spokeCount; i += 1) {
    const a = (i / spokeCount) * Math.PI;
    const knob = new THREE.Mesh(knobGeometry, knobMaterial);
    knob.position.set(Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0.03);
    group.add(knob);
  }

  // Center hub boss.
  const hubGeometry = new THREE.CylinderGeometry(0.16, 0.16, 0.09, 18);
  const hubMaterial = new THREE.MeshBasicMaterial({ color: GOLD });
  const hub = new THREE.Mesh(hubGeometry, hubMaterial);
  hub.rotation.x = Math.PI / 2;
  group.add(hub);

  const hubCapGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.11, 12);
  const hubCapMaterial = new THREE.MeshBasicMaterial({ color: DARK_GOLD });
  const hubCap = new THREE.Mesh(hubCapGeometry, hubCapMaterial);
  hubCap.rotation.x = Math.PI / 2;
  group.add(hubCap);
}

function animateWheel(group: THREE.Group, delta: number, elapsed: number) {
  group.rotation.z += delta * 0.25;
  group.position.y = Math.sin(elapsed * 0.7) * 0.06;
  group.rotation.x = Math.sin(elapsed * 0.4) * 0.04;
}

/**
 * A low-poly golden ship's wheel. It slowly spins about its Z axis with a
 * gentle bob, pausing whenever it leaves the viewport or the tab is hidden.
 */
export default function ShipWheel3D({ height = 240, width = 240 }: ShipWheel3DProps) {
  const { mountRef } = useThreeScene({
    width,
    height,
    cameraZ: 4.6,
    build: buildWheel,
    animate: animateWheel,
  });

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="mx-auto"
      style={{ width, height }}
    />
  );
}
