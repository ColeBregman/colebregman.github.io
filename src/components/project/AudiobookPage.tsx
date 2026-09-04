import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';
import type { Project } from '../../types/project';
import { DeviceShowcase } from './DeviceShowcase';
import { DeviceSim3D } from './DeviceSim3D';
import { AudiobookStory } from './AudiobookStory';
import { getNextProjectLink, getNextProjectTitle } from '../../utils/projectHelpers';

const NAVY = '#2b57c4';
const NAVY_DEEP = '#1c3f96';
const TEAL = '#0f9a8a';
const INK = '#0a0a0a';
const DISPLAY = '-apple-system, "SF Pro Display", "Segoe UI", system-ui, sans-serif';

/* ---------- small motion helpers ---------- */

function Reveal({
  children, y = 28, delay = 0, className = '',
}: { children: React.ReactNode; y?: number; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ type: 'spring', bounce: 0.18, duration: 0.9, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Words rise in, staggered — the Apple headline reveal. */
function LineReveal({ text, className = '', style = {} }:
  { text: string; className?: string; style?: React.CSSProperties }) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  return (
    <motion.h2
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-18%' }}
      transition={{ staggerChildren: reduce ? 0 : 0.045 }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          variants={{
            hidden: { opacity: 0, y: '0.5em' },
            show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.2, duration: 0.7 } },
          }}
        >
          {w + (i < words.length - 1 ? ' ' : '')}
        </motion.span>
      ))}
    </motion.h2>
  );
}

