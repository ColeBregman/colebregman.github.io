import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const MODEL_URL = '/assets/player_labeled.glb';
const NAVY = '#2b57c4';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/** The build order — each stage is one cluster of named parts flying into place. */
const STAGES = [
  {
    no: '01', label: 'Compute', part: 'Raspberry Pi Zero 2 W',
    body: 'A quad-core Linux computer the size of a stick of gum. Runs the player and the on-device Whisper model that turns speech into text.',
  },
  {
    no: '02', label: 'Power', part: '1100 mAh LiPo · USB-C',
    body: 'An all-day cell, a power module, and USB-C charging tucked along the spine.',
  },
  {
    no: '03', label: 'Audio', part: 'DAC · Amp · Speaker · Mic',
    body: 'A dedicated DAC and amplifier for clean playback, and a MEMS microphone for capturing quotes and voice notes.',
  },
  {
    no: '04', label: 'Display', part: '1.28″ Round TFT',
    body: 'A single round screen — one book, one cover. No feed, no notifications.',
  },
  {
    no: '05', label: 'Controls', part: 'Encoder · Knob · Buttons',
    body: 'A knurled wheel on a rotary encoder, plus three machined buttons on springs: capture, voice, and back.',
  },
  {
    no: '06', label: 'Enclosure', part: 'Top & Back Shells',
    body: '3D-printed shells, iterated across a dozen prototypes and closed up by hand around every part.',
  },
];
const N = STAGES.length;

/** Map a node name to a build stage; -1 if it names no stage. */
function matchStage(name: string): number {
  const n = (name || '').toLowerCase();
  if (n.includes('shell')) return 5;
  if (n.includes('raspberry')) return 0;
  if (n.includes('lipo') || n.includes('1100') || n.includes('power ') ||
      n.includes('mute') || n.includes('usb')) return 1;
  if (n.includes('converter') || n.includes('analog') || n.includes('amplifier') ||
      n.includes('speaker') || n.includes('microphone') || n.includes('max98357') ||
      n.includes('dac')) return 2;
  if (n.includes('tft') || n.includes('display') || n.includes('round')) return 3;
  if (n.includes('knob') || n.includes('encoder') || n.includes('button') ||
      n.includes('spring') || n.includes('bracket') || n.includes('slider') ||
      n.includes('switch')) return 4;
  return -1;
}

/**
 * Pinned "assemble on scroll" teardown for the ode. player.
 * Left: the labeled model flies together stage by stage as you scroll.
 * Right: the component list rises in lockstep, each part named as it lands.
 * On phones it collapses to a static, draggable device + the full parts list.
 */
