import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { projects } from '../types/project';
import { Breadcrumb } from '../components/Breadcrumb';
import { ProjectSection } from '../components/project/ProjectSection';
import { ProjectStory } from '../components/project/ProjectStory';
import { ProjectImages } from '../components/project/ProjectImages';
import { ScrollProgress } from '../components/ScrollProgress';
import { BinaryBorder } from '../components/BinaryBorder';
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
          <h1 className="text-h1 font-medium mb-4">Project Not Found</h1>
          <p className="text-body text-secondary-text mb-8">The project you're looking for doesn't exist.</p>
          <Link
            to="/#projects"
            className="inline-flex items-center text-primary-text hover:underline smooth-hover"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      
      {/* Breadcrumb - Fixed positioning */}
      <div className="px-6 pt-24 pb-8 max-w-container mx-auto">
        <Breadcrumb
          items={[
            { label: 'Projects', href: '/#projects' },
            { label: project.title }
          ]}
        />
      </div>

      {/* Hero Section - Responsive height */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[65vh] overflow-hidden">
        {/* Hero Image - No gradient overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="w-full h-full"
        >
          <img
            src={project.image}
            alt={`${project.title} cover image`}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>
      </div>

      {/* Binary strip under hero - ties into the homepage motif */}
      <div className="w-full border-y border-black/20 overflow-hidden">
        <BinaryBorder />
      </div>

      {/* Main Content Container */}
      <div className="max-w-container mx-auto px-6 md:px-20 lg:px-32">
        {/* Stats Section - Below Hero */}
        {project.stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 mb-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-black divide-y-2 md:divide-y-0 md:divide-x-2 divide-black">
              {project.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="bg-white p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-3">
                    {stat.label}
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-black tracking-tight">
                    {stat.value.match(/^\d+/) ? (
                      <>
                        <CountUp
                          end={parseInt(stat.value.match(/^\d+/)?.[0] || '0')}
                          duration={2}
                          delay={0.5 + index * 0.1}
                        />
                        {stat.value.replace(/^\d+/, '')}
                      </>
                    ) : (
                      stat.value
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Title and Description Section - Below Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          {/* Project Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-black leading-[1.05] mb-6">
            {project.title}
          </h1>
          
          {/* Description - 800px max-width, 24px gray text */}
          <p className="text-xl md:text-2xl text-secondary-text max-w-reading font-light leading-relaxed">
            {project.description}
          </p>

          {/* Optional press coverage link - kept low-key */}
          {project.pressLink && (
            <a
              href={project.pressLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 mt-6 font-mono text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
            >
              {project.pressLink.label}
              <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
            </a>
          )}
        </motion.div>

        {/* Quick Overview Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-section-sm md:mt-section mb-12"
        >
          <h2 className="text-h1 font-bold uppercase tracking-tight mb-2">Quick Overview</h2>
          <p className="text-body text-secondary-text">
            The essential details you need to understand this project at a glance.
          </p>
          <p className="font-mono text-xs text-tertiary-text uppercase tracking-widest mt-4">
            ~ 30 sec read
          </p>
        </motion.div>

        {/* Content Sections (Why/What/How) - Horizontal Flow */}
        <div className="mb-section-sm md:mb-section">
          <ProjectSection
            why={project.why}
            what={project.what}
            how={project.how}
          />
        </div>

        {/* Photo Gallery - Aesthetic showcase of all images */}
        {project.images.length > 0 && (
          <div className="mt-section-sm md:mt-section">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-h1 font-bold uppercase tracking-tight mb-12">Visual Documentation</h2>
              <ProjectImages images={project.images} />
            </motion.div>
          </div>
        )}

        {/* Deep Dive - with optional inline images */}
        {project.story && (
          <div className="mt-section-sm md:mt-section">
            <ProjectStory
              story={project.story}
              inlineImages={project.story.inlineImages}
            />
          </div>
        )}

        {/* Technologies Section */}
        {project.technologies && project.technologies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mt-section-sm md:mt-section"
          >
            <h2 className="text-h2 font-bold uppercase tracking-tight mb-8">Technologies & Skills</h2>
            <div className="flex flex-wrap gap-3">
              {project.technologies.map((tech, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="tech-pill"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to Projects Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-section-sm"
        >
          <Link
            to="/#projects"
            className="inline-flex items-center text-secondary-text hover:text-primary-text smooth-hover text-body"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </Link>
        </motion.div>
      </div>

      {/* Next Project - Full width */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mt-section-sm md:mt-section"
      >
        <div className="max-w-container mx-auto px-6 md:px-20 lg:px-32">
          <div className="mb-6">
            <div className="text-caption uppercase tracking-wider text-tertiary-text mb-4">
              Next Project
            </div>
            <Link
              to={getNextProjectLink(id)}
              className="inline-flex items-center gap-3 text-h2 font-medium hover:text-secondary-text smooth-hover group"
              aria-label={`View ${getNextProjectTitle(id)} project`}
            >
              {getNextProjectTitle(id)}
              <span className="transform group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </Link>
          </div>
        </div>
        <Link
          to={getNextProjectLink(id)}
          className="block w-full overflow-hidden group"
          aria-label={`Navigate to ${getNextProjectTitle(id)}`}
        >
          <motion.img
            src={getNextProjectImage(id)}
            alt={`${getNextProjectTitle(id)} preview`}
            className="w-full h-[400px] object-cover"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            loading="lazy"
          />
        </Link>
      </motion.div>
    </div>
  );
}
