import React, { useEffect, useRef } from 'react';

const images = [
  "/assets/lamp-q6TuXykl.png",
  "/assets/violin-BqRdxQ0W.png",
  "/assets/Rose-BvPnEJYy.png",
  "/assets/bunny-B0hxmrp7.png",
  "/assets/chainsaw-L9O015hr.png",
  "/assets/archVis-Dn9hslr4.png",
  "/assets/chairs-C7I6Kj6j.png",
  "/assets/initialmockup-B6cGBnij.png"
];

const Breadcrumbs: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  
  const mouseDownAt = useRef<number>(0);
  const prevPercentage = useRef<number>(0);
  const currentPercentage = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);

  const handleOnDown = (clientX: number) => {
    mouseDownAt.current = clientX;
    isMouseDown.current = true;
  };

  const handleOnUp = () => {
    isMouseDown.current = false;
    prevPercentage.current = currentPercentage.current;
  };

  const handleOnMove = (clientX: number) => {
    if (!isMouseDown.current || !trackRef.current) return;

    const track = trackRef.current;
    const mouseDelta = mouseDownAt.current - clientX;
    const maxDelta = window.innerWidth / 2;

    const percentage = (mouseDelta / maxDelta) * -150;
    const totalImages = images.length;
    const maxPercentage = -totalImages*100; // Adjust maxPercentage dynamically based on images
    const nextPercentageUnconstrained = prevPercentage.current + percentage;
    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), maxPercentage);

    currentPercentage.current = nextPercentage;


    // Animate the track
    track.animate(
      { transform: `translate(${nextPercentage}%, -50%)` },
      { duration: 1200, fill: 'forwards' }
    );

    //Animate each image's objectPosition
    const imgs = track.querySelectorAll('.image');
    imgs.forEach((img) => {
      const imageMovementPercentage = Math.max(
        Math.min((nextPercentage / maxPercentage) * 100, 100),
        0
      );
      (img as HTMLImageElement).animate(
        { objectPosition: `${100-imageMovementPercentage}% center` },
        { duration: 1200, fill: 'forwards' }
      );

  });

    

  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => handleOnDown(e.clientX);
    const handleMouseUp = () => handleOnUp();
    const handleMouseMove = (e: MouseEvent) => handleOnMove(e.clientX);

    const handleTouchStart = (e: TouchEvent) => handleOnDown(e.touches[0].clientX);
    const handleTouchEnd = () => handleOnUp();
    const handleTouchMove = (e: TouchEvent) => handleOnMove(e.touches[0].clientX);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);

      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <section id="breadcrumbs" className="px-8">
      <div className="relative">
        <h2 className="text-3xl font-bold mb-8">breadcrumbs</h2>
        
        <div className="w-screen relative py-[25vmin]">
      <div
        ref={trackRef}
        id="image-track"
        className="flex gap-[4vmin] absolute top-1/2 -translate-y-1/2 select-none md:pr-32"
      >
        {images.map((src, idx) => (
          <img
            key={idx}
            className="image w-[50vmin] h-[50vmin] object-cover object-[100%_center] pointer-events-none"
            src={src}
            draggable="false"
            alt="Sliding"
          />
        ))}
      </div>
      {/* White Block */}
  <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-white w-[20vmin] h-[50vmin] z-10">
  </div>

    </div>
      </div>
    </section>
  );
}

export default Breadcrumbs;