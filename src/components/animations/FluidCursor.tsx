import { useEffect } from 'react';
import { initFluid } from 'smokey-fluid-cursor';

interface FluidCursorProps {
  className?: string;
}

export function FluidCursor({ className = '' }: FluidCursorProps) {
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
    
    const heroSection = document.querySelector('section');
    if (heroSection) {
      heroSection.appendChild(canvas);
      
      // Initialize fluid after canvas is in DOM
      setTimeout(() => {
        initFluid({
          id: 'smokey-fluid-canvas',
          simResolution: 128,
          dyeResolution: 512,
          densityDissipation: 0.98,
          velocityDissipation: 0.98,
          pressureIteration: 8,
          curl: 25,
          splatRadius: 0.25,
          splatForce: 5000,
          shading: false,
          colorUpdateSpeed: 0.4,
          transparent: true,
        });
      }, 100);
      
      return () => {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      };
    }
  }, [className]);

  return null;
}