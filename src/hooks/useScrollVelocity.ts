import { useState, useEffect } from 'react';

export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(Date.now());

  useEffect(() => {
    let animationFrameId: number;
    let velocityDecay = 0;

    function measureScrollVelocity() {
      const currentScrollTop = window.scrollY;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastScrollTime;
      
      if (timeDelta > 0) {
        const scrollDelta = currentScrollTop - lastScrollTop;
        velocityDecay = scrollDelta / timeDelta;
      }

      // Apply decay
      velocityDecay *= 0.95;
      
      setVelocity(velocityDecay);
      setLastScrollTop(currentScrollTop);
      setLastScrollTime(currentTime);

      animationFrameId = requestAnimationFrame(measureScrollVelocity);
    }

    window.addEventListener('scroll', measureScrollVelocity);
    animationFrameId = requestAnimationFrame(measureScrollVelocity);

    return () => {
      window.removeEventListener('scroll', measureScrollVelocity);
      cancelAnimationFrame(animationFrameId);
    };
  }, [lastScrollTop, lastScrollTime]);

  return velocity;
}