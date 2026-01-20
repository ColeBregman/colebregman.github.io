export function About() {
  return (
    <section id="about" className="min-h-screen flex items-center px-8 py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">About</h2>
        
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-8 text-xl md:text-2xl leading-relaxed text-gray-700">
            <p>
              Mechanical Engineering student at Columbia University, pursuing a minor in Computer Science.
            </p>
            <p>
              I love getting hands-on and making things—whether I'm prototyping in the Creative Machines Lab 
              or conducting research in the Musculoskeletal Biomechanics Lab.
            </p>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-8">Core Skills</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                'CAD (NX, Solidworks, Fusion360)', 'Blender', 'LabVIEW', 'JMP',
                '3D Printing', 'Python', 'Arduino/Raspberry Pi', 'Adobe Suite'
              ].map((skill) => (
                <div key={skill} className="text-lg font-medium">
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