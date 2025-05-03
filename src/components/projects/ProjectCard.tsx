import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '../../types/project';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link 
      to={project.link}
      className="group block relative overflow-hidden rounded-none hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[4/3]">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/0">
        </div>
        
        {/* Text Content */}
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h3 className="text-3xl font-semibold mb-2">
            {project.title}
          </h3>
          
          <p className="text-lg mb-8">{project.description}</p>
          
          {/* Technology Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {project.technologies && project.technologies.map((tech, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-black/30 text-white text-sm rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}