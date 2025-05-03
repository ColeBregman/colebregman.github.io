import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SmallProjectProps {
  title: string;
  description: string;
  link: string;
  technologies: string[];
}

export function SmallProject({ title, description, link, technologies }: SmallProjectProps) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <ExternalLink size={16} className="text-gray-400" />
      </div>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {technologies.map((tech, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full"
          >
            {tech}
          </span>
        ))}
      </div>
    </a>
  );
}