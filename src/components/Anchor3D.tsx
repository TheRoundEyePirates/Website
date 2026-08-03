import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GOLD = 0xb45309;
const DARK_GOLD = 0x8a5a17;

interface Anchor3DProps {
  height?: number;
  width?: number;
}

/**
 * A low-poly golden anchor. It sways gently like a moored ship, pausing
 * whenever it leaves the viewport or the tab is hidden.
 */
export default function Anchor3D({ height = 110, width = 110 }: Anchor3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (error) {
      console.warn('[Anchor3D] WebGL unavailable, skipping scene.', error);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const group = new THREE.Group();
    scene.add(group);

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

    let inView = true;
    let documentVisible = !document.hidden;
    let frame = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    observer.observe(mount);

    const onVisibilityChange = () => {
      documentVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const clock = new THREE.Clock();

    const tick = () => {
      frame = requestAnimationFrame(tick);
      clock.getDelta();

      if (inView && documentVisible) {
        if (!reducedMotion) {
          const t = clock.elapsedTime;
          group.rotation.z = Math.sin(t * 0.6) * 0.08;
          group.position.y = Math.sin(t * 0.4) * 0.04;
        }
        renderer.render(scene, camera);
      }
    };

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      gold.dispose();
      darkGold.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [height, width]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="mx-auto"
      style={{ width, height }}
    />
  );
}
