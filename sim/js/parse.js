// Audiobook metadata parser — no dependencies, runs in the browser.
// m4b/m4a/mp4: walks atoms for duration (mvhd), tags (ilst: title/author/cover)
//              and Nero chapters (chpl). QuickTime chapter *tracks* are not
//              parsed (fallback: evenly generated parts).
// mp3: ID3v2 TIT2/TPE1/APIC + duration via Xing header or CBR estimate.
// On the Pi the same job is done by mutagen/ffprobe; the output shape matches.

const td = (label) => new TextDecoder(label);

function fourcc(view, off) {
  return String.fromCharCode(view.getUint8(off), view.getUint8(off + 1), view.getUint8(off + 2), view.getUint8(off + 3));
}

// ---------------- MP4 / M4B ----------------

async function findMoov(file) {
  let pos = 0;
  while (pos < file.size - 8) {
    const head = new DataView(await file.slice(pos, Math.min(pos + 16, file.size)).arrayBuffer());
    let size = head.getUint32(0);
    const type = fourcc(head, 4);
    let hdr = 8;
    if (size === 1) { size = Number(head.getBigUint64(8)); hdr = 16; }
    else if (size === 0) size = file.size - pos; // atom extends to EOF
    if (size < 8) return null;
    if (type === 'moov') return new DataView(await file.slice(pos + hdr, pos + size).arrayBuffer());
    pos += size;
  }
  return null;
}

// Iterate child atoms of a container payload [start, end).
function* atoms(view, start, end) {
  let pos = start;
  while (pos + 8 <= end) {
    let size = view.getUint32(pos);
    const type = fourcc(view, pos + 4);
    let hdr = 8;
    if (size === 1) { size = Number(view.getBigUint64(pos + 8)); hdr = 16; }
    if (size < hdr || pos + size > end) break;
    yield { type, body: pos + hdr, end: pos + size };
    pos += size;
  }
}

function parseMvhd(view, body) {
  const version = view.getUint8(body);
  if (version === 1) {
    return { timescale: view.getUint32(body + 20), duration: Number(view.getBigUint64(body + 24)) };
  }
  return { timescale: view.getUint32(body + 12), duration: view.getUint32(body + 16) };
}

function ilstText(view, body, end) {
  for (const a of atoms(view, body, end)) {
    if (a.type === 'data') {
      return td('utf-8').decode(new Uint8Array(view.buffer, view.byteOffset + a.body + 8, a.end - a.body - 8));
    }
  }
  return null;
}

function ilstBlob(view, body, end) {
  for (const a of atoms(view, body, end)) {
    if (a.type === 'data') {
      const type = view.getUint32(a.body); // 13 = jpeg, 14 = png
      const bytes = new Uint8Array(view.buffer, view.byteOffset + a.body + 8, a.end - a.body - 8);
      return new Blob([bytes], { type: type === 14 ? 'image/png' : 'image/jpeg' });
    }
  }
  return null;
}

// Nero chapter atom; writers disagree on the exact preamble, so try both.
function parseChpl(view, body, end) {
  for (const countOff of [4, 8]) {
    try {
      const count = view.getUint8(body + countOff);
      if (count < 1 || count > 400) continue;
      let pos = body + countOff + 1;
      const out = [];
      let prev = -1;
      for (let i = 0; i < count; i++) {
        const start = Number(view.getBigUint64(pos));
        const len = view.getUint8(pos + 8);
        if (start < prev || pos + 9 + len > end) throw new Error('bad');
        const title = td('utf-8').decode(new Uint8Array(view.buffer, view.byteOffset + pos + 9, len));
        out.push({ start, title });
        prev = start;
        pos += 9 + len;
      }
      if (out.length) return out;
    } catch (e) { /* try next layout */ }
  }
  return null;
}

