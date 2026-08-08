import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

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
 * The Raging Heaven ship, loaded from GLB. The square sail is deformed every
 * frame — a bagged, gusting billow plus a fast ripple — so it reads as cloth
 * filling with wind, while the whole vessel yaws and rolls slowly at sea.
 * Pauses whenever it leaves the viewport or the tab is hidden, renders a
 * single static frame under `prefers-reduced-motion`, and falls back to the
 * static ship photo when WebGL or the model is unavailable.
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

    let sail: THREE.Mesh | null = null;
    let basePositions: Float32Array | null = null;
    let sailParams: Float32Array | null = null;
    let baseQuat: THREE.Quaternion | null = null;
    let modelReady = false;
    let disposed = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderFrame = () => renderer.render(scene, camera);

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
        }

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

        const gust = 0.55 + 0.45 * Math.sin(elapsed * 1.7 + u * 1.4 + v * 3.1);
        let displacement = 3.0 * Math.sin(v * Math.PI) * gust;
        displacement *= 0.85 + 0.15 * Math.cos(u * Math.PI);
        displacement += 0.55 * Math.sin(elapsed * 4.2 + u * 2.6 + v * 5.4) * Math.sin(v * Math.PI);

        array[i * 3] = bx;
        array[i * 3 + 1] = by + displacement;
        array[i * 3 + 2] = bz;
      }

      position.needsUpdate = true;
      geometry.computeVertexNormals();

      SWAY_QUAT.setFromAxisAngle(Y_AXIS, 0.1 + 0.08 * Math.sin(elapsed * 0.9));
      sail.quaternion.copy(baseQuat).premultiply(SWAY_QUAT);
    };

    const animate = (elapsed: number) => {
      if (!modelReady) return;
      root.rotation.y = Math.sin(elapsed * 0.22) * 0.5;
      root.rotation.z = Math.sin(elapsed * 0.4) * 0.02;
      root.position.y = Math.sin(elapsed * 0.5) * 0.015;
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
