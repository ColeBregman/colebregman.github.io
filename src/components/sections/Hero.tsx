import { useEffect, useState } from 'react';
import { FluidCursor } from '../animations/FluidCursor';
import { BinaryBorder } from '../BinaryBorder';

// EASY TOGGLE: Set to false to disable fluid cursor effect
const SHOW_FLUID_EFFECT = true;

export function Hero() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    // Detect if device has touch capability
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouchScreen);
  }, []);
  
  return (
    <section className="h-screen flex flex-col relative">
      {/* Fluid Cursor - Desktop only (touch devices have library issues with scrolling) */}
      {SHOW_FLUID_EFFECT && !isTouchDevice && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <FluidCursor />
        </div>
      )}
      
      {/* Mobile Animation - Falling lines (no touch interference) */}
      {isTouchDevice && (
        <div className="mobile-lines">
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
          <div className="mobile-line"></div>
        </div>
      )}
      
      {/* Hero content - No background, fluid shows through */}
      <div className="flex-1 relative z-10"></div>
      
      {/* COLE BREGMAN Section at Bottom - White background blocks fluid */}
      <div className="flex flex-col items-center w-full relative z-10 bg-white">
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