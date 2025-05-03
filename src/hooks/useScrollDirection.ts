import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateDirection = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setDirection('right');
      } else if (currentScrollY < lastScrollY) {
        setDirection('left');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', updateDirection);
    return () => window.removeEventListener('scroll', updateDirection);
  }, [lastScrollY]);

  return direction;
}