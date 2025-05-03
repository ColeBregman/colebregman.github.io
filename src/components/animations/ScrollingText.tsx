import React, { useRef } from 'react';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';

interface ScrollingTextProps {
  text: string;
  baseSpeed: number;
  direction: 'left' | 'right';
  scrollVelocity: number;
  className?: string;
}

export function ScrollingText({
  text,
  baseSpeed,
  direction,
  scrollVelocity,
  className = ''
}: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  
  const speed = baseSpeed * (1.5 + 10*Math.abs(scrollVelocity));

  useAnimationFrame(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const textWidth = container.scrollWidth / 2;
    
    positionRef.current += direction === 'left' ? -speed : speed;
    
    if (Math.abs(positionRef.current) >= textWidth) {
      positionRef.current = 0;
    }
    
    container.style.transform = `translateX(${positionRef.current}px)`;
  });

  return (
    <div className="relative overflow-hidden whitespace-nowrap leading-none py-4">
      <div ref={containerRef} className={className}>
        <span className="inline-block">{text}</span>
        <span className="inline-block ml-8">{text}</span>
      </div>
    </div>
  );
}