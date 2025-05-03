import React from 'react';
import { BookOpen } from 'lucide-react';

interface ProjectStoryProps {
  story: {
    challenge: string;
    approach: string;
    outcome: string;
  };
}

export function ProjectStory({ story }: ProjectStoryProps) {
  return (
    <section className="mt-24">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="text-green-500" size={24} />
        <h2 className="text-2xl font-bold">Project Story</h2>
      </div>
      
      <div className="space-y-12">
        <div>
          <h3 className="text-xl font-semibold mb-4">Approach & Implementation</h3>
          <p className="text-gray-600">{story.approach}</p>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Findings & Conclusion</h3>
          <p className="text-gray-600">{story.outcome}</p>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Takeaways and Reflection</h3>
          <p className="text-gray-600">{story.challenge}</p>
        </div>
      </div>
    </section>
  );
}