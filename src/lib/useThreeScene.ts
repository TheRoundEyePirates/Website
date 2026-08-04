import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface UseThreeSceneOptions {
  width: number;
  height: number;
  /** Distance of the camera from the origin. Defaults to 5. */
  cameraZ?: number;
  /** Populate the scene's root group. Runs once per mount. */
  build: (group: THREE.Group) => void;
  /** Called every rendered frame while the element is on-screen and the
      page is visible (skipped entirely under prefers-reduced-motion). */
  animate: (group: THREE.Group, delta: number, elapsed: number) => void;
}

/**
 * One renderer / camera / scene lifecycle shared by every 3D prop on the
 * site. Handles the things all three were copy-pasting:
 *   - WebGL renderer creation (graceful when unavailable)
 *   - an always-on-viewport render loop that pauses when the element
 *     leaves the viewport or the tab is hidden
 *   - `prefers-reduced-motion` (static single render, no loop)
 *   - disposal of geometries, materials and the renderer on unmount
 */
export function useThreeScene({ width, height, cameraZ = 5, build, animate }: UseThreeSceneOptions) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  // Keep the latest callbacks without restarting the scene on re-render.
  const buildRef = useRef(build);
  buildRef.current = build;
  const animateRef = useRef(animate);
  animateRef.current = animate;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (error) {
      console.warn('[useThreeScene] WebGL unavailable, skipping scene.', error);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = cameraZ;

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;
    buildRef.current(group);

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
          animateRef.current(group, delta, clock.elapsedTime);
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
      groupRef.current = null;

      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Line ||
          object instanceof THREE.LineSegments
        ) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [width, height, cameraZ]);

  return { mountRef, groupRef };
}
