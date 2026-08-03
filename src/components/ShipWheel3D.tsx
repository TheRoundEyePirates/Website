import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GOLD = 0xb45309;
const DARK_GOLD = 0x8a5a17;

interface ShipWheel3DProps {
  height?: number;
  width?: number;
}

/**
 * A low-poly golden ship's wheel. It slowly spins about its Z axis with a
 * gentle bob, pausing whenever it leaves the viewport or the tab is hidden.
 */
export default function ShipWheel3D({ height = 240, width = 240 }: ShipWheel3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (error) {
      console.warn('[ShipWheel3D] WebGL unavailable, skipping scene.', error);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.6;

    const group = new THREE.Group();
    scene.add(group);

    const spokeCount = 8;
    const spokeLength = 1.5;

    // Spokes radiating from the hub.
    const spokeGeometry = new THREE.BoxGeometry(0.07, spokeLength, 0.05);
    const spokeMaterial = new THREE.MeshBasicMaterial({ color: GOLD });
    const spokes: THREE.Mesh[] = [];
    for (let i = 0; i < spokeCount; i += 1) {
      const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
      spoke.rotation.z = (i / spokeCount) * Math.PI;
      group.add(spoke);
      spokes.push(spoke);
    }

    // Outer rim ring.
    const rimGeometry = new THREE.TorusGeometry(0.98, 0.045, 10, 64);
    const rimMaterial = new THREE.MeshBasicMaterial({ color: DARK_GOLD });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    group.add(rim);

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
      const delta = Math.min(clock.getDelta(), 0.05);

      if (inView && documentVisible) {
        if (!reducedMotion) {
          group.rotation.z += delta * 0.25;
          group.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.06;
          group.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.04;
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

      spokeGeometry.dispose();
      spokeMaterial.dispose();
      rimGeometry.dispose();
      rimMaterial.dispose();
      knobGeometry.dispose();
      knobMaterial.dispose();
      hubGeometry.dispose();
      hubMaterial.dispose();
      hubCapGeometry.dispose();
      hubCapMaterial.dispose();
      spokes.forEach((spoke) => spoke.geometry.dispose());
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
