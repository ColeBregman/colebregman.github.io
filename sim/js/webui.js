// Companion Web UI — reads/writes the same store as the device sim.
import { BOOKS, SEED_QUOTES, SEED_NOTES, bookDur } from './data.js';
import { parseAudioFile } from './parse.js';

const KEY = 'puck.sim.v1';
const chan = ('BroadcastChannel' in window) ? new BroadcastChannel('puck-sync') : null;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch (e) { return {}; }
}
function save(patch) {
  const cur = load();
  localStorage.setItem(KEY, JSON.stringify({ ...cur, ...patch }));
  if (chan) chan.postMessage({ type: 'sync' });
}

function allBooks(st) {
  const uploads = (st.uploads || []).map((u) => ({
    id: u.id, title: u.title, author: u.author || 'Uploaded', color: u.color || ['#5c4a2e', '#a8843f'],
    cover: u.cover || null,
    initials: (u.title || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
    dur: u.dur || 6 * 3600, chapters: u.chapters || null, uploaded: true, summary: [],
  }));
  return [...BOOKS.map((b) => ({ ...b, dur: bookDur(b), cover: null })), ...uploads];
}

const fmtDur = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
const fmtTime = (sec) => {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
};
const ago = (ts) => {
  const m = (Date.now() - ts) / 60000;
  if (m < 60) return Math.max(1, Math.round(m)) + ' min ago';
  if (m < 60 * 24) return Math.round(m / 60) + ' h ago';
  return Math.round(m / 60 / 24) + ' d ago';
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function toast(msg) {
  document.querySelector('.toastbar')?.remove();
  const el = document.createElement('div');
  el.className = 'toastbar';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function coverHtml(b, size = 62) {
  if (b.cover) return `<div class="cover" style="background-image:url('${b.cover}');background-size:cover;background-position:center"></div>`;
  return `<div class="cover" style="background:linear-gradient(135deg,${b.color[0]},${b.color[1]})">${esc(b.initials)}</div>`;
}

// ---------------- render ----------------

function render() {
  const st = load();
  const quotes = st.quotes || SEED_QUOTES;
  const notes = st.notes || SEED_NOTES;
  const books = allBooks(st);
  const positions = st.positions || {};
  const currentId = st.currentId || 'mobydick';

  // header
  const cur = books.find((b) => b.id === currentId);
  const pos = positions[currentId] || 0;
  document.getElementById('nowPlaying').innerHTML = cur
    ? `On device: <b>${esc(cur.title)}</b> · ${fmtTime(pos)} · ${Math.round((pos / cur.dur) * 100)}%`
    : '—';

  // stats
  const listened = (st.stats && st.stats.listenedSec) || 0;
  const streak = (st.recall && st.recall.streak) || 0;
  document.getElementById('stats').innerHTML = `
    <div class="stat"><div class="v amber">${fmtDur(listened)}</div><div class="k">listened</div></div>
    <div class="stat"><div class="v teal">${quotes.length}</div><div class="k">quotes captured</div></div>
    <div class="stat"><div class="v teal">${notes.length}</div><div class="k">voice notes</div></div>
    <div class="stat"><div class="v teal">${streak}</div><div class="k">recall streak</div></div>
    <div class="stat"><div class="v">${books.length}</div><div class="k">books in library</div></div>`;

  // 14-day listening chart
  const days = (st.stats && st.stats.days) || {};
  const bars = [];
  let maxSec = 60;
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    const key = d.toISOString().slice(0, 10);
    const sec = days[key] || 0;
    maxSec = Math.max(maxSec, sec);
    bars.push({ sec, label: 'SMTWTFS'[d.getDay()], today: i === 0 });
  }
  document.getElementById('chart').innerHTML = bars.map((b) => `
    <div class="bar-col" title="${fmtDur(b.sec)}">
      <div class="bar ${b.today ? 'today' : ''}" style="height:${Math.max(3, Math.round((b.sec / maxSec) * 100))}%"></div>
      <span>${b.label}</span>
    </div>`).join('');
  document.getElementById('chartTotal').textContent =
    fmtDur(bars.reduce((a, b) => a + b.sec, 0)) + ' in the last 14 days';

  // library
  document.getElementById('library').innerHTML = books.map((b) => {
    const p = Math.min(1, (positions[b.id] || 0) / b.dur);
    const done = st.finished && st.finished[b.id];
    return `<div class="book ${b.id === currentId ? 'current' : ''}">
      ${coverHtml(b)}
      <div class="meta">
        <div class="t" title="${esc(b.title)}">${esc(b.title)}</div>
        <div class="a">${esc(b.author)}${b.uploaded && b.chapters ? ` · ${b.chapters.length} chapters` : ''}</div>
        <div class="bar-track"><i style="width:${done ? 100 : Math.round(p * 100)}%"></i></div>
        <div class="p">${done ? 'Finished' : p > 0.002 ? Math.round(p * 100) + '% · ' + fmtDur(b.dur * (1 - p)) + ' left' : fmtDur(b.dur)}</div>
      </div>
      ${b.id === currentId ? '<span class="badge">ON DEVICE</span>' : done ? '<span class="badge done">✓ DONE</span>' : b.uploaded ? '<span class="badge" style="color:#85837b">UPLOADED</span>' : ''}
    </div>`;
  }).join('');

  // quote filter options
  const sel = document.getElementById('quoteFilter');
  const selVal = sel.value;
  sel.innerHTML = '<option value="">All books</option>' + books
    .filter((b) => quotes.some((q) => q.bookId === b.id))
    .map((b) => `<option value="${b.id}" ${b.id === selVal ? 'selected' : ''}>${esc(b.title)}</option>`).join('');

  // quotes
  const shown = quotes.filter((q) => !sel.value || q.bookId === sel.value);
  document.getElementById('quotes').innerHTML = shown.length ? shown.map((q) => {
    const b = books.find((x) => x.id === q.bookId) || { title: '?' };
    const pending = q.status === 'transcribing';
    return `<div class="quote">
      <div class="mark">“</div>
      <div class="body">
        <div class="text ${pending ? 'pending' : ''}">${pending ? 'Transcribing on device…' : esc(q.text)}</div>
        <div class="src"><b>${esc(b.title)}</b> · chapter ${q.chapter + 1} · ${fmtTime(q.t0)} · captured ${ago(q.created)}</div>
      </div>
      <div class="acts">
        <button data-card="${q.id}" ${pending ? 'disabled' : ''}>Card ↓</button>
        <button data-copy="${q.id}">Copy</button>
        <button data-del="${q.id}">Delete</button>
      </div>
    </div>`;
  }).join('') : '<div class="empty">No quotes yet — tap the encoder on the device while listening.</div>';

  // voice notes
  document.getElementById('notes').innerHTML = notes.length ? notes.map((n) => {
    const b = books.find((x) => x.id === n.bookId) || { title: '?' };
    const pending = n.status === 'transcribing';
    return `<div class="quote note">
      <div class="mark">🎙</div>
      <div class="body">
        <div class="text ${pending ? 'pending' : ''}">${pending ? 'Transcribing on device…' : esc(n.text)}</div>
        <div class="src"><b>${esc(b.title)}</b> · chapter ${n.chapter + 1} · marked at ${fmtTime(n.t0)} · ${ago(n.created)}</div>
      </div>
      <div class="acts">
        <button data-copy-note="${n.id}">Copy</button>
        <button data-del-note="${n.id}">Delete</button>
      </div>
    </div>`;
  }).join('') : '<div class="empty">No voice notes yet — press the Note button on the device to record a thought.</div>';

  // summaries
  const active = books.filter((b) => (positions[b.id] || 0) > 60 || quotes.some((q) => q.bookId === b.id));
  document.getElementById('summaries').innerHTML = (active.length ? active : books.slice(0, 3)).map((b) => `
    <div class="summary">
      <h3>${esc(b.title)}</h3>
      <ul>${(b.summary || []).map((s) => `<li>${esc(s)}</li>`).join('') || '<li>Summaries appear as you listen.</li>'}</ul>
    </div>`).join('');
}

// ---------------- shareable quote cards ----------------

function wrapLines(ctx, text, maxW) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

export function renderQuoteCard(q, book) {
  const S = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f5f3ee';
  ctx.fillRect(0, 0, S, S);

  // accent quote mark
  ctx.fillStyle = '#ff4f1f';
  ctx.font = '700 220px Georgia, serif';
  ctx.fillText('“', 90, 260);

  // quote text, auto-sized
  ctx.fillStyle = '#1d1d1f';
  let size = 66;
  let lines;
  do {
    ctx.font = `500 ${size}px Georgia, serif`;
    lines = wrapLines(ctx, q.text, S - 240);
    size -= 4;
  } while (lines.length * size * 1.35 > 520 && size > 30);
  const lh = (size + 4) * 1.4;
  const y0 = 380 + (520 - lines.length * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, 120, y0 + i * lh));

  // rule + attribution
  ctx.fillStyle = '#ff4f1f';
  ctx.fillRect(120, 930, 64, 6);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = '600 34px -apple-system, Inter, "Segoe UI", sans-serif';
  ctx.fillText(book.title, 120, 985);
  ctx.fillStyle = '#85837b';
  ctx.font = '400 28px -apple-system, Inter, "Segoe UI", sans-serif';
  ctx.fillText(`${book.author || ''} · chapter ${q.chapter + 1}`, 120, 1025);

  // wordmark
  ctx.fillStyle = '#85837b';
  ctx.font = '700 26px -apple-system, Inter, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('P U C K', S - 90, 1010);
  ctx.textAlign = 'left';
  return canvas;
}

function downloadCard(q, book) {
  const canvas = renderQuoteCard(q, book);
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `puck-quote-${book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
  toast('Quote card downloaded');
}

// expose for dev/testing
window.__renderQuoteCard = renderQuoteCard;

// ---------------- actions ----------------

document.addEventListener('click', (e) => {
  const d = e.target.dataset || {};
  const st = load();
  const quotes = st.quotes || SEED_QUOTES;
  const notes = st.notes || SEED_NOTES;
  if (d.copy || d.copyNote) {
    const item = d.copy ? quotes.find((x) => x.id === d.copy) : notes.find((x) => x.id === d.copyNote);
    if (item) { navigator.clipboard?.writeText(item.text); toast('Copied'); }
  }
  if (d.del) { save({ quotes: quotes.filter((x) => x.id !== d.del) }); render(); toast('Quote deleted'); }
  if (d.delNote) { save({ notes: notes.filter((x) => x.id !== d.delNote) }); render(); toast('Note deleted'); }
  if (d.card) {
    const q = quotes.find((x) => x.id === d.card);
    const b = allBooks(st).find((x) => x.id === q?.bookId);
    if (q && b) downloadCard(q, b);
  }
});

document.getElementById('quoteFilter').addEventListener('change', render);

// ---------------- upload with real metadata parsing ----------------

const dz = document.getElementById('dropzone');
const fi = document.getElementById('fileInput');
const PALETTE = [['#5c2e4a', '#a83f7c'], ['#2e4a5c', '#3f8aa8'], ['#4a5c2e', '#8aa83f'], ['#5c452e', '#a8843f']];

async function addUploads(files) {
  const audio = [...files].filter((f) => /\.(m4b|m4a|mp4|mp3|aac)$/i.test(f.name) || f.type.startsWith('audio/'));
  if (!audio.length) { toast('No audio files found in drop'); return; }
  toast(`Reading metadata from ${audio.length} file${audio.length > 1 ? 's' : ''}…`);
  const st = load();
  const uploads = st.uploads || [];
  for (let i = 0; i < audio.length; i++) {
    const meta = await parseAudioFile(audio[i]);
    uploads.push({
      id: 'up' + Date.now().toString(36) + i,
      title: meta.title,
      author: meta.author || 'Unknown author',
      dur: meta.dur,
      cover: meta.cover,
      chapters: meta.chapters,
      color: PALETTE[(uploads.length + i) % PALETTE.length],
      added: Date.now(),
    });
  }
  save({ uploads });
  render();
  const withCovers = uploads.slice(-audio.length).filter((u) => u.cover).length;
  const withChapters = uploads.slice(-audio.length).filter((u) => u.chapters).length;
  toast(`${audio.length} book${audio.length > 1 ? 's' : ''} added · ${withCovers} covers · ${withChapters} chaptered — now on the device`);
}

fi.addEventListener('change', () => addUploads([...fi.files]));
dz.addEventListener('click', (e) => { if (e.target.tagName !== 'INPUT') fi.click(); });
['dragover', 'dragenter'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
dz.addEventListener('drop', (e) => addUploads([...e.dataTransfer.files]));

// live sync from device
if (chan) chan.onmessage = (m) => { if (m.data?.type === 'sync') render(); };
window.addEventListener('storage', (e) => { if (e.key === KEY) render(); });
setInterval(render, 4000);

render();
