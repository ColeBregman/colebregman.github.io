import React from 'react';

interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  date: string;
  description: string[];
  logo?: string;
}

const experiences: ExperienceItem[] = [
  {
    title: 'Incoming MDE Intern',
    company: 'Apple',
    location: 'Cupertino, California, United States',
    date: 'Mar 2025 - Present',
    description: [],
  },
  {
    title: 'MBL Lab Student Researcher',
    company: 'Columbia Engineering',
    date: 'Sep 2024 - Present',
    description: [
      'Designed CAD models for NITRO knee replacement and co-developed test rig for mechanical testing.'
    ],
  },
  {
    title: 'Creative Machines Lab Student Researcher',
    company: 'Columbia Engineering',
    date: 'Feb 2024 - Jan 2025',
    description: [
      'Worked on a self-diagnostic 3D-printing robot and a low-cost food 3D printer for a NYC restaurant.'
    ],
  },
  {
    title: 'Mechanical Engineering Intern',
    company: 'Eikon Therapeutics',
    location: 'Hayward, California, United States',
    date: 'Jun 2024 - Aug 2024',
    description: [
      'Developed automated rig to increase laser precision and reduce testing time.'
    ],
  },
  {
    title: 'Intern',
    company: 'Design Visionaries',
    location: 'San Jose, California, United States',
    date: 'May 2023 - Aug 2023',
    description: [
      'Designed medical devices, trained interns in NX, and filed USPTO provisional patents for small businesses.'
    ],
  },
  {
    title: 'Suzuki Lab intern',
    company: 'Stanford University',
    location: 'Stanford, California, United States',
    date: 'Aug 2021 - Aug 2021',
    description: [
      'Determined minimum viable layer thickness for novel spintronic material.'
    ],
  }
];

export function Experience() {
  return (
    <section id="experience" className="min-h-screen py-24 px-6 md:pr-32">
      <div className="w-full">
        <h2 className="text-4xl font-bold mb-16">Experience</h2>
        
        <div className="relative pl-12">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          {/* Experience items */}
          {experiences.map((exp, index) => (
            <div key={index} className="relative mb-20">
              {/* Circle marker */}
              <div className="absolute left-5 top-0 w-10 h-10 rounded-full bg-white border-4 border-gray-300 z-10 -translate-x-1/2"></div>
              
              <div className="pl-16">
                <h3 className="text-2xl font-bold mb-1">{exp.title} @ {exp.company}</h3>
                <p className="text-gray-600 mb-2">{exp.date}</p>
                {exp.location && <p className="text-gray-600 mb-3">{exp.location}</p>}
                
                {exp.description.length > 0 && (
                  <ul className="list-disc pl-5 space-y-3">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="text-gray-700">{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 