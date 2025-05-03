import React from 'react';
import { ProjectCard } from '../projects/ProjectCard.tsx';
import { projects } from '../../types/project';

export function Projects() {
  return (
    <section id="projects" className="min-h-screen py-24 px-6 md:pr-32">
      <div className="w-full">
        <h2 className="text-3xl font-bold mb-12">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}