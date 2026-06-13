import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';

interface ProjectImage {
  url: string;
  caption: string;
}

interface ProjectStoryProps {
  story?: {
    challenge: string;
    approach: string;
    outcome: string;
  };
  inlineImages?: {
    challenge?: string;
    approach?: string;
    outcome?: string;
  };
}

interface StorySection {
  number: string;
  title: string;
  content: string;
  image?: ProjectImage;
}

export function ProjectStory({ story, inlineImages }: ProjectStoryProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px',
  });
  
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption: string } | null>(null);

  if (!story) {
    return null;
  }

  // Create sections with optional inline images
  const sections: StorySection[] = [
    {
      number: '01',
      title: 'Takeaways and Reflection',
      content: story.challenge,
      image: inlineImages?.challenge ? { url: inlineImages.challenge, caption: 'Takeaways and Reflection' } : undefined,
    },
    {
      number: '02',
      title: 'Approach & Implementation',
      content: story.approach,
      image: inlineImages?.approach ? { url: inlineImages.approach, caption: 'Approach & Implementation' } : undefined,
    },
    {
      number: '03',
      title: 'Findings & Conclusion',
      content: story.outcome,
      image: inlineImages?.outcome ? { url: inlineImages.outcome, caption: 'Findings & Conclusion' } : undefined,
    },
  ];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      className="border-t-2 border-primary-text pt-16"
    >
      {/* Header with reading time */}
      <div className="mb-16">
        <h2 className="text-h1 font-bold uppercase tracking-tight mb-4">The Deep Dive</h2>
        <p className="text-body text-secondary-text max-w-reading">
          A detailed look into the personal learnings, implementation challenges, and outcomes from this project.
        </p>
        <p className="font-mono text-xs text-tertiary-text uppercase tracking-widest mt-4">
          ~ 3-5 minute read
        </p>
      </div>
      
      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line - Solid Black - hidden on mobile */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-black hidden lg:block opacity-20" />
        
        {/* Story Sections */}
        <div className="space-y-12 md:space-y-16">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-12"
            >
              {/* Number Badge - Responsive sizing */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black flex items-center justify-center font-mono font-bold text-sm sm:text-base text-black bg-white">
                  {section.number}
                </div>
              </div>
              
              {/* Content - Single Column with Centered Images */}
              <div className="flex-grow pt-0 sm:pt-2">
                <div className="max-w-reading">
                  <h3 className="text-xl sm:text-2xl lg:text-h3 font-medium mb-3 sm:mb-4">
                    {section.title}
                  </h3>
                  <p className="text-base sm:text-lg lg:text-body text-secondary-text font-light leading-relaxed whitespace-pre-line mb-6 sm:mb-8">
                    {section.content}
                  </p>
                </div>
                
                {/* Centered Image Below Text - Responsive sizing */}
                {section.image && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="cursor-pointer group mt-6 sm:mt-8 w-full sm:max-w-reading sm:mx-auto"
                    onClick={() => setLightboxImage(section.image || null)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="overflow-hidden bg-gray-50 border border-border-gray">
                      <img
                        src={section.image.url}
                        alt={section.image.caption}
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-tertiary-text mt-2 sm:mt-3 text-center">
                      {section.image.caption}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Lightbox Modal - Touch-friendly for mobile */}
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4 md:p-8"
          onClick={() => setLightboxImage(null)}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Close Button - Touch-friendly size (44x44px minimum) */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors z-50 w-11 h-11 flex items-center justify-center text-3xl md:text-4xl touch-manipulation"
            aria-label="Close lightbox"
          >
            ×
          </button>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="max-w-5xl w-full px-2 md:px-0"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.caption}
              className="w-full h-auto max-h-[70vh] md:max-h-[85vh] object-contain mx-auto"
            />
            <p className="text-white text-center mt-3 md:mt-4 text-sm md:text-base px-4">
              {lightboxImage.caption}
            </p>
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  );
}
