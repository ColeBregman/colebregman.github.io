interface ExperienceItem {
  title: string;
  company: string;
  date: string;
  description: string[];
  logo?: string;
}

const experiences: ExperienceItem[] = [
  {
    title: 'Manufacturing Design Engineering Intern',
    company: 'Apple',
    date: 'May 2025 - Present',
    description: [
      'Working on manufacturing design and engineering projects for upcoming products.',
      'Collaborating with cross-functional teams to improve product manufacturability.'
    ],
    logo: '/assets/logos/Apple_logo_black.svg',
  },
  {
    title: 'Student Researcher',
    company: 'Columbia Engineering',
    date: 'Feb 2024 - May 2025',
    description: [
      'MBL Lab: Designed CAD models for NITRO knee replacement and co-developed test rig for mechanical testing.',
      'Creative Machines Lab: Developed a low-cost food 3D printer for a restaurant and a self-diagnostic 3D-printing robot.'
    ],
    logo: '/assets/logos/Vertical Left-aligned logo_blue.svg',
  },
  {
    title: 'Mechanical Engineering Intern',
    company: 'Eikon Therapeutics',
    date: 'Jun 2024 - Aug 2024',
    description: [
      'Developed automated rig to increase laser precision and reduce testing time.'
    ],
    logo: '/assets/logos/idckWeE-SI_logos.jpeg',
  },
  {
    title: 'Intern',
    company: 'Design Visionaries',
    date: 'May 2023 - Aug 2023',
    description: [
      'Designed medical devices, trained interns in NX, and filed USPTO provisional patents for small businesses.'
    ],
    logo: '/assets/logos/design visionaries logo.jpeg',
  },
  {
    title: 'Suzuki Lab intern',
    company: 'Stanford University',
    date: 'Aug 2021 - Aug 2021',
    description: [
      'Determined minimum viable layer thickness for novel spintronic material.'
    ],
    logo: '/assets/logos/Stanford_Cardinal_logo.svg',
  }
];

export function Experience() {
  return (
    <section id="experience" className="min-h-screen py-32 px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">Experience</h2>
        
        <div className="space-y-16">
          {experiences.map((exp, index) => (
            <div key={index} className="border-b border-gray-200 pb-16 last:border-0">
              <div className="flex items-start gap-6 mb-6">
                {exp.logo && (
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={exp.logo} 
                      alt={`${exp.company} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    {exp.title}
                  </h3>
                  <div className="text-xl text-gray-600 mb-2">{exp.company}</div>
                  <div className="text-lg text-gray-500">{exp.date}</div>
                </div>
              </div>
              
              {exp.description.length > 0 && (
                <ul className="space-y-3 ml-22 text-lg text-gray-700">
                  {exp.description.map((desc, i) => (
                    <li key={i}>• {desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}