import React from 'react';
import { ArrowDown } from 'lucide-react';
import { ScrollingText } from '../animations/ScrollingText';
import { useScrollVelocity } from '../../hooks/useScrollVelocity';
import { useScrollDirection } from '../../hooks/useScrollDirection';
// Import image from both local development path and use fallback to public assets
import localHeadshot from '../../images/headshot.png';

export function Hero() {
  const scrollVelocity = useScrollVelocity();
  const scrollDirection = useScrollDirection();
  
  // Try the local image first, fallback to the public assets path if needed
  const headshotImage = localHeadshot || '/assets/headshot-M8coJzZI.png';

  return (
    <section
      id="hero"
      className="h-screen flex items-center justify-center pt-16 px-0 bg-cover bg-center font-exo2 md:pr-[0px]"
      style={{ backgroundImage: `url(${headshotImage})` }}
    >
      <div className="w-full space-y-4 z-100">
        {/* Scrolling Text - Unaffected */}
        <div className="space-y-4">
          <ScrollingText
            text="Cole Bregman — Cole Bregman — Cole Bregman —"
            baseSpeed={0.75}
            direction={scrollDirection}
            scrollVelocity={scrollVelocity}
            className="text-6xl md:text-9xl font-exo2 text-white"
          />
        </div>

        {/* New Container for Moving Down */}
        <div className="mt-16"> {/* Added margin-top to move this section down */}
          <p className="text-xl text-gray-600 max-w-xl px-8 absolute bottom-16 text-white">
            Hi, I create products. Currently studying Mechanical Engineering at Columbia University.
          </p>

          <div className="animate-bounce px-8 mt-8 absolute bottom-4 text-white">
            <ArrowDown size={24} />
          </div>
        </div>
      </div>
    </section>
  );
}