import { smallProjects } from '../../data/smallProjects';
import { BinaryBorder } from '../BinaryBorder';

export default function Breadcrumbs() {
  return (
    <section id="breadcrumbs" className="py-32 px-8 bg-white relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Binary Border Top */}
        <div className="w-full border-y-2 border-black mb-16">
          <BinaryBorder />
        </div>

        <h2 className="text-5xl md:text-7xl font-black mb-16 uppercase">More Projects</h2>
        
        {/* Polaroid Grid with Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {smallProjects.map((project, index) => (
            <a
              key={project.id}
              href={project.link}
              className={`group block ${project.link ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
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
                    loading="lazy"
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
            </a>
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