/** Image that drifts slightly as it scrolls through the viewport. */
function ParallaxMedia({ src, alt, video = false, className = '' }:
  { src: string; alt: string; video?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-6%', '6%']);
  return (
    <div ref={ref} className={`overflow-hidden rounded-[28px] ring-1 ring-black/5 bg-neutral-100 ${className}`}
      style={{ boxShadow: '0 40px 90px -34px rgba(28,40,80,0.4)' }}>
      <motion.div style={{ y }} className="h-full w-full">
        {video ? (
          <video src={src} autoPlay muted loop playsInline className="h-full w-full object-cover" />
        ) : (
          <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover scale-[1.12]" />
        )}
      </motion.div>
    </div>
  );
}

/* ---------- feature glyphs (SF-style line icons, 24×24, currentColor) ---------- */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const ICONS: Record<string, React.ReactNode> = {
  focus: (<svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /></svg>),
  quote: (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.6 6.2C7 7.4 5.3 9.8 5.3 12.8c0 2.1 1.3 3.6 3.2 3.6 1.6 0 2.8-1.2 2.8-2.8 0-1.5-1-2.6-2.5-2.6-.2 0-.5 0-.7.1.3-1.3 1.4-2.5 3-3.2L9.6 6.2zM17.7 6.2c-2.6 1.2-4.3 3.6-4.3 6.6 0 2.1 1.3 3.6 3.2 3.6 1.6 0 2.8-1.2 2.8-2.8 0-1.5-1-2.6-2.5-2.6-.2 0-.5 0-.7.1.3-1.3 1.4-2.5 3-3.2l-1.5-1.7z" /></svg>),
  mic: (<svg viewBox="0 0 24 24" {...S}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" /><path d="M12 18v3" /></svg>),
  dial: (<svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="7.4" /><path d="M12 4.6v1.8M12 17.6v1.8M4.6 12h1.8M17.6 12h1.8M6.9 6.9l1.3 1.3M15.8 15.8l1.3 1.3M17.1 6.9l-1.3 1.3M8.2 15.8l-1.3 1.3" /><circle cx="12" cy="12" r="1.9" fill="currentColor" stroke="none" /></svg>),
  gauge: (<svg viewBox="0 0 24 24" {...S}><path d="M4 15.5a8 8 0 0 1 16 0" /><path d="M12 15.5l4.2-3.7" /><circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" /></svg>),
  layers: (<svg viewBox="0 0 24 24" {...S}><path d="M12 3l8 4.5-8 4.5-8-4.5L12 3z" /><path d="M4 12l8 4.5 8-4.5" /><path d="M4 16.5 12 21l8-4.5" opacity="0.45" /></svg>),
};

/* ---------- sticky local nav (Apple product-page style) ---------- */

function LocalNav({ project }: { project: Project }) {
  const items = [['Overview', 'overview'], ['Highlights', 'highlights'], ['Try it', 'tryit'], ['Specs', 'specs']];
  return (
    <nav
      className="sticky top-0 z-40 border-b border-black/[0.06]"
      style={{ background: 'rgba(250,250,250,0.72)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
    >
      <div className="mx-auto flex h-11 max-w-5xl items-center justify-center gap-5 px-6 text-[13px]">
        <div className="flex items-center gap-5 text-neutral-500 sm:gap-7">
          {items.map(([label, id]) => (
            <a key={id} href={`#${id}`} className="transition-colors hover:text-black">{label}</a>
          ))}
          <Link
            to={getNextProjectLink(project.id)}
            className="rounded-full px-3.5 py-1 font-medium text-white transition-transform hover:scale-[1.04] active:scale-95"
            style={{ background: NAVY }}
          >
            Next ↗
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ---------- "Get the highlights" — horizontal snap carousel ---------- */

const HIGHLIGHTS: { icon: keyof typeof ICONS; title: string; body: string; grad: [string, string]; accent: string }[] = [
  { icon: 'quote', title: 'Quote\ncapture', body: 'Save any line as text — transcribed on the device itself.', grad: ['#0f9a8a', '#0a6f63'], accent: '#eafffb' },
  { icon: 'mic', title: 'Voice\nnotes', body: 'Speak a thought; it lands with the exact chapter and time.', grad: ['#12b0a0', '#0b7a6d'], accent: '#eafffb' },
  { icon: 'dial', title: 'Controls\nyou feel', body: 'A knurled wheel and thumb-buttons you work without looking.', grad: ['#2b57c4', '#1c3f96'], accent: '#eef3ff' },
  { icon: 'focus', title: 'Zero\ndistractions', body: 'One book, one round screen. No feeds, no badges, no phone.', grad: ['#31406b', '#1a2440'], accent: '#eef3ff' },
  { icon: 'gauge', title: 'Offline\nby design', body: 'Whisper runs on-device. No account, no cloud, ever.', grad: ['#2b57c4', '#1c3f96'], accent: '#eef3ff' },
  { icon: 'layers', title: 'A whole\nlibrary', body: 'MP3, M4B, AAC, FLAC — 256 GB and ~5 hours a charge.', grad: ['#3a3f4c', '#16181f'], accent: '#f2f3f5' },
];

function Highlights() {
  return (
    <section id="highlights" className="scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px,4.5vw,52px)', letterSpacing: '-0.03em' }}>
            Get the highlights.
          </h2>
        </Reveal>
      </div>
      <div
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 md:mt-12"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <style>{`#highlights ::-webkit-scrollbar{display:none}`}</style>
        <div className="shrink-0" style={{ width: 'max(0px, calc((100vw - 72rem) / 2))' }} aria-hidden />
        {HIGHLIGHTS.map((h, i) => (
          <motion.div
            key={h.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ type: 'spring', bounce: 0.16, duration: 0.8, delay: (i % 3) * 0.06 }}
            className="relative flex aspect-[3/4] w-[260px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[28px] p-6 md:w-[300px]"
            style={{ background: `linear-gradient(160deg, ${h.grad[0]}, ${h.grad[1]})`, boxShadow: '0 30px 60px -32px rgba(28,40,80,0.5)' }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl [&>svg]:h-6 [&>svg]:w-6"
              style={{ background: 'rgba(255,255,255,0.16)', color: h.accent }}
            >
              {ICONS[h.icon]}
            </div>
            <div>
              <h3 className="whitespace-pre-line font-semibold tracking-tight text-white" style={{ fontFamily: DISPLAY, fontSize: 'clamp(24px,2.4vw,30px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                {h.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: h.accent, opacity: 0.86 }}>{h.body}</p>
            </div>
          </motion.div>
        ))}
        <div className="shrink-0 pr-1" style={{ width: 'max(1.5rem, calc((100vw - 72rem) / 2))' }} aria-hidden />
      </div>
    </section>
  );
}

/* ---------- the page ---------- */

export function AudiobookPage({ project }: { project: Project }) {
  const [sim3d, setSim3d] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroP, [0, 1], ['0%', '24%']);
  const heroFade = useTransform(heroP, [0, 0.85], [1, 0]);
  const imgY = useTransform(heroP, [0, 1], ['0%', '14%']);
  const imgScale = useTransform(heroP, [0, 1], [1, 1.06]);

  return (
    <div className="bg-[#fafafa] text-[#0a0a0a]" style={{ scrollBehavior: 'smooth' }}>
      <LocalNav project={project} />

      {/* ============ HERO ============ */}
      <header id="overview" ref={heroRef} className="relative flex min-h-[100dvh] scroll-mt-16 flex-col items-center px-6 pt-24 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(70% 50% at 50% 22%, rgba(43,87,196,0.08), rgba(250,250,250,0) 62%)' }}
        />
        <motion.div style={{ y: heroY, opacity: heroFade }} className="relative">
          <Reveal y={16}>
            <div className="font-mono text-xs uppercase tracking-[0.28em]" style={{ color: NAVY }}>
              A handheld audiobook player, built from scratch
            </div>
          </Reveal>
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', bounce: 0.2, duration: 1.1, delay: 0.1 }}
            className="mt-4 font-semibold tracking-tight"
            style={{ fontFamily: DISPLAY, fontSize: 'clamp(76px,17vw,184px)', letterSpacing: '-0.05em', lineHeight: 0.9 }}
          >
            ode<span style={{ color: NAVY }}>.</span>
          </motion.h1>
          <Reveal delay={0.22}>
            <p className="mt-3 font-medium" style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,3.2vw,34px)', letterSpacing: '-0.02em' }}>
              Audiobooks, remembered.
            </p>
          </Reveal>
        </motion.div>

        {/* product hero shot */}
        <motion.div style={{ y: imgY, scale: imgScale }} className="relative mt-4 w-full max-w-[420px]">
          <motion.img
            src="/assets/device-hero.jpg"
            alt="The ode. audiobook player"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.16, duration: 1.2, delay: 0.35 }}
            className="mx-auto w-full rounded-[32px] object-contain"
            style={{ filter: 'drop-shadow(0 50px 60px rgba(28,40,80,0.28))' }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
          className="pointer-events-none absolute bottom-6 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400"
        >
          Scroll to explore ↓
        </motion.div>
      </header>

      {/* ============ HIGHLIGHTS CAROUSEL ============ */}
      <Highlights />

      {/* ============ TAKE A CLOSER LOOK — 3D explode → assemble ============ */}
      <div className="mx-auto max-w-6xl px-6 pt-6 text-center">
        <Reveal>
          <div className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: NAVY }}>Take a closer look</div>
          <h2 className="mx-auto mt-4 max-w-3xl font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,5vw,58px)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
            Forty parts, in the palm of your hand.
          </h2>
        </Reveal>
      </div>
      <DeviceShowcase />

      {/* ============ THE WHY ============ */}
      <section className="relative scroll-mt-16 px-6 py-28 md:py-40">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: NAVY }}>Why</div>
          </Reveal>
          <LineReveal
            text="I love books. Somewhere in college, I stopped having the time to get lost in one."
            className="mt-6 font-semibold tracking-tight"
            style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,5vw,58px)', letterSpacing: '-0.03em', lineHeight: 1.05, textWrap: 'balance' }}
          />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-[60ch] text-xl leading-relaxed text-neutral-500">
              Audiobooks gave reading back to me — in the gym, on walks, doing dishes. But listening on
              my phone meant every notification came along for the ride. I wanted one object that does
              this and nothing else.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ PRODUCT STORY (real photos) ============ */}
      <AudiobookStory />

      {/* ============ THE ONE FEATURE THAT STARTED IT (teal, full-bleed) ============ */}
      <section className="relative overflow-hidden px-6 py-28 md:py-40" style={{ background: 'linear-gradient(180deg, #0b1f1c, #06110f)' }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 45% at 50% 42%, rgba(16,176,160,0.22), rgba(6,17,15,0) 68%)' }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal><div className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: '#5fe6d2' }}>The feature I always wanted</div></Reveal>
          <LineReveal
            text="Hear a line worth keeping? Keep it."
            className="mt-6 font-semibold tracking-tight text-white"
            style={{ fontFamily: DISPLAY, fontSize: 'clamp(32px,6vw,68px)', letterSpacing: '-0.03em', lineHeight: 1.02, textWrap: 'balance' }}
          />
          <Reveal delay={0.15}>
            <p className="mx-auto mt-7 max-w-[54ch] text-xl leading-relaxed" style={{ color: 'rgba(220,255,248,0.72)' }}>
              One press grabs the last thirty seconds and transcribes it — with the book, chapter and
              timestamp — running Whisper on the device itself. No phone, no account, no cloud. The
              lines you'd have forgotten are waiting for you later.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ FEATURES GRID ============ */}
      <section className="scroll-mt-16 px-6 py-24 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px,4.5vw,52px)', letterSpacing: '-0.03em' }}>
              Everything I wished an app had.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {([
              ['focus', 'Distraction-free', 'One book, one screen. No feeds, no badges, no reason to look at your phone.', false],
              ['quote', 'Quote capture', 'Save the last 30 seconds as text, transcribed on-device.', true],
              ['mic', 'Voice notes', 'Press to pause, speak a thought, and it lands with the exact timestamp.', true],
              ['dial', 'Physical controls', 'A knurled wheel and thumb-buttons you can work without looking.', false],
              ['gauge', 'Speed & sleep', '0.75–2× per book, a sleep timer, and resume that rewinds when you come back.', false],
              ['layers', 'All the formats', 'MP3, M4B, AAC and FLAC, with 256 GB of room for a whole library.', false],
            ] as [keyof typeof ICONS, string, string, boolean][]).map(([icon, title, body, teal], i) => (
              <Reveal key={title} delay={i * 0.05}>
                <div
                  className="group h-full rounded-3xl border border-black/[0.06] bg-white p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: '0 1px 2px rgba(28,40,80,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 30px 60px -30px rgba(28,40,80,0.28)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 2px rgba(28,40,80,0.04)')}
                >
                  <div
                    className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl [&>svg]:h-[22px] [&>svg]:w-[22px]"
                    style={{ background: teal ? 'rgba(16,154,138,0.1)' : 'rgba(43,87,196,0.09)', color: teal ? TEAL : NAVY }}
                    aria-hidden
                  >
                    {ICONS[icon]}
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: teal ? TEAL : INK }}>{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRY IT YOURSELF (real interactive simulator) ============ */}
      <section id="tryit" className="scroll-mt-16 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center">
              <div className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: NAVY }}>Try it yourself</div>
              <h2 className="mx-auto mt-5 max-w-3xl font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,5vw,56px)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
                The real interface, running in your browser.
              </h2>
              <p className="mx-auto mt-6 max-w-[56ch] text-lg leading-relaxed text-neutral-500">
                This is the actual simulator I built to design the device — the same screen-drawing code
                that now runs on the hardware. Turn the wheel to move, click it to play, and use the mic
                and bookmark buttons. Try it flat, or on the real 3D model.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-full border border-black/10 bg-white p-1 text-sm">
                {[['Interactive', false], ['3D model', true]].map(([label, on]) => (
                  <button
                    key={label as string}
                    onClick={() => setSim3d(on as boolean)}
                    className={`rounded-full px-5 py-1.5 font-medium transition-colors ${sim3d === on ? 'text-white' : 'text-neutral-600 hover:text-neutral-900'}`}
                    style={sim3d === on ? { background: NAVY } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div
              className="mt-8 overflow-hidden rounded-[28px] ring-1 ring-black/5"
              style={{ background: '#eceae4', boxShadow: '0 50px 100px -40px rgba(28,40,80,0.4)' }}
            >
              {sim3d ? (
                <div className="h-[560px] w-full md:h-[600px]">
                  <DeviceSim3D />
                </div>
              ) : (
                <iframe
                  src="/sim/embed.html"
                  title="ode. interface simulator"
                  loading="lazy"
                  className="block h-[840px] w-full border-0 md:h-[600px]"
                />
              )}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
              <span>
                {sim3d
                  ? 'Drag to rotate · scroll the wheel · click the buttons on the device'
                  : 'Turn/scroll the wheel · click it to play · mic records, bookmark saves a quote'}
              </span>
              <a href="/sim/index.html" target="_blank" rel="noreferrer" className="font-medium hover:underline" style={{ color: NAVY }}>
                Open the full simulator ↗
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ THE MAKING-OF (challenge → approach → build) ============ */}
      <section className="scroll-mt-16 px-6 py-28 md:py-40">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: NAVY }}>How it was made</div>
            <h2 className="mt-5 font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,5vw,56px)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
              Simulated on a Mac, long before a wire was cut.
            </h2>
          </Reveal>

          {/* beat 1 — simulate */}
          <div className="mt-16 grid items-center gap-10 md:grid-cols-2 md:gap-16">
            <Reveal><ParallaxMedia src="/assets/audiobook-macsim.mp4" alt="Mac simulation of the interface" video /></Reveal>
            <Reveal delay={0.1}>
              <div className="md:pl-4">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">01 — Prove it in software</div>
                <h3 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight" style={{ fontFamily: DISPLAY }}>The whole player, faked on my laptop.</h3>
                <p className="mt-4 text-lg leading-relaxed text-neutral-500 max-w-[46ch]">
                  That simulator above is where it started. Before touching a component I built the whole
                  interface and I/O in software — so by the time I reached for a soldering iron, I knew
                  exactly which parts I needed and how they'd behave.
                </p>
              </div>
            </Reveal>
          </div>

          {/* beat 2 — breadboard */}
          <div className="mt-24 grid items-center gap-10 md:grid-cols-2 md:gap-16">
            <Reveal delay={0.1} className="md:order-2"><ParallaxMedia src="/assets/audiobook-breadboard-1.webp" alt="First working breadboard prototype" /></Reveal>
            <Reveal className="md:order-1">
              <div className="md:pr-4">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">02 — Bring it up for real</div>
                <h3 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight" style={{ fontFamily: DISPLAY }}>Screen, controls, audio — one at a time.</h3>
                <p className="mt-4 text-lg leading-relaxed text-neutral-500 max-w-[46ch]">
                  On the breadboard I brought the system up piece by piece — learning the hardware side as I
                  went: wiring, power management, and the messy reality of real-device I/O.
                </p>
              </div>
            </Reveal>
          </div>

          {/* beat 3 — enclosure iteration (image strip) */}
          <div className="mt-24">
            <Reveal>
              <div className="md:max-w-[48ch]">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">03 — Redesign until it felt right</div>
                <h3 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight" style={{ fontFamily: DISPLAY }}>A round screen sent the case back to the drawing board.</h3>
                <p className="mt-4 text-lg leading-relaxed text-neutral-500">
                  Switching to a round display meant rounds of CAD and 3D-printed enclosures — each one
                  tested in the hand — until the form factor finally disappeared into it.
                </p>
              </div>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
              {[
                ['/assets/initialmockup-B6cGBnij.webp', 'Photoshop mockup'],
                ['/assets/audiobook-round-display.webp', 'Round display test'],
                ['/assets/audiobook-iterations.webp', 'Enclosure iterations'],
                ['/assets/audiobook-final-print.webp', 'Final print'],
              ].map(([src, cap], i) => (
                <Reveal key={src} delay={i * 0.07}>
                  <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 bg-neutral-100" style={{ boxShadow: '0 20px 44px -28px rgba(28,40,80,0.3)' }}>
                    <img src={src} alt={cap} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  </div>
                  <div className="mt-2 text-center font-mono text-[11px] uppercase tracking-wider text-neutral-400">{cap}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SPECS — big Apple-style stat blocks ============ */}
      <section id="specs" className="scroll-mt-16 px-6 py-24 md:py-28" style={{ background: 'linear-gradient(180deg, #fafafa, #f1f3f8)' }}>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="text-center font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,5vw,56px)', letterSpacing: '-0.03em' }}>
              The specs.
            </h2>
          </Reveal>
          <div className="mt-16 grid grid-cols-2 gap-y-14 md:grid-cols-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {([
              [240, '×240', 'round display'],
              [5, ' hr', 'per charge'],
              [256, ' GB', 'library'],
              [100, '%', 'offline AI'],
            ] as [number, string, string][]).map(([n, suf, label], i) => (
              <Reveal key={label} delay={i * 0.08} className="text-center">
                <div className="font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(52px,8vw,88px)', letterSpacing: '-0.04em', color: NAVY_DEEP, lineHeight: 1 }}>
                  <CountUp end={n} duration={2} enableScrollSpy scrollSpyOnce />
                  <span style={{ fontSize: '0.42em', color: NAVY }}>{suf}</span>
                </div>
                <div className="mt-3 font-mono text-xs uppercase tracking-widest text-neutral-500">{label}</div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-16 flex flex-wrap justify-center gap-2.5">
              {(project.technologies ?? []).concat(['Raspberry Pi Zero 2 W', 'GC9A01 display', 'PCM5102A DAC', 'Whisper on-device', 'mpv', 'SQLite']).map((t) => (
                <span key={t} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-neutral-600">{t}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ KEEP EXPLORING ============ */}
      <section className="px-6 py-28 md:py-40 text-center">
        <Reveal>
          <LineReveal
            text="Soldered, sealed, and still easy to open."
            className="mx-auto max-w-4xl font-semibold tracking-tight"
            style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,5.5vw,60px)', letterSpacing: '-0.03em', lineHeight: 1.05, textWrap: 'balance' }}
          />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-7 max-w-[56ch] text-xl leading-relaxed text-neutral-500">
            Hardware and software working as one device — quote capture and all. The latest work is about
            longevity: keeping every part secure inside the shell while staying easy to take apart for the
            next upgrade.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link to={getNextProjectLink(project.id)}
              className="rounded-full px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
              style={{ background: INK }}>
              Next: {getNextProjectTitle(project.id)} →
            </Link>
            <Link to="/#projects" className="rounded-full border border-black/15 px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-black/40">
              All projects
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
