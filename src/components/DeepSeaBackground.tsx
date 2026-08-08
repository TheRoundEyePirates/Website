import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Fixed full-viewport Three.js backdrop: a slow-drifting field of faint
 * bioluminescent "sea sparks" (gold / ocean blue / mist) over pure black.
 *
 * Design decisions for mobile + perf:
 *  - Particle count is derived from viewport area and capped.
 *  - Pixel ratio is capped so low-end phones don't paint 3x pixels.
 *  - The render loop pauses when the tab is hidden.
 *  - `prefers-reduced-motion` renders a single static frame instead of a loop.
 *  - Everything is additive + depth-tested off, which is cheap on GPUs.
 */
export default function DeepSeaBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch (error) {
      console.warn('[DeepSeaBackground] WebGL unavailable, skipping.', error);
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    camera.position.set(0, 0, 24);

    const group = new THREE.Group();
    scene.add(group);

    const GOLD = new THREE.Color('#d4a02c');
    const BLUE = new THREE.Color('#4a7fbd');
    const MIST = new THREE.Color('#9fb4d6');
    const PALE = new THREE.Color('#ece5d3');

    const buildField = () => {
      // Remove the previous field, if any.
      while (group.children.length > 0) {
        const old = group.children[0] as THREE.Points;
        group.remove(old);
        old.geometry.dispose();
        (old.material as THREE.PointsMaterial).dispose();
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      // Fill roughly the visible band (the camera half-height at z=24 is ~13.9
      // world units), with a margin so the edges never go empty.
      const halfW = Math.max(13.9 * (w / h), 14) + 6;
      const halfH = 13.9 + 6;

      const count = Math.min(420, Math.max(70, Math.round((w * h) * 0.00022)));
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const palette = [GOLD, GOLD, GOLD, BLUE, BLUE, MIST, PALE];

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() * 2 - 1) * halfW;
        positions[i * 3 + 1] = (Math.random() * 2 - 1) * halfH;
        positions[i * 3 + 2] = (Math.random() * 2 - 1) * 10 - 2;

        const color = palette[Math.floor(Math.random() * palette.length)].clone();
        color.multiplyScalar(0.45 + Math.random() * 0.55);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 2.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: false,
      });

      const points = new THREE.Points(geometry, material);
      group.add(points);
    };

    const updateSize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    updateSize();
    buildField();

    // Pointer parallax — the whole field tilts gently toward the cursor.
    let targetX = 0;
    let targetY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let raf = 0;
    let documentVisible = !document.hidden;

    const onPointerMove = (event: PointerEvent) => {
      // Skip touch/pen so scrolling on phones doesn't tilt the field.
      if (event.pointerType !== 'mouse') return;
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      updateSize();
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildField, 200);
    };

    const onVisibilityChange = () => {
      documentVisible = !document.hidden;
    };

    const clock = new THREE.Clock();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!documentVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      parallaxX += (targetX - parallaxX) * 0.02;
      parallaxY += (targetY - parallaxY) * 0.02;

      group.rotation.y = parallaxX * 0.05;
      group.rotation.x = -parallaxY * 0.05;
      // Gentle rise and fall, like a swell on the ocean.
      group.position.y = Math.sin(elapsed * 0.12) * 1.1;
      group.rotation.z += delta * 0.002;

      renderer.render(scene, camera);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(raf);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      scene.traverse((object) => {
        if (object instanceof THREE.Points) {
          object.geometry.dispose();
          (object.material as THREE.PointsMaterial).dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-70 hidden dark:block"
    />
  );
}
