// Puck simulator runtime: render loop, screen router, overlays, input HAL.
// On the Pi, the input section is replaced by GPIO encoder/button events and
// the canvas by the GC9A01 framebuffer — screens and store port unchanged.
import { S } from './store.js';
import { SCREENS } from './screens.js';
import { W, H, CX, CY, T, arc, dot, txt, icon, fmtTime, ease, polar } from './gfx.js';

const canvas = document.getElementById('lcd');
const SS = 2; // supersample factor for crisp text on the scaled-up LCD
const CSS = canvas.clientWidth || 480;
const dpr = window.devicePixelRatio || 1;
const ctx = canvas.getContext('2d');

// Two display modes: smooth dev rendering, or honest 240×240 device pixels
// (drawn at native res, nearest-neighbor upscaled so you see the real density).
function setupCanvas(pixelTrue) {
  if (pixelTrue) {
    canvas.width = W;
    canvas.height = H;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    canvas.classList.add('pixel');
  } else {
    canvas.width = CSS * dpr * SS;
    canvas.height = CSS * dpr * SS;
    const k = (CSS * dpr * SS) / W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    canvas.classList.remove('pixel');
  }
}
setupCanvas(false);

// ---------------- UI controller ----------------

const ui = {
  screen: null,
  screenId: '',
  locked: false,
  lockFlash: 0,
  volShow: 0,        // seconds remaining to show volume overlay
  scrubShow: 0,
  scrubDelta: 0,
  scrubTicks: 0,
  capture: { active: false, t0: 0, started: 0 },
  noteRec: { active: false, t0: 0, started: 0, wasPlaying: false },
  toasts: [],

  goto(id, params) {
    this.screen = SCREENS[id];
    this.screenId = id;
    this.screen.enter && this.screen.enter(params || {});
  },

  toast(text, { icon: ic = null, color = T.text } = {}) {
    this.toasts.push({ text, icon: ic, color, t: 0 });
    if (this.toasts.length > 2) this.toasts.shift();
  },

  // encoder rotate routed here
  rotate(d, pressed) {
    if (this.locked) { this.lockFlash = 1; return; }
    if (this.noteRec.active) return; // recording a thought — ignore the dial
    blip(660 + d * 40, 0.02);
    this.screen.rotate && this.screen.rotate(d, pressed, this);
  },
  tap() {
    if (this.locked) { this.lockFlash = 1; return; }
    if (this.noteRec.active) { this.stopNote(); return; }
    blip(880, 0.03);
    this.screen.tap && this.screen.tap(this);
  },
  hold() {
    if (this.locked) { this.lockFlash = 1; return; }
    if (this.noteRec.active) return;
    blip(520, 0.05);
    this.screen.hold && this.screen.hold(this);
  },
  btnPlay() {
    if (this.locked) { this.lockFlash = 1; return; }
    S.togglePlay();
    blip(S.playing ? 990 : 440, 0.04);
  },
  btnSkip() {
    if (this.locked) { this.lockFlash = 1; return; }
    S.seek(-30);
    this.toast('−30 s', { icon: 'skipback' });
  },
  btnBack() {
    if (this.locked) { this.lockFlash = 1; return; }
    blip(560, 0.03);
    if (this.screen.back && this.screen.back(this)) return;
    this.goto(this.screenId === 'home' ? 'menu' : 'home');
  },
  toggleLock() {
    this.locked = !this.locked;
    this.lockFlash = 1;
    blip(this.locked ? 300 : 900, 0.08);
    this.toast(this.locked ? 'Locked · hold ⏯ to unlock' : 'Unlocked', { icon: 'lock' });
  },

  volumeNudge(d) {
    S.setVolume(S.volume + d * 4);
    this.volShow = 1.0;
  },
  scrub(d) {
    this.scrubTicks += d;
    const macro = Math.abs(this.scrubTicks) > 8; // keep turning → macro mode
    const step = macro ? 300 : 30;
    S.seek(d * step);
    this.scrubDelta += d * step;
    this.scrubShow = 1.1;
  },

  quickCapture() {
    const t1 = S.pos;
    S.captureQuote(Math.max(0, t1 - 30), t1);
    this.toast('Captured last 30 s', { icon: 'quote', color: T.tealHi });
  },
  startCapture() {
    this.capture = { active: true, t0: S.pos, started: performance.now() };
    if (!S.playing) S.togglePlay();
    this.toast('Recording quote…', { icon: 'mic', color: T.tealHi });
  },
  stopCapture() {
    const c = this.capture;
    this.capture = { active: false, t0: 0, started: 0 };
    S.captureQuote(c.t0, S.pos);
    this.toast('Quote captured', { icon: 'quote', color: T.tealHi });
  },

  // Voice note: dedicated button — pauses the book while you speak,
  // marks the timestamp/chapter, resumes when saved.
  toggleNote() {
    if (this.locked) { this.lockFlash = 1; return; }
    if (this.noteRec.active) this.stopNote();
    else this.startNote();
  },
  startNote() {
    this.noteRec = { active: true, t0: S.pos, started: performance.now(), wasPlaying: S.playing };
    if (S.playing) S.togglePlay(); // audio pauses while the mic records
    blip(740, 0.06);
  },
  stopNote() {
    const n = this.noteRec;
    this.noteRec = { active: false, t0: 0, started: 0, wasPlaying: false };
    S.addNote(n.t0, (performance.now() - n.started) / 1000);
    if (n.wasPlaying) S.togglePlay(); // resume where you left off
    this.toast('Note saved · transcribing', { icon: 'mic', color: T.tealHi });
    blip(980, 0.05);
  },
};

