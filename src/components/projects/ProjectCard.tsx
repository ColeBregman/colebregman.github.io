import { Project } from '../../types/project';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <Link 
      to={project.link}
      className="group block"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
          <div className="aspect-[4/3] overflow-hidden bg-gray-100">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
        
        <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
          <div className="text-sm text-gray-500 mb-4">
            #{String(index + 1).padStart(2, '0')}
          </div>
          <h3 className="text-4xl md:text-5xl font-bold mb-6 group-hover:opacity-60 transition-opacity">
            {project.title}
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            {project.description}
          </p>
          
          {project.technologies && (
            <div className="flex flex-wrap gap-3 mb-8">
              {project.technologies.slice(0, 4).map((tech, i) => (
                <span key={i} className="text-sm font-medium text-gray-700">
                  {tech}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-lg font-medium group-hover:gap-4 transition-all">
            View Project
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
}