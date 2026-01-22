import { Lightbulb, Wrench, Cog } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface ProjectSectionProps {
  why: string;
  what: string;
  how: string;
}

// Helper to convert text into bullet points (splits by newlines or bullet markers)
function parseBulletPoints(content: string, maxPoints: number = 3): string[] {
  // Split by newlines and filter out empty lines
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Remove bullet markers if present
  const cleaned = lines.map(line => 
    line.replace(/^[•\-\*]\s*/, '').trim()
  );
  
  // Take only the first maxPoints
  return cleaned.slice(0, maxPoints);
}

export function ProjectSection({ why, what, how }: ProjectSectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px',
  });

  const whyPoints = parseBulletPoints(why);
  const whatPoints = parseBulletPoints(what);
  const howPoints = parseBulletPoints(how);

  const sections = [
    {
      number: '01',
      label: 'WHY',
      icon: Lightbulb,
      points: whyPoints,
      delay: 0
    },
    {
      number: '02',
      label: 'WHAT',
      icon: Wrench,
      points: whatPoints,
      delay: 0.15
    },
    {
      number: '03',
      label: 'HOW',
      icon: Cog,
      points: howPoints,
      delay: 0.3
    }
  ];

  return (
    <div ref={ref} className="w-full">
      {/* Horizontal flow layout - stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {sections.map((section, index) => (
          <motion.div
            key={section.number}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: section.delay, ease: 'easeOut' }}
            className={`
              relative px-6 py-10 md:px-8 md:py-12
              ${index < 2 ? 'lg:border-r border-b lg:border-b-0 border-border-gray' : 'border-b lg:border-b-0 border-border-gray last:border-b-0'}
              bg-white hover:bg-hover-gray
              transition-all duration-300
              group
            `}
          >
            {/* Section number badge */}
            <div className="absolute top-6 left-6 md:left-8">
              <span className="
                font-mono text-sm font-bold text-tertiary-text
                tracking-wider
              ">
                {section.number}
              </span>
            </div>

            {/* Icon */}
            <div className="mb-6 pt-6">
              <section.icon
                className="text-black group-hover:scale-110 transition-transform duration-300"
                size={36}
                strokeWidth={1.5}
              />
            </div>

            {/* Section label - Responsive typography */}
            <h3 className="
              text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 md:mb-8
              text-black tracking-tight
              leading-none
            ">
              {section.label}
            </h3>

            {/* Bullet points - max 3 */}
            <ul className="space-y-4">
              {section.points.map((point, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: section.delay + 0.2 + (idx * 0.1),
                    ease: 'easeOut'
                  }}
                  className="flex items-start gap-3 text-secondary-text"
                >
                  <span className="text-black font-bold text-lg leading-none mt-1">•</span>
                  <span className="text-base leading-relaxed">
                    {point}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Bottom accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: section.delay + 0.5, ease: 'easeOut' }}
              className="absolute bottom-0 left-0 h-1 bg-black origin-left"
              style={{ width: '100%' }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
