import { useEffect, useRef, useState } from 'react';

const VIDEO_URL = '/assets/assembly.mp4';
const POSTER_URL = '/assets/assembly-poster.jpg';
const ACCENT = '#6f9bff';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** The build order — each card names a cluster of parts as the device comes together. */
const STAGES = [
  {
    no: '01', label: 'Compute', part: 'Raspberry Pi Zero 2 W',
    body: 'A quad-core Linux computer the size of a stick of gum. Runs the player and the on-device Whisper model that turns speech into text.',
  },
  {
    no: '02', label: 'Power', part: '1100 mAh LiPo · USB-C',
    body: 'An all-day cell, a power module, and USB-C charging tucked along the spine.',
  },
  {
    no: '03', label: 'Audio', part: 'DAC · Amp · Speaker · Mic',
    body: 'A dedicated DAC and amplifier for clean playback, and a MEMS microphone for capturing quotes and voice notes.',
  },
  {
    no: '04', label: 'Display', part: '1.28″ Round TFT',
    body: 'A single round screen — one book, one cover. No feed, no notifications.',
  },
  {
    no: '05', label: 'Controls', part: 'Encoder · Knob · Buttons',
    body: 'A knurled wheel on a rotary encoder, plus three machined buttons on springs: capture, voice, and back.',
  },
  {
    no: '06', label: 'Enclosure', part: 'Top & Back Shells',
    body: '3D-printed shells, iterated across a dozen prototypes and closed up by hand around every part.',
  },
];
const N = STAGES.length;

/**
 * "Assemble on scroll" teardown for the ode. player.
 * Left: a rendered assembly animation scrubbed by scroll — the device builds
 * itself part by part as you move down the pinned section.
 * Right: the component list rises in lockstep, each part named as it lands.
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
    // window of scroll over which the assembly plays (leaves an intro + settle)
    const P0 = 0.08, P1 = 0.9;
    let duration = 0;
    let target = 0;         // desired currentTime
    let raf = 0;
    let lastActive = -2;
    let lastSet = -1;

    const onMeta = () => { duration = video.duration || 0; };
    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const rect = wrap.getBoundingClientRect();
      const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!onScreen) return;

      const totalScroll = wrap.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(1, totalScroll));
      // linear map of scroll → assembly time so the scrub feels 1:1
      const f = clamp((progress - P0) / (P1 - P0));

      if (duration) {
        // keep a sliver of the start/end so it never sits on the empty frame 0
        target = (0.03 + 0.97 * f) * duration;
        // seek only on a meaningful change; all-intra encode makes this crisp
        if (video.readyState >= 2 && Math.abs(target - lastSet) > 0.012) {
          if (!video.seeking) { video.currentTime = target; lastSet = target; }
        }
      }

      let a: number;
      if (progress < P0) a = -1;
      else if (progress >= P1 - 0.001) a = N;
      else a = clamp(Math.floor(f * N), 0, N - 1);
      if (a !== lastActive) { lastActive = a; setActive(a); }
    };

    // prime decoding so the first scrub-seek is instant (esp. Safari/iOS)
    video.muted = true;
    const prime = () => {
      const p = video.play();
      if (p && typeof p.then === 'function') p.then(() => video.pause()).catch(() => {});
      else video.pause();
    };
    if (!reduce) prime();
    tick();

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('loadedmetadata', onMeta);
    };
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
      className="h-full w-full object-cover"
      style={{ background: '#08090c' }}
    />
  );

  const Rail = (
    <div className="flex flex-col">
      <div className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: ACCENT }}>
        Designed &amp; built from scratch
      </div>
      <h2 className="mt-2 text-[26px] sm:text-3xl font-black tracking-tighter text-white">
        Every part, in its place.
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
        {mobile ? 'Every component, modeled and labeled.' : 'Scroll to build it — one component at a time.'}
      </p>

      <ol className="mt-5 flex flex-col gap-1">
        {STAGES.map((s, i) => {
          const state = mobile ? 'active' : active >= N ? (i === N - 1 ? 'active' : 'done')
            : active < 0 ? 'future'
            : i < active ? 'done' : i === active ? 'active' : 'future';
          const isActive = state === 'active';
          const isFuture = state === 'future';
          return (
            <li
              key={s.no}
              className="relative rounded-2xl px-4 py-2.5 transition-all duration-500 ease-out"
              style={{
                background: isActive ? 'rgba(111,155,255,0.10)' : 'transparent',
                opacity: isFuture ? 0.32 : 1,
                transform: isFuture ? 'translateY(10px)' : 'translateY(0)',
              }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="font-mono text-[11px] tabular-nums transition-colors duration-500"
                  style={{ color: isActive ? ACCENT : '#5b6472' }}
                >
                  {s.no}
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
                    <p className="overflow-hidden text-[13.5px] leading-relaxed text-neutral-400"
                       style={{ marginTop: isActive || mobile ? 8 : 0 }}>
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
    <section ref={wrapRef} className="relative w-full" style={{ height: '520vh', background: '#08090c' }}>
      <div className="sticky top-0 flex h-screen w-full items-start overflow-hidden">
        <div className="relative h-full flex-1">{Video}</div>
        <div className="flex h-full w-[42%] max-w-[540px] shrink-0 flex-col justify-center px-8 pb-10 pt-24 lg:px-14">{Rail}</div>
      </div>
    </section>
  );
}
