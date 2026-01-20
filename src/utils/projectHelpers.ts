import { projects } from '../types/project';

/**
 * Get the link to the next project in the list
 * Wraps to the first project if current is the last
 */
export function getNextProjectLink(currentId: string | undefined): string {
  if (!currentId) return '/#projects';
  
  const currentIndex = projects.findIndex(p => p.id === currentId);
  if (currentIndex === -1 || currentIndex === projects.length - 1) {
    return `/project/${projects[0].id}`;
  }
  
  return `/project/${projects[currentIndex + 1].id}`;
}

/**
 * Get the title of the next project
 */
export function getNextProjectTitle(currentId: string | undefined): string {
  if (!currentId) return '';
  
  const currentIndex = projects.findIndex(p => p.id === currentId);
  if (currentIndex === -1 || currentIndex === projects.length - 1) {
    return projects[0].title;
  }
  
  return projects[currentIndex + 1].title;
}

/**
 * Get the image URL of the next project
 */
export function getNextProjectImage(currentId: string | undefined): string {
  if (!currentId) return '';
  
  const currentIndex = projects.findIndex(p => p.id === currentId);
  if (currentIndex === -1 || currentIndex === projects.length - 1) {
    return projects[0].image;
  }
  
  return projects[currentIndex + 1].image;
}