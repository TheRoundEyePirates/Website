import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GOLD = 0xb45309;
const RING_SEGMENTS = 96;

interface CompassRoseProps {
  height?: number;
  width?: number;
}

/**
 * A single, contained low-poly golden compass rose. Rotates slowly about
 * its Z axis with a gentle vertical bob. The render loop pauses whenever
 * the element leaves the viewport or the tab is hidden.
 */
export default function CompassRose({ height = 200, width = 260 }: CompassRoseProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (error) {
      console.warn('[CompassRose] WebGL unavailable, skipping scene.', error);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    const group = new THREE.Group();
    scene.add(group);

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

    const outerRingPoints = ringPoints.map((point) => point.clone().multiplyScalar(1.18));
    const outerRingGeometry = new THREE.BufferGeometry().setFromPoints(outerRingPoints);
    const outerRingMaterial = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.3 });

    // The outer ring drifts counter to the main rose for a subtle instrument feel.
    const outerGroup = new THREE.Group();
    outerGroup.add(new THREE.Line(outerRingGeometry, outerRingMaterial));
    scene.add(outerGroup);

    // Center boss.
    const centerGeometry = new THREE.CircleGeometry(0.035, 20);
    const centerMaterial = new THREE.MeshBasicMaterial({ color: GOLD });
    group.add(new THREE.Mesh(centerGeometry, centerMaterial));

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
          group.rotation.z += delta * 0.15;
          outerGroup.rotation.z -= delta * 0.05;
          group.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.05;
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

      rayGeometry.dispose();
      rayMaterial.dispose();
      innerRingGeometry.dispose();
      innerRingMaterial.dispose();
      outerRingGeometry.dispose();
      outerRingMaterial.dispose();
      centerGeometry.dispose();
      centerMaterial.dispose();
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
