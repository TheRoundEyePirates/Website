import * as THREE from 'three';
import { useThreeScene } from '../lib/useThreeScene';

const GOLD = 0xb45309;
const DARK_GOLD = 0x8a5a17;

interface Anchor3DProps {
  height?: number;
  width?: number;
}

function buildAnchor(group: THREE.Group) {
  const gold = new THREE.MeshBasicMaterial({ color: GOLD });
  const darkGold = new THREE.MeshBasicMaterial({ color: DARK_GOLD });

  // Ring at the top.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.032, 8, 24), gold);
  ring.position.y = 0.52;
  group.add(ring);

  // Stock crossing the shank near the top.
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.03), darkGold);
  stock.position.set(0, 0.4, -0.02);
  group.add(stock);

  // Shank.
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.6, 8), gold);
  shank.position.y = 0.05;
  group.add(shank);

  // Arms — a half torus bulging downward, tips pointing up.
  const arms = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.038, 8, 28, Math.PI), darkGold);
  arms.rotation.z = Math.PI;
  arms.position.y = -0.25;
  group.add(arms);

  // Crown at the lowest point of the arms.
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), gold);
  crown.position.y = -0.55;
  group.add(crown);

  // Flukes at the tips of the arms.
  const flukeGeometry = new THREE.ConeGeometry(0.045, 0.2, 6);
  const leftFluke = new THREE.Mesh(flukeGeometry, gold);
  leftFluke.position.set(-0.3, -0.22, 0);
  leftFluke.rotation.z = 0.45;
  group.add(leftFluke);

  const rightFluke = new THREE.Mesh(flukeGeometry, gold);
  rightFluke.position.set(0.3, -0.22, 0);
  rightFluke.rotation.z = -0.45;
  group.add(rightFluke);
}

function animateAnchor(group: THREE.Group, _delta: number, elapsed: number) {
  group.rotation.z = Math.sin(elapsed * 0.6) * 0.08;
  group.position.y = Math.sin(elapsed * 0.4) * 0.04;
}

/**
 * A low-poly golden anchor. It sways gently like a moored ship, pausing
 * whenever it leaves the viewport or the tab is hidden.
 */
export default function Anchor3D({ height = 110, width = 110 }: Anchor3DProps) {
  const { mountRef } = useThreeScene({
    width,
    height,
    cameraZ: 4.2,
    build: buildAnchor,
    animate: animateAnchor,
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
