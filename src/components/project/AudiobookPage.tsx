import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';
import type { Project } from '../../types/project';
import { DeviceShowcase } from './DeviceShowcase';
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

/* ---------- sticky local nav ---------- */

function LocalNav() {
  const items = [['Overview', 'overview'], ['Highlights', 'highlights'], ['Try it', 'tryit'], ['Specs', 'specs']];
  return (
    <nav className="sticky top-0 z-40 border-b-2 border-black bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/#projects" className="text-sm font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-60">
          ← Projects
        </Link>
        <div className="flex items-center gap-5 sm:gap-8">
          {items.map(([label, id]) => (
            <a key={id} href={`#${id}`} className="text-xs font-bold uppercase tracking-[0.15em] opacity-50 transition-opacity hover:opacity-100 sm:text-sm">
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ---------- "Get the highlights" — horizontal snap carousel ---------- */

const HIGHLIGHTS: { media: string; video?: boolean; eyebrow: string; title: string; body: string }[] = [
  { media: '/assets/clip-inhand.mp4', video: true, eyebrow: 'Controls', title: 'Intuitive mapping', body: 'Every control does the obvious thing — you work it without looking.' },
  { media: '/assets/device-hero.jpg', eyebrow: 'Focus', title: 'Notification-free', body: 'No feeds, no badges, nothing buzzing for your attention.' },
  { media: '/assets/clip-webui.mp4', video: true, eyebrow: 'Companion', title: 'A little web UI', body: 'A local host to upload books, see your stats, and copy out any quote or note.' },
  { media: '/assets/clip-capture.mp4', video: true, eyebrow: 'Capture', title: 'Keep the good lines', body: 'One press saves the last thirty seconds as text.' },
  { media: '/assets/device-teardown.jpg', eyebrow: 'By hand', title: 'Soldered & serviceable', body: 'Point-to-point, packed into a printed shell.' },
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
            className="relative aspect-[3/4] w-[280px] shrink-0 snap-start overflow-hidden rounded-[28px] bg-neutral-900 md:w-[320px]"
            style={{ boxShadow: '0 34px 64px -34px rgba(28,40,80,0.55)' }}
          >
            {h.video ? (
              <video src={h.media} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <img src={h.media} alt={h.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,10,20,0.86) 4%, rgba(6,10,20,0.28) 42%, rgba(6,10,20,0) 66%)' }} />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#a8c5ff' }}>{h.eyebrow}</div>
              <h3 className="mt-1.5 font-semibold tracking-tight text-white" style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,2.2vw,28px)', letterSpacing: '-0.02em', lineHeight: 1.06 }}>
                {h.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-snug text-white/75">{h.body}</p>
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
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroP, [0, 1], ['0%', '24%']);
  const heroFade = useTransform(heroP, [0, 0.85], [1, 0]);
  const imgY = useTransform(heroP, [0, 1], ['0%', '14%']);
  const imgScale = useTransform(heroP, [0, 1], [1, 1.06]);

  return (
    <div className="bg-[#fafafa] text-[#0a0a0a]" style={{ scrollBehavior: 'smooth' }}>
      <LocalNav />

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

        {/* product hero shot on a soft platform (lifts a light device off a light bg) */}
        <motion.div style={{ y: imgY, scale: imgScale }} className="relative mt-4 w-full max-w-[440px]">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-2 mx-auto h-24 w-[86%]"
            style={{ background: 'radial-gradient(60% 100% at 50% 50%, rgba(28,40,80,0.22), rgba(28,40,80,0) 72%)', filter: 'blur(6px)' }}
            aria-hidden
          />
          <motion.img
            src="/assets/device-hero.jpg"
            alt="The ode. audiobook player"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.16, duration: 1.2, delay: 0.35 }}
            className="relative mx-auto w-full rounded-[32px] object-contain"
            style={{ filter: 'drop-shadow(0 42px 46px rgba(28,40,80,0.32))' }}
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

      {/* ============ TAKE A CLOSER LOOK — 3D explode → assemble (own title inside) ============ */}
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

      {/* ============ TRY IT YOURSELF (real interactive simulator) ============ */}
      <section id="tryit" className="scroll-mt-16 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="max-w-3xl">
              <div className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: NAVY }}>Try it yourself</div>
              <h2 className="mt-5 font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,5vw,56px)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
                The real interface, running in your browser.
              </h2>
              <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-neutral-500">
                This is the actual simulator I built to design the device — the same screen-drawing code
                that now runs on the hardware. Turn the wheel to move, click it to play, and use the mic
                and bookmark buttons.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div
              className="mt-10 overflow-hidden rounded-[28px] ring-1 ring-black/5"
              style={{ background: '#eceae4', boxShadow: '0 50px 100px -40px rgba(28,40,80,0.4)' }}
            >
              <iframe
                src="/sim/embed.html"
                title="ode. interface simulator"
                loading="lazy"
                className="block h-[840px] w-full border-0 md:h-[600px]"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
              <span>Turn/scroll the wheel · click it to play · mic records, bookmark saves a quote</span>
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

      {/* ============ EVERY PROTOTYPE (real iteration photo) ============ */}
      <section className="scroll-mt-16 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
            <Reveal>
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: NAVY }}>Every version</div>
                <h2 className="mt-5 font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,5vw,54px)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
                  It took a lot of tries.
                </h2>
                <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-neutral-500">
                  Every shell here is a print I held, judged, and threw back on the pile — shrinking the
                  body, nudging buttons a millimetre, and chasing the round screen until the whole thing
                  finally disappeared into the hand.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-[24px] ring-1 ring-black/5 bg-neutral-100" style={{ boxShadow: '0 40px 90px -34px rgba(28,40,80,0.4)' }}>
                <img src="/assets/prototypes.jpg" alt="Every 3D-printed prototype shell, across dozens of iterations" loading="lazy" className="w-full object-cover" />
              </div>
            </Reveal>
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
              [39, ' MB', 'on-device AI'],
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
        <Reveal className="mx-auto mb-14 max-w-[420px]">
          <div className="overflow-hidden rounded-[28px] ring-1 ring-black/5 bg-neutral-100" style={{ boxShadow: '0 40px 90px -34px rgba(28,40,80,0.4)' }}>
            <video src="/assets/clip-hold.mp4" autoPlay muted loop playsInline className="w-full object-cover" />
          </div>
        </Reveal>
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
