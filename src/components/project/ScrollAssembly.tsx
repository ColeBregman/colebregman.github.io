import { useEffect, useRef, useState } from 'react';

const VIDEO_URL = '/assets/assembly.mp4';
const POSTER_URL = '/assets/assembly-poster.jpg';
const ACCENT = '#6f9bff';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// The video's real assembly timeline (seconds). Scroll scrubs 0 → ASM_END;
// the remaining tail (ASM_END → duration) is a "spin for fun" that autoplays.
const ASM_END = 17;

/** Each card is tied to the window of video time in which its part flies in. */
const STAGES = [
  { t0: 0,  t1: 4,  label: 'Controls', part: 'Capture · Voice · Back buttons', body: 'The button sub-assembly — three buttons designed and 3D-printed for a satisfying press.' },
  { t0: 4,  t1: 6,  label: 'Chassis',  part: 'Shell + 1.28″ round TFT',        body: 'The printed shell and the round screen — one book, one cover.' },
  { t0: 6,  t1: 9,  label: 'Power',    part: 'Power module',                    body: 'Regulation and USB-C charging along the spine.' },
  { t0: 9,  t1: 10, label: 'Compute',  part: 'Raspberry Pi Zero 2 W',          body: 'The quad-core brain running the player and on-device Whisper.' },
  { t0: 10, t1: 11, label: 'Audio',    part: 'DAC',                            body: 'A dedicated digital-to-analog converter for clean playback.' },
  { t0: 11, t1: 12, label: 'Capture',  part: 'Microphone',                     body: 'A MEMS mic for capturing quotes and voice notes.' },
  { t0: 12, t1: 13, label: 'Battery',  part: '1100 mAh LiPo',                  body: 'An all-day cell tucked into the base.' },
  { t0: 13, t1: 14, label: 'Sound',    part: 'Amplifier + speaker',            body: 'Amp and speaker for listening out loud before bed.' },
  { t0: 14, t1: 15, label: 'Wheel',    part: 'Rotary encoder + knob',          body: 'The knurled wheel for scrubbing and menus.' },
  { t0: 15, t1: 17, label: 'Cover',    part: 'Back cover + screws',            body: 'The back cover and fasteners close it up by hand.' },
];
const N = STAGES.length;

function stageAt(time: number): number {
  if (time < STAGES[0].t0) return -1;
  if (time >= ASM_END) return N; // fully assembled → spinning
  for (let i = 0; i < N; i++) if (time >= STAGES[i].t0 && time < STAGES[i].t1) return i;
  return N - 1;
}

/**
 * "Assemble on scroll" teardown for the ode. player.
 * Left: a rendered assembly animation scrubbed by scroll — the device builds
 * itself part by part as you move down the pinned section, then spins on its
 * own once complete. Right: the component list rises in lockstep.
 * On phones it plays through on a loop with the full parts list beneath it.
 */
