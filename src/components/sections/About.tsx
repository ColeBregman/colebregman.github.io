import { OptimizedImage } from '../OptimizedImage';

const skillGroups = [
  {
    label: 'DESIGN',
    skills: ['Siemens NX', 'SolidWorks', 'Fusion360', 'Tolerance Analysis'],
  },
  {
    label: 'MAKE',
    skills: ['3D Printing', 'CNC / CAM', 'Injection Molding', 'Casting'],
  },
  {
    label: 'CODE + ANALYZE',
    skills: ['Python', 'Arduino / Raspberry Pi', 'LabVIEW', 'JMP'],
  },
  {
    label: 'CREATE',
    skills: ['Blender', 'Adobe Suite', 'Embroidery', 'Bookbinding'],
  },
];

export function About() {
  return (
    <section id="about" className="min-h-screen flex items-center px-8 py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">About</h2>

        {/* Three-column layout */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Left Column - Bio Text */}
          <div className="space-y-6 text-lg md:text-xl leading-relaxed text-gray-700">
            <p>
              I'm Cole — a mechanical engineer who likes building things you can
              hold. I study Mechanical Engineering at{' '}
              <span className="font-semibold text-black">Columbia University</span>{' '}
              with a minor in Computer Science.
            </p>
            <p>
              Over the past year I worked on high-volume hardware at{' '}
              <span className="font-semibold text-black">Apple</span> as a
              Manufacturing Design Engineering intern, and I'm now developing
              rides at{' '}
              <span className="font-semibold text-black">Walt Disney Imagineering</span>.
            </p>
            <p>
              When I'm not on a factory floor or in the Creative Machines Lab,
              I'm usually making something smaller — embroidery, bookbinding,
              or whatever the 3D printer is up to that week.
            </p>

            {/* Currently strip */}
            <div className="border-2 border-black p-4 mt-8">
              <div className="font-mono text-xs uppercase tracking-widest opacity-50 mb-1">
                Currently
              </div>
              <div className="font-semibold text-black text-base md:text-lg">
                Ride Development Engineering Intern @ Walt Disney Imagineering
              </div>
            </div>
          </div>

          {/* Center Column - Image (Focal Point) */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm relative">
              {/* Offset frame */}
              <div className="absolute inset-0 border-2 border-black translate-x-3 translate-y-3" aria-hidden="true" />
              <div className="relative bg-white">
                <OptimizedImage
                  src="/assets/cole-portrait-2.webp"
                  alt="Cole Bregman"
                  className="border-2 border-black"
                  objectFit="cover"
                  priority={false}
                />
              </div>
              <p className="font-mono text-xs uppercase tracking-widest opacity-50 mt-6 text-center">
                NYC ↔ Bay Area
              </p>
            </div>
          </div>

          {/* Right Column - Skills */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Core Skills</h3>
            <div className="space-y-6">
              {skillGroups.map((group) => (
                <div key={group.label}>
                  <div className="font-mono text-xs uppercase tracking-widest opacity-50 mb-2 border-b border-black/20 pb-1">
                    {group.label}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {group.skills.map((skill) => (
                      <span key={skill} className="text-base md:text-lg font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
