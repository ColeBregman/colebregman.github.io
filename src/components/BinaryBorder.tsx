import { useMemo } from 'react';

// Generate random binary string
const generateBinary = (length: number) => {
  return Array.from({ length }, () => (Math.random() > 0.5 ? '1' : '0')).join('');
};

// Generate pattern with binary and slashes
const generatePattern = (segmentCount: number) => {
  const segments = [];
  for (let i = 0; i < segmentCount; i++) {
    segments.push(generateBinary(11));
    segments.push(' //////////////////////////////////////////// ');
  }
  return segments.join('');
};

/**
 * Decorative binary/slash strip. The pattern is generated once and scrolled
 * with a GPU-composited CSS animation instead of re-rendering on a timer,
 * so it costs nothing after mount. Disabled under prefers-reduced-motion.
 */
export function BinaryBorder() {
  // 16 segments is wider than any viewport; overflow is hidden
  const pattern = useMemo(() => generatePattern(16), []);

  return (
    <div
      aria-hidden="true"
      className="font-mono leading-tight py-2 opacity-60 whitespace-nowrap overflow-hidden w-full"
    >
      <div className="inline-block animate-scroll-left will-change-transform">
        <span className="text-[8px]">{pattern}{pattern}</span>
      </div>
    </div>
  );
}
