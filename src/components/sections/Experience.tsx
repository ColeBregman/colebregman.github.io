import { Link } from 'react-router-dom';

interface ExperienceItem {
  title: string;
  company: string;
  date: string;
  summary: string;
  logo?: string;
  links?: { label: string; href: string }[]; // links to full case studies, when they exist
  current?: boolean;
}

const experiences: ExperienceItem[] = [
  {
    title: 'Ride Development Engineering Intern',
    company: 'Walt Disney Imagineering',
    date: 'Jun 2026 — Present',
    summary: 'Developing ride systems for upcoming attractions.',
    logo: '/assets/logos/walt-disney-imagineering.webp',
    current: true,
  },
  {
    title: 'Manufacturing Design Engineering Intern',
    company: 'Apple',
    date: 'May 2025 — May 2026',
    summary:
      'Drove $2.8M+ in savings across DFM, tooling, materials, and assembly — including raising one assembly from 65% to 99.7% yield. Also built a tabletop model of a partner factory with a small team, later seen on CNBC.',
    logo: '/assets/logos/Apple_logo_black.svg',
    links: [
      { label: 'View case study', href: '/project/AppleMDE' },
      { label: 'Tabletop factory model', href: '/project/CorningModel' },
    ],
  },
  {
    title: 'Student Researcher',
    company: 'Columbia Engineering',
    date: 'Feb 2024 — May 2025',
    summary:
      'Designed a test rig and CAD for the NITRO knee replacement (Biomechanics Lab); built a low-cost food 3D printer and a self-diagnostic printing robot (Creative Machines Lab).',
    logo: '/assets/logos/Vertical Left-aligned logo_blue.svg',
  },
  {
    title: 'Mechanical Engineering Intern',
    company: 'Eikon Therapeutics',
    date: 'Jun 2024 — Aug 2024',
    summary:
      'Built an automated optical-alignment rig and real-time GUI — +44% laser precision, −90% alignment time.',
    logo: '/assets/logos/idckWeE-SI_logos.jpeg',
    links: [{ label: 'View case study', href: '/project/Optics' }],
  },
  {
    title: 'Engineering Intern',
    company: 'Design Visionaries',
    date: 'May 2023 — Aug 2023',
    summary: 'Designed medical devices, trained interns in NX, and filed USPTO provisional patents for small businesses.',
    logo: '/assets/logos/design visionaries logo.jpeg',
  },
  {
    title: 'Suzuki Lab Intern',
    company: 'Stanford University',
    date: 'Aug 2021',
    summary: 'Determined the minimum viable layer thickness for a novel spintronic material.',
    logo: '/assets/logos/Stanford_Cardinal_logo.svg',
  },
];

export function Experience() {
  return (
    <section id="experience" className="min-h-screen py-32 px-8 bg-white relative z-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">Experience</h2>

        <div>
          {experiences.map((exp, index) => {
            const isLast = index === experiences.length - 1;
            return (
              <div key={index} className="relative flex gap-5 md:gap-8">
                {/* Node column: logo square on the timeline rule */}
                <div className="relative flex flex-col items-center flex-shrink-0">
                  <div className="relative w-14 h-14 md:w-16 md:h-16 border-2 border-black bg-white flex items-center justify-center p-2">
                    {exp.logo && (
                      <img
                        src={exp.logo}
                        alt={`${exp.company} logo`}
                        className="w-full h-full object-contain"
                      />
                    )}
                    {/* "Now" marker for the current role */}
                    {exp.current && (
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-black" aria-hidden="true" />
                    )}
                  </div>
                  {/* Connector to the next node */}
                  {!isLast && <div className="w-0.5 flex-1 bg-black/15 my-2" />}
                </div>

                {/* Content */}
                <div className={`flex-1 pt-1 ${isLast ? '' : 'pb-12'}`}>
                  <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                    {exp.date}
                    {exp.current && (
                      <span className="text-black font-bold">· NOW</span>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold leading-tight">{exp.title}</h3>
                  <div className="text-base md:text-lg text-gray-600 mb-3">{exp.company}</div>
                  <p className="text-base text-gray-700 leading-relaxed max-w-2xl">{exp.summary}</p>
                  {exp.links && (
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                      {exp.links.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold hover:opacity-60 transition-opacity"
                        >
                          {link.label}
                          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
