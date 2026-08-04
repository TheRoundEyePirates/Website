import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface UseThreeSceneOptions {
  width: number;
  height: number;
  /** Distance of the camera from the origin. Defaults to 5. */
  cameraZ?: number;
  /** Offset the camera from straight-on for a 3/4 view. Defaults to [0, 0, cameraZ]. */
  cameraPosition?: [number, number, number];
  /** Bake a neutral studio environment for image-based lighting of metals. */
  environment?: boolean;
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
export function useThreeScene({
  width,
  height,
  cameraZ = 5,
  cameraPosition,
  environment = false,
  build,
  animate,
}: UseThreeSceneOptions) {
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
    const [cameraX, cameraY, cameraZPos] = cameraPosition ?? [0, 0, cameraZ];
    camera.position.set(cameraX, cameraY, cameraZPos);
    camera.lookAt(0, 0, 0);

    // Image-based lighting: bake a soft studio environment once so metal
    // materials pick up realistic reflections instead of flat fills.
    let environmentTexture: THREE.Texture | null = null;
    if (environment) {
      try {
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        environmentTexture = pmrem.fromScene(room, 0.04).texture;
        scene.environment = environmentTexture;
        room.dispose();
        pmrem.dispose();
      } catch (error) {
        console.warn('[useThreeScene] Environment lighting unavailable.', error);
        environmentTexture = null;
      }
    }

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
          materials.forEach((material) => {
            material.map?.dispose();
            material.dispose();
          });
        }
      });

      environmentTexture?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [width, height, cameraZ, cameraPosition, environment]);

  return { mountRef, groupRef };
}
