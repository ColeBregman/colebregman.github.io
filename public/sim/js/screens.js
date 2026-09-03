// All device screens. Each draws into a logical 240×240 circle.
// Light "paper" design: cream ground, ink type, flat accent arcs, no glow.
// Interface: enter(params), render(ctx, t, dt, ui), rotate(dir, pressed, ui),
//            tap(ui), hold(ui), back(ui) -> true if consumed.
import { S } from './store.js';
import {
  W, H, CX, CY, T, arc, arcText, dot, txt, wrap, icon,
  polar, fmtTime, fmtDur, ease, shortAngle,
} from './gfx.js';

// ---------- shared bits ----------

// Soft inner shadow at the rim so the panel reads as a physical disc.
function rim(ctx) {
  const g = ctx.createRadialGradient(CX, CY, 96, CX, CY, 121);
  g.addColorStop(0, 'rgba(29,29,31,0)');
  g.addColorStop(1, 'rgba(29,29,31,0.09)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Accent knob with a paper-colored border so it sits on top of the ring.
function knob(ctx, x, y, color = T.amber) {
  dot(ctx, x, y, 5.4, T.bg);
  dot(ctx, x, y, 3.6, color);
}

// Cover disc: real cover art (circular clip) when the book has one, else a
// gradient monogram. Images are decoded once and cached.
const coverImgs = {};
function coverDisc(ctx, book, x, y, r, { alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (book.cover) {
    let img = coverImgs[book.id];
    if (!img) {
      img = new Image();
      img.src = book.cover;
      coverImgs[book.id] = img;
    }
    if (img.complete && img.naturalWidth) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
      const s = Math.max((r * 2) / img.naturalWidth, (r * 2) / img.naturalHeight);
      ctx.drawImage(img, x - (img.naturalWidth * s) / 2, y - (img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
      ctx.restore();
      return;
    }
  }
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  g.addColorStop(0, book.color[0]);
  g.addColorStop(1, book.color[1]);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  const sh = ctx.createRadialGradient(x - r * 0.4, y - r * 0.5, 0, x, y, r * 1.4);
  sh.addColorStop(0, 'rgba(255,255,255,0.25)');
  sh.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = sh;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  txt(ctx, book.initials, x, y + 1, { size: r * 0.72, weight: 700, color: 'rgba(255,255,255,0.95)', ls: 1 });
  ctx.restore();
}

function hintFooter(ctx, s, { color = T.dim, y = 218 } = {}) {
  txt(ctx, s, CX, y, { size: 8.5, color, weight: 600, ls: 1.2, alpha: 0.9 });
}

function listState() { return { idx: 0, anim: 0 }; }

// ---------- Boot ----------

const boot = {
  t0: 0,
  enter() { this.t0 = performance.now(); },
  render(ctx, t, dt, ui) {
    const el = (performance.now() - this.t0) / 1000;
    const p = Math.min(1, el / 1.1);
    const sweep = 360 * (1 - Math.pow(1 - p, 3));
    arc(ctx, 104, 0, sweep, { w: 3, color: T.amber });
    txt(ctx, 'PUCK', CX, CY - 6, { size: 26, weight: 700, ls: 8, alpha: Math.min(1, el / 0.5) });
    txt(ctx, 'AUDIOBOOKS, REMEMBERED', CX, CY + 20, { size: 8, weight: 600, ls: 2.4, color: T.dim, alpha: Math.max(0, Math.min(1, (el - 0.35) / 0.5)) });
    if (el > 1.7) {
      ui.goto('home');
      if (S._smartResumed) { ui.toast('Smart Resume · rewound 30 s', { icon: 'skipback' }); S._smartResumed = false; }
    }
  },
  rotate() {}, tap() {}, hold() {},
};

// ---------- Now Playing ----------

const home = {
  render(ctx, t, dt, ui) {
    const book = S.book();
    const ch = S.chapterAt();
    const chPos = S.pos - ch.start;
    const chProg = chPos / ch.d;
    const bookProg = S.pos / S.dur();

    rim(ctx);

    // book progress: hairline outer ring (optional)
    if (S.settings.bookRing) {
      arc(ctx, 111, 0, 360, { w: 1.5, color: T.track });
      arc(ctx, 111, 0, Math.max(1, 360 * bookProg), { w: 1.5, color: T.dim, alpha: 0.7 });
    }

    // chapter progress: main accent ring
    arc(ctx, 101, 0, 360, { w: 5, color: T.track });
    arc(ctx, 101, 0, Math.max(1.5, 360 * chProg), { w: 5, color: T.amber });

    // voice-note marks within this chapter
    for (const n of S.notes) {
      if (n.bookId !== book.id) continue;
      const rel = (n.t0 - ch.start) / ch.d;
      if (rel >= 0 && rel <= 1) {
        const [nx, ny] = polar(360 * rel, 101);
        dot(ctx, nx, ny, 2.6, T.bg);
        dot(ctx, nx, ny, 1.8, T.tealHi);
      }
    }
    const [kx, ky] = polar(360 * chProg, 101);
    knob(ctx, kx, ky);

    // cover art up top; bluetooth glyph beside it when routed to BT
    coverDisc(ctx, book, CX, 32, 15);
    if (S.settings.btOn && S.settings.btDevice) icon(ctx, 'bt', CX + 28, 32, 9, { color: T.dim, alpha: 0.8 });

    txt(ctx, `CHAPTER ${ch.index + 1} OF ${book.chapters.length}`, CX, 64, { size: 8, color: T.dim, weight: 600, ls: 2 });
    txt(ctx, ch.t, CX, 80, { size: 13, weight: 600, maxW: 148 });

    // big readout + status line per Display settings
    const spd = S.speed();
    const remainCh = ch.d - chPos;
    const remainBook = S.dur() - S.pos;
    const mode = S.settings.timeMode;
    const big = mode === 'bookLeft' ? '−' + fmtTime(remainBook)
      : mode === 'chapterElapsed' ? fmtTime(chPos)
      : '−' + fmtTime(remainCh);
    txt(ctx, big, CX, 114, { size: big.length > 8 ? 30 : 38, weight: 700, ls: -0.5 });

    const parts = [];
    parts.push(mode === 'bookLeft' ? `${fmtTime(remainCh)} in chapter` : `${fmtDur(remainBook / spd)} left`);
    if (spd !== 1) parts.push(spd.toFixed(2).replace(/0$/, '') + '×');
    const pct = Math.round(bookProg * 100);
    if (S.settings.percentMode === 'in') parts.push(pct + '%');
    else if (S.settings.percentMode === 'left') parts.push((100 - pct) + '% left');
    txt(ctx, parts.join(' · '), CX, 142, { size: 9.5, color: T.dim, weight: 500 });

    // play / pause
    const py = 174;
    ctx.save();
    ctx.strokeStyle = T.track;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(CX, py, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    icon(ctx, S.playing ? 'pause' : 'play', CX + (S.playing ? 0 : 1.5), py, 13, { color: S.playing ? T.amber : T.dim });

    // sleep indicator
    if (S.sleepRemain > 0 || S.sleepEndOfChapter) {
      icon(ctx, 'moon', CX - 34, 30, 9, { color: T.indigo, fill: true });
      txt(ctx, S.sleepEndOfChapter ? 'ch' : Math.ceil(S.sleepRemain / 60) + 'm', CX - 34, 43, { size: 7.5, color: T.indigo, weight: 600 });
    }

    arcText(ctx, book.title.toUpperCase(), 90, 180, { size: 8, color: T.dim, ls: 3, alpha: 0.85 });
  },
  rotate(d, pressed, ui) {
    if (pressed) ui.scrub(d);
    else ui.volumeNudge(d);
  },
  tap(ui) {
    if (ui.capture.active) { ui.stopCapture(); return; }
    ui.quickCapture();
  },
  hold(ui) { ui.startCapture(); },
  back(ui) { ui.goto('menu'); return true; },
};

// ---------- Arc menu ----------

const MENU = [
  { id: 'resume', label: 'Now Playing', icon: 'play' },
  { id: 'library', label: 'Library', icon: 'library' },
  { id: 'chapters', label: 'Chapters', icon: 'chapters' },
  { id: 'quotes', label: 'Quotes', icon: 'quote' },
  { id: 'notes', label: 'Notes', icon: 'mic' },
  { id: 'recall', label: 'Recall', icon: 'spark' },
  { id: 'speed', label: 'Speed', icon: 'gauge' },
  { id: 'sleep', label: 'Sleep', icon: 'moon' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
];
const TEAL_MENU = new Set(['quotes', 'notes', 'recall']);

const menu = {
  idx: 0, rot: 0,
  enter() { this.rot = -this.idx * (360 / MENU.length); },
  render(ctx, t, dt) {
    const n = MENU.length;
    const step = 360 / n;
    const target = -this.idx * step;
    this.rot += shortAngle(this.rot, target) * (1 - Math.exp(-14 * dt));
    rim(ctx);

    for (let i = 0; i < n; i++) {
      const a = this.rot + i * step; // 0 = top
      const sel = ((i % n) + n) % n === ((this.idx % n) + n) % n;
      const closeness = Math.max(0, 1 - Math.abs(shortAngle(0, a)) / 120);
      const [x, y] = polar(a, 86);
      const size = 15 + 11 * (sel ? 1 : closeness * 0.35);
      const it = MENU[i];
      const isTeal = TEAL_MENU.has(it.id);
      if (sel) dot(ctx, x, y, 22, isTeal ? T.tealSoft : T.amberSoft);
      const c = sel ? (isTeal ? T.tealHi : T.amber) : T.dim;
      icon(ctx, it.icon, x, y, size, { color: c, alpha: sel ? 1 : 0.35 + closeness * 0.45, fill: sel });
    }
    const it = MENU[((this.idx % n) + n) % n];
    const isTeal = TEAL_MENU.has(it.id);
    txt(ctx, it.label, CX, CY - 4, { size: 20, weight: 700, color: T.text });
    txt(ctx, 'PRESS TO OPEN', CX, CY + 20, { size: 8, color: T.dim, weight: 600, ls: 2 });
    dot(ctx, CX, 36, 2.2, isTeal ? T.tealHi : T.amber);
  },
  rotate(d) { this.idx += d; },
  tap(ui) {
    const n = MENU.length;
    const it = MENU[((this.idx % n) + n) % n];
    if (it.id === 'resume') ui.goto('home');
    else ui.goto(it.id);
  },
  hold() {},
  back(ui) { ui.goto('home'); return true; },
};

// ---------- Library ----------

const library = {
  idx: 0, x: 0,
  enter() {
    this.idx = Math.max(0, S.books.findIndex((b) => b.id === S.currentId));
    this.x = this.idx;
  },
  render(ctx, t, dt) {
    this.x = ease(this.x, this.idx, dt, 11);
    rim(ctx);
    arcText(ctx, 'LIBRARY', 102, 0, { size: 9, ls: 4, color: T.dim });

    for (let i = 0; i < S.books.length; i++) {
      const off = i - this.x;
      if (Math.abs(off) > 1.6) continue;
      const x = CX + off * 92;
      const alpha = Math.max(0, 1 - Math.abs(off) * 0.85);
      const book = S.books[i];
      const r = 46 * Math.max(0.35, 1 - Math.abs(off) * 0.55);
      coverDisc(ctx, book, x, 102, r, { alpha: 0.25 + alpha * 0.75 });
      if (Math.abs(off) < 0.5) {
        const prog = (S.positions[book.id] || (book.id === S.currentId ? S.pos : 0)) / S.dur(book);
        ctx.save(); ctx.translate(x - CX, 102 - CY);
        arc(ctx, r + 7, 0, 360, { w: 3, color: T.track });
        if (S.finished[book.id]) arc(ctx, r + 7, 0, 360, { w: 3, color: T.green });
        else arc(ctx, r + 7, 0, Math.max(2, 360 * prog), { w: 3, color: T.amber });
        ctx.restore();
      }
    }
    const book = S.books[Math.round(this.x)] || S.books[0];
    const pos = S.positions[book.id] || (book.id === S.currentId ? S.pos : 0);
    const prog = pos / S.dur(book);
    if (book.id === S.currentId) dot(ctx, CX, 158, 2.4, T.amber);
    txt(ctx, book.title, CX, 176, { size: 14, weight: 700, maxW: 168 });
    txt(ctx, book.author, CX, 192, { size: 10, color: T.dim, maxW: 160 });
    const status = S.finished[book.id] ? 'Finished'
      : prog > 0.002 ? `${Math.round(prog * 100)}% · ${fmtDur((S.dur(book) - pos) / (S.speeds[book.id] || 1))} left`
      : `${fmtDur(S.dur(book))} · new`;
    txt(ctx, status, CX, 208, { size: 9, color: S.finished[book.id] ? T.green : T.amberDeep, weight: 600 });
    txt(ctx, `${Math.round(this.x) + 1} / ${S.books.length}`, CX, 36, { size: 9, color: T.faint, weight: 600 });
  },
  rotate(d) { this.idx = Math.min(S.books.length - 1, Math.max(0, this.idx + d)); },
  tap(ui) {
    const book = S.books[Math.round(this.idx)];
    S.selectBook(book.id);
    ui.goto('home');
    if (S.pos > 5) ui.toast(`Resumed · ${fmtTime(S.pos)}`, { icon: 'play' });
  },
  hold() {},
};

// ---------- Chapters ----------

const chapters = {
  ...listState(),
  enter() { this.idx = S.chapterAt().index; this.anim = this.idx; },
  render(ctx, t, dt) {
    this.anim = ease(this.anim, this.idx, dt, 13);
    const book = S.book();
    rim(ctx);
    arcText(ctx, 'CHAPTERS', 102, 0, { size: 9, ls: 4, color: T.dim });
    const cur = S.chapterAt().index;
    for (let i = 0; i < book.chapters.length; i++) {
      const off = i - this.anim;
      if (Math.abs(off) > 3.4) continue;
      const y = CY + off * 30;
      const focus = Math.max(0, 1 - Math.abs(off) * 0.9);
      const sel = i === this.idx;
      const c = book.chapters[i];
      const edge = Math.abs(y - CY) / 95;
      const alpha = Math.max(0.06, (0.3 + focus * 0.7) * (1 - edge * edge));
      txt(ctx, String(i + 1).padStart(2, '0'), 52, y, { size: sel ? 11 : 9, weight: 700, color: i === cur ? T.amber : T.faint, alpha, align: 'center' });
      txt(ctx, c.t, 66, y, { size: sel ? 12.5 : 10.5, weight: sel ? 700 : 500, color: sel ? T.text : T.dim, alpha, align: 'left', maxW: sel ? 108 : 100 });
      txt(ctx, fmtDur(c.d), 188, y, { size: 8.5, color: T.faint, alpha, align: 'right' });
      if (i === cur) dot(ctx, 43, y, 2, T.amber);
    }
    hintFooter(ctx, 'PRESS TO JUMP');
  },
  rotate(d) { this.idx = Math.min(S.book().chapters.length - 1, Math.max(0, this.idx + d)); },
  tap(ui) {
    S.seekTo(S.chapterStart(this.idx) + 0.01);
    S.playing = true;
    ui.goto('home');
    ui.toast(`Chapter ${this.idx + 1}`, { icon: 'chapters' });
  },
  hold() {},
};

// ---------- Quotes ----------

const quotes = {
  ...listState(),
  enter() { this.idx = 0; this.anim = 0; },
  list() { return S.quotes; },
  render(ctx, t, dt) {
    const list = this.list();
    rim(ctx);
    arcText(ctx, 'QUOTES', 102, 0, { size: 9, ls: 4, color: T.tealHi });
    if (!list.length) {
      icon(ctx, 'quote', CX, 92, 34, { color: T.teal });
      const lines = wrap(ctx, 'Tap the knob while listening to capture the last 30 seconds', 150, 11);
      lines.forEach((l, i) => txt(ctx, l, CX, 130 + i * 15, { size: 11, color: T.dim }));
      return;
    }
    this.idx = Math.min(this.idx, list.length - 1);
    this.anim = ease(this.anim, this.idx, dt, 13);
    for (let i = 0; i < list.length; i++) {
      const off = i - this.anim;
      if (Math.abs(off) > 2.6) continue;
      const y = CY + off * 42;
      const focus = Math.max(0, 1 - Math.abs(off) * 0.8);
      const sel = i === this.idx;
      const q = list[i];
      const book = S.book(q.bookId) || { title: '?', initials: '?', color: ['#999', '#777'] };
      const edge = Math.abs(y - CY) / 100;
      const alpha = Math.max(0.05, (0.3 + focus * 0.7) * (1 - edge * edge));
      const body = q.status === 'transcribing' ? 'Transcribing…' : q.text;
      txt(ctx, body, CX, y - 7, { size: sel ? 11.5 : 10, weight: sel ? 600 : 500, color: sel ? T.text : T.dim, alpha, maxW: 158 });
      txt(ctx, `${book.title} · ch ${q.chapter + 1} · ${fmtTime(q.t0)}`, CX, y + 9, { size: 8, color: sel ? T.tealHi : T.faint, alpha, maxW: 150 });
    }
    hintFooter(ctx, 'PRESS TO READ', { color: T.tealHi });
  },
  rotate(d) { this.idx = Math.min(this.list().length - 1, Math.max(0, this.idx + d)); },
  tap(ui) {
    if (this.list().length) ui.goto('quoteDetail', { quote: this.list()[this.idx] });
  },
  hold() {},
};

const quoteDetail = {
  q: null, kind: 'quote', scroll: 0, scrollA: 0, pulse: 0,
  enter({ quote, kind = 'quote' }) { this.q = quote; this.kind = kind; this.scroll = 0; this.scrollA = 0; },
  render(ctx, t, dt) {
    const q = this.q;
    const isNote = this.kind === 'note';
    const book = S.book(q.bookId);
    this.scrollA = ease(this.scrollA, this.scroll, dt, 13);
    rim(ctx);
    arc(ctx, 112, 0, 360, { w: 1.5, color: T.tealSoft });
    icon(ctx, isNote ? 'mic' : 'quote', CX, 46, 20, { color: T.teal });

    if (q.status === 'transcribing') {
      this.pulse += dt;
      txt(ctx, 'Transcribing', CX, 112, { size: 14, weight: 600, color: T.tealHi });
      for (let i = 0; i < 3; i++) {
        const ph = (this.pulse * 1.4 + i * 0.33) % 1;
        dot(ctx, CX - 14 + i * 14, 134, 2.6, T.teal);
        ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(ph * Math.PI)); ctx.restore();
      }
      txt(ctx, 'whisper · local on device', CX, 158, { size: 8.5, color: T.dim, ls: 1.5 });
    } else {
      const lines = wrap(ctx, isNote ? q.text : '“' + q.text + '”', 156, 12, 500);
      const maxScroll = Math.max(0, lines.length - 5);
      this.scroll = Math.min(this.scroll, maxScroll);
      ctx.save();
      ctx.beginPath(); ctx.rect(30, 62, 180, 106); ctx.clip();
      lines.forEach((l, i) => {
        const y = 78 + (i - this.scrollA) * 17;
        txt(ctx, l, CX, y, { size: 12, color: T.text, alpha: Math.min(1, Math.max(0, (y - 60) / 16)) * Math.min(1, Math.max(0, (170 - y) / 16)) });
      });
      ctx.restore();
      if (lines.length > 5) hintFooter(ctx, 'TURN TO SCROLL', { y: 228, color: T.faint });
    }
    const kindTag = this.kind === 'note' ? 'NOTE · ' : '';
    txt(ctx, `${kindTag}${book.title} · CH ${q.chapter + 1} · ${fmtTime(q.t0)}`, CX, 184, { size: 8.5, color: T.tealHi, weight: 600, ls: 1, maxW: 170 });
    hintFooter(ctx, 'PRESS: PLAY · HOLD: DELETE', { color: T.dim, y: 202 });
  },
  rotate(d) { this.scroll = Math.max(0, this.scroll + d); },
  tap(ui) {
    S.selectBook(this.q.bookId);
    S.seekTo(Math.max(0, this.q.t0 - 2));
    S.playing = true;
    ui.goto('home');
    ui.toast(this.kind === 'note' ? 'Playing from note' : 'Playing from quote', { icon: 'play' });
  },
  hold(ui) {
    if (this.kind === 'note') { S.deleteNote(this.q.id); ui.goto('notes'); ui.toast('Note deleted', { icon: 'trash' }); }
    else { S.deleteQuote(this.q.id); ui.goto('quotes'); ui.toast('Quote deleted', { icon: 'trash' }); }
  },
  back(ui) { ui.goto(this.kind === 'note' ? 'notes' : 'quotes'); return true; },
};

// ---------- Voice notes ----------

const notes = {
  ...listState(),
  enter() { this.idx = 0; this.anim = 0; },
  list() { return S.notes; },
  render(ctx, t, dt) {
    const list = this.list();
    rim(ctx);
    arcText(ctx, 'VOICE NOTES', 102, 0, { size: 9, ls: 4, color: T.tealHi });
    if (!list.length) {
      icon(ctx, 'mic', CX, 92, 32, { color: T.teal });
      const lines = wrap(ctx, 'Press the note button to record a thought — playback pauses while you speak', 152, 11);
      lines.forEach((l, i) => txt(ctx, l, CX, 130 + i * 15, { size: 11, color: T.dim }));
      return;
    }
    this.idx = Math.min(this.idx, list.length - 1);
    this.anim = ease(this.anim, this.idx, dt, 13);
    for (let i = 0; i < list.length; i++) {
      const off = i - this.anim;
      if (Math.abs(off) > 2.6) continue;
      const y = CY + off * 42;
      const focus = Math.max(0, 1 - Math.abs(off) * 0.8);
      const sel = i === this.idx;
      const n = list[i];
      const book = S.book(n.bookId) || { title: '?' };
      const edge = Math.abs(y - CY) / 100;
      const alpha = Math.max(0.05, (0.3 + focus * 0.7) * (1 - edge * edge));
      const body = n.status === 'transcribing' ? 'Transcribing…' : n.text;
      txt(ctx, body, CX, y - 7, { size: sel ? 11.5 : 10, weight: sel ? 600 : 500, color: sel ? T.text : T.dim, alpha, maxW: 158 });
      txt(ctx, `${book.title} · ch ${n.chapter + 1} · ${fmtTime(n.t0)}`, CX, y + 9, { size: 8, color: sel ? T.tealHi : T.faint, alpha, maxW: 150 });
    }
    hintFooter(ctx, 'PRESS TO READ', { color: T.tealHi });
  },
  rotate(d) { this.idx = Math.min(this.list().length - 1, Math.max(0, this.idx + d)); },
  tap(ui) {
    if (this.list().length) ui.goto('quoteDetail', { quote: this.list()[this.idx], kind: 'note' });
  },
  hold() {},
};

// ---------- Recall ----------

const recall = {
  qIdx: 0, phase: 'prompt', ph: 0,
  enter() { this.phase = 'prompt'; this.ph = 0; this.qIdx = Math.floor(Math.random() * 100); },
  prompt() {
    const list = S.book().recall || [];
    return list[this.qIdx % list.length] || 'What happened in the last chapter?';
  },
  render(ctx, t, dt) {
    rim(ctx);
    this.ph += dt;
    arcText(ctx, 'RECALL', 102, 0, { size: 9, ls: 4, color: T.tealHi });

    if (this.phase === 'prompt') {
      arc(ctx, 110, 0, 360, { w: 2, color: T.tealSoft });
      icon(ctx, 'spark', CX, 56, 18, { color: T.teal, fill: true });
      const lines = wrap(ctx, this.prompt(), 158, 12.5, 600);
      lines.forEach((l, i) => txt(ctx, l, CX, 106 + i * 17 - (lines.length - 1) * 8, { size: 12.5, weight: 600, color: T.text }));
      icon(ctx, 'flame', CX - 14, 172, 11, { color: T.amber, fill: true });
      txt(ctx, S.recall.streak, CX + 2, 172, { size: 12, weight: 700, color: T.amberDeep, align: 'left' });
      hintFooter(ctx, 'HOLD TO ANSWER ALOUD', { color: T.tealHi, y: 198 });
      hintFooter(ctx, 'TURN TO SKIP', { color: T.faint, y: 212 });
    } else if (this.phase === 'listening') {
      const p = this.ph;
      for (let i = 0; i < 3; i++) {
        const rr = 40 + ((p * 34 + i * 26) % 78);
        arc(ctx, rr, 0, 360, { w: 1.6, color: T.teal, alpha: Math.max(0, 0.4 - rr / 300) });
      }
      icon(ctx, 'mic', CX, CY - 8, 30, { color: T.tealHi, fill: true });
      txt(ctx, 'Listening…', CX, 168, { size: 12, color: T.tealHi, weight: 600 });
      txt(ctx, 'say what you remember', CX, 186, { size: 9, color: T.dim });
      if (this.ph > 3.2) { this.phase = 'done'; this.ph = 0; S.answerRecall(); }
    } else {
      const pop = Math.min(1, this.ph * 3);
      arc(ctx, 60, 0, 360 * pop, { w: 3, color: T.teal });
      icon(ctx, 'check', CX, CY - 18, 26 * (0.6 + pop * 0.4), { color: T.tealHi, w: 3.5 });
      txt(ctx, 'Nice recall', CX, 152, { size: 14, weight: 700, color: T.text });
      icon(ctx, 'flame', CX - 18, 176, 12, { color: T.amber, fill: true });
      txt(ctx, `streak ${S.recall.streak}`, CX - 4, 176, { size: 11, weight: 600, color: T.amberDeep, align: 'left' });
    }
  },
  rotate(d) { if (this.phase === 'prompt') this.qIdx += d; },
  tap(ui) { if (this.phase === 'done') ui.goto('home'); },
  hold() { if (this.phase === 'prompt') { this.phase = 'listening'; this.ph = 0; } },
};

// ---------- Speed ----------

const speed = {
  v: 1, va: 1,
  enter() { this.v = S.speed(); this.va = this.v; },
  render(ctx, t, dt) {
    this.va = ease(this.va, this.v, dt, 14);
    rim(ctx);
    arcText(ctx, 'PLAYBACK SPEED', 102, 0, { size: 9, ls: 3, color: T.dim });
    const A0 = 235, A1 = 485; // gauge sweep through the top
    const f = (this.va - 0.75) / (2.0 - 0.75);
    arc(ctx, 88, A0, A1, { w: 6, color: T.track });
    arc(ctx, 88, A0, A0 + (A1 - A0) * f, { w: 6, color: T.amber });
    const [gx, gy] = polar(A0 + (A1 - A0) * f, 88);
    knob(ctx, gx, gy);
    for (const s of [0.75, 1.0, 1.25, 1.5, 1.75, 2.0]) {
      const a = A0 + ((s - 0.75) / 1.25) * (A1 - A0);
      const [x0, y0] = polar(a, 78);
      const [x1, y1] = polar(a, 73);
      ctx.strokeStyle = Math.abs(s - this.v) < 0.01 ? T.amber : T.faint;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const [lx, ly] = polar(a, 64);
      txt(ctx, s + '×', lx, ly, { size: 7.5, color: Math.abs(s - this.v) < 0.01 ? T.amberDeep : T.faint, weight: 600 });
    }
    txt(ctx, this.v.toFixed(2).replace(/0$/, '') + '×', CX, 118, { size: 32, weight: 700, ls: -0.5 });
    const remain = (S.dur() - S.pos) / this.v;
    txt(ctx, `${fmtDur(remain)} left at this speed`, CX, 148, { size: 9.5, color: T.dim });
    hintFooter(ctx, 'TURN TO ADJUST · PRESS TO SET', { y: 196 });
  },
  rotate(d) {
    this.v = Math.min(2.0, Math.max(0.75, Math.round((this.v + d * 0.05) * 20) / 20));
    S.setSpeed(this.v);
  },
  tap(ui) { S.setSpeed(this.v); ui.goto('home'); ui.toast(`Speed ${this.v}×`, { icon: 'gauge' }); },
  hold() {},
};

// ---------- Sleep ----------

const SLEEP_OPTS = [
  { label: 'Off', min: 0 },
  { label: '15 min', min: 15 },
  { label: '30 min', min: 30 },
  { label: '45 min', min: 45 },
  { label: '60 min', min: 60 },
  { label: 'End of chapter', min: -1 },
];

const sleep = {
  idx: 0, anim: 0,
  enter() {
    this.idx = S.sleepEndOfChapter ? 5 : S.sleepRemain > 0 ? SLEEP_OPTS.findIndex((o) => o.min * 60 >= S.sleepRemain) : 0;
    if (this.idx < 0) this.idx = 0;
    this.anim = this.idx;
  },
  render(ctx, t, dt) {
    this.anim = ease(this.anim, this.idx, dt, 13);
    rim(ctx);
    arcText(ctx, 'SLEEP TIMER', 102, 0, { size: 9, ls: 3, color: T.dim });
    icon(ctx, 'moon', CX, 62, 22, { color: T.indigo, fill: true });
    for (let i = 0; i < SLEEP_OPTS.length; i++) {
      const off = i - this.anim;
      if (Math.abs(off) > 2.4) continue;
      const y = 132 + off * 26;
      const sel = i === this.idx;
      const edge = Math.abs(y - 132) / 70;
      txt(ctx, SLEEP_OPTS[i].label, CX, y, {
        size: sel ? 15 : 11, weight: sel ? 700 : 500,
        color: sel ? T.text : T.dim, alpha: Math.max(0.08, 1 - edge * edge),
      });
    }
    hintFooter(ctx, 'PRESS TO SET');
  },
  rotate(d) { this.idx = Math.min(SLEEP_OPTS.length - 1, Math.max(0, this.idx + d)); },
  tap(ui) {
    const o = SLEEP_OPTS[this.idx];
    S.sleepEndOfChapter = o.min === -1;
    S.sleepRemain = o.min > 0 ? o.min * 60 : 0;
    ui.goto('home');
    ui.toast(o.min === 0 ? 'Sleep timer off' : o.min === -1 ? 'Sleeping at chapter end' : `Sleep in ${o.min} min`, { icon: 'moon' });
  },
  hold() {},
};

// ---------- Settings (+ Wi-Fi / Bluetooth / Display sub-screens) ----------

// Shared row renderer for settings-style lists.
// row: { label, sub, right: {type:'toggle',on} | {type:'value',text} |
//        {type:'nav'} | {type:'check'} | {type:'sig',n} | {type:'busy'} }
function drawRows(ctx, rows, anim, idx, t) {
  // Clamp the scroll anchor so short lists fill the circle instead of
  // leaving the top half empty when the first row is selected.
  const hi = Math.max(0, rows.length - 1 - 1.3);
  const center = Math.min(Math.max(anim, Math.min(1.3, hi)), hi);
  for (let i = 0; i < rows.length; i++) {
    const off = i - center;
    if (Math.abs(off) > 2.8) continue;
    const y = CY + off * 33;
    const sel = i === idx;
    const it = rows[i];
    const edge = Math.abs(y - CY) / 95;
    const alpha = Math.max(0.06, (sel ? 1 : 0.5) * (1 - edge * edge));
    txt(ctx, it.label, 50, y - (it.sub ? 6 : 0), { size: sel ? 12.5 : 11, weight: sel ? 700 : 500, color: sel ? T.text : T.dim, alpha, align: 'left', maxW: 96 });
    if (it.sub) txt(ctx, it.sub, 50, y + 9, { size: 8, color: T.dim, alpha: alpha * 0.8, align: 'left', maxW: 104 });
    const r = it.right || {};
    ctx.save();
    ctx.globalAlpha = alpha;
    if (r.type === 'toggle') {
      ctx.fillStyle = r.on ? T.green : '#d8d5cc';
      ctx.beginPath(); ctx.roundRect(162, y - 7, 26, 14, 7); ctx.fill();
      dot(ctx, r.on ? 181 : 169, y, 5, '#ffffff');
    } else if (r.type === 'value') {
      txt(ctx, r.text, 190, y, { size: 8.5, weight: 600, color: sel ? T.amberDeep : T.dim, align: 'right', maxW: 66 });
    } else if (r.type === 'nav') {
      txt(ctx, '›', 188, y, { size: 15, weight: 600, color: sel ? T.text : T.faint });
    } else if (r.type === 'check') {
      icon(ctx, 'check', 182, y, 11, { color: T.tealHi, w: 2.2 });
    } else if (r.type === 'sig') {
      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = b < r.n ? (sel ? T.text : T.dim) : '#d8d5cc';
        ctx.beginPath(); ctx.roundRect(174 + b * 5, y + 3 - (b + 1) * 3.2, 3, (b + 1) * 3.2 + 2, 1.2); ctx.fill();
      }
    } else if (r.type === 'busy') {
      for (let d = 0; d < 3; d++) {
        const ph = Math.abs(Math.sin((t * 2.4 + d * 0.28) * Math.PI));
        ctx.globalAlpha = alpha * (0.25 + 0.75 * ph);
        dot(ctx, 172 + d * 8, y, 2.2, T.tealHi);
      }
    }
    ctx.restore();
  }
}

const WIFI_NETWORKS = [
  { ssid: 'BregmanHome', sig: 3, lock: true },
  { ssid: 'BregmanHome-5G', sig: 2, lock: true },
  { ssid: 'Workshop 2.4G', sig: 2, lock: true },
  { ssid: 'CoffeeBar Guest', sig: 1, lock: false },
];

const wifi = {
  ...listState(), busy: null,
  enter() { this.idx = 0; this.anim = 0; this.busy = null; },
  items() {
    const rows = [{ id: '_toggle', label: 'Wi-Fi', sub: S.settings.wifiOn ? 'on' : 'off', right: { type: 'toggle', on: S.settings.wifiOn } }];
    if (S.settings.wifiOn) {
      for (const n of WIFI_NETWORKS) {
        rows.push({
          id: n.ssid, label: n.ssid, sub: S.settings.wifiSsid === n.ssid ? 'connected' : n.lock ? 'secured' : 'open',
          right: this.busy === n.ssid ? { type: 'busy' } : S.settings.wifiSsid === n.ssid ? { type: 'check' } : { type: 'sig', n: n.sig },
        });
      }
    }
    return rows;
  },
  render(ctx, t, dt) {
    this.anim = ease(this.anim, this.idx, dt, 13);
    rim(ctx);
    arcText(ctx, 'WI-FI', 102, 0, { size: 9, ls: 4, color: T.dim });
    drawRows(ctx, this.items(), this.anim, this.idx, t);
    hintFooter(ctx, this.busy ? 'CONNECTING…' : 'PRESS TO CONNECT');
  },
  rotate(d) { this.idx = Math.min(this.items().length - 1, Math.max(0, this.idx + d)); },
  tap(ui) {
    const it = this.items()[this.idx];
    if (!it) return;
    if (it.id === '_toggle') {
      S.settings.wifiOn = !S.settings.wifiOn;
      if (!S.settings.wifiOn) S.settings.wifiSsid = null;
      S.persist(); this.idx = 0;
      return;
    }
    if (this.busy) return;
    if (S.settings.wifiSsid === it.id) {
      S.settings.wifiSsid = null; S.persist();
      ui.toast('Disconnected', { icon: 'wifi' });
      return;
    }
    this.busy = it.id;
    setTimeout(() => {
      this.busy = null;
      S.settings.wifiSsid = it.id;
      S.persist();
      ui.toast('Connected · ' + it.id, { icon: 'wifi', color: T.tealHi });
    }, 1400);
  },
  hold() {},
  back(ui) { ui.goto('settings'); return true; },
};

const BT_DEVICES = [
  { name: 'AirPods Pro', kind: 'earbuds' },
  { name: 'Shokz OpenRun', kind: 'bone conduction' },
  { name: 'Kitchen Speaker', kind: 'speaker' },
  { name: 'Subaru Outback', kind: 'car' },
];

const bluetooth = {
  ...listState(), busy: null,
  enter() { this.idx = 0; this.anim = 0; this.busy = null; },
  items() {
    const rows = [{ id: '_toggle', label: 'Bluetooth', sub: S.settings.btOn ? 'analog out when off' : 'off · analog out', right: { type: 'toggle', on: S.settings.btOn } }];
    if (S.settings.btOn) {
      for (const d of BT_DEVICES) {
        rows.push({
          id: d.name, label: d.name, sub: S.settings.btDevice === d.name ? 'connected' : d.kind,
          right: this.busy === d.name ? { type: 'busy' } : S.settings.btDevice === d.name ? { type: 'check' } : { type: 'nav' },
        });
      }
    }
    return rows;
  },
  render(ctx, t, dt) {
    this.anim = ease(this.anim, this.idx, dt, 13);
    rim(ctx);
    arcText(ctx, 'BLUETOOTH', 102, 0, { size: 9, ls: 4, color: T.dim });
    drawRows(ctx, this.items(), this.anim, this.idx, t);
    hintFooter(ctx, this.busy ? 'PAIRING…' : 'PRESS TO CONNECT');
  },
  rotate(d) { this.idx = Math.min(this.items().length - 1, Math.max(0, this.idx + d)); },
  tap(ui) {
    const it = this.items()[this.idx];
    if (!it) return;
    if (it.id === '_toggle') {
      S.settings.btOn = !S.settings.btOn;
      if (!S.settings.btOn) S.setBtDevice(null); else S.persist();
      this.idx = 0;
      return;
    }
    if (this.busy) return;
    if (S.settings.btDevice === it.id) {
      S.setBtDevice(null);
      ui.toast('Disconnected · analog out', { icon: 'headphones' });
      return;
    }
    this.busy = it.id;
    setTimeout(() => {
      this.busy = null;
      S.setBtDevice(it.id);
      ui.toast('Connected · ' + it.id, { icon: 'bt', color: T.tealHi });
    }, 1600);
  },
  hold() {},
  back(ui) { ui.goto('settings'); return true; },
};

const TIME_MODES = [['chapterLeft', 'Chapter left'], ['bookLeft', 'Book left'], ['chapterElapsed', 'Chapter elapsed']];
const PCT_MODES = [['in', '% listened'], ['left', '% left'], ['off', 'Hidden']];
const BRIGHT_LVLS = [0.6, 0.8, 1.0];

const display = {
  ...listState(),
  enter() { this.idx = 0; this.anim = 0; },
  items() {
    const tm = TIME_MODES.find(([k]) => k === S.settings.timeMode) || TIME_MODES[0];
    const pm = PCT_MODES.find(([k]) => k === S.settings.percentMode) || PCT_MODES[0];
    return [
      { id: 'timeMode', label: 'Time readout', sub: 'big number on Now Playing', right: { type: 'value', text: tm[1] } },
      { id: 'percentMode', label: 'Percentage', sub: 'book progress in status line', right: { type: 'value', text: pm[1] } },
      { id: 'bookRing', label: 'Book ring', sub: 'outer whole-book ring', right: { type: 'toggle', on: S.settings.bookRing } },
      { id: 'brightness', label: 'Brightness', sub: '', right: { type: 'value', text: Math.round(S.settings.brightness * 100) + '%' } },
    ];
  },
  render(ctx, t, dt) {
    this.anim = ease(this.anim, this.idx, dt, 13);
    rim(ctx);
    arcText(ctx, 'DISPLAY', 102, 0, { size: 9, ls: 4, color: T.dim });
    drawRows(ctx, this.items(), this.anim, this.idx, t);
    hintFooter(ctx, 'PRESS TO CHANGE');
  },
  rotate(d) { this.idx = Math.min(this.items().length - 1, Math.max(0, this.idx + d)); },
  tap() {
    const id = this.items()[this.idx].id;
    if (id === 'timeMode') {
      const i = TIME_MODES.findIndex(([k]) => k === S.settings.timeMode);
      S.settings.timeMode = TIME_MODES[(i + 1) % TIME_MODES.length][0];
    } else if (id === 'percentMode') {
      const i = PCT_MODES.findIndex(([k]) => k === S.settings.percentMode);
      S.settings.percentMode = PCT_MODES[(i + 1) % PCT_MODES.length][0];
    } else if (id === 'bookRing') {
      S.settings.bookRing = !S.settings.bookRing;
    } else if (id === 'brightness') {
      const i = BRIGHT_LVLS.indexOf(S.settings.brightness);
      S.settings.brightness = BRIGHT_LVLS[(i + 1) % BRIGHT_LVLS.length] ?? 1.0;
    }
    S.persist();
  },
  hold() {},
  back(ui) { ui.goto('settings'); return true; },
};

const settings = {
  ...listState(),
  items() {
    return [
      { id: 'wifi', to: 'wifi', label: 'Wi-Fi', sub: S.settings.wifiOn ? (S.settings.wifiSsid ? S.settings.wifiSsid : 'on') : 'off', right: { type: 'nav' } },
      { id: 'bluetooth', to: 'bluetooth', label: 'Bluetooth', sub: S.settings.btOn ? (S.settings.btDevice || 'on') : 'off · analog out', right: { type: 'nav' } },
      { id: 'display', to: 'display', label: 'Display', sub: 'time · progress · brightness', right: { type: 'nav' } },
      { id: 'smartResume', label: 'Smart Resume', sub: 'rewind 30 s after a pause', right: { type: 'toggle', on: S.settings.smartResume } },
      { id: 'autoRecall', label: 'Recall Prompts', sub: 'between chapters', right: { type: 'toggle', on: S.settings.autoRecall } },
      { id: 'sounds', label: 'UI Sounds', sub: 'encoder detents', right: { type: 'toggle', on: S.settings.sounds } },
      { id: 'about', label: 'About', sub: 'Puck sim v0.2', right: {} },
    ];
  },
  enter() { this.idx = 0; this.anim = 0; },
  render(ctx, t, dt) {
    this.anim = ease(this.anim, this.idx, dt, 13);
    rim(ctx);
    arcText(ctx, 'SETTINGS', 102, 0, { size: 9, ls: 4, color: T.dim });
    drawRows(ctx, this.items(), this.anim, this.idx, t);
    hintFooter(ctx, 'PRESS TO OPEN · TOGGLE');
  },
  rotate(d) { this.idx = Math.min(this.items().length - 1, Math.max(0, this.idx + d)); },
  tap(ui) {
    const it = this.items()[this.idx];
    if (it.to) { ui.goto(it.to); return; }
    if (it.right.type === 'toggle') { S.settings[it.id] = !S.settings[it.id]; S.persist(); }
    else ui.toast('Puck · 240×240 GC9A01 · Pi Zero 2 W', {});
  },
  hold() {},
};

// ---------- Finished ----------

const finished = {
  ph: 0,
  enter() { this.ph = 0; },
  render(ctx, t, dt, ui) {
    this.ph += dt;
    rim(ctx);
    const book = S.book();
    for (let i = 0; i < 3; i++) {
      const p = Math.min(1, Math.max(0, this.ph * 0.9 - i * 0.18));
      arc(ctx, 40 + p * 74, 0, 360, { w: 2.5 - i * 0.5, color: T.amber, alpha: Math.max(0, 0.6 - p * 0.6) });
    }
    icon(ctx, 'check', CX, 78, 30, { color: T.amber, w: 4 });
    txt(ctx, 'Finished!', CX, 118, { size: 22, weight: 700 });
    txt(ctx, book.title, CX, 142, { size: 11, color: T.dim, maxW: 170 });
    const qn = S.quotes.filter((q) => q.bookId === book.id).length;
    txt(ctx, `${fmtDur(S.dur())} · ${qn} quotes saved`, CX, 162, { size: 9.5, color: T.amberDeep, weight: 600 });
    hintFooter(ctx, 'PRESS: LIBRARY · HOLD: RESTART', { y: 198 });
  },
  rotate() {},
  tap(ui) { ui.goto('library'); },
  hold(ui) { S.seekTo(0); S.playing = true; ui.goto('home'); },
};

export const SCREENS = { boot, home, menu, library, chapters, quotes, notes, quoteDetail, recall, speed, sleep, settings, wifi, bluetooth, display, finished };
