import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Wrench, Cog } from 'lucide-react';
import { projects } from '../types/project';
import { Breadcrumb } from '../components/Breadcrumb';
import { ProjectSection } from '../components/project/ProjectSection';
import { ProjectStory } from '../components/project/ProjectStory';
import { ProjectImages } from '../components/project/ProjectImages';
import { getNextProjectLink, getNextProjectTitle, getNextProjectImage } from '../utils/projectHelpers';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const project = projects.find(p => p.id === id);

  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center py-24 px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-8">The project you're looking for doesn't exist.</p>
          <Link
            to="/#projects"
            className="inline-flex items-center text-black hover:underline"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Projects', href: '/#projects' },
            { label: project.title }
          ]}
        />

        <Link
          to="/#projects"
          className="inline-flex items-center text-gray-600 hover:text-black mt-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back home
        </Link>

        <div className="mt-8">
          <img
            src={project.image}
            alt={`${project.title} cover image`}
            className="w-full h-[400px] object-cover rounded-lg"
            loading="eager"
          />

          <h1 className="text-4xl font-bold mt-8">{project.title}</h1>
          <p className="text-xl text-gray-600 mt-4">{project.description}</p>
          
          {project.stats && (
            <div className="grid grid-cols-3 gap-8 mt-8">
              {project.stats.map((stat, index) => (
                <div key={index} className="p-4 bg-gray-50">
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-xl font-semibold mt-1">{stat.value}</div>
                </div>
              ))}
            </div>
          )}

          

          <div className="border-t border-gray-200">
            <ProjectSection
              icon={Lightbulb}
              title="The Why"
              content={project.why}
              iconColor="text-yellow-500"
            />
            <ProjectSection
              icon={Wrench}
              title="The What"
              content={project.what}
              iconColor="text-blue-500"
            />
            <ProjectSection
              icon={Cog}
              title="The How"
              content={project.how}
              iconColor="text-purple-500"
            />
          </div>

          <ProjectImages images={project.images} />

          <ProjectStory story={project.story} />

          {project.technologies && project.technologies.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Technologies & Skills</h2>
              <div className="flex flex-wrap gap-3">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-medium hover:bg-gray-200 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Project Navigation */}
          <div className="mt-24 pt-12 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm uppercase tracking-wider text-gray-600">Next Project</div>
              <Link
                to={getNextProjectLink(id)}
                className="flex items-center gap-2 text-xl font-semibold hover:underline group"
                aria-label={`View ${getNextProjectTitle(id)} project`}
              >
                {getNextProjectTitle(id)}
                <div className="ml-2 transform group-hover:translate-x-1 transition-transform">→</div>
              </Link>
            </div>
            <Link
              to={getNextProjectLink(id)}
              className="block overflow-hidden rounded-lg group"
              aria-label={`Navigate to ${getNextProjectTitle(id)}`}
            >
              <img
                src={getNextProjectImage(id)}
                alt={`${getNextProjectTitle(id)} preview`}
                className="w-full h-[300px] object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}