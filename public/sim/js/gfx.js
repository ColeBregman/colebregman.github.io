// Drawing toolkit for the 240×240 round display.
// All screens draw in a logical 240×240 space; the canvas is supersampled.

export const W = 240, H = 240, CX = 120, CY = 120;

// Light "paper" theme — cream ground, ink type, one warm accent.
// amber* = playback accent, teal* = quotes/recall accent (Hi = readable-dark on light).
export const T = {
  bg: '#f5f3ee',
  amber: '#ff4f1f',
  amberHi: '#ff7a4d',
  amberDeep: '#d8380e',
  amberSoft: 'rgba(255,79,31,0.12)',
  teal: '#10ac9b',
  tealHi: '#0a7f73',
  tealDeep: '#0a7f73',
  tealSoft: 'rgba(16,172,155,0.13)',
  indigo: '#5e6ad2',
  text: '#1d1d1f',
  dim: '#85837b',
  faint: '#c7c4b9',
  track: 'rgba(29,29,31,0.08)',
  danger: '#e5484d',
  green: '#34c759',
  font: '-apple-system,"SF Pro Text",Inter,"Segoe UI",system-ui,sans-serif',
};

// Angles: degrees, 0 at 12 o'clock, clockwise.
export const rad = (deg) => ((deg - 90) * Math.PI) / 180;
export const polar = (deg, r, cx = CX, cy = CY) => [cx + Math.cos(rad(deg)) * r, cy + Math.sin(rad(deg)) * r];

