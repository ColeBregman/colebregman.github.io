import { useEffect, useState, useRef } from 'react';
import { smallProjects } from '../../data/smallProjects';

// Generate random binary string (reused from Hero)
const generateBinary = (length: number) => {
  return Array.from({ length }, () => Math.random() > 0.5 ? '1' : '0').join('');
};

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

export default function Breadcrumbs() {
  return (
    <section id="breadcrumbs" className="py-32 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Binary Border Top */}
        <div className="w-full border-y-2 border-black mb-16">
          <BinaryBorder />
        </div>

        <h2 className="text-5xl md:text-7xl font-black mb-16 uppercase">More Projects</h2>
        
        {/* Polaroid Grid with Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {smallProjects.map((project, index) => (
            <div
              key={project.id}
              className="group cursor-pointer"
            >
              {/* Number Label */}
              <div className="text-sm font-mono text-gray-500 mb-3">
                #{String(index + 1).padStart(2, '0')}
              </div>

              {/* Polaroid Frame */}
              <div className="border-8 border-white shadow-2xl bg-white hover:shadow-3xl transition-shadow duration-300">
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={project.image}
                    alt={project.title}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:blur-[0.5px] ${
                      project.rotate ? 'rotate-90' : ''
                    }`}
                  />
                </div>
                
                {/* Caption Area */}
                <div className="p-4 bg-white border-t-2 border-gray-200">
                  <h3 className="text-lg font-bold mb-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Binary Border Bottom */}
        <div className="w-full border-y-2 border-black mt-16">
          <BinaryBorder />
        </div>
      </div>
    </section>
  );
}