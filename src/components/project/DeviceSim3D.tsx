import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// @ts-ignore
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// @ts-ignore
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const MODEL_URL = '/assets/player_lite.glb';
const NAMES = ['knob', 'Back_Button', 'Save_button', 'on_off_switch', 'front_face', 'Buttonshell'];

/**
 * Interactive 3D device: the real (lightweight) model, drag to rotate, with the
 * live sim UI mapped onto its screen. Uses the app's bundled three.js (no CDN)
 * and a tiny hidden engine iframe as the screen's texture + logic source.
 */
export function DeviceSim3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let raf = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.001, 100);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xece9e3, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-0.5, 0.8, 0.9); scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff6ea, 0.5); fill.position.set(0.8, 0.1, 0.4); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(0.2, 0.4, -0.8); scene.add(rim);

    const pivot = new THREE.Group(); scene.add(pivot);
    const named: Record<string, THREE.Object3D[]> = {};
    let screenMesh: THREE.Mesh | null = null;
    let screenTex: THREE.CanvasTexture | null = null;

    // ---- the hidden engine (2D sim) is the texture + logic source ----
    function puck(): any {
      try { return (iframeRef.current?.contentWindow as any)?.puck; } catch { return null; }
    }
    function lcd(): HTMLCanvasElement | null {
      try { return iframeRef.current?.contentDocument?.getElementById('lcd') as HTMLCanvasElement; } catch { return null; }
    }

    // ---- load model ----
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    const failTimer = window.setTimeout(() => { if (!disposed && !loaded) setFailed(true); }, 14000);

    loader.load(MODEL_URL, (gltf: { scene: THREE.Object3D }) => {
      if (disposed) return;
      const root = gltf.scene;
      root.updateMatrixWorld(true);

      const NAVY_MAT = new THREE.MeshStandardMaterial({ color: new THREE.Color('#2b3757'), roughness: 0.5, metalness: 0 });
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const nm = NAMES.includes(o.name) ? o.name : (o.parent && NAMES.includes(o.parent.name) ? o.parent.name : null);
        if (nm) {
          (named[nm] ||= []).push(o);
          if (nm === 'Buttonshell' || nm === 'knob') m.material = NAVY_MAT;
        }
      });

      const box0 = new THREE.Box3().setFromObject(root);
      const size0 = box0.getSize(new THREE.Vector3());
      const center0 = box0.getCenter(new THREE.Vector3());

      // auto-orient: tall axis -> up, front_face normal -> camera
      const dims: [string, number][] = [['x', size0.x], ['y', size0.y], ['z', size0.z]];
      dims.sort((a, b) => b[1] - a[1]);
      const tallAxis = dims[0][0] as 'x' | 'y' | 'z';
      const btnc = new THREE.Vector3(); let bn = 0;
      ['knob', 'Back_Button', 'Save_button'].forEach((k) => (named[k] || []).forEach((mm) => {
        btnc.add(new THREE.Box3().setFromObject(mm).getCenter(new THREE.Vector3())); bn++;
      }));
      if (bn) btnc.multiplyScalar(1 / bn);
      const up = new THREE.Vector3();
      up[tallAxis] = Math.sign((btnc[tallAxis] || 1) - center0[tallAxis]) || 1;
      const front = new THREE.Vector3(0, 0, 1);
      const ff = (named['front_face'] || [])[0];
      if (ff) {
        const fb = new THREE.Box3().setFromObject(ff);
        const fs = fb.getSize(new THREE.Vector3());
        const fdims: [string, number][] = [['x', fs.x], ['y', fs.y], ['z', fs.z]];
        fdims.sort((a, b) => a[1] - b[1]);
        const fa = fdims[0][0] as 'x' | 'y' | 'z';
        const fc = fb.getCenter(new THREE.Vector3());
        front.set(0, 0, 0); front[fa] = Math.sign(fc[fa] - center0[fa]) || 1;
      }
      const right = new THREE.Vector3().crossVectors(up, front).normalize();
      const trueFront = new THREE.Vector3().crossVectors(right, up).normalize();
      const m4 = new THREE.Matrix4().makeBasis(right, up.clone().normalize(), trueFront);
      const q = new THREE.Quaternion().setFromRotationMatrix(m4).invert();

      root.position.sub(center0);
      const holder = new THREE.Group(); holder.add(root); holder.quaternion.copy(q);
      pivot.add(holder);
      pivot.updateMatrixWorld(true);

      // place the live screen disc on the model's round recess
      const box = new THREE.Box3().setFromObject(pivot);
      const size = box.getSize(new THREE.Vector3());
      let best: { c: THREE.Vector3; sz: THREE.Vector3; b: THREE.Box3 } | null = null;
      let bestScore = -1;
      pivot.traverse((o) => {
        const mm = o as THREE.Mesh;
        if (!mm.isMesh) return;
        const b = new THREE.Box3().setFromObject(o);
        const sz = b.getSize(new THREE.Vector3()); const c = b.getCenter(new THREE.Vector3());
        const circ = Math.abs(sz.x - sz.y) < sz.x * 0.35;
        const thinZ = sz.z < Math.min(sz.x, sz.y) * 0.7;
        const big = sz.x > size.x * 0.35;
        const frontish = c.z > box.min.z + size.z * 0.4;
        if (circ && thinZ && big && frontish) {
          const score = sz.x + (c.z - box.min.z);
          if (score > bestScore) { bestScore = score; best = { c, sz, b }; }
        }
      });
      const lift = Math.max(0.0016, size.z * 0.06);
      let cx: number, cy: number, radius: number;
      if (best) { cx = best.c.x; cy = best.c.y; radius = best.sz.x * 0.52; }
      else { cx = (box.min.x + box.max.x) / 2; cy = box.max.y - size.y * 0.6; radius = size.x * 0.33; }
      screenTex = new THREE.CanvasTexture(document.createElement('canvas'));
      screenTex.colorSpace = THREE.SRGBColorSpace;
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 64),
        new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })
      );
      disc.position.set(cx, cy, box.max.z + lift);
      screenMesh = disc; pivot.add(disc);

      const sph = box.getBoundingSphere(new THREE.Sphere());
      camera.position.set(0, 0, sph.radius / Math.sin((camera.fov * Math.PI) / 360) * 1.5);
      camera.lookAt(0, 0, 0);

      window.clearTimeout(failTimer);
      setLoaded(true);
    }, undefined, () => { if (!disposed) { window.clearTimeout(failTimer); setFailed(true); } });

    // ---- interaction ----
    const raycaster = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let dragging = false, moved = false, px = 0, py = 0, rotY = 0.4, rotX = 0.05, idle = 0;
    let holdTimer = 0, holdFired = false, wacc = 0;

    function hitName(e: PointerEvent): string | null {
      const r = canvas!.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(ptr, camera);
      const hits = raycaster.intersectObject(pivot, true);
      for (const h of hits) {
        if (h.object === screenMesh) return 'screen';
        let o: THREE.Object3D | null = h.object;
        while (o && o !== pivot) { if (NAMES.includes(o.name)) return o.name; o = o.parent; }
      }
      return null;
    }
    const down = (e: PointerEvent) => {
      dragging = true; moved = false; holdFired = false; px = e.clientX; py = e.clientY; idle = 0;
      canvas.setPointerCapture(e.pointerId);
      const n = hitName(e);
      holdTimer = window.setTimeout(() => {
        if (!moved) { holdFired = true; const u = puck(); if (!u) return; n === 'Back_Button' ? u.ui.goto('menu') : u.ui.hold(); }
      }, 550);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 3) { moved = true; window.clearTimeout(holdTimer); }
      rotY += dx * 0.008; rotX = Math.max(-0.9, Math.min(0.9, rotX + dy * 0.008));
    };
    const up = (e: PointerEvent) => {
      window.clearTimeout(holdTimer);
      if (dragging && !moved && !holdFired) {
        const n = hitName(e); const u = puck();
        if (u) {
          if (n === 'knob' || n === 'screen') u.ui.tap();
          else if (n === 'Back_Button') u.ui.btnSkip();
          else if (n === 'Save_button') { u.ui.capture.active ? u.ui.stopCapture() : u.ui.quickCapture(); }
          else if (n === 'Buttonshell') u.ui.toggleNote();
          else if (n === 'on_off_switch') u.ui.toggleLock();
        }
      }
      dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault(); wacc += e.deltaY; const u = puck(); if (!u) return;
      while (Math.abs(wacc) >= 80) { const d = Math.sign(wacc); wacc -= d * 80; u.ui.rotate(d, e.shiftKey); }
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', () => { dragging = false; window.clearTimeout(holdTimer); });
    canvas.addEventListener('wheel', wheel, { passive: false });

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      // bind the live screen canvas once the engine is up
      if (screenTex) {
        const c = lcd();
        if (c && screenTex.image !== c) { screenTex.image = c; }
        if (c) screenTex.needsUpdate = true;
      }
      if (!dragging) { idle++; if (idle > 40 && !reduce) rotY += 0.003; }
      pivot.rotation.y = rotY; pivot.rotation.x = rotX;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(failTimer);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('wheel', wheel);
      renderer.dispose(); pmrem.dispose();
      scene.traverse((o) => {
        const mm = o as THREE.Mesh;
        if (mm.geometry) mm.geometry.dispose();
        const mat = mm.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else if (mat) mat.dispose();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* hidden engine: runs the real sim, renders #lcd + exposes window.puck */}
      <iframe
        ref={iframeRef}
        src="/sim/engine.html"
        title="ode. engine"
        aria-hidden
        tabIndex={-1}
        style={{ position: 'absolute', width: 300, height: 300, left: -9999, top: 0, border: 0, opacity: 0.01, pointerEvents: 'none' }}
      />
      <canvas ref={canvasRef} className="block h-full w-full" style={{ touchAction: 'pan-y', cursor: 'grab' }} />
      {!loaded && !failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-[#2b57c4]" />
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-sm text-neutral-500">
          <p>The 3D view couldn't load here.</p>
          <a href="/sim/index.html" target="_blank" rel="noreferrer" className="font-medium underline" style={{ color: '#2b57c4' }}>Open the full simulator ↗</a>
        </div>
      )}
    </div>
  );
}