export function arc(ctx, r, a0, a1, { w = 4, color = '#fff', cap = 'round', glow = 0, alpha = 1 } = {}) {
  if (a1 <= a0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineWidth = w;
  ctx.lineCap = cap;
  ctx.strokeStyle = color;
  if (glow) { ctx.shadowColor = typeof color === 'string' ? color : T.amber; ctx.shadowBlur = glow; }
  ctx.beginPath();
  ctx.arc(CX, CY, r, rad(a0), rad(a1));
  ctx.stroke();
  ctx.restore();
}

// Gradient stroke along an arc (approximated with segments).
export function arcGrad(ctx, r, a0, a1, c0, c1, { w = 6, glow = 0, cap = 'round' } = {}) {
  if (a1 <= a0) return;
  const steps = Math.max(2, Math.ceil((a1 - a0) / 6));
  ctx.save();
  ctx.lineWidth = w;
  ctx.lineCap = 'butt';
  if (glow) { ctx.shadowColor = c1; ctx.shadowBlur = glow; }
  for (let i = 0; i < steps; i++) {
    const f0 = i / steps, f1 = (i + 1) / steps;
    ctx.strokeStyle = mix(c0, c1, f1);
    ctx.beginPath();
    ctx.arc(CX, CY, r, rad(a0 + (a1 - a0) * f0) - 0.008, rad(a0 + (a1 - a0) * f1) + 0.004);
    ctx.stroke();
  }
  if (cap === 'round') {
    // rounded end caps
    ctx.fillStyle = c0;
    let [x, y] = polar(a0, r);
    ctx.beginPath(); ctx.arc(x, y, w / 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c1;
    [x, y] = polar(a1, r);
    ctx.beginPath(); ctx.arc(x, y, w / 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function dot(ctx, x, y, r, color, glow = 0) {
  ctx.save();
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function txt(ctx, s, x, y, { size = 12, color = T.text, weight = 500, ls = 0, align = 'center', baseline = 'middle', alpha = 1, maxW = 0, font = T.font } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = ls + 'px';
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  let str = String(s);
  if (maxW > 0) {
    while (str.length > 2 && ctx.measureText(str).width > maxW) str = str.slice(0, -2);
    if (str !== String(s)) str = str.replace(/\s+$/, '') + '…';
  }
  ctx.fillText(str, x, y);
  ctx.restore();
}

export function wrap(ctx, s, maxW, size, weight = 500, font = T.font) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${font}`;
  const words = String(s).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  ctx.restore();
  return lines;
}

// Text following an arc, centered on centerDeg. Glyphs auto-flip on the
// bottom half of the dial so the text always reads upright.
export function arcText(ctx, s, r, centerDeg, { size = 9, color = T.dim, weight = 600, ls = 2.5, alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${T.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const norm = ((centerDeg % 360) + 360) % 360;
  const flip = norm > 90 && norm < 270; // bottom half
  const str = String(s);
  const widths = [...str].map((ch) => ctx.measureText(ch).width + ls);
  const total = widths.reduce((a, b) => a + b, 0);
  const dir = flip ? -1 : 1;
  let a = centerDeg - dir * ((total / 2) / r) * (180 / Math.PI);
  for (let i = 0; i < str.length; i++) {
    const half = (widths[i] / 2 / r) * (180 / Math.PI);
    a += dir * half;
    const [x, y] = polar(a, r);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rad(a) + (flip ? -Math.PI / 2 : Math.PI / 2));
    ctx.fillText(str[i], 0, 0);
    ctx.restore();
    a += dir * half;
  }
  ctx.restore();
}

export function mix(c0, c1, f) {
  const p = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const [r0, g0, b0] = p(c0), [r1, g1, b1] = p(c1);
  const m = (a, b) => Math.round(a + (b - a) * f);
  return `rgb(${m(r0, r1)},${m(g0, g1)},${m(b0, b1)})`;
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

export function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

export function ease(cur, target, dt, rate = 12) {
  return cur + (target - cur) * (1 - Math.exp(-rate * dt));
}

export function shortAngle(from, to) {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

// ---- Vector icons (stroke-based, s = box size) ----
export function icon(ctx, name, x, y, s, { color = T.text, w = 0, alpha = 1, fill = false } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  const lw = w || Math.max(1.4, s * 0.11);
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  const u = s / 2; // unit half-size
  ctx.beginPath();
  switch (name) {
    case 'play':
      ctx.moveTo(-u * 0.55, -u * 0.85);
      ctx.lineTo(u * 0.85, 0);
      ctx.lineTo(-u * 0.55, u * 0.85);
      ctx.closePath();
      ctx.fill();
      break;
    case 'pause': {
      const bw = u * 0.42;
      ctx.fillRect(-u * 0.62, -u * 0.8, bw, u * 1.6);
      ctx.fillRect(u * 0.2, -u * 0.8, bw, u * 1.6);
      break;
    }
    case 'library':
      ctx.strokeRect(-u * 0.9, -u * 0.7, u * 0.5, u * 1.5);
      ctx.strokeRect(-u * 0.25, -u * 0.7, u * 0.5, u * 1.5);
      ctx.moveTo(u * 0.35, -u * 0.62);
      ctx.lineTo(u * 0.75, -u * 0.52);
      ctx.lineTo(u * 1.0, u * 0.75);
      ctx.lineTo(u * 0.6, u * 0.85);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'chapters':
      for (const dy of [-0.6, 0, 0.6]) {
        ctx.moveTo(-u * 0.35, u * dy); ctx.lineTo(u * 0.9, u * dy);
      }
      ctx.stroke();
      for (const dy of [-0.6, 0, 0.6]) dot(ctx, x - x - u * 0.75, u * dy, lw * 0.55, color);
      break;
    case 'quote':
      ctx.font = `700 ${s * 1.7}px Georgia,serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('“', 0, s * 0.28);
      break;
    case 'mic':
      ctx.moveTo(0, -u * 0.85);
      ctx.arcTo(u * 0.32, -u * 0.85, u * 0.32, -u * 0.5, u * 0.32);
      ctx.lineTo(u * 0.32, 0);
      ctx.arcTo(u * 0.32, u * 0.32, 0, u * 0.32, u * 0.32);
      ctx.arcTo(-u * 0.32, u * 0.32, -u * 0.32, 0, u * 0.32);
      ctx.lineTo(-u * 0.32, -u * 0.5);
      ctx.arcTo(-u * 0.32, -u * 0.85, 0, -u * 0.85, u * 0.32);
      ctx.closePath();
      if (fill) ctx.fill(); else ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, u * 0.62, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.moveTo(0, u * 0.62); ctx.lineTo(0, u * 0.95);
      ctx.stroke();
      break;
    case 'gear': {
      ctx.arc(0, 0, u * 0.52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, u * 0.18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = lw * 1.8;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * u * 0.58, Math.sin(a) * u * 0.58);
        ctx.lineTo(Math.cos(a) * u * 0.88, Math.sin(a) * u * 0.88);
        ctx.stroke();
      }
      break;
    }
    case 'moon':
      ctx.arc(0, 0, u * 0.8, Math.PI * 0.3, Math.PI * 1.85);
      ctx.arc(u * 0.35, -u * 0.35, u * 0.62, Math.PI * 1.7, Math.PI * 0.55, true);
      ctx.closePath();
      if (fill) ctx.fill(); else ctx.stroke();
      break;
    case 'spark': {
      // 4-point star (recall)
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const a2 = a + Math.PI / 4;
        ctx.lineTo(Math.cos(a) * u * 0.95, Math.sin(a) * u * 0.95);
        ctx.lineTo(Math.cos(a2) * u * 0.3, Math.sin(a2) * u * 0.3);
      }
      ctx.closePath();
      if (fill) ctx.fill(); else ctx.stroke();
      break;
    }
    case 'gauge':
      ctx.arc(0, u * 0.15, u * 0.85, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, u * 0.15);
      ctx.lineTo(u * 0.45, -u * 0.42);
      ctx.stroke();
      dot(ctx, 0, u * 0.15, lw * 0.8, color);
      break;
    case 'bolt':
      ctx.moveTo(u * 0.25, -u * 0.95);
      ctx.lineTo(-u * 0.45, u * 0.12);
      ctx.lineTo(-u * 0.02, u * 0.12);
      ctx.lineTo(-u * 0.25, u * 0.95);
      ctx.lineTo(u * 0.45, -u * 0.12);
      ctx.lineTo(u * 0.02, -u * 0.12);
      ctx.closePath();
      ctx.fill();
      break;
    case 'lock':
      ctx.strokeRect(-u * 0.6, -u * 0.1, u * 1.2, u * 0.95);
      ctx.beginPath();
      ctx.arc(0, -u * 0.1, u * 0.42, Math.PI, 0);
      ctx.stroke();
      dot(ctx, 0, u * 0.35, lw * 0.7, color);
      break;
    case 'check':
      ctx.moveTo(-u * 0.7, u * 0.05);
      ctx.lineTo(-u * 0.15, u * 0.6);
      ctx.lineTo(u * 0.75, -u * 0.55);
      ctx.stroke();
      break;
    case 'trash':
      ctx.moveTo(-u * 0.7, -u * 0.5); ctx.lineTo(u * 0.7, -u * 0.5);
      ctx.moveTo(-u * 0.25, -u * 0.5); ctx.lineTo(-u * 0.25, -u * 0.75); ctx.lineTo(u * 0.25, -u * 0.75); ctx.lineTo(u * 0.25, -u * 0.5);
      ctx.moveTo(-u * 0.5, -u * 0.5); ctx.lineTo(-u * 0.42, u * 0.75); ctx.lineTo(u * 0.42, u * 0.75); ctx.lineTo(u * 0.5, -u * 0.5);
      ctx.stroke();
      break;
    case 'back':
      ctx.moveTo(u * 0.3, -u * 0.7);
      ctx.lineTo(-u * 0.45, 0);
      ctx.lineTo(u * 0.3, u * 0.7);
      ctx.stroke();
      break;
    case 'skipback':
      ctx.arc(0, 0, u * 0.72, -Math.PI * 0.42, Math.PI * 1.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(u * 0.12, -u * 0.95); ctx.lineTo(u * 0.6, -u * 0.62); ctx.lineTo(u * 0.05, -u * 0.35);
      ctx.closePath(); ctx.fill();
      break;
    case 'timer':
      ctx.arc(0, u * 0.1, u * 0.75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, u * 0.1); ctx.lineTo(0, -u * 0.35);
      ctx.moveTo(-u * 0.2, -u * 0.85); ctx.lineTo(u * 0.2, -u * 0.85);
      ctx.stroke();
      break;
    case 'flame':
      ctx.moveTo(0, -u * 0.9);
      ctx.bezierCurveTo(u * 0.75, -u * 0.2, u * 0.65, u * 0.35, 0, u * 0.9);
      ctx.bezierCurveTo(-u * 0.65, u * 0.35, -u * 0.75, -u * 0.2, 0, -u * 0.9);
      if (fill) ctx.fill(); else ctx.stroke();
      break;
    case 'wifi':
      for (const rr of [0.35, 0.65, 0.95]) {
        ctx.beginPath();
        ctx.arc(0, u * 0.55, u * rr, Math.PI * 1.28, Math.PI * 1.72);
        ctx.stroke();
      }
      dot(ctx, 0, u * 0.55, lw * 0.65, color);
      break;
    case 'bt':
      ctx.moveTo(-u * 0.45, -u * 0.45);
      ctx.lineTo(u * 0.42, u * 0.45);
      ctx.lineTo(0, u * 0.9);
      ctx.lineTo(0, -u * 0.9);
      ctx.lineTo(u * 0.42, -u * 0.45);
      ctx.lineTo(-u * 0.45, u * 0.45);
      ctx.stroke();
      break;
    case 'display':
      ctx.arc(0, 0, u * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, u * 0.48, -Math.PI / 2, Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      break;
    case 'headphones':
      ctx.arc(0, u * 0.05, u * 0.78, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(-u * 0.95, u * 0.05, u * 0.34, u * 0.7);
      ctx.strokeRect(u * 0.61, u * 0.05, u * 0.34, u * 0.7);
      break;
  }
  ctx.restore();
}

