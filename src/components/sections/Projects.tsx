import { ProjectCard } from '../projects/ProjectCard';
import { projects } from '../../types/project';

export function Projects() {
  return (
    <section id="projects" className="min-h-screen py-32 px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">Work</h2>
        <div className="space-y-24">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}