// store events → UI reactions
S.on('finished', () => ui.goto('finished'));
S.on('quote-done', () => ui.toast('Quote saved', { icon: 'check', color: T.tealHi }));
S.on('note-done', () => ui.toast('Note transcribed', { icon: 'check', color: T.tealHi }));
S.on('autopause', (why) => ui.toast(why + ' · paused', { icon: 'headphones' }));
S.on('sleep-fired', () => ui.toast('Sleep timer · paused', { icon: 'moon' }));
S.on('chapter', (ch) => {
  if (S.settings.autoRecall && S.playing && Math.random() < 0.6) {
    ui.toast('Recall ready · menu → recall', { icon: 'spark', color: T.tealHi });
  }
});
S.on('shared-updated', () => { /* library/quotes refreshed from web UI */ });

// ---------------- overlays ----------------

function drawOverlays(dt) {
  // volume
  if (ui.volShow > 0) {
    ui.volShow -= dt;
    const a = Math.min(1, ui.volShow / 0.35);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(245,243,238,0.96)';
    ctx.beginPath(); ctx.arc(CX, CY, 120, 0, Math.PI * 2); ctx.fill();
    arc(ctx, 82, 0, 360, { w: 8, color: T.track, alpha: a });
    arc(ctx, 82, 0, Math.max(2, 360 * (S.volume / 100)), { w: 8, color: T.amber, alpha: a });
    txt(ctx, S.volume, CX, CY - 8, { size: 44, weight: 700, alpha: a });
    txt(ctx, 'VOLUME', CX, CY + 26, { size: 9, color: T.dim, ls: 3, weight: 600, alpha: a });
    ctx.restore();
  }
  // scrub
  if (ui.scrubShow > 0) {
    ui.scrubShow -= dt;
    if (ui.scrubShow <= 0) { ui.scrubDelta = 0; ui.scrubTicks = 0; }
    const a = Math.min(1, ui.scrubShow / 0.3);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(245,243,238,0.96)';
    ctx.beginPath(); ctx.arc(CX, CY, 120, 0, Math.PI * 2); ctx.fill();
    const ch = S.chapterAt();
    const p = (S.pos - ch.start) / ch.d;
    arc(ctx, 92, 0, 360, { w: 4, color: T.track });
    arc(ctx, 92, 0, Math.max(2, 360 * p), { w: 4, color: T.amber });
    const [mx, my] = polar(360 * p, 92);
    dot(ctx, mx, my, 5.2, T.bg);
    dot(ctx, mx, my, 3.6, T.amber);
    const d = ui.scrubDelta;
    txt(ctx, (d >= 0 ? '+' : '−') + fmtTime(Math.abs(d)), CX, CY - 14, { size: 34, weight: 700 });
    txt(ctx, fmtTime(S.pos - ch.start) + ' · ' + ch.t, CX, CY + 18, { size: 9.5, color: T.dim, maxW: 150 });
    txt(ctx, Math.abs(ui.scrubTicks) > 8 ? '±5 MIN STEPS' : 'KEEP TURNING FOR ±5 MIN', CX, CY + 40, { size: 7.5, color: T.faint, ls: 1.5, weight: 600 });
    ctx.restore();
  }
  // live capture ring
  if (ui.capture.active) {
    const el = (performance.now() - ui.capture.started) / 1000;
    const pulse = 0.6 + 0.4 * Math.sin(el * 5);
    arc(ctx, 116, 0, 360, { w: 3, color: T.teal, alpha: 0.35 + 0.35 * pulse, glow: 10 });
    dot(ctx, CX, 14, 3, '#ff5c4d', 6);
    txt(ctx, 'REC ' + fmtTime(S.pos - ui.capture.t0), CX, 30, { size: 9, color: T.tealHi, weight: 700, ls: 1 });
  }
  // toasts
  for (let i = ui.toasts.length - 1; i >= 0; i--) {
    const tst = ui.toasts[i];
    tst.t += dt;
    if (tst.t > 2.1) { ui.toasts.splice(i, 1); continue; }
    const inA = Math.min(1, tst.t / 0.18);
    const outA = Math.min(1, (2.1 - tst.t) / 0.3);
    const a = Math.min(inA, outA);
    const y = 208 - (1 - inA) * 10;
    ctx.save();
    ctx.globalAlpha = a * 0.96;
    ctx.font = `600 9.5px ${T.font}`;
    const tw = ctx.measureText(tst.text).width;
    const iw = tst.icon ? 15 : 0;
    ctx.shadowColor = 'rgba(29,29,31,0.18)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(CX - (tw + iw) / 2 - 10, y - 11, tw + iw + 20, 22, 11);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(29,29,31,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (tst.icon) icon(ctx, tst.icon, CX - tw / 2 - 2, y, 10, { color: tst.color });
    txt(ctx, tst.text, CX + iw / 2, y, { size: 9.5, weight: 600, color: tst.color, alpha: a });
    ctx.restore();
  }
  // voice-note recording (playback is paused underneath)
  if (ui.noteRec.active) {
    const el = (performance.now() - ui.noteRec.started) / 1000;
    ctx.save();
    ctx.fillStyle = 'rgba(245,243,238,0.97)';
    ctx.beginPath(); ctx.arc(CX, CY, 120, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    for (let i = 0; i < 3; i++) {
      const rr = 34 + ((el * 30 + i * 24) % 70);
      arc(ctx, rr, 0, 360, { w: 1.6, color: T.teal, alpha: Math.max(0, 0.4 - rr / 280) });
    }
    icon(ctx, 'mic', CX, CY - 26, 30, { color: T.tealHi, fill: true });
    txt(ctx, fmtTime(el), CX, CY + 22, { size: 26, weight: 700, color: T.text });
    const ch = S.chapterAt(ui.noteRec.t0);
    txt(ctx, `marked · ch ${ch.index + 1} · ${fmtTime(ui.noteRec.t0)}`, CX, CY + 46, { size: 9, color: T.tealHi, weight: 600 });
    txt(ctx, 'VOICE NOTE', CX, 42, { size: 9, color: T.dim, weight: 600, ls: 3 });
    txt(ctx, 'PRESS NOTE TO SAVE', CX, 204, { size: 8.5, color: T.dim, weight: 600, ls: 1.2 });
    dot(ctx, CX + 52, 42, 3, T.danger);
  }
  // lock flash
  if (ui.lockFlash > 0) {
    ui.lockFlash = Math.max(0, ui.lockFlash - dt * 1.6);
    if (ui.locked) {
      ctx.save();
      ctx.globalAlpha = ui.lockFlash * 0.9;
      icon(ctx, 'lock', CX, 44, 16, { color: T.text });
      ctx.restore();
    }
  }
}

// ---------------- main loop ----------------

let last = performance.now();
function schedule() {
  // rAF pauses in hidden tabs — keep state/rendering alive on a slow timer.
  if (document.hidden) setTimeout(() => frame(performance.now()), 200);
  else requestAnimationFrame(frame);
}
function frame(now) {
  // cap covers the 200 ms hidden-tab timer without letting real gaps explode
  const dt = Math.min(0.25, (now - last) / 1000);
  last = now;
  S.tick(dt);

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  // Hard clip to the round panel — exactly what the GC9A01 shows.
  ctx.beginPath(); ctx.arc(CX, CY, 120, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, W, H);

  ui.screen.render(ctx, now / 1000, dt, ui);
  drawOverlays(dt);
  ctx.restore();

  // brightness dim
  if (S.settings.brightness < 1) {
    ctx.fillStyle = `rgba(0,0,0,${(1 - S.settings.brightness) * 0.55})`;
    ctx.beginPath(); ctx.arc(CX, CY, 120, 0, Math.PI * 2); ctx.fill();
  }
  schedule();
}

// ---------------- sounds ----------------

let actx = null;
function blip(freq, dur) {
  if (!S.settings.sounds) return;
  try {
    actx ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.frequency.value = freq;
    o.type = 'sine';
    g.gain.setValueAtTime(0.06, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur + 0.03);
    o.connect(g).connect(actx.destination);
    o.start();
    o.stop(actx.currentTime + dur + 0.05);
  } catch (e) { /* audio blocked */ }
}

// ---------------- input HAL (mouse/keyboard → encoder/buttons) ----------------

const device = document.getElementById('device');
const ring = document.getElementById('encoderRing');
let ringAngle = 0;

function spinRing(d) {
  ringAngle += d * 12;
  ring.style.setProperty('--rot', ringAngle + 'deg');
}

// wheel = encoder rotate (shift or pressed pointer = press-and-turn)
let pointerDown = false;
let downAt = 0;
let holdFired = false;
let holdTimer = null;
let rotatedWhileDown = false;

device.addEventListener('wheel', (e) => {
  e.preventDefault();
  const d = Math.sign(e.deltaY);
  if (!d) return;
  const pressed = e.shiftKey || pointerDown;
  if (pointerDown) rotatedWhileDown = true;
  spinRing(d);
  ui.rotate(d, pressed);
}, { passive: false });

// encoder push: click canvas = tap, long-press = hold
canvas.addEventListener('pointerdown', (e) => {
  pointerDown = true;
  rotatedWhileDown = false;
  holdFired = false;
  downAt = performance.now();
  holdTimer = setTimeout(() => {
    if (pointerDown && !rotatedWhileDown) { holdFired = true; ui.hold(); }
  }, 550);
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointerup', () => {
  clearTimeout(holdTimer);
  if (pointerDown && !holdFired && !rotatedWhileDown) ui.tap();
  pointerDown = false;
});
canvas.addEventListener('pointercancel', () => { clearTimeout(holdTimer); pointerDown = false; });

// drag the encoder ring
let dragging = false, dragAngle = 0, dragAcc = 0;
function angleOf(e) {
  const r = ring.getBoundingClientRect();
  return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
}
ring.addEventListener('pointerdown', (e) => {
  dragging = true; dragAngle = angleOf(e); dragAcc = 0;
  ring.setPointerCapture(e.pointerId);
});
ring.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const a = angleOf(e);
  let d = a - dragAngle;
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  dragAngle = a;
  dragAcc += d;
  const detent = (12 * Math.PI) / 180;
  while (Math.abs(dragAcc) >= detent) {
    const s = Math.sign(dragAcc);
    dragAcc -= s * detent;
    spinRing(s);
    ui.rotate(s, e.shiftKey);
  }
});
ring.addEventListener('pointerup', () => { dragging = false; });

