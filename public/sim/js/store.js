// State store + simulated playback engine.
// On the Pi this file's tick() is replaced by mpv IPC; everything else ports as-is.
import { BOOKS, SEED_QUOTES, SEED_NOTES, NOTE_POOL, bookDur } from './data.js';

const KEY = 'puck.sim.v2';
const chan = ('BroadcastChannel' in window) ? new BroadcastChannel('puck-sync') : null;

const listeners = {};

export const S = {
  books: [],
  currentId: 'artthief',
  playing: false,
  pos: 0,
  volume: 72,
  positions: {},
  speeds: {},
  finished: {},
  quotes: [],
  notes: [],
  wired: true, // wired headphones present (hardware state, not persisted)
  settings: {
    smartResume: true, autoRecall: true, sounds: true, brightness: 1.0,
    timeMode: 'chapterLeft',   // chapterLeft | bookLeft | chapterElapsed
    percentMode: 'in',         // in | left | off
    bookRing: true,            // outer whole-book progress ring
    wifiOn: true, wifiSsid: 'BregmanHome',
    btOn: true, btDevice: 'AirPods Pro',
  },
  recall: { streak: 3, answered: 7 },
  stats: { listenedSec: 4 * 3600 + 22 * 60, days: {} },
  sleepRemain: 0,       // seconds; 0 = off
  sleepEndOfChapter: false,
  uploads: [],

  on(evt, fn) { (listeners[evt] ||= []).push(fn); },
  emit(evt, data) { (listeners[evt] || []).forEach((f) => f(data)); },

  init() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { /* fresh */ }
    if (saved) {
      Object.assign(this.positions, saved.positions || {});
      Object.assign(this.speeds, saved.speeds || {});
      Object.assign(this.finished, saved.finished || {});
      Object.assign(this.settings, saved.settings || {});
      Object.assign(this.recall, saved.recall || {});
      Object.assign(this.stats, saved.stats || {});
      this.quotes = saved.quotes || [];
      this.notes = saved.notes || [];
      this.uploads = saved.uploads || [];
      this.currentId = saved.currentId || 'artthief';
      this.volume = saved.volume ?? 72;
      this._lastPlayedAt = saved.lastPlayedAt || 0;
    } else {
      this.quotes = [...SEED_QUOTES];
      this.notes = [...SEED_NOTES];
      const bd = (id) => { const b = BOOKS.find((x) => x.id === id); return b ? bookDur(b) : 0; };
      this.positions = { artthief: 0.16 * bd('artthief'), mobydick: 0.37 * bd('mobydick'), meditations: 0.12 * bd('meditations'), walden: 0.81 * bd('walden') };
      this.speeds = { artthief: 1.55, mobydick: 1.25 };
      // seed a plausible fortnight of listening for the stats chart
      for (let i = 1; i <= 13; i++) {
        const day = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
        const min = [45, 20, 0, 65, 90, 30, 55, 0, 75, 40, 25, 80, 35][i - 1];
        if (min) this.stats.days[day] = min * 60;
      }
    }
    this.rebuildBooks();
    this.pos = this.positions[this.currentId] || 0;

    // Smart Resume: rewind 30 s when returning after a real gap.
    if (this.settings.smartResume && this.pos > 60 &&
        (!this._lastPlayedAt || Date.now() - this._lastPlayedAt > 2 * 60 * 1000)) {
      this.pos = Math.max(0, this.pos - 30);
      this._smartResumed = true;
    }
    if (chan) chan.onmessage = (m) => { if (m.data?.type === 'sync') this.reloadShared(); };
    window.addEventListener('storage', (e) => { if (e.key === KEY) this.reloadShared(); });
  },

  rebuildBooks() {
    this.books = [...BOOKS, ...this.uploads.map((u) => ({
      id: u.id, title: u.title, author: u.author || 'Unknown', color: u.color || ['#5c4a2e', '#a8843f'],
      cover: u.cover || null,
      initials: (u.title || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      chapters: u.chapters || Array.from({ length: 8 }, (_, i) => ({ t: `Part ${i + 1}`, d: Math.round((u.dur || 6 * 3600) / 8) })),
      quoteBank: ['(Transcription of the last 30 seconds of audio would appear here.)'],
      recall: ['What was the key idea in the section you just finished?'],
      summary: ['Uploaded via the web UI — summaries appear after listening.'],
    }))];
  },

  // Pulled in when the OTHER page (web UI) writes: quotes, uploads, deletions.
  reloadShared() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!saved) return;
      this.quotes = saved.quotes || this.quotes;
      this.notes = saved.notes || this.notes;
      this.uploads = saved.uploads || this.uploads;
      this.rebuildBooks();
      this.emit('shared-updated');
    } catch (e) { /* ignore */ }
  },

  book(id = this.currentId) { return this.books.find((b) => b.id === id); },
  dur(book = this.book()) { return bookDur(book); },
  speed(id = this.currentId) { return this.speeds[id] || 1.0; },

  chapterAt(pos = this.pos, book = this.book()) {
    let acc = 0;
    for (let i = 0; i < book.chapters.length; i++) {
      const c = book.chapters[i];
      if (pos < acc + c.d) return { index: i, start: acc, ...c };
      acc += c.d;
    }
    const last = book.chapters[book.chapters.length - 1];
    return { index: book.chapters.length - 1, start: acc - last.d, ...last };
  },

  chapterStart(i, book = this.book()) {
    return book.chapters.slice(0, i).reduce((a, c) => a + c.d, 0);
  },

  togglePlay() {
    if (this.playing) { this.playing = false; this.persist(); }
    else {
      this.playing = true;
      if (this.finished[this.currentId]) { this.pos = 0; delete this.finished[this.currentId]; }
    }
    this.emit('play', this.playing);
  },

  seek(delta) {
    const wasChapter = this.chapterAt().index;
    this.pos = Math.min(Math.max(0, this.pos + delta), this.dur() - 1);
    if (this.chapterAt().index !== wasChapter) this.emit('chapter', this.chapterAt());
  },

  seekTo(pos) { this.pos = Math.min(Math.max(0, pos), this.dur() - 1); },

  setSpeed(v) { this.speeds[this.currentId] = Math.round(v * 20) / 20; this.persist(); },

  setVolume(v) { this.volume = Math.min(100, Math.max(0, Math.round(v))); },

  selectBook(id) {
    if (id !== this.currentId) {
      this.positions[this.currentId] = this.pos;
      this.currentId = id;
      this.pos = this.positions[id] || 0;
      this.playing = false;
    }
    this.persist();
  },

  tick(dt) {
    if (this.playing) {
      const prevCh = this.chapterAt().index;
      this.pos += dt * this.speed();
      this.stats.listenedSec += dt;
      const day = new Date().toISOString().slice(0, 10);
      this.stats.days[day] = (this.stats.days[day] || 0) + dt;
      const d = this.dur();
      if (this.pos >= d) {
        this.pos = d - 0.001;
        this.playing = false;
        this.finished[this.currentId] = true;
        this.emit('finished');
      } else if (this.chapterAt().index !== prevCh) {
        this.emit('chapter', this.chapterAt());
        if (this.sleepEndOfChapter) {
          this.playing = false; this.sleepEndOfChapter = false;
          this.emit('sleep-fired');
        }
      }
      if (this.sleepRemain > 0) {
        this.sleepRemain -= dt;
        if (this.sleepRemain <= 0) { this.sleepRemain = 0; this.playing = false; this.emit('sleep-fired'); }
      }
      this._saveT = (this._saveT || 0) + dt;
      if (this._saveT > 5) { this._saveT = 0; this.persist(); }
    }
  },

  // ---- audio routing (auto-pause on disconnect) ----
  setBtDevice(name) {
    const had = this.settings.btDevice;
    this.settings.btDevice = name;
    if (!name && had && this.playing) {
      this.playing = false;
      this.emit('autopause', 'Bluetooth disconnected');
    }
    this.persist();
  },
  setWired(plugged) {
    this.wired = plugged;
    if (!plugged && !this.settings.btDevice && this.playing) {
      this.playing = false;
      this.emit('autopause', 'Headphones unplugged');
    }
  },

  // ---- Quote capture (Whisper is simulated with the book's quoteBank) ----
  captureQuote(t0, t1) {
    const book = this.book();
    const q = {
      id: 'q' + Date.now().toString(36),
      bookId: book.id,
      chapter: this.chapterAt(t0).index,
      t0, t1,
      status: 'transcribing',
      text: '',
      created: Date.now(),
    };
    this.quotes.unshift(q);
    this.persist();
    this.emit('quote-added', q);
    const bank = book.quoteBank;
    const pick = bank[Math.abs(Math.floor(t0)) % bank.length];
    setTimeout(() => {
      q.text = pick;
      q.status = 'done';
      this.persist();
      this.emit('quote-done', q);
    }, 2300 + Math.random() * 900);
    return q;
  },

  deleteQuote(id) {
    this.quotes = this.quotes.filter((q) => q.id !== id);
    this.persist();
  },

  // ---- Voice notes (local Whisper simulated with NOTE_POOL) ----
  addNote(t0, recDur) {
    const note = {
      id: 'n' + Date.now().toString(36),
      bookId: this.currentId,
      chapter: this.chapterAt(t0).index,
      t0,
      recDur: Math.round(recDur),
      status: 'transcribing',
      text: '',
      created: Date.now(),
    };
    this.notes.unshift(note);
    this.persist();
    this.emit('note-added', note);
    const pick = NOTE_POOL[Math.abs(Math.floor(t0)) % NOTE_POOL.length];
    setTimeout(() => {
      note.text = pick;
      note.status = 'done';
      this.persist();
      this.emit('note-done', note);
    }, 2600 + Math.random() * 900);
    return note;
  },

  deleteNote(id) {
    this.notes = this.notes.filter((n) => n.id !== id);
    this.persist();
  },

  answerRecall() {
    this.recall.streak += 1;
    this.recall.answered += 1;
    this.persist();
  },

  persist() {
    this.positions[this.currentId] = this.pos;
    const payload = {
      currentId: this.currentId,
      positions: this.positions,
      speeds: this.speeds,
      finished: this.finished,
      volume: this.volume,
      quotes: this.quotes,
      notes: this.notes,
      settings: this.settings,
      recall: this.recall,
      stats: this.stats,
      uploads: this.uploads,
      lastPlayedAt: this.playing ? Date.now() : (this._lastPlayedAt || Date.now()),
    };
    try { localStorage.setItem(KEY, JSON.stringify(payload)); } catch (e) { /* full */ }
    if (chan) chan.postMessage({ type: 'sync' });
  },
};