async function parseMp4(file) {
  const moov = await findMoov(file);
  if (!moov) return null;
  const out = { title: null, author: null, dur: 0, coverBlob: null, chapters: null };
  let rawChapters = null;

  for (const a of atoms(moov, 0, moov.byteLength)) {
    if (a.type === 'mvhd') {
      const { timescale, duration } = parseMvhd(moov, a.body);
      if (timescale > 0) out.dur = duration / timescale;
    } else if (a.type === 'udta') {
      for (const u of atoms(moov, a.body, a.end)) {
        if (u.type === 'chpl') rawChapters = parseChpl(moov, u.body, u.end);
        if (u.type === 'meta') {
          for (const m of atoms(moov, u.body + 4, u.end)) { // meta is a fullbox: skip version/flags
            if (m.type === 'ilst') {
              for (const it of atoms(moov, m.body, m.end)) {
                if (it.type === '©nam') out.title = ilstText(moov, it.body, it.end);
                else if (it.type === '©ART' || it.type === 'aART') out.author ||= ilstText(moov, it.body, it.end);
                else if (it.type === 'covr') out.coverBlob = ilstBlob(moov, it.body, it.end);
              }
            }
          }
        }
      }
    }
  }

  if (rawChapters && out.dur > 0) {
    // chpl timestamps are usually 100 ns ticks; fall back to other scales.
    const last = rawChapters[rawChapters.length - 1].start;
    const scale = [1e7, 1e3, 1].find((s) => last / s <= out.dur * 1.05) || 1e7;
    const starts = rawChapters.map((c) => ({ t: c.title, s: c.start / scale }));
    out.chapters = starts.map((c, i) => ({
      t: c.t || `Chapter ${i + 1}`,
      d: Math.max(1, Math.round(((i + 1 < starts.length ? starts[i + 1].s : out.dur) - c.s))),
    }));
  }
  return out;
}

// ---------------- MP3 / ID3v2 ----------------

const syncsafe = (v, o) => ((v.getUint8(o) & 0x7f) << 21) | ((v.getUint8(o + 1) & 0x7f) << 14) | ((v.getUint8(o + 2) & 0x7f) << 7) | (v.getUint8(o + 3) & 0x7f);

function id3Text(bytes) {
  const enc = bytes[0];
  const body = bytes.subarray(1);
  const label = enc === 0 ? 'latin1' : enc === 3 ? 'utf-8' : enc === 2 ? 'utf-16be' : 'utf-16';
  return td(label).decode(body).replace(/\0+$/g, '').replace(/^\0+/, '');
}

function id3Apic(bytes) {
  const enc = bytes[0];
  let p = 1;
  while (p < bytes.length && bytes[p] !== 0) p++; // mime (latin1 cstring)
  const mime = td('latin1').decode(bytes.subarray(1, p));
  p += 2; // null + picture type
  if (enc === 1 || enc === 2) { // utf-16 description: double-null terminated
    while (p + 1 < bytes.length && !(bytes[p] === 0 && bytes[p + 1] === 0)) p += 2;
    p += 2;
  } else {
    while (p < bytes.length && bytes[p] !== 0) p++;
    p += 1;
  }
  return new Blob([bytes.subarray(p)], { type: mime || 'image/jpeg' });
}

const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const SAMPLERATES = [44100, 48000, 32000];

