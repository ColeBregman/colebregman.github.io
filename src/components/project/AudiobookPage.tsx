import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';
import type { Project } from '../../types/project';
import { DeviceShowcase } from './DeviceShowcase';
import { AudiobookStory } from './AudiobookStory';
import { getNextProjectLink, getNextProjectTitle } from '../../utils/projectHelpers';

const NAVY = '#2b57c4';
const TEAL = '#0f9a8a';
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

/* ---------- the page ---------- */

export function AudiobookPage({ project }: { project: Project }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroP, [0, 1], ['0%', '30%']);
  const heroFade = useTransform(heroP, [0, 0.8], [1, 0]);

  return (
    <div className="bg-white text-[#0a0a0a]">
      {/* ============ HERO ============ */}
      <header ref={heroRef} className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pt-24 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(70% 55% at 50% 30%, rgba(43,87,196,0.07), rgba(255,255,255,0) 65%)' }}
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
            className="mt-5 font-semibold tracking-tight"
            style={{ fontFamily: DISPLAY, fontSize: 'clamp(72px,16vw,168px)', letterSpacing: '-0.05em', lineHeight: 0.9 }}
          >
            ode<span style={{ color: NAVY }}>.</span>
          </motion.h1>
          <Reveal delay={0.25}>
            <p className="mt-4 font-medium" style={{ fontFamily: DISPLAY, fontSize: 'clamp(20px,3vw,30px)', letterSpacing: '-0.02em' }}>
              Audiobooks, remembered.
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <p className="mx-auto mt-5 max-w-[52ch] text-lg leading-relaxed text-neutral-500">
              A distraction-free player for people who read with their ears — with controls you feel,
              quotes it remembers for you, and nothing else asking for your attention.
            </p>
          </Reveal>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400"
        >
          Scroll to build it ↓
        </motion.div>
      </header>

      {/* ============ 3D EXPLODE → ASSEMBLE ============ */}
      <DeviceShowcase />

      {/* ============ THE WHY ============ */}
      <section className="relative px-6 py-28 md:py-40">
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

      {/* ============ THE ONE FEATURE THAT STARTED IT (teal / retention) ============ */}
      <section className="relative px-6 py-28 md:py-36">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 50% at 50% 50%, rgba(16,154,138,0.06), rgba(255,255,255,0) 65%)' }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal><div className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: TEAL }}>The feature I always wanted</div></Reveal>
          <LineReveal
            text="Hear a line worth keeping? Keep it."
            className="mt-6 font-semibold tracking-tight"
            style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,5.5vw,62px)', letterSpacing: '-0.03em', lineHeight: 1.03, textWrap: 'balance' }}
          />
          <Reveal delay={0.15}>
            <p className="mx-auto mt-7 max-w-[54ch] text-xl leading-relaxed text-neutral-500">
              One press grabs the last thirty seconds and transcribes it — with the book, chapter and
              timestamp — running Whisper on the device itself. No phone, no account, no cloud. The
              lines you'd have forgotten are waiting for you later.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ FEATURES GRID ============ */}
      <section className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px,4vw,46px)', letterSpacing: '-0.03em' }}>
              Everything I wished an app had.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Distraction-free', 'One book, one screen. No feeds, no badges, no reason to look at your phone.'],
              ['Quote capture', 'Save the last 30 seconds as text, transcribed on-device.', true],
              ['Voice notes', 'Press to pause, speak a thought, and it lands with the exact timestamp.', true],
              ['Physical controls', 'A knurled wheel and thumb-buttons you can work without looking.'],
              ['Speed & sleep', '0.75–2× per book, a sleep timer, and resume that rewinds when you come back.'],
              ['All the formats', 'MP3, M4B, AAC and FLAC, with 256 GB of room for a whole library.'],
            ].map(([title, body, teal], i) => (
              <Reveal key={title as string} delay={i * 0.05}>
                <div
                  className="group h-full rounded-3xl border border-black/[0.06] bg-white p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: '0 1px 2px rgba(28,40,80,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 30px 60px -30px rgba(28,40,80,0.28)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 2px rgba(28,40,80,0.04)')}
                >
                  <div className="mb-4 h-9 w-9 rounded-xl" style={{ background: teal ? 'rgba(16,154,138,0.12)' : 'rgba(43,87,196,0.1)' }} />
                  <h3 className="text-lg font-semibold" style={{ color: teal ? TEAL : '#0a0a0a' }}>{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ THE MAKING-OF (challenge → approach → build) ============ */}
      <section className="px-6 py-28 md:py-40">
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
                  Before touching a component I built a full simulation of the interface and I/O on my Mac —
                  so by the time I reached for a soldering iron, I knew exactly which parts I needed and how
                  they'd behave.
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

      {/* ============ SPECS ============ */}
      <section className="px-6 py-24" style={{ background: 'linear-gradient(180deg, #ffffff, #f7f8fb)' }}>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="text-center font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px,4vw,46px)', letterSpacing: '-0.03em' }}>
              The finished thing.
            </h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-y-12 md:grid-cols-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {[
              [240, '×240', 'round display'],
              [5, ' hr', 'per charge'],
              [256, ' GB', 'library'],
              [100, '%', 'offline AI'],
            ].map(([n, suf, label], i) => (
              <Reveal key={label as string} delay={i * 0.08} className="text-center">
                <div className="font-semibold tracking-tight" style={{ fontFamily: DISPLAY, fontSize: 'clamp(40px,6vw,64px)', letterSpacing: '-0.03em', color: NAVY }}>
                  <CountUp end={n as number} duration={2} enableScrollSpy scrollSpyOnce />{suf}
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-widest text-neutral-500">{label}</div>
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

      {/* ============ CLOSING ============ */}
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
              style={{ background: '#0a0a0a' }}>
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
