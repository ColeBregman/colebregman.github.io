import {
  ACESFilmicToneMapping,
  BoxGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { ShelfBook } from '../../data/books';

// Shelf mechanics adapted from "The Complete Shelf" by mint.gg (MIT License):
// https://github.com/mintdotgg/mint-playground/tree/main/experiences/complete-shelf
// Rewritten for real cover textures and for embedding in a scrolling page.

export type ShelfMode = 'browse' | 'focusing' | 'inspect' | 'returning';

type ShelfCallbacks = {
  onActiveIndex: (index: number) => void;
  onMode: (mode: ShelfMode, selectedIndex: number | null) => void;
  onReady: () => void;
};

type BookPose = {
  x: number;
  z: number;
  yaw: number;
  scale: number;
};

type BrowsePhase =
  | 'retreat-current'
  | 'turn-current'
  | 'shelve-current'
  | 'extract-next'
  | 'turn-next'
  | 'settle-next';

type RuntimeBook = {
  data: ShelfBook;
  index: number;
  slot: Group;
  content: Group;
  boardMaterial: MeshStandardMaterial;
  spineMesh: Mesh<PlaneGeometry, MeshStandardMaterial>;
  frontMaterial: MeshStandardMaterial;
  backMaterial: MeshStandardMaterial | null;
  pickProxy: Mesh;
  x: number;
  width: number;
  height: number;
  thickness: number;
  pose: BookPose;
  hover: number;
  targetHover: number;
  textures: Texture[];
};

const clamp = MathUtils.clamp;

// Book proportions (2:3 covers) and shelf layout
const bookWidth = 1.08;
const bookHeight = 1.62;
const shelfTop = 0.34;
const bookGap = 0.05;

// Poses: books rest spine-out; the active one is pulled forward, cover-out
const shelvedYaw = Math.PI / 2;
const presentedYaw = 0;
const shelvedZ = -0.58;
const presentedZ = 0.42;
const rotationLaneZ = 0.28;
const presentedScale = 1.035;

const browseCameraDesktop = new Vector3(0, 1.32, 6.4);
const browseTarget = new Vector3(0, 1.12, 0.15);
const focusInDuration = 0.46;
const focusOutDuration = 0.34;
const desktopFocusX = -0.55;
const desktopFocusZ = 1.7;
const desktopFocusScale = 1.06;
const mobileFocusZ = 1.42;
const mobileFocusScale = 0.9;

const shelfColor = '#111111';
const shelfEdgeColor = '#000000';
const pageColor = '#ede7d9';
const fallbackBoard = '#9a9a9a';

const phaseDuration: Record<BrowsePhase, number> = {
  'retreat-current': 0.11,
  'turn-current': 0.14,
  'shelve-current': 0.13,
  'extract-next': 0.13,
  'turn-next': 0.14,
  'settle-next': 0.11,
};

function damp(current: number, target: number, lambda: number, delta: number) {
  return MathUtils.damp(current, target, lambda, delta);
}

function smooth(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function easeOutCubic(value: number) {
  const t = 1 - clamp(value, 0, 1);
  return 1 - t * t * t;
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

// Deterministic per-book variation so the shelf feels hand-collected
function seededVariation(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 997;
  }
  return hash / 997;
}

function browsePose(phase: BrowsePhase, progress: number): BookPose {
  const t = smooth(progress);
  switch (phase) {
    case 'retreat-current':
      return { x: 0, z: lerp(presentedZ, rotationLaneZ, t), yaw: presentedYaw, scale: lerp(presentedScale, 1, t) };
    case 'turn-current':
      return { x: 0, z: rotationLaneZ, yaw: lerp(presentedYaw, shelvedYaw, t), scale: 1 };
    case 'shelve-current':
      return { x: 0, z: lerp(rotationLaneZ, shelvedZ, t), yaw: shelvedYaw, scale: 1 };
    case 'extract-next':
      return { x: 0, z: lerp(shelvedZ, rotationLaneZ, t), yaw: shelvedYaw, scale: 1 };
    case 'turn-next':
      return { x: 0, z: rotationLaneZ, yaw: lerp(shelvedYaw, presentedYaw, t), scale: 1 };
    case 'settle-next':
      return { x: 0, z: lerp(rotationLaneZ, presentedZ, t), yaw: presentedYaw, scale: lerp(1, presentedScale, t) };
  }
}

function shelvedPose(): BookPose {
  return { x: 0, z: shelvedZ, yaw: shelvedYaw, scale: 1 };
}

function presentedPose(): BookPose {
  return { x: 0, z: presentedZ, yaw: presentedYaw, scale: presentedScale };
}

function focusedPose(progress: number, focusX: number, focusZ: number, focusScale: number): BookPose {
  const value = clamp(progress, 0, 1);
  const clearance = smooth(Math.min(1, value / 0.55));
  const presentation = smooth(Math.max(0, (value - 0.55) / 0.45));
  return {
    x: lerp(0, focusX, presentation),
    z: lerp(presentedZ, focusZ, clearance),
    yaw: presentedYaw,
    scale: lerp(presentedScale, focusScale, presentation),
  };
}

// The cover's dominant color: histogram over a downsampled copy, with a mild
// preference for saturated buckets so the book's "brand" color wins over
// large neutral backgrounds when the counts are close.
function dominantColorFrom(image: CanvasImageSource): Color | null {
  const sample = document.createElement('canvas');
  sample.width = 24;
  sample.height = 36;
  const ctx = sample.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, sample.width, sample.height);
  const { data } = ctx.getImageData(0, 0, sample.width, sample.height);

  const buckets = new Map<number, { score: number; r: number; g: number; b: number; n: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key) ?? { score: 0, r: 0, g: 0, b: 0, n: 0 };
    bucket.score += 1 + saturation * 1.5;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.n += 1;
    buckets.set(key, bucket);
  }

  let best: { score: number; r: number; g: number; b: number; n: number } | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.score > best.score) best = bucket;
  }
  if (!best) return null;
  return new Color(best.r / best.n / 255, best.g / best.n / 255, best.b / best.n / 255);
}

