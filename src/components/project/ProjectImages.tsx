import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { X } from 'lucide-react';

interface ProjectImage {
  url: string;
  caption: string;
}

interface ProjectImagesProps {
  images: ProjectImage[];
  layout?: 'featured' | 'grid' | 'offset';
}

interface ImageCardProps {
  image: ProjectImage;
  index: number;
  onClick: () => void;
  isFeatured?: boolean;
}

function ImageCard({ image, index, onClick, isFeatured = false }: ImageCardProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Format number with leading zero
  const displayNumber = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      className="relative cursor-pointer select-none w-full h-full"
      onClick={onClick}
    >
      {/* Polaroid frame */}
      <div className="
        bg-white p-3 md:p-4
        shadow-[0_2px_12px_rgba(0,0,0,0.08)]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]
        transition-all duration-300
        h-full flex flex-col
      ">
        {/* Number badge - always visible */}
        <div className="
          absolute top-5 left-5 md:top-6 md:left-6
          bg-black text-white
          px-2.5 py-1 md:px-3.5 md:py-1.5
          font-mono text-xs md:text-sm font-bold
          z-10
          shadow-md
        ">
          {displayNumber}
        </div>

        {/* Image */}
        <div
          className={`
            relative w-full bg-hover-gray overflow-hidden
            ${isFeatured ? 'h-[300px] sm:h-[400px] lg:h-[500px]' : 'h-[200px] sm:h-[220px] lg:h-[240px]'}
          `}
        >
          <img
            src={image.url}
            alt={image.caption}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Caption - always visible below image */}
        <div className="mt-2 md:mt-3 pt-1">
          <p className="text-xs md:text-sm text-secondary-text leading-relaxed font-light">
            {image.caption}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectImages({ images }: ProjectImagesProps) {
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px',
  });

  // Render layout based on number of images
  const renderLayout = () => {
    if (images.length >= 4) {
      // Featured + Grid Layout for 4+ images
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Featured Image - takes 2 columns */}
          <div className="lg:col-span-2">
            <ImageCard
              image={images[0]}
              index={0}
              onClick={() => setSelectedImage(images[0])}
              isFeatured={true}
            />
          </div>
          
          {/* Right side stack - takes 1 column with 2 rows */}
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            <ImageCard
              image={images[1]}
              index={1}
              onClick={() => setSelectedImage(images[1])}
            />
            <ImageCard
              image={images[2]}
              index={2}
              onClick={() => setSelectedImage(images[2])}
            />
          </div>
          
          {/* Remaining images in 3-column grid below */}
          {images.length > 3 && (
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {images.slice(3).map((image, i) => (
                <ImageCard
                  key={i + 3}
                  image={image}
                  index={i + 3}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          )}
        </div>
      );
    } else {
      // Simple 2-column grid for 2-3 images
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {images.map((image, index) => (
            <ImageCard
              key={index}
              image={image}
              index={index}
              onClick={() => setSelectedImage(image)}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        {renderLayout()}
      </motion.div>

      {/* Lightbox Modal - Touch-friendly for mobile */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Close Button - Touch-friendly size (44x44px minimum) */}
            <button
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors z-50 w-11 h-11 flex items-center justify-center touch-manipulation"
              onClick={() => setSelectedImage(null)}
              aria-label="Close lightbox"
            >
              <X size={28} strokeWidth={2} />
            </button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="max-w-6xl max-h-[90vh] flex flex-col items-center px-2 md:px-0"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="max-w-full max-h-[70vh] md:max-h-[80vh] object-contain"
              />
              <p className="mt-4 md:mt-6 text-white text-sm md:text-base font-light text-center max-w-2xl px-4">
                {selectedImage.caption}
              </p>
            </motion.div>

            {/* Instruction text - Hide on very small screens */}
            <p className="absolute bottom-4 md:bottom-6 text-white text-xs md:text-sm opacity-60 hidden sm:block">
              Click anywhere to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
