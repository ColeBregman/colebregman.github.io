import { motion } from 'framer-motion';

/**
 * Apple-style product narrative for the ode. audiobook player.
 * Alternating full-photo "chapters" with restrained editorial type,
 * soft navy-tinted depth, and spring reveals. Uses the real device photos.
 */

const NAVY = '#2b57c4';

const chapters = [
  {
    img: '/assets/device-hero.jpg',
    eyebrow: 'The display',
    title: 'A whole book, on a coin of glass.',
    body: 'A round 240×240 screen shows the cover, where you are in the chapter, and the time left — and nothing else fighting for your attention.',
  },
  {
    img: '/assets/device-buttons.jpg',
    eyebrow: 'The controls',
    title: 'You never have to look.',
    body: 'A knurled wheel scrubs and sets volume; two thumb-buttons capture a quote or start a voice note — all by feel, mid-walk, mid-set, mid-thought.',
  },
  {
    img: '/assets/device-internals.jpg',
    eyebrow: 'Inside',
    title: 'A Raspberry Pi, tuned to disappear.',
    body: 'A Pi Zero 2 W drives a PCM5102A DAC and an I²S microphone on one shared bus. Whisper runs on the device itself — what you say never leaves your hand.',
  },
  {
    img: '/assets/device-teardown.jpg',
    eyebrow: 'Built by hand',
    title: 'Every part, chosen on purpose.',
    body: 'Soldered point to point and packed into a two-tone printed shell around an 1100 mAh cell — roughly five hours of listening between charges.',
  },
];

const display = '-apple-system, "SF Pro Display", "Segoe UI", system-ui, sans-serif';

export function AudiobookStory() {
  return (
    <section className="relative w-full overflow-hidden py-24 md:py-32">
      {/* ambient navy wash for depth (no hard section-color break) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(80% 50% at 50% 0%, rgba(43,87,196,0.05), rgba(255,255,255,0) 60%)' }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        {/* intro */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.9 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="font-mono text-xs uppercase tracking-[0.24em]" style={{ color: NAVY }}>
            The device
          </div>
          <h2
            className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight text-black"
            style={{ fontFamily: display, letterSpacing: '-0.03em', textWrap: 'balance' }}
          >
            Small enough to forget. Good enough to reach for.
          </h2>
        </motion.div>

        {/* alternating chapters */}
        <div className="mt-20 md:mt-28 flex flex-col gap-24 md:gap-40">
          {chapters.map((c, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={c.img}
                className="grid items-center gap-10 md:gap-16 md:grid-cols-2"
              >
                {/* image */}
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-12%' }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 1 }}
                  className={flip ? 'md:order-2' : ''}
                >
                  <div
                    className="overflow-hidden rounded-[28px] ring-1 ring-black/5 bg-neutral-50"
                    style={{ boxShadow: '0 40px 80px -32px rgba(28,40,80,0.35)' }}
                  >
                    <img
                      src={c.img}
                      alt={c.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </motion.div>

                {/* copy */}
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-12%' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.9, delay: 0.08 }}
                  className={flip ? 'md:order-1 md:pr-6' : 'md:pl-6'}
                >
                  <div className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: NAVY }}>
                    {c.eyebrow}
                  </div>
                  <h3
                    className="mt-3 text-3xl md:text-[2.6rem] md:leading-[1.05] font-semibold tracking-tight text-black"
                    style={{ fontFamily: display, letterSpacing: '-0.02em', textWrap: 'balance' }}
                  >
                    {c.title}
                  </h3>
                  <p className="mt-5 text-lg leading-relaxed text-neutral-500 max-w-[46ch]">
                    {c.body}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
