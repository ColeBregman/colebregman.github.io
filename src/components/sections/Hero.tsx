import { useEffect, useState, useRef } from 'react';

// Generate random binary string
const generateBinary = (length: number) => {
  return Array.from({ length }, () => Math.random() > 0.5 ? '1' : '0').join('');
};

// Generate pattern with binary and slashes
const generatePattern = (segmentCount: number) => {
  const segments = [];
  for (let i = 0; i < segmentCount; i++) {
    segments.push(generateBinary(11));
    if (i < segmentCount - 1) {
      segments.push(' //////////////////////////////////////////// ');
    }
  }
  return segments.join('');
};

function BinaryBorder() {
  const [pattern, setPattern] = useState('');
  const [segmentCount, setSegmentCount] = useState(6);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateSegments = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const charWidth = 6.5;
        const segmentWidth = 56 * charWidth;
        const count = Math.floor(containerWidth / segmentWidth);
        setSegmentCount(Math.max(count, 3));
      }
    };

    calculateSegments();
    window.addEventListener('resize', calculateSegments);
    return () => window.removeEventListener('resize', calculateSegments);
  }, []);

  useEffect(() => {
    setPattern(generatePattern(segmentCount));
    
    const interval = setInterval(() => {
      setPattern(generatePattern(segmentCount));
    }, 50);

    return () => clearInterval(interval);
  }, [segmentCount]);

  return (
    <div
      ref={containerRef}
      className="font-mono leading-tight py-2 opacity-60 whitespace-nowrap overflow-hidden w-full"
    >
      <div className="inline-block">
        <span className="text-[8px]">{pattern}{pattern}</span>
      </div>
    </div>
  );
}

export function Hero() {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="h-screen flex flex-col items-end justify-end relative">
      <div className="flex flex-col items-center w-full">
        {/* Top Binary/Slash Border - Extends to window edges */}
        <div className="w-screen border-y border-black/20 overflow-hidden">
          <BinaryBorder />
        </div>

        {/* Cole Bregman Text - Very Tightly Sandwiched */}
        <div className="w-full px-4 py-2 text-center bg-white">
          <h1 className="font-black leading-[1.1] tracking-tighter uppercase text-[clamp(3rem,10vw,11rem)]">
            <span className="inline-flex items-center justify-center gap-3 md:gap-6">
              <span>COLE</span>
              <span className="text-[clamp(2rem,2.5vw,3.5rem)]">✦</span>
              <span>BREGMAN</span>
            </span>
          </h1>
        </div>

        {/* Bottom Binary/Slash Border - Extends to window edges */}
        <div className="w-screen border-y border-black/20 overflow-hidden">
          <BinaryBorder />
        </div>
      </div>
    </section>
  );
}