export function ScrollAssembly() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(-1);
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const mobileRef = useRef(mobile);
  mobileRef.current = mobile;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onMq = () => setMobile(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;
    if (mobileRef.current) return; // mobile just loops the clip; no scrubbing

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // scroll zones: [P0,PA] scrubs the assembly, [PA,P1] lets the spin autoplay
    const P0 = 0.05, PA = 0.8;
    let duration = 0;
    let raf = 0;
    let lastActive = -2;
    let lastSet = -1;
    let spinning = false;

    const onMeta = () => { duration = video.duration || 20; };
    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const rect = wrap.getBoundingClientRect();
      const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!onScreen) return;

      const totalScroll = wrap.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(1, totalScroll));

      let activeTime: number;
      if (progress < PA) {
        // ---- scrub the assembly (paused, seeked by scroll) ----
        if (spinning) { spinning = false; video.pause(); }
        const f = clamp((progress - P0) / (PA - P0));   // 0..1, linear
        const t = f * ASM_END;
        if (video.readyState >= 2 && Math.abs(t - lastSet) > 0.012 && !video.seeking) {
          video.currentTime = t; lastSet = t;
        }
        activeTime = t;
      } else {
        // ---- spin for fun: autoplay + loop the tail, independent of scroll ----
        if (!spinning) { spinning = true; video.currentTime = ASM_END; if (!reduce) video.play().catch(() => {}); }
        else if (!reduce && video.paused) video.play().catch(() => {});
        if (duration && (video.currentTime >= duration - 0.06 || video.currentTime < ASM_END - 0.25)) {
          video.currentTime = ASM_END;
        }
        activeTime = ASM_END; // everything assembled
      }

      const a = stageAt(activeTime);
      if (a !== lastActive) { lastActive = a; setActive(a); }
    };

    // prime decoding so the first scrub-seek is instant (esp. Safari/iOS)
    video.muted = true;
    if (!reduce) {
      const p = video.play();
      if (p && typeof p.then === 'function') p.then(() => video.pause()).catch(() => {});
      else video.pause();
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('loadedmetadata', onMeta);
    };
  }, [mobile]);

  // mobile: play the clip on a loop when it scrolls into view; if the browser
  // blocks autoplay, fall back to the finished device rather than an empty frame
  useEffect(() => {
    if (!mobileRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) video.play().catch(() => {}); }),
      { threshold: 0.2 }
    );
    io.observe(video);
    const onLoaded = () => { if (video.paused) { try { video.currentTime = Math.max(0, (video.duration || 20) - 1.2); } catch { /* ignore */ } } };
    video.addEventListener('loadeddata', onLoaded);
    return () => { io.disconnect(); video.removeEventListener('loadeddata', onLoaded); };
  }, [mobile]);

  const Video = (
    <video
      ref={videoRef}
      src={VIDEO_URL}
      poster={POSTER_URL}
      muted
      playsInline
      preload="auto"
      autoPlay={mobile}
      loop={mobile}
      className="h-full w-full object-contain"
      style={{ background: '#08090c' }}
    />
  );

  const Rail = (
    <div className="flex flex-col">
      <div className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: ACCENT }}>
        Designed &amp; built from scratch
      </div>
      <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tighter text-white">
        Every part, in its place.
      </h2>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-neutral-400">
        {mobile ? 'Every component, in the order it goes in.' : 'Scroll to build it — one component at a time.'}
      </p>

      <ol className="mt-4 flex flex-col gap-0.5">
        {STAGES.map((s, i) => {
          const state = mobile ? 'active' : active >= N ? (i === N - 1 ? 'active' : 'done')
            : active < 0 ? 'future'
            : i < active ? 'done' : i === active ? 'active' : 'future';
          const isActive = state === 'active';
          const isFuture = state === 'future';
          return (
            <li
              key={s.part}
              className="relative rounded-xl px-4 py-2 transition-all duration-500 ease-out"
              style={{
                background: isActive ? 'rgba(111,155,255,0.10)' : 'transparent',
                opacity: isFuture ? 0.34 : 1,
                transform: isFuture ? 'translateY(8px)' : 'translateY(0)',
              }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="font-mono text-[11px] tabular-nums transition-colors duration-500"
                  style={{ color: isActive ? ACCENT : '#5b6472' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13.5px] sm:text-sm font-bold tracking-tight text-white">
                      {s.part}
                    </span>
                    <span
                      className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-500"
                      style={{ color: isActive ? ACCENT : '#5b6472' }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div
                    className="grid transition-all duration-500 ease-out"
                    style={{
                      gridTemplateRows: isActive || mobile ? '1fr' : '0fr',
                      opacity: isActive || mobile ? 1 : 0,
                    }}
                  >
                    <p className="overflow-hidden text-[13px] leading-relaxed text-neutral-400"
                       style={{ marginTop: isActive || mobile ? 6 : 0 }}>
                      {s.body}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );

  // ---- mobile: single stacked, non-pinned block ----
  if (mobile) {
    return (
      <section ref={wrapRef} className="w-full px-6 py-16" style={{ background: '#08090c' }}>
        <div className="mx-auto max-w-lg">
          <div className="relative mb-8 aspect-[4/3] w-full overflow-hidden rounded-3xl">{Video}</div>
          {Rail}
        </div>
      </section>
    );
  }

  // ---- desktop: pinned, two columns ----
  return (
    <section ref={wrapRef} className="relative w-full" style={{ height: '680vh', background: '#08090c' }}>
      <div className="sticky top-0 flex h-screen w-full items-start overflow-hidden">
        <div className="relative h-full flex-1">{Video}</div>
        <div className="flex h-full w-[42%] max-w-[540px] shrink-0 flex-col justify-center px-8 pb-10 pt-24 lg:px-14">{Rail}</div>
      </div>
    </section>
  );
}
