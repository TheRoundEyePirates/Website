import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const MODEL_URL = '/models/raging-heaven.glb';
const SAIL_NAME = 'Sail Square 3_0';

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const SWAY_QUAT = new THREE.Quaternion();
const CAMERA_DIR = new THREE.Vector3(1, 0.45, 0.35).normalize();

interface ShipModel3DProps {
  className?: string;
  fallback?: string | null;
}

/**
 * The Raging Heaven ship, loaded from GLB. The baked (near-black) colors are
 * overwritten to match the Brickwave photo — warm monochrome hull, gray masts,
 * white canvas sail — and the square sail is deformed every frame (bagged,
 * gusting billow, swinging foot, running ripple, edge flutter) so it reads as
 * cloth filling with wind. The camera is orbitable (drag to spin, scroll to
 * zoom, gentle idle auto-rotate that pauses while interacting) and the vessel
 * rolls and bobs slowly at sea. Pauses when off-screen or the tab is hidden,
 * renders a single static frame under `prefers-reduced-motion`, and falls back
 * to the static ship photo when WebGL or the model fails.
 */
export default function ShipModel3D({ className, fallback }: ShipModel3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (error) {
      console.warn('[ShipModel3D] WebGL unavailable, skipping scene.', error);
      setStatus('error');
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 100);

    let environmentTexture: THREE.Texture | null = null;
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      environmentTexture = pmrem.fromScene(room, 0.04).texture;
      scene.environment = environmentTexture;
      room.dispose();
      pmrem.dispose();
    } catch (error) {
      console.warn('[ShipModel3D] Environment lighting unavailable.', error);
      environmentTexture = null;
    }

    const hemi = new THREE.HemisphereLight(0xe8f0ff, 0x6b5a45, 2.2);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffe8c4, 3.5);
    key.position.set(3, 4, 2);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbfd0ff, 1.5);
    rim.position.set(-2.5, 1.5, -3);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xfff3dd, 0.8);
    fill.position.set(1.5, -1, 1);
    scene.add(fill);

    const root = new THREE.Group();
    scene.add(root);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const dist = 1.7;
    camera.position.set(CAMERA_DIR.x * dist, CAMERA_DIR.y * dist, CAMERA_DIR.z * dist);
    camera.lookAt(0, 0.05, 0);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderFrame = () => renderer.render(scene, camera);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !reducedMotion;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 0.9;
    controls.maxDistance = 5;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = 1.4;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.6;
    if (reducedMotion) {
      controls.addEventListener('change', renderFrame);
    } else {
      controls.addEventListener('start', () => {
        controls.autoRotate = false;
      });
      controls.addEventListener('end', () => {
        controls.autoRotate = true;
      });
    }

    let sail: THREE.Mesh | null = null;
    let basePositions: Float32Array | null = null;
    let sailParams: Float32Array | null = null;
    let baseQuat: THREE.Quaternion | null = null;
    let modelReady = false;
    let disposed = false;

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const s = 1 / Math.max(size.x, size.y, size.z);
        model.scale.multiplyScalar(s);
        model.position.copy(center).multiplyScalar(-s);

        model.traverse((object) => {
          if (object instanceof THREE.Mesh && object.name === SAIL_NAME) {
            sail = object;
          }
        });

        if (sail) {
          const geometry = sail.geometry;
          const position = geometry.getAttribute('position') as THREE.BufferAttribute;
          basePositions = new Float32Array(position.array as Float32Array);
          baseQuat = sail.quaternion.clone();

          const count = position.count;
          sailParams = new Float32Array(count * 2);
          for (let i = 0; i < count; i += 1) {
            const u = basePositions[i * 3] / 26.3;
            const v = (basePositions[i * 3 + 2] + 1.1) / 31.4;
            sailParams[i * 2] = THREE.MathUtils.clamp(u, -1, 1);
            sailParams[i * 2 + 1] = THREE.MathUtils.clamp(v, 0, 1);
          }

          // Swap the baked (very dark) sail for a bright, double-sided canvas
          // so the wind reads clearly against the dark hull.
          let colors = geometry.getAttribute('color');
          if (!colors) {
            colors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
            geometry.setAttribute('color', colors);
          }
          const colorArray = colors.array as Float32Array;
          const top = new THREE.Color(0xf7f4ee);
          const mid = new THREE.Color(0xe0d7c4);
          const bot = new THREE.Color(0xbfb39a);
          for (let i = 0; i < count; i += 1) {
            const u = sailParams[i * 2];
            const v = sailParams[i * 2 + 1];
            const color = new THREE.Color();
            if (v <= 0.5) {
              color.lerpColors(bot, mid, v * 2);
            } else {
              color.lerpColors(mid, top, (v - 0.5) * 2);
            }
            color.multiplyScalar(0.96 + 0.04 * Math.sin(u * Math.PI));
            colorArray[i * 3] = color.r;
            colorArray[i * 3 + 1] = color.g;
            colorArray[i * 3 + 2] = color.b;
          }
          colors.needsUpdate = true;

          sail.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            vertexColors: true,
            roughness: 0.82,
            metalness: 0,
            side: THREE.DoubleSide,
          });
        }

        // Overwrite the baked (near-black) colors across the whole vessel to
        // match the Brickwave photo: warm monochrome hull, gray masts and
        // rigging. The original per-vertex luminance is kept as a subtle
        // shading map so crevices stay darker.
        const recolor = (mesh: THREE.Mesh, base: THREE.Color) => {
          const geometry = mesh.geometry;
          const position = geometry.getAttribute('position') as THREE.BufferAttribute;
          let colors = geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
          if (!colors) {
            colors = new THREE.BufferAttribute(new Float32Array(position.count * 3), 3);
            geometry.setAttribute('color', colors);
          }
          const src = colors.array as Float32Array;
          for (let i = 0; i < position.count; i += 1) {
            const lum = (src[i * 3] + src[i * 3 + 1] + src[i * 3 + 2]) / 3;
            const f = Math.min(1.15, 0.72 + 1.1 * lum);
            src[i * 3] = base.r * f;
            src[i * 3 + 1] = base.g * f;
            src[i * 3 + 2] = base.b * f;
          }
          colors.needsUpdate = true;
        };

        const HULL_COLOR = new THREE.Color(0x2b2724);
        const MAST_COLOR = new THREE.Color(0x6f6a63);
        const RIGGING_COLOR = new THREE.Color(0x3a3734);
        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh) || object.name === SAIL_NAME) return;
          if (object.name === 'Rigging') recolor(object, RIGGING_COLOR);
          else if (object.name.startsWith('Mast')) recolor(object, MAST_COLOR);
          else recolor(object, HULL_COLOR);
        });

        root.add(model);
        modelReady = true;
        setStatus('ready');
        if (reducedMotion) renderFrame();
      },
      undefined,
      (error) => {
        console.warn('[ShipModel3D] Failed to load model.', error);
        setStatus('error');
      },
    );

    const updateSail = (elapsed: number) => {
      if (!sail || !basePositions || !sailParams || !baseQuat) return;
      const geometry = sail.geometry;
      const position = geometry.getAttribute('position') as THREE.BufferAttribute;
      const array = position.array as Float32Array;
      const count = position.count;

      for (let i = 0; i < count; i += 1) {
        const u = sailParams[i * 2];
        const v = sailParams[i * 2 + 1];
        const bx = basePositions[i * 3];
        const by = basePositions[i * 3 + 1];
        const bz = basePositions[i * 3 + 2];

        // Belly: pinned at the yard (top) and the foot, deepest at mid-height.
        const belly = Math.pow(Math.sin(v * Math.PI), 1.35);
        // A slow gust swells and slackens the whole cloth.
        const gust = 0.62 + 0.38 * Math.sin(elapsed * 1.6 + u * 1.2 + v * 2.4);
        // Ease off near the leeches so the cloth stays taut along the sides.
        const width = 0.55 + 0.45 * Math.cos(u * Math.PI * 0.5);
        let displacement = 3.2 * belly * gust * width;

        // The free foot lifts and drops with each gust.
        const foot = Math.pow(1 - v, 2.2) * Math.sin(u * Math.PI * 0.5);
        displacement += 1.7 * foot * (0.55 + 0.45 * Math.sin(elapsed * 1.3 + u * 1.7));

        // A ripple running up the cloth.
        displacement += 0.65 * Math.sin(elapsed * 3.4 + v * 6.5 + u * 1.8) * belly;

        // Flutter near the free edges.
        displacement += 0.35 * Math.sin(elapsed * 5.0 + u * 4.2 + v * 2.2) * Math.abs(u) * belly;

        array[i * 3] = bx;
        array[i * 3 + 1] = by + displacement;
        array[i * 3 + 2] = bz;
      }

      position.needsUpdate = true;
      geometry.computeVertexNormals();

      SWAY_QUAT.setFromAxisAngle(Y_AXIS, 0.16 + 0.12 * Math.sin(elapsed * 0.9));
      sail.quaternion.copy(baseQuat).premultiply(SWAY_QUAT);
    };

    const animate = (elapsed: number) => {
      if (!modelReady) return;
      root.rotation.z = Math.sin(elapsed * 0.4) * 0.015;
      root.position.y = Math.sin(elapsed * 0.5) * 0.012;
      updateSail(elapsed);
    };

    let inView = true;
    let documentVisible = !document.hidden;
    let raf = 0;

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
      raf = requestAnimationFrame(tick);
      clock.getDelta();
      if (inView && documentVisible) {
        if (!reducedMotion) animate(clock.elapsedTime);
        controls.update();
        renderer.render(scene, camera);
      }
    };

    if (!reducedMotion) tick();
    else renderFrame();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      controls.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });

      environmentTexture?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <div ref={mountRef} className="h-full w-full" />
      {status === 'ready' && (
        <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-[0.25em] text-ink/35">
          Drag to orbit · Scroll to zoom
        </div>
      )}
      {status !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {status === 'error' && fallback ? (
            <img
              src={fallback}
              alt="Brickwave, the team ship"
              loading="lazy"
              className="image-fade max-h-full w-full object-contain"
            />
          ) : (
            <span className="animate-pulse font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
              {status === 'loading' ? 'Raising sail…' : 'Sail torn — WebGL unavailable'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
