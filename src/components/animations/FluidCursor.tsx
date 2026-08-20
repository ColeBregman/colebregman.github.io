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
      
      // Initialize fluid after canvas is in DOM
      setTimeout(() => {
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
        
        initFluid(config);
        
        // On touch devices, create gentle auto-splats for ambient effect
        if (disableInteraction) {
          const autoSplat = setInterval(() => {
            const x = Math.random();
            const y = Math.random();
            // Trigger automatic splats for visual interest without user input
            const event = new MouseEvent('mousemove', {
              clientX: x * window.innerWidth,
              clientY: y * window.innerHeight
            });
            canvas.dispatchEvent(event);
          }, 2000);
          
          return () => {
            clearInterval(autoSplat);
            if (canvas.parentNode) {
              canvas.parentNode.removeChild(canvas);
            }
          };
        }
      }, 100);
      
      return () => {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      };
    }
  }, [className, disableInteraction]);

  return null;
}