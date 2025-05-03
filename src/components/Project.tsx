import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ProjectProps {
  title: string;
  description: string;
  image: string;
  link: string;
}

export function Project({ title, description, image, link }: ProjectProps) {
  return (
    <a 
      href={link}
      target="_blank"
      rel="noopener noreferrer" 
      className="group block relative overflow-hidden rounded-2xl hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-[16/9] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {title}
            <ArrowUpRight size={20} className="inline-block" />
          </h3>
          <p className="mt-2 text-sm text-gray-200">{description}</p>
        </div>
      </div>
    </a>
  );
}