export function ScrollAssembly() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(-1); // -1 exploded · 0..N-1 building · N done
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const mobileRef = useRef(mobile);
  mobileRef.current = mobile;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onMq = () => setMobile(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

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

    type Part = { m: THREE.Object3D; exploded: THREE.Vector3; assembled: THREE.Vector3; stage: number };
    const parts: Part[] = [];
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

        // classify every mesh by its nearest named ancestor BEFORE flattening
        const meshes: { mesh: THREE.Object3D; stage: number }[] = [];
        root.traverse((o) => {
          if (!(o as THREE.Mesh).isMesh) return;
          let x: THREE.Object3D | null = o;
          let st = -1;
          while (x) { st = matchStage(x.name); if (st >= 0) break; x = x.parent; }
          meshes.push({ mesh: o, stage: st < 0 ? 4 : st });
        });

        meshes.forEach(({ mesh }) => {
          const mm = mesh as THREE.Mesh;
          mm.castShadow = mm.receiveShadow = false;
          const mat = mm.material as THREE.MeshStandardMaterial;
          if (mat && 'roughness' in mat) {
            if (mat.metalness < 0.2) mat.roughness = Math.min(mat.roughness ?? 0.6, 0.78);
          }
          model.attach(mesh);
        });
        scene.remove(root);

        // The source CAD file is authored *exploded* — parts are spread along
        // one axis. Find that axis (largest spread), then define two targets:
        // exploded (spread a touch further) and assembled (collapsed so the
        // layers nest into the finished device). In-plane position is preserved
        // so the parts stay aligned into a real device silhouette.
        const box = new THREE.Box3().setFromObject(model);
        const c = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const EX: 'x' | 'y' | 'z' = size.x >= size.y && size.x >= size.z ? 'x'
          : size.y >= size.z ? 'y' : 'z';

        const axi = 'xyz'.indexOf(EX);
        const IP = [0, 1, 2].filter((i) => i !== axi) as (0 | 1 | 2)[];
        const ipMax = 0.46 * Math.min(size.x, size.z); // body in-plane half-extent
        const axes = ['x', 'y', 'z'] as const;
        meshes.forEach(({ mesh, stage }) => {
          const base = mesh.position.clone();
          const pc = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
          const d = pc[EX] - c[EX]; // signed distance from centre along stack axis
          const exploded = base.clone();
          exploded[EX] = base[EX] + d * 0.42;   // pull apart ~40% further
          const assembled = base.clone();
          assembled[EX] = base[EX] - d * 0.965;  // collapse to ~3.5% spacing → shells close
          // a few parts are exploded off to the side in-plane; soft-clamp those
          // back inside the footprint, then tuck everything in slightly so the
          // shells close and edge parts (buttons, springs) nest against the body
          for (const i of IP) {
            const ax = axes[i];
            let off = pc[ax] - c[ax];
            if (Math.abs(off) > ipMax) off = Math.sign(off) * (ipMax + (Math.abs(off) - ipMax) * 0.05);
            off *= 0.9;
            assembled[ax] += (c[ax] + off) - pc[ax];
          }
          parts.push({ m: mesh, exploded, assembled, stage });
        });

        // frame on the assembled (compact) device so it fills the panel
        parts.forEach((p) => p.m.position.copy(p.assembled));
        model.updateMatrixWorld(true);
        const rAsm = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere()).radius;
        const camDist = rAsm / Math.sin((camera.fov * Math.PI) / 360) * 1.95;
        camera.position.set(0, rAsm * 0.06, camDist);
        camera.lookAt(0, 0, 0);
        setLoaded(true);
      },
      undefined,
      () => { if (!disposed) setFailed(true); }
    );

    // ---- scroll + drag state ----
    let progress = 0;
    let dragRX = 0.04, dragRY = 0;
    let velRY = 0, velRX = 0;
    let dragging = false, px = 0, py = 0, idle = 0;
    let lastActive = -2;

    // window over which the stages assemble (leaves an intro + settle)
    const P0 = 0.10, P1 = 0.86;
    const step = (P1 - P0) / N;

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      progress = clamp(-rect.top / Math.max(1, total));
    };
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
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

      const isMobile = mobileRef.current;
      // on phones the piece is always assembled (no scroll scrub)
      for (const p of parts) {
        const asm = isMobile
          ? 1
          : smooth(P0 + p.stage * step - step * 0.15, P0 + (p.stage + 1) * step, progress);
        p.m.position.set(
          p.exploded.x + (p.assembled.x - p.exploded.x) * asm,
          p.exploded.y + (p.assembled.y - p.exploded.y) * asm,
          p.exploded.z + (p.assembled.z - p.exploded.z) * asm
        );
      }

      const overall = isMobile ? 1 : smooth(P0, P1, progress);
      // the device turns to face the camera as it comes together: shallow tilt
      // while exploded (parts fan out readably) → broad screen face when whole
      const baseRY = THREE.MathUtils.lerp(-0.45, 0.44, overall);
      const baseRX = THREE.MathUtils.lerp(0.32, 0.92, overall);
      if (!dragging) {
        dragRY += velRY; dragRX += velRX;          // flick momentum
        dragRX = clamp(dragRX, -0.9, 0.9);
        velRY *= 0.9; velRX *= 0.9;
        idle++;
        if ((isMobile || overall > 0.98) && !reduce && idle > 40) dragRY += 0.0022;
      }
      model.rotation.y = baseRY + dragRY;
      model.rotation.x = baseRX + dragRX;

      renderer.render(scene, camera);

      // which stage is landing right now (drives the right-hand list)
      let a: number;
      if (isMobile) a = N;
      else if (progress < P0) a = -1;
      else if (progress >= P1) a = N;
      else a = clamp(Math.floor((progress - P0) / step), 0, N - 1);
      if (a !== lastActive) { lastActive = a; setActive(a); }
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
  }, [mobile]);

  if (failed) return null; // page still holds without the 3D teardown

  const Canvas = (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(58% 52% at 50% 46%, rgba(43,87,196,0.07), rgba(255,255,255,0) 70%)' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: 'pan-y', cursor: 'grab' }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/15" style={{ borderTopColor: NAVY }} />
        </div>
      )}
    </div>
  );

  const Rail = (
    <div className="flex flex-col">
      <div className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: NAVY }}>
        Designed &amp; built from scratch
      </div>
      <h2 className="mt-2 text-[26px] sm:text-3xl font-black tracking-tighter text-black">
        Every part, in its place.
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
        {mobile ? 'Every component, modeled and labeled.' : 'Scroll to build it — one component at a time.'}
      </p>

      <ol className="mt-5 flex flex-col gap-1">
        {STAGES.map((s, i) => {
          const state = mobile ? 'active' : active >= N ? (i === N - 1 ? 'active' : 'done')
            : active < 0 ? 'future'
            : i < active ? 'done' : i === active ? 'active' : 'future';
          const isActive = state === 'active';
          const isFuture = state === 'future';
          return (
            <li
              key={s.no}
              className="relative rounded-2xl px-4 py-2.5 transition-all duration-500 ease-out"
              style={{
                background: isActive ? 'rgba(43,87,196,0.06)' : 'transparent',
                opacity: isFuture ? 0.32 : 1,
                transform: isFuture ? 'translateY(10px)' : 'translateY(0)',
              }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="font-mono text-[11px] tabular-nums transition-colors duration-500"
                  style={{ color: isActive ? NAVY : '#a3a3a3' }}
                >
                  {s.no}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13.5px] sm:text-sm font-bold tracking-tight text-black">
                      {s.part}
                    </span>
                    <span
                      className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-500"
                      style={{ color: isActive ? NAVY : '#a3a3a3' }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div
                    className="grid transition-all duration-500 ease-out"
                    style={{
                      gridTemplateRows: isActive || mobile ? '1fr' : '0fr',
                      opacity: isActive || mobile ? 1 : 0,
                    }}
                  >
                    <p className="overflow-hidden text-[13.5px] leading-relaxed text-neutral-600"
                       style={{ marginTop: isActive || mobile ? 8 : 0 }}>
                      {s.body}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );

  // ---- mobile: single stacked, non-pinned block ----
  if (mobile) {
    return (
      <section ref={wrapRef} className="w-full bg-white px-6 py-16">
        <div className="mx-auto max-w-lg">
          <div className="relative mb-8 h-[54vh] w-full">{Canvas}</div>
          {Rail}
        </div>
      </section>
    );
  }

  // ---- desktop: pinned, two columns ----
  return (
    <section ref={wrapRef} className="relative w-full bg-white" style={{ height: '560vh' }}>
      <div className="sticky top-0 flex h-screen w-full items-start overflow-hidden">
        <div className="relative h-full flex-1">{Canvas}</div>
        <div className="flex h-full w-[42%] max-w-[540px] shrink-0 flex-col justify-center px-8 pb-10 pt-24 lg:px-14">{Rail}</div>
      </div>
    </section>
  );
}
