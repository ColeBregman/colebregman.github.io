import React from 'react';

interface ProjectImage {
  url: string;
  caption: string;
}

interface ProjectImagesProps {
  images: ProjectImage[];
}

export function ProjectImages({ images }: ProjectImagesProps) {
  return (
    <div className="mt-24 mb-24">
      <h2 className="text-2xl font-bold mb-8">Project Gallery</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {images.map((image, index) => (
          <div key={index} className="flex flex-col">
            <img
              src={image.url}
              alt={image.caption}
              className="w-full h-[300px] object-contain bg-white border border-gray-200"
            />
            <p className="mt-2 text-gray-700">{image.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}