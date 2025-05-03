import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProjectSectionProps {
  icon: LucideIcon;
  title: string;
  content: string;
  iconColor: string;
}

export function ProjectSection({ icon: Icon, title, content, iconColor }: ProjectSectionProps) {
  return (
    <div className="flex gap-8 items-start py-12">
      <div className="w-48 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Icon className={iconColor} size={24} />
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
      </div>
      <div className="flex-grow prose prose-lg">{content}</div>
    </div>
  );
}