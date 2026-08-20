import { useEffect } from 'react';
import { initFluid } from 'smokey-fluid-cursor';

interface FluidCursorProps {
  className?: string;
  disableInteraction?: boolean;
}

export function FluidCursor({ className = '', disableInteraction = false }: FluidCursorProps) {
  useEffect(() => {
    // Add canvas to DOM
    const canvas = document.createElement('canvas');
    canvas.id = 'smokey-fluid-canvas';
    canvas.className = `absolute inset-0 w-full h-full pointer-events-none ${className}`;
    canvas.style.opacity = '0.25';
    canvas.style.zIndex = '1';
    canvas.style.filter = 'grayscale(1) contrast(1.2)'; // Black and white only
    canvas.style.clipPath = 'inset(0)'; // Strict clipping to container bounds
    canvas.style.maxHeight = '100%'; // Hard limit on height
    canvas.style.pointerEvents = 'none'; // Explicitly ensure no pointer events
    canvas.style.touchAction = 'none'; // Allow touch gestures to pass through
    
    // On touch devices, make the canvas completely non-interactive
    if (disableInteraction) {
      canvas.style.position = 'fixed';
      canvas.style.pointerEvents = 'none';
      canvas.style.userSelect = 'none';
      canvas.style.webkitUserSelect = 'none';
    }
    
    const heroSection = document.querySelector('section');
    if (heroSection) {
      heroSection.appendChild(canvas);

      // The library's simulation loop re-schedules itself forever with no
      // pause API, so it would keep burning GPU long after the hero scrolls
      // away. Capture its frame callback at init time and gate it: while the
      // hero is off-screen the loop idles on a slow timer instead of rAF.
      let heroVisible = true;
      let fluidFrame: FrameRequestCallback | null = null;
      const nativeRaf = window.requestAnimationFrame.bind(window);
      let idleTimer: ReturnType<typeof setTimeout> | null = null;

      window.requestAnimationFrame = (callback: FrameRequestCallback) => {
        if (callback !== fluidFrame) return nativeRaf(callback);
        if (heroVisible) return nativeRaf(callback);
        const waitForHero = () => {
          if (heroVisible) {
            nativeRaf(callback);
          } else {
            idleTimer = setTimeout(waitForHero, 300);
          }
        };
        idleTimer = setTimeout(waitForHero, 300);
        return 0;
      };

      const observer = new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
      });
      observer.observe(heroSection);

      let autoSplat: ReturnType<typeof setInterval> | null = null;

      // Initialize fluid after canvas is in DOM
      const initTimer = setTimeout(() => {
        const config: Parameters<typeof initFluid>[0] = {
          id: 'smokey-fluid-canvas',
          simResolution: 128,
          dyeResolution: 512,
          densityDissipation: 0.98,
          velocityDissipation: 0.98,
          pressureIteration: 8,
          curl: 25,
          splatRadius: 0.25,
          splatForce: disableInteraction ? 3000 : 5000, // Less force on touch devices
          shading: false,
          colorUpdateSpeed: 0.4,
          transparent: true,
        };

        // Whatever initFluid registers with rAF is the simulation loop
        const capture = window.requestAnimationFrame;
        window.requestAnimationFrame = (callback: FrameRequestCallback) => {
          fluidFrame = callback;
          window.requestAnimationFrame = capture;
          return capture(callback);
        };
        initFluid(config);
        window.requestAnimationFrame = capture;

        // On touch devices, create gentle auto-splats for ambient effect
        if (disableInteraction) {
          autoSplat = setInterval(() => {
            if (!heroVisible) return;
            const x = Math.random();
            const y = Math.random();
            // Trigger automatic splats for visual interest without user input
            const event = new MouseEvent('mousemove', {
              clientX: x * window.innerWidth,
              clientY: y * window.innerHeight
            });
            canvas.dispatchEvent(event);
          }, 2000);
        }
      }, 100);

      return () => {
        clearTimeout(initTimer);
        if (idleTimer) clearTimeout(idleTimer);
        if (autoSplat) clearInterval(autoSplat);
        observer.disconnect();
        window.requestAnimationFrame = nativeRaf;
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      };
    }
  }, [className, disableInteraction]);

  return null;
}