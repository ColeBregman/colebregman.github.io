import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// @ts-ignore
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// @ts-ignore
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const MODEL_URL = '/assets/audiobook_model.glb';
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/**
 * Exploded → reassembling 3D hero for the ode. audiobook player.
 * Scroll through the tall section: the parts fly together into the finished
 * device (Apple-teardown style), then it's yours to drag and rotate.
 */
export function DeviceShowcase() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(0); // 0 exploded · 1 assembling · 2 done
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xe6eaf2, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.7);
    key.position.set(-0.4, 0.6, 0.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd7e4ff, 0.7);
    fill.position.set(0.6, -0.1, 0.35);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.5);
    rim.position.set(0.1, 0.3, -0.6);
    scene.add(rim);

    const model = new THREE.Group();
    scene.add(model);

    type Part = { m: THREE.Object3D; base: THREE.Vector3; expl: THREE.Vector3 };
    const parts: Part[] = [];
    let camDist = 0.5;
    let disposed = false;

    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load(
      MODEL_URL,
      (gltf: { scene: THREE.Object3D }) => {
        if (disposed) return;
        const root = gltf.scene;
        scene.add(root);
        // normalise: centre at origin, scale to a consistent size
        const box0 = new THREE.Box3().setFromObject(root);
        const size0 = box0.getSize(new THREE.Vector3());
        const center0 = box0.getCenter(new THREE.Vector3());
        const scale = 0.24 / Math.max(size0.x, size0.y, size0.z);
        root.scale.setScalar(scale);
        root.position.sub(center0.multiplyScalar(scale));
        root.updateMatrixWorld(true);

        // which axis is the thin "assembly stack" axis
        const stackAxis = size0.x <= size0.y && size0.x <= size0.z ? 'x'
          : size0.y <= size0.z ? 'y' : 'z';

        // flatten: attach every mesh to `model`, preserving world transform
        const meshes: THREE.Object3D[] = [];
        root.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o); });
        meshes.forEach((mesh) => {
          const mm = mesh as THREE.Mesh;
          mm.castShadow = mm.receiveShadow = false;
          // tighten any pure-white plastic so it reads on a white page
          const mat = mm.material as THREE.MeshStandardMaterial;
          if (mat && 'roughness' in mat) {
            if (mat.metalness < 0.2) mat.roughness = Math.min(mat.roughness ?? 0.6, 0.75);
          }
          model.attach(mesh);
        });
        scene.remove(root);

        // recompute centre in model space, build explode vectors
        const box = new THREE.Box3().setFromObject(model);
        const c = box.getCenter(new THREE.Vector3());
        const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
        const AX = stackAxis as 'x' | 'y' | 'z';
        model.children.slice().forEach((m, i) => {
          const base = m.position.clone();
          // use each part's own centroid so large shells get a true direction
          const pc = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
          const rel = pc.sub(c);
          const expl = rel.clone().multiplyScalar(1.35);         // in-plane fan
          const a = rel[AX];
          // strong, guaranteed separation along the assembly axis so even the
          // two case shells fly apart (not just the small internals)
          const sign = Math.abs(a) > radius * 0.01 ? Math.sign(a) : (i % 2 ? 1 : -1);
          expl[AX] += sign * (radius * 1.15 + Math.abs(a) * 2.4);
          parts.push({ m, base, expl });
        });

        camDist = radius / Math.sin((camera.fov * Math.PI) / 360) * 1.55;
        camera.position.set(0, radius * 0.12, camDist);
        camera.lookAt(0, 0, 0);
        setLoaded(true);
      },
      undefined,
      () => { if (!disposed) setFailed(true); }
    );

    // ---- interaction + scroll state ----
    let progress = 0;          // 0..1 through the tall section
    let dragRX = 0.05, dragRY = 0;
    let velRY = 0, velRX = 0;
    let dragging = false, px = 0, py = 0, idle = 0;
    let lastPhase = -1;

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      progress = clamp(-rect.top / Math.max(1, total));
    };
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); onResize();

    const down = (e: PointerEvent) => {
      dragging = true; idle = 0; px = e.clientX; py = e.clientY;
      canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
      dragRY += dx * 0.008; dragRX += dy * 0.008;
      dragRX = clamp(dragRX, -0.9, 0.9); velRY = dx * 0.008; velRX = dy * 0.008;
    };
    const up = () => { dragging = false; canvas.style.cursor = 'grab'; };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const rect = wrap.getBoundingClientRect();
      const onScreen = rect.bottom > -50 && rect.top < window.innerHeight + 50;
      if (!onScreen && !dragging) return;

      const assembly = smooth(0.04, 0.72, progress);
      for (const p of parts) {
        p.m.position.set(
          p.base.x + p.expl.x * (1 - assembly),
          p.base.y + p.expl.y * (1 - assembly),
          p.base.z + p.expl.z * (1 - assembly)
        );
      }
      // base rotation turns as it assembles
      const baseRY = THREE.MathUtils.lerp(-0.7, 0.2, assembly);
      if (!dragging) {
        velRY *= 0.9; velRX *= 0.9;
        idle++;
        if (assembly > 0.98 && !reduce && idle > 40) dragRY += 0.0022;
      }
      model.rotation.y = baseRY + dragRY;
      model.rotation.x = dragRX;

      renderer.render(scene, camera);

      const ph = progress < 0.12 ? 0 : assembly < 0.98 ? 1 : 2;
      if (ph !== lastPhase) { lastPhase = ph; setPhase(ph); }
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      renderer.dispose();
      pmrem.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
    };
  }, []);

  if (failed) return null; // fall back to the static hero silently

  return (
    <section ref={wrapRef} className="relative w-full bg-white" style={{ height: '320vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* subtle radial ground so the light device sits on the page */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(60% 55% at 50% 46%, rgba(43,87,196,0.06), rgba(255,255,255,0) 70%)' }}
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ touchAction: 'pan-y', cursor: 'grab' }} />

        {/* eyebrow */}
        <div className="absolute left-0 right-0 top-[13vh] flex flex-col items-center px-6 text-center">
          <div className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.24em] text-[#2b57c4]">
            Designed &amp; built from scratch
          </div>
          <h2 className="mt-3 text-4xl sm:text-6xl font-black tracking-tighter text-black">
            Every component, exploded.
          </h2>
        </div>

        {/* rotating caption stack, cross-fading with scroll phase */}
        <div className="absolute bottom-[9vh] left-0 right-0 px-6 text-center">
          <Caption show={phase === 0}>Every component, modeled and exploded.</Caption>
          <Caption show={phase === 1}>Scroll to bring it together.</Caption>
          <Caption show={phase === 2} accent>
            The finished device — drag to rotate.
          </Caption>
        </div>

        {!loaded && !failed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-[#2b57c4]" />
          </div>
        )}
      </div>
    </section>
  );
}

function Caption({ show, accent, children }: { show: boolean; accent?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="absolute left-0 right-0 mx-auto transition-all duration-500"
      style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(8px)' }}
    >
      <p className={`text-lg sm:text-2xl font-medium ${accent ? 'text-[#2b57c4]' : 'text-black'}`}>
        {children}
      </p>
    </div>
  );
}