async function parseMp3(file) {
  const head = new DataView(await file.slice(0, Math.min(file.size, 3 * 1024 * 1024)).arrayBuffer());
  const out = { title: null, author: null, dur: 0, coverBlob: null, chapters: null };
  let audioStart = 0;

  if (head.byteLength > 10 && fourcc(head, 0).startsWith('ID3')) {
    const major = head.getUint8(3);
    const tagSize = syncsafe(head, 6) + 10;
    audioStart = tagSize;
    let view = head;
    if (tagSize > head.byteLength) view = new DataView(await file.slice(0, tagSize + 65536).arrayBuffer());
    let p = 10;
    if (head.getUint8(5) & 0x40) p += syncsafe(view, 10) + (major === 4 ? 0 : 4); // extended header
    while (p + 10 < Math.min(tagSize, view.byteLength)) {
      const id = fourcc(view, p);
      if (!/^[A-Z0-9]{4}$/.test(id)) break;
      const size = major === 4 ? syncsafe(view, p + 4) : view.getUint32(p + 4);
      if (size <= 0 || p + 10 + size > view.byteLength) break;
      const bytes = new Uint8Array(view.buffer, p + 10, size);
      if (id === 'TIT2') out.title = id3Text(bytes);
      else if (id === 'TPE1') out.author = id3Text(bytes);
      else if (id === 'APIC' && !out.coverBlob) out.coverBlob = id3Apic(bytes);
      p += 10 + size;
    }
  }

  // Duration: find first MPEG frame, prefer Xing/Info frame count, else CBR.
  const scanStart = Math.min(audioStart, Math.max(0, head.byteLength - 4));
  const scan = audioStart + 65536 <= head.byteLength ? head : new DataView(await file.slice(audioStart, audioStart + 65536).arrayBuffer());
  const base = scan === head ? audioStart : 0;
  for (let i = base; i < scan.byteLength - 4; i++) {
    if (scan.getUint8(i) !== 0xff || (scan.getUint8(i + 1) & 0xe0) !== 0xe0) continue;
    const b1 = scan.getUint8(i + 1), b2 = scan.getUint8(i + 2), b3 = scan.getUint8(i + 3);
    const mpeg1 = (b1 & 0x18) === 0x18;
    const layer3 = (b1 & 0x06) === 0x02;
    if (!layer3) continue;
    const brIdx = (b2 >> 4) & 0x0f, srIdx = (b2 >> 2) & 0x03;
    if (brIdx === 0 || brIdx === 15 || srIdx === 3) continue;
    const bitrate = (mpeg1 ? BITRATES[brIdx] : Math.round(BITRATES[brIdx] / 2)) * 1000;
    const sampleRate = SAMPLERATES[srIdx] / (mpeg1 ? 1 : 2);
    const mono = ((b3 >> 6) & 3) === 3;
    const xingOff = i + 4 + (mpeg1 ? (mono ? 17 : 32) : (mono ? 9 : 17));
    if (xingOff + 12 < scan.byteLength) {
      const tag = fourcc(scan, xingOff);
      if ((tag === 'Xing' || tag === 'Info') && (scan.getUint32(xingOff + 4) & 1)) {
        const frames = scan.getUint32(xingOff + 8);
        out.dur = (frames * (mpeg1 ? 1152 : 576)) / sampleRate;
        return out;
      }
    }
    out.dur = ((file.size - audioStart) * 8) / bitrate; // CBR estimate
    return out;
  }
  return out;
}

// ---------------- shared ----------------

async function blobToDataUrl(blob, maxPx = 300) {
  try {
    const bmp = await createImageBitmap(blob);
    const s = Math.min(1, maxPx / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bmp.width * s));
    canvas.height = Math.max(1, Math.round(bmp.height * s));
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch (e) {
    return null;
  }
}

export async function parseAudioFile(file) {
  const fallbackTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  const result = {
    title: fallbackTitle, author: null, dur: 0, cover: null, chapters: null, parsed: false,
  };
  try {
    const isMp4 = /\.(m4b|m4a|mp4|aac)$/i.test(file.name);
    const meta = isMp4 ? await parseMp4(file) : /\.mp3$/i.test(file.name) ? await parseMp3(file) : null;
    if (meta) {
      result.parsed = true;
      if (meta.title) result.title = meta.title.trim();
      if (meta.author) result.author = meta.author.trim();
      if (meta.dur > 30) result.dur = Math.round(meta.dur);
      if (meta.chapters && meta.chapters.length > 1) result.chapters = meta.chapters;
      if (meta.coverBlob) result.cover = await blobToDataUrl(meta.coverBlob);
    }
  } catch (e) {
    console.warn('parse failed for', file.name, e);
  }
  if (!result.dur) result.dur = Math.max(1800, Math.round(file.size / 4000)); // size-based guess
  return result;
}