// Generated spine: the cover's dominant color as a solid, with the title
// lettered down it. Replaced entirely by book.spineUrl when one is provided.
function drawSpineTexture(book: ShelfBook, color: Color, height: number, thickness: number) {
  const canvas = document.createElement('canvas');
  const scale = 220;
  canvas.width = Math.round(thickness * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = `#${color.getHexString()}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle vertical shading toward the edges of the spine
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, 'rgba(0,0,0,0.22)');
  gradient.addColorStop(0.14, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.86, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title running down the spine
  const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  ctx.fillStyle = luminance > 0.45 ? 'rgba(17,17,17,0.92)' : 'rgba(255,255,255,0.95)';
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 2);
  const title = book.title.split('\n')[0].replace(/"/g, '');
  const maxTextWidth = canvas.height * 0.82;
  let fontSize = Math.round(canvas.width * 0.42);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  do {
    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    fontSize -= 1;
  } while (ctx.measureText(title).width > maxTextWidth && fontSize > 8);
  ctx.fillText(title, 0, 0, maxTextWidth);
  ctx.restore();

  return canvas;
}

export class BookShelfEngine {
  private canvas: HTMLCanvasElement;
  private booksData: ShelfBook[];
  private callbacks: ShelfCallbacks;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private controls: OrbitControls;
  private shelfGroup = new Group();
  private shelfFurniture = new Group();
  private runtimeBooks: RuntimeBook[] = [];
  private pickTargets: Object3D[] = [];
  private raycaster = new Raycaster();
  private pointer = new Vector2(10, 10);
  private animationFrame = 0;
  private resizeObserver: ResizeObserver;
  private mode: ShelfMode = 'browse';
  private selectedIndex: number | null = null;
  private activeIndex = 0;
  private presentedIndex: number | null = 0;
  private pendingFocusIndex: number | null = null;
  private browsePhase: BrowsePhase | 'idle' = 'idle';
  private browseProgress = 0;
  private motionBookIndex: number | null = null;
  private scrollIndex = 0;
  private targetScrollIndex = 0;
  private focusProgress = 0;
  private lastInputTime = 0;
  private pointerDown = false;
  private pointerId: number | null = null;
  private pointerStartX = 0;
  private pointerLastX = 0;
  private pointerTravel = 0;
  private reducedMotion = false;
  private focusCameraPosition = new Vector3();
  private focusCameraTarget = new Vector3();
  private responsiveBrowseCamera = browseCameraDesktop.clone();
  private lastTimestamp = 0;
  private isDisposed = false;
  private running = false;
  private visibilityObserver: IntersectionObserver;
  // On-demand rendering: draw only while something moves or a one-shot is queued
  private renderRequested = true;
  // Books exist only after async init measures any real spine images
  private built = false;
  private canvasVisible = true;
  private spineDims = new Map<string, { w: number; h: number }>();

  constructor(canvas: HTMLCanvasElement, books: ShelfBook[], callbacks: ShelfCallbacks) {
    this.canvas = canvas;
    this.booksData = books;
    this.callbacks = callbacks;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.03;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;

    this.camera = new PerspectiveCamera(27, 1, 0.08, 80);
    this.camera.position.copy(browseCameraDesktop);
    this.camera.lookAt(browseTarget);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enabled = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.enablePan = false;
    this.controls.enableZoom = true;
    this.controls.minDistance = 2.6;
    this.controls.maxDistance = 7;
    this.controls.minPolarAngle = Math.PI * 0.22;
    this.controls.maxPolarAngle = Math.PI * 0.78;

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.setupScene();
    this.bindEvents();
    this.resizeObserver.observe(canvas);
    this.handleResize();

    // Render only while the shelf is on screen — costs nothing once the
    // reader scrolls past it.
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.canvasVisible = entry.isIntersecting;
      if (entry.isIntersecting) {
        this.startLoop();
      } else {
        this.stopLoop();
      }
    });
    this.visibilityObserver.observe(canvas);

    void this.initBooks();
  }

  // Real spine artwork sets the book's physical thickness, so its dimensions
  // have to be known before the shelf layout is built.
  private async initBooks() {
    await Promise.all(
      this.booksData
        .filter((book) => book.spineUrl)
        .map(
          (book) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => {
                this.spineDims.set(book.id, { w: img.naturalWidth, h: img.naturalHeight });
                resolve();
              };
              img.onerror = () => resolve(); // fall back to page-count thickness
              img.src = book.spineUrl!;
            })
        )
    );
    if (this.isDisposed) return;
    this.createBooks();
    this.built = true;
    this.callbacks.onReady();
    this.requestRender();
    if (this.canvasVisible) this.startLoop();
  }

  private startLoop() {
    if (this.running || this.isDisposed || !this.built) return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.animate();
  }

  private stopLoop() {
    this.running = false;
    cancelAnimationFrame(this.animationFrame);
  }

  private setupScene() {
    // Transparent canvas: the page's own white shows through, and the books
    // cast soft shadows straight onto it.
    this.scene.background = null;

    const hemisphere = new HemisphereLight('#ffffff', '#8a8a8a', 2.4);
    this.scene.add(hemisphere);

    const key = new DirectionalLight('#ffffff', 4.2);
    key.position.set(-4.2, 7.4, 5.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -2;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 22;
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    const rim = new DirectionalLight('#dfe6ee', 1.7);
    rim.position.set(5, 3, -4);
    this.scene.add(rim);

    // Invisible ground that only catches shadows, so the books ground
    // themselves on the page without painting a gray floor
    const ground = new Mesh(
      new PlaneGeometry(44, 18),
      new ShadowMaterial({ opacity: 0.14 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.24;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.scene.add(this.shelfGroup);
    this.shelfGroup.add(this.shelfFurniture);
  }

  private createBooks() {
    let cursor = 0;

    this.booksData.forEach((book, index) => {
      // A real spine image dictates the book's proportions directly; without
      // one, spine width tracks the page count (~96p novella to ~1300p epic)
      const spine = this.spineDims.get(book.id);
      let thickness: number;
      if (spine && spine.w > 0 && spine.h > 0) {
        const aspect = spine.w > spine.h ? spine.h / spine.w : spine.w / spine.h;
        thickness = clamp(aspect * bookHeight, 0.06, 0.5);
      } else {
        thickness = clamp(0.08 + book.pages * 0.00023, 0.1, 0.4);
      }
      cursor += thickness * 0.5;
      const runtime = this.createBook(book, index, cursor, thickness);
      this.runtimeBooks.push(runtime);
      this.shelfGroup.add(runtime.slot);
      void this.loadCover(runtime);
      cursor += thickness * 0.5 + bookGap;
      // A little extra air between mood categories
      const next = this.booksData[index + 1];
      if (next && next.categoryId !== book.categoryId) {
        cursor += 0.22;
      }
    });

    this.runtimeBooks.forEach((book, index) => {
      this.applyPose(book, index === 0 ? presentedPose() : shelvedPose());
    });

    const shelfWidth = cursor + 8;
    const shelf = new Mesh(
      new RoundedBoxGeometry(shelfWidth, 0.22, 1.72, 2, 0.045),
      new MeshStandardMaterial({ color: shelfColor, roughness: 0.55, metalness: 0.05 })
    );
    // The slab doesn't cast onto the ground — its full-length shadow would
    // paint a gray band across the otherwise white page
    shelf.position.set(cursor * 0.5, shelfTop - 0.14, 0);
    shelf.receiveShadow = true;
    this.shelfFurniture.add(shelf);

    const shelfEdge = new Mesh(
      new RoundedBoxGeometry(shelfWidth, 0.12, 0.16, 2, 0.025),
      new MeshStandardMaterial({ color: shelfEdgeColor, roughness: 0.4 })
    );
    shelfEdge.position.set(cursor * 0.5, shelfTop - 0.08, 0.85);
    this.shelfFurniture.add(shelfEdge);
  }

  private createBook(book: ShelfBook, index: number, x: number, thickness: number): RuntimeBook {
    const variation = seededVariation(book.id);
    const height = bookHeight + (variation - 0.5) * 0.08;
    const width = bookWidth + (variation - 0.5) * 0.02;

    const slot = new Group();
    slot.position.set(x, shelfTop + height * 0.5, 0.04);

    const content = new Group();
    slot.add(content);

    const boardMaterial = new MeshStandardMaterial({
      color: fallbackBoard,
      roughness: 0.78,
      metalness: 0,
    });
    const paperMaterial = new MeshStandardMaterial({ color: pageColor, roughness: 0.88, metalness: 0 });

    const pageBlock = new Mesh(
      new BoxGeometry(width - 0.07, height - 0.1, Math.max(0.07, thickness - 0.05)),
      paperMaterial
    );
    pageBlock.castShadow = true;
    pageBlock.receiveShadow = true;
    content.add(pageBlock);

    const boardGeometry = new RoundedBoxGeometry(width, height, 0.03, 2, 0.02);
    const frontBoard = new Mesh(boardGeometry, boardMaterial);
    frontBoard.position.z = thickness * 0.5;
    frontBoard.castShadow = true;
    frontBoard.receiveShadow = true;
    content.add(frontBoard);

    const backBoard = new Mesh(boardGeometry, boardMaterial);
    backBoard.position.z = -thickness * 0.5;
    backBoard.castShadow = true;
    backBoard.receiveShadow = true;
    content.add(backBoard);

    const spineBoard = new Mesh(
      new RoundedBoxGeometry(0.05, height - 0.01, thickness + 0.012, 2, 0.015),
      boardMaterial
    );
    spineBoard.position.x = -width * 0.5 + 0.02;
    spineBoard.castShadow = true;
    content.add(spineBoard);

    // Real cover artwork loads in asynchronously
    const frontMaterial = new MeshStandardMaterial({
      color: fallbackBoard,
      roughness: 0.66,
      metalness: 0.02,
    });
    const frontSurface = new Mesh(new PlaneGeometry(width, height), frontMaterial);
    frontSurface.position.z = thickness * 0.5 + 0.018;
    content.add(frontSurface);

    // Real back-cover artwork, visible when the book is orbited in inspect mode
    let backMaterial: MeshStandardMaterial | null = null;
    if (book.backUrl) {
      backMaterial = new MeshStandardMaterial({
        color: fallbackBoard,
        roughness: 0.7,
        metalness: 0.02,
      });
      const backSurface = new Mesh(new PlaneGeometry(width, height), backMaterial);
      backSurface.position.z = -thickness * 0.5 - 0.018;
      backSurface.rotation.y = Math.PI;
      content.add(backSurface);
    }

    const spineMesh = new Mesh(
      new PlaneGeometry(thickness + 0.012, height - 0.008),
      new MeshStandardMaterial({ color: fallbackBoard, roughness: 0.7, metalness: 0.01 })
    );
    spineMesh.rotation.y = -Math.PI / 2;
    spineMesh.position.x = -width * 0.5 - 0.018;
    content.add(spineMesh);

    const pickProxy = new Mesh(
      new BoxGeometry(width, height, thickness + 0.07),
      new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    pickProxy.userData.bookIndex = index;
    content.add(pickProxy);
    this.pickTargets.push(pickProxy);

    return {
      data: book,
      index,
      slot,
      content,
      boardMaterial,
      spineMesh,
      frontMaterial,
      backMaterial,
      pickProxy,
      x,
      width,
      height,
      thickness,
      pose: shelvedPose(),
      hover: 0,
      targetHover: 0,
      textures: [],
    };
  }

  private async loadCover(runtime: RuntimeBook) {
    try {
      const texture = await new TextureLoader().loadAsync(runtime.data.coverUrl);
      if (this.isDisposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      runtime.frontMaterial.map = texture;
      runtime.frontMaterial.color.set('#ffffff');
      runtime.frontMaterial.needsUpdate = true;
      runtime.textures.push(texture);
      this.requestRender();

      if (runtime.data.backUrl && runtime.backMaterial) {
        const backTexture = await new TextureLoader().loadAsync(runtime.data.backUrl);
        if (this.isDisposed) {
          backTexture.dispose();
          return;
        }
        backTexture.colorSpace = SRGBColorSpace;
        backTexture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
        runtime.backMaterial.map = backTexture;
        runtime.backMaterial.color.set('#ffffff');
        runtime.backMaterial.needsUpdate = true;
        runtime.textures.push(backTexture);
        this.requestRender();
      }

      // Boards and generated spine take the cover's dominant color
      const dominant = texture.image ? dominantColorFrom(texture.image as CanvasImageSource) : null;
      if (dominant) {
        runtime.boardMaterial.color.copy(dominant.clone().multiplyScalar(0.85));
      }

      if (runtime.data.spineUrl) {
        // A real spine image replaces the generated one entirely
        const spineTexture = await new TextureLoader().loadAsync(runtime.data.spineUrl);
        if (this.isDisposed) {
          spineTexture.dispose();
          return;
        }
        spineTexture.colorSpace = SRGBColorSpace;
        spineTexture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
        // Accept horizontal scans too: rotate onto the vertical spine face
        const dims = this.spineDims.get(runtime.data.id);
        if (dims && dims.w > dims.h) {
          spineTexture.center.set(0.5, 0.5);
          spineTexture.rotation = -Math.PI / 2;
        }
        runtime.spineMesh.material.map = spineTexture;
        runtime.spineMesh.material.color.set('#ffffff');
        runtime.spineMesh.material.needsUpdate = true;
        runtime.textures.push(spineTexture);
      } else if (dominant) {
        const spineCanvas = drawSpineTexture(runtime.data, dominant, runtime.height, runtime.thickness);
        const spineTexture = new CanvasTexture(spineCanvas);
        spineTexture.colorSpace = SRGBColorSpace;
        spineTexture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
        runtime.spineMesh.material.map = spineTexture;
        runtime.spineMesh.material.color.set('#ffffff');
        runtime.spineMesh.material.needsUpdate = true;
        runtime.textures.push(spineTexture);
      }
      this.requestRender();
    } catch {
      // Keep the fallback board color if a cover fails to load
    }
  }

  private bindEvents() {
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: true });
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerCancel);
    this.canvas.addEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  // Embedded in a scrolling page: only claim horizontal wheel input and let
  // vertical scrolling pass through to the document.
  private handleWheel = (event: WheelEvent) => {
    if (!this.built || this.mode !== 'browse') return;
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    this.pendingFocusIndex = null;
    this.targetScrollIndex = clamp(
      this.targetScrollIndex + event.deltaX * 0.0024,
      0,
      this.runtimeBooks.length - 1
    );
    this.lastInputTime = performance.now();
  };

  private handlePointerDown = (event: PointerEvent) => {
    if (!this.built || this.mode !== 'browse') return;
    this.pointerDown = true;
    this.pointerId = event.pointerId;
    this.pointerStartX = event.clientX;
    this.pointerLastX = event.clientX;
    this.pointerTravel = 0;
    this.canvas.setPointerCapture(event.pointerId);
  };

  private handlePointerMove = (event: PointerEvent) => {
    this.updatePointer(event);
    if (this.mode !== 'browse') return;

    if (this.pointerDown && event.pointerId === this.pointerId) {
      this.pendingFocusIndex = null;
      const delta = event.clientX - this.pointerLastX;
      this.pointerLastX = event.clientX;
      this.pointerTravel += Math.abs(delta);
      this.targetScrollIndex = clamp(
        this.targetScrollIndex - delta / Math.max(105, this.canvas.clientWidth * 0.11),
        0,
        this.runtimeBooks.length - 1
      );
      this.lastInputTime = performance.now();
      return;
    }

    this.updateHover();
  };

  private handlePointerUp = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId) return;
    const wasClick = this.pointerTravel < 7 && Math.abs(event.clientX - this.pointerStartX) < 7;
    this.pointerDown = false;
    this.pointerId = null;
    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }
    if (this.mode === 'browse' && wasClick) {
      this.updatePointer(event);
      const hit = this.raycastBook();
      if (hit !== null) this.focusBook(hit);
    }
  };

  private handlePointerCancel = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId) return;
    this.pointerDown = false;
    this.pointerId = null;
  };

  private handlePointerLeave = () => {
    if (!this.pointerDown) {
      this.runtimeBooks.forEach((book) => {
        book.targetHover = 0;
      });
      this.canvas.style.cursor = 'grab';
    }
  };

  private handleWindowBlur = () => {
    this.pointerDown = false;
    this.pointerId = null;
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.returnToShelf();
      return;
    }
    if (this.mode !== 'browse') return;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.browseBy(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.browseBy(-1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.focusBook(this.activeIndex);
    }
  };

  private updatePointer(event: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private raycastBook() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.pickTargets, false)[0];
    return typeof hit?.object.userData.bookIndex === 'number'
      ? (hit.object.userData.bookIndex as number)
      : null;
  }

  private updateHover() {
    const hit = this.raycastBook();
    this.runtimeBooks.forEach((book) => {
      book.targetHover = book.index === hit ? 1 : 0;
    });
    this.canvas.style.cursor = hit === null ? 'grab' : 'pointer';
  }

  private xAtIndex(index: number) {
    const lower = Math.floor(index);
    const upper = Math.min(this.runtimeBooks.length - 1, Math.ceil(index));
    const fraction = index - lower;
    return lerp(this.runtimeBooks[lower]?.x ?? 0, this.runtimeBooks[upper]?.x ?? 0, fraction);
  }

  private applyPose(book: RuntimeBook, pose: BookPose) {
    book.pose = { ...pose };
    book.content.position.x = pose.x;
    book.content.position.z = pose.z;
    book.content.rotation.y = pose.yaw;
    book.content.scale.setScalar(pose.scale);
  }

  private beginFocus(index: number) {
    if (this.mode !== 'browse' || this.browsePhase !== 'idle' || this.presentedIndex !== index) return;
    this.pendingFocusIndex = null;
    this.selectedIndex = index;
    this.focusProgress = 0;
    this.mode = 'focusing';
    this.runtimeBooks.forEach((book) => {
      book.targetHover = 0;
    });
    this.callbacks.onMode(this.mode, index);
  }

  private updateBrowseMotion(delta: number) {
    if (this.browsePhase === 'idle') {
      if (this.presentedIndex === this.activeIndex) {
        if (this.pendingFocusIndex === this.activeIndex) {
          this.beginFocus(this.activeIndex);
        }
        return;
      }
      this.motionBookIndex = this.presentedIndex;
      this.browsePhase = this.motionBookIndex === null ? 'extract-next' : 'retreat-current';
      if (this.motionBookIndex === null) {
        this.motionBookIndex = this.activeIndex;
      }
      this.browseProgress = 0;
    }

    const phase = this.browsePhase;
    const motionIndex = this.motionBookIndex;
    if (motionIndex === null) return;
    const duration = this.reducedMotion
      ? Math.max(0.055, phaseDuration[phase] * 0.45)
      : phaseDuration[phase];
    this.browseProgress = clamp(this.browseProgress + delta / duration, 0, 1);
    this.applyPose(this.runtimeBooks[motionIndex], browsePose(phase, this.browseProgress));
    if (this.browseProgress < 1) return;

    this.browseProgress = 0;
    switch (phase) {
      case 'retreat-current':
        this.browsePhase = 'turn-current';
        break;
      case 'turn-current':
        this.browsePhase = 'shelve-current';
        break;
      case 'shelve-current':
        this.presentedIndex = null;
        this.motionBookIndex = this.activeIndex;
        this.browsePhase = 'extract-next';
        break;
      case 'extract-next':
        this.browsePhase = 'turn-next';
        break;
      case 'turn-next':
        this.browsePhase = 'settle-next';
        break;
      case 'settle-next':
        this.presentedIndex = motionIndex;
        this.motionBookIndex = null;
        this.browsePhase = 'idle';
        if (this.pendingFocusIndex === this.presentedIndex) {
          this.beginFocus(this.presentedIndex);
        }
        break;
    }
  }

  private requestRender() {
    this.renderRequested = true;
  }

  // True when nothing is animating, so the frame can be skipped entirely
  private isSettled() {
    if (this.mode === 'focusing' || this.mode === 'returning') return false;
    if (this.mode === 'inspect') return true; // controls.update() reports its own motion
    if (this.browsePhase !== 'idle') return false;
    if (Math.abs(this.scrollIndex - this.targetScrollIndex) > 1e-4) return false;
    if (Math.abs(this.targetScrollIndex - Math.round(this.targetScrollIndex)) > 1e-4) return false;
    if (this.focusProgress > 1e-3) return false;
    if (this.camera.position.distanceToSquared(this.responsiveBrowseCamera) > 1e-6) return false;
    for (const book of this.runtimeBooks) {
      if (Math.abs(book.hover - book.targetHover) > 1e-3) return false;
    }
    return true;
  }

  private animate = () => {
    if (this.isDisposed || !this.running) return;
    this.animationFrame = requestAnimationFrame(this.animate);
    const timestamp = performance.now();
    const delta = clamp((timestamp - this.lastTimestamp) / 1000 || 1 / 60, 0, 0.05);
    this.lastTimestamp = timestamp;

    const wasSettled = this.isSettled();
    this.updateState(delta, timestamp);
    this.updateBooks(delta);

    let controlsMoved = false;
    if (this.controls.enabled) controlsMoved = this.controls.update();

    if (!wasSettled || !this.isSettled() || controlsMoved || this.renderRequested) {
      this.renderer.render(this.scene, this.camera);
      this.renderRequested = false;
    }
  };

  private updateState(delta: number, timestamp: number) {
    if (this.mode === 'browse') {
      if (!this.pointerDown && timestamp - this.lastInputTime > 150) {
        this.targetScrollIndex = damp(
          this.targetScrollIndex,
          Math.round(this.targetScrollIndex),
          this.reducedMotion ? 18 : 8.5,
          delta
        );
      }
      this.scrollIndex = damp(this.scrollIndex, this.targetScrollIndex, this.reducedMotion ? 20 : 10, delta);
      this.focusProgress = damp(this.focusProgress, 0, 10, delta);
      this.camera.position.lerp(
        this.responsiveBrowseCamera,
        1 - Math.exp(-(this.reducedMotion ? 18 : 7) * delta)
      );
      this.camera.lookAt(browseTarget);
    } else if (this.mode === 'focusing') {
      this.focusProgress = clamp(
        this.focusProgress + delta / (this.reducedMotion ? 0.08 : focusInDuration),
        0,
        1
      );
      this.updateFocusCamera(delta);
      if (this.focusProgress >= 1) {
        this.mode = 'inspect';
        this.controls.enabled = true;
        this.controls.target.copy(this.focusCameraTarget);
        this.callbacks.onMode(this.mode, this.selectedIndex);
      }
    } else if (this.mode === 'returning') {
      this.controls.enabled = false;
      this.focusProgress = clamp(
        this.focusProgress - delta / (this.reducedMotion ? 0.08 : focusOutDuration),
        0,
        1
      );
      this.applyFocusViewOffset(easeOutCubic(this.focusProgress));
      this.camera.position.lerp(
        this.responsiveBrowseCamera,
        1 - Math.exp(-(this.reducedMotion ? 24 : 14) * delta)
      );
      this.camera.lookAt(browseTarget);
      if (this.focusProgress <= 0) {
        if (this.selectedIndex !== null) {
          this.applyPose(this.runtimeBooks[this.selectedIndex], presentedPose());
          this.presentedIndex = this.selectedIndex;
        }
        this.selectedIndex = null;
        this.mode = 'browse';
        this.callbacks.onMode(this.mode, null);
      }
    }

    const nextActive = clamp(Math.round(this.scrollIndex), 0, this.runtimeBooks.length - 1);
    if (nextActive !== this.activeIndex) {
      this.activeIndex = nextActive;
      this.callbacks.onActiveIndex(this.activeIndex);
    }
    this.shelfGroup.position.x = -this.xAtIndex(this.scrollIndex);
    if (this.mode === 'browse') {
      this.updateBrowseMotion(delta);
    }
  }

  private updateBooks(delta: number) {
    const motionFocus = this.mode === 'returning' ? this.focusProgress : easeOutCubic(this.focusProgress);
    const isolated = this.selectedIndex !== null && motionFocus > 0.72;
    this.shelfFurniture.visible = !isolated;
    const isMobile = this.canvas.clientWidth < 760;
    const focusX = isMobile ? 0 : desktopFocusX;
    const focusZ = isMobile ? mobileFocusZ : desktopFocusZ;
    const focusScale = isMobile ? mobileFocusScale : desktopFocusScale;

    if (this.selectedIndex !== null) {
      this.applyPose(
        this.runtimeBooks[this.selectedIndex],
        focusedPose(motionFocus, focusX, focusZ, focusScale)
      );
    }

    this.runtimeBooks.forEach((book) => {
      book.hover = damp(book.hover, book.targetHover, 12, delta);
      const isSelected = book.index === this.selectedIndex;
      book.content.visible = !isolated || isSelected;
      book.content.position.y = isSelected
        ? motionFocus * 0.04
        : book.index !== this.presentedIndex
          ? book.hover * 0.045
          : 0;
    });
  }

  private updateFocusCamera(delta: number) {
    if (this.selectedIndex === null) return;
    const selected = this.runtimeBooks[this.selectedIndex];
    const worldPosition = new Vector3();
    selected.content.getWorldPosition(worldPosition);
    this.frameFocusedBook(worldPosition, easeOutCubic(this.focusProgress));
    this.camera.position.lerp(
      this.focusCameraPosition,
      1 - Math.exp(-(this.reducedMotion ? 28 : 13) * delta)
    );
    this.camera.lookAt(this.focusCameraTarget);
  }

  // Shift the composition sideways so the focused book shares the frame with
  // the HTML details panel, while OrbitControls keep the book as their target.
  private applyFocusViewOffset(progress: number) {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    const isMobile = width < 760;
    const detailWidth = width <= 1020 ? Math.min(480, width * 0.46) : Math.min(560, width * 0.4);
    const focusDistance = isMobile ? 5.8 : 5.4;
    const verticalHalfSpan = Math.tan(MathUtils.degToRad(this.camera.fov * 0.5)) * focusDistance;
    const clamped = clamp(progress, 0, 1);
    const horizontalOffset = isMobile ? 0 : detailWidth * 0.5 * clamped;
    const verticalOffset = isMobile ? (0.34 / verticalHalfSpan) * height * 0.5 * clamped : 0;

    if (clamped <= 0.001) {
      this.camera.clearViewOffset();
      return;
    }
    this.camera.setViewOffset(width, height, horizontalOffset, verticalOffset, width, height);
  }

  private frameFocusedBook(worldPosition: Vector3, compositionProgress = 1) {
    const isMobile = this.canvas.clientWidth < 760;
    const focusDistance = isMobile ? 5.8 : 5.4;
    this.applyFocusViewOffset(compositionProgress);
    this.focusCameraTarget.copy(worldPosition);
    this.focusCameraPosition.set(
      worldPosition.x + (isMobile ? 0 : 0.55),
      worldPosition.y + 0.12,
      worldPosition.z + focusDistance
    );
  }

  private handleResize = () => {
    this.requestRender();
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    const dprCap = width < 760 ? 1.5 : 1.75;
    this.responsiveBrowseCamera.set(
      0,
      width < 760 ? 1.4 : browseCameraDesktop.y,
      width < 760 ? 8.1 : browseCameraDesktop.z
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.fov = width < 600 ? 33 : width < 920 ? 30 : 27;
    this.camera.updateProjectionMatrix();
    if (this.mode === 'browse' && this.focusProgress < 0.01) {
      this.camera.clearViewOffset();
      this.camera.position.copy(this.responsiveBrowseCamera);
      this.camera.lookAt(browseTarget);
    } else if (this.mode === 'inspect' && this.selectedIndex !== null) {
      const worldPosition = new Vector3();
      this.runtimeBooks[this.selectedIndex].content.getWorldPosition(worldPosition);
      this.frameFocusedBook(worldPosition);
      this.controls.target.copy(this.focusCameraTarget);
    }
  };

  browseBy(direction: number) {
    if (!this.built || this.mode !== 'browse') return;
    this.browseTo(Math.round(this.targetScrollIndex) + direction);
  }

  browseTo(index: number) {
    if (!this.built || this.mode !== 'browse') return;
    this.pendingFocusIndex = null;
    this.targetScrollIndex = clamp(Math.round(index), 0, this.runtimeBooks.length - 1);
    this.lastInputTime = performance.now() - 1000;
  }

  focusBook(index = this.activeIndex) {
    if (!this.built || this.mode !== 'browse') return;
    const next = clamp(Math.round(index), 0, this.runtimeBooks.length - 1);
    this.targetScrollIndex = next;
    this.scrollIndex = next;
    this.activeIndex = next;
    this.pendingFocusIndex = next;
    this.callbacks.onActiveIndex(next);
    if (this.browsePhase === 'idle' && this.presentedIndex === next) {
      this.beginFocus(next);
    }
  }

  returnToShelf() {
    if (this.mode === 'browse' && this.pendingFocusIndex !== null) {
      this.pendingFocusIndex = null;
      return;
    }
    if (this.mode === 'browse' || this.mode === 'returning') return;
    this.controls.enabled = false;
    this.mode = 'returning';
    this.callbacks.onMode(this.mode, this.selectedIndex);
  }

  dispose() {
    this.isDisposed = true;
    this.running = false;
    cancelAnimationFrame(this.animationFrame);
    this.visibilityObserver.disconnect();
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerCancel);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('blur', this.handleWindowBlur);

    this.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => material?.dispose());
    });
    this.runtimeBooks.forEach((book) => {
      book.textures.forEach((texture) => texture.dispose());
    });
    this.renderer.dispose();
  }
}
