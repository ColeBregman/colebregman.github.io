import { OptimizedImage } from '../OptimizedImage';

export function About() {
  return (
    <section id="about" className="min-h-screen flex items-center px-8 py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-5xl md:text-7xl font-bold mb-16 text-center">About</h2>
        
        {/* Three-column layout */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Left Column - Bio Text */}
          <div className="space-y-6 text-lg md:text-xl leading-relaxed text-gray-700">
            <p>
              Mechanical Engineering student at Columbia University, pursuing a minor in Computer Science.
            </p>
            <p>
              I love getting hands-on and making things—whether I'm prototyping in the Creative Machines Lab
              or conducting research in the Musculoskeletal Biomechanics Lab.
            </p>
          </div>
          
          {/* Center Column - Image (Focal Point) */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <OptimizedImage
                src="/assets/MediumShot.webp"
                alt="Cole Bregman"
                className="rounded-lg shadow-2xl"
                objectFit="cover"
                priority={false}
              />
            </div>
          </div>
          
          {/* Right Column - Skills */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Core Skills</h3>
            <div className="space-y-3">
              {[
                'CAD (NX, Solidworks, Fusion360)', 'Blender', 'LabVIEW', 'JMP',
                '3D Printing', 'Python', 'Arduino/Raspberry Pi', 'Adobe Suite'
              ].map((skill) => (
                <div key={skill} className="text-base md:text-lg font-medium">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}