// physical buttons
function wireButton(id, onTap, onHoldMs, onHold) {
  const el = document.getElementById(id);
  let t = null, fired = false;
  el.addEventListener('pointerdown', (e) => {
    fired = false;
    el.classList.add('pressed');
    if (onHold) t = setTimeout(() => { fired = true; onHold(); }, onHoldMs);
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointerup', () => {
    el.classList.remove('pressed');
    clearTimeout(t);
    if (!fired) onTap();
  });
  el.addEventListener('pointercancel', () => { el.classList.remove('pressed'); clearTimeout(t); });
}
wireButton('btnPlay', () => ui.btnPlay(), 1200, () => ui.toggleLock());
wireButton('btnSkip', () => ui.btnSkip());
wireButton('btnBack', () => ui.btnBack());
wireButton('btnNote', () => ui.toggleNote());

// keyboard
window.addEventListener('keydown', (e) => {
  if (e.repeat && !['ArrowUp', 'ArrowDown'].includes(e.key)) return;
  switch (e.key) {
    case 'ArrowUp': spinRing(-1); ui.rotate(-1, e.shiftKey); e.preventDefault(); break;
    case 'ArrowDown': spinRing(1); ui.rotate(1, e.shiftKey); e.preventDefault(); break;
    case 'Enter': ui.tap(); break;
    case 'h': case 'H': ui.hold(); break;
    case ' ': ui.btnPlay(); e.preventDefault(); break;
    case 'ArrowLeft': ui.btnSkip(); break;
    case 'Escape': case 'b': case 'B': ui.btnBack(); break;
    case 'l': case 'L': ui.toggleLock(); break;
    case 'n': case 'N': ui.toggleNote(); break;
  }
});

// ---------------- hardware sim panel ----------------

const sndToggle = document.getElementById('sndToggle');
const wiredToggle = document.getElementById('wiredToggle');
wiredToggle.checked = true;
wiredToggle.addEventListener('change', () => {
  S.setWired(wiredToggle.checked);
  if (wiredToggle.checked) ui.toast('Headphones connected', { icon: 'headphones' });
});

sndToggle.checked = S.settings.sounds !== false;
sndToggle.addEventListener('change', () => { S.settings.sounds = sndToggle.checked; S.persist(); });

const pixToggle = document.getElementById('pixToggle');
pixToggle.addEventListener('change', () => setupCanvas(pixToggle.checked));

// dev shortcuts to jump screens
document.querySelectorAll('[data-screen]').forEach((el) => {
  el.addEventListener('click', () => ui.goto(el.dataset.screen));
});

// ---------------- go ----------------

S.init();
ui.goto('boot');
document.addEventListener('visibilitychange', () => { last = performance.now(); });
schedule();

// dev handle for console/tests
window.puck = { S, ui };
