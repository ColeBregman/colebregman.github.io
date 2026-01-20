# Bold Minimal Portfolio Redesign - Implementation Guide

Inspired by wodniack.dev, adapted with white/black color scheme.

## 🎨 Design System

### Colors
```css
--bg-primary: #FFFFFF (white)
--text-primary: #000000 (black)
--text-secondary: #666666 (gray)
--border: #E5E5E5 (light gray)
--accent: #000000 (black)
```

### Typography Scale
```css
--text-xs: 0.75rem (12px)
--text-sm: 0.875rem (14px)
--text-base: 1rem (16px)
--text-lg: 1.125rem (18px)
--text-xl: 1.25rem (20px)
--text-2xl: 1.5rem (24px)
--text-3xl: 1.875rem (30px)
--text-4xl: 2.25rem (36px)
--text-5xl: 3rem (48px)
--text-6xl: 3.75rem (60px)
--text-7xl: 4.5rem (72px)
--text-8xl: 6rem (96px)
--text-9xl: 8rem (128px)
```

### Spacing System
Use generous whitespace - double current padding/margins

---

## 📁 Files to Modify

### 1. Global Styles

**File**: `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }
  
  body {
    @apply bg-white text-black font-exo2;
    font-feature-settings: 'liga' 1, 'calt' 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer components {
  /* Hide default scrollbar, keep functionality */
  body {
    scrollbar-width: thin;
    scrollbar-color: #000 #fff;
  }
  
  body::-webkit-scrollbar {
    width: 8px;
  }
  
  body::-webkit-scrollbar-track {
    background: #fff;
  }
  
  body::-webkit-scrollbar-thumb {
    background: #000;
    border-radius: 4px;
  }
}
```

---

### 2. App Layout

**File**: `src/App.tsx`
```typescript
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Projects } from './components/sections/Projects';
import { Experience } from './components/sections/Experience';
import { Contact } from './components/sections/Contact';
import { ProjectDetail } from './pages/ProjectDetail';

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Contact />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
        
        <footer className="border-t border-gray-200 py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                © {new Date().getFullYear()} Cole Bregman
              </div>
              <div className="text-sm text-gray-600">
                Built with React & TypeScript
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
```

---

### 3. Navigation (Top-Right, Minimal)

**File**: `src/components/Navigation.tsx`
```typescript
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

export function Navigation() {
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isHomePage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isHomePage]);

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isHomePage) {
    return (
      <nav className="fixed top-8 right-8 z-50">
        <a 
          href="/" 
          className="text-sm font-medium tracking-wider uppercase hover:opacity-60 transition-opacity"
        >
          ← Back
        </a>
      </nav>
    );
  }

  return (
    <nav className="fixed top-8 right-8 z-50 flex gap-8">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => handleNavClick(id)}
          className={`text-sm font-medium tracking-wider uppercase transition-opacity ${
            activeSection === id ? 'opacity-100' : 'opacity-40 hover:opacity-70'
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
```

---

### 4. Hero Section (Bold & Centered)

**File**: `src/components/sections/Hero.tsx`
```typescript
import { ArrowDown } from 'lucide-react';

export function Hero() {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="h-screen flex flex-col items-center justify-center px-8 relative">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-none">
          Cole Bregman
        </h1>
        <p className="text-2xl md:text-3xl lg:text-4xl text-gray-600 font-light">
          Mechanical Engineer & Product Designer
        </p>
      </div>
      
      <button 
        onClick={scrollToAbout}
        className="absolute bottom-16 animate-bounce opacity-40 hover:opacity-100 transition-opacity"
        aria-label="Scroll to about section"
      >
        <ArrowDown size={32} />
      </button>
    </section>
  );
}
```

---

### 5. About Section

**File**: `src/components/sections/About.tsx`
```typescript
export function About() {
  return (
    <section id="about" className="min-h-screen flex items-center px-8 py-32">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">About</h2>
        
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-8 text-xl md:text-2xl leading-relaxed text-gray-700">
            <p>
              Mechanical Engineering student at Columbia University, pursuing a minor in Computer Science.
            </p>
            <p>
              I love getting hands-on and making things—whether I'm prototyping in the Creative Machines Lab 
              or conducting research in the Musculoskeletal Biomechanics Lab.
            </p>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-8">Core Skills</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                'Python', 'TypeScript', 'React', 'CAD (Fusion360, NX)', 
                '3D Printing', 'CNC Machining', 'Design Thinking', 'Product Design'
              ].map((skill) => (
                <div key={skill} className="text-lg font-medium">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### 6. Projects Section

**File**: `src/components/sections/Projects.tsx`
```typescript
import { ProjectCard } from '../projects/ProjectCard.tsx';
import { projects } from '../../types/project';

export function Projects() {
  return (
    <section id="projects" className="min-h-screen py-32 px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">Work</h2>
        <div className="space-y-24">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 7. Project Card (Minimal & Bold)

**File**: `src/components/projects/ProjectCard.tsx`
```typescript
import { Project } from '../../types/project';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <Link 
      to={project.link}
      className="group block"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
          <div className="aspect-[4/3] overflow-hidden bg-gray-100">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
        
        <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
          <div className="text-sm text-gray-500 mb-4">
            #{String(index + 1).padStart(2, '0')}
          </div>
          <h3 className="text-4xl md:text-5xl font-bold mb-6 group-hover:opacity-60 transition-opacity">
            {project.title}
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            {project.description}
          </p>
          
          {project.technologies && (
            <div className="flex flex-wrap gap-3 mb-8">
              {project.technologies.slice(0, 4).map((tech, i) => (
                <span key={i} className="text-sm font-medium text-gray-700">
                  {tech}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-lg font-medium group-hover:gap-4 transition-all">
            View Project
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
}
```

---

### 8. Experience Section

**File**: `src/components/sections/Experience.tsx`
```typescript
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
  // ... rest of experiences
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
```

---

### 9. Contact Section

**File**: `src/components/sections/Contact.tsx`
```typescript
import { Mail, Linkedin, Github } from 'lucide-react';

export function Contact() {
  return (
    <section id="contact" className="min-h-screen flex items-center px-8 py-32">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-5xl md:text-7xl font-bold mb-16">Let's Talk</h2>
        
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-2xl md:text-3xl text-gray-700 leading-relaxed mb-12">
              I'm always interested in hearing about new projects, 
              internship opportunities, and collaborations.
            </p>
            
            <a 
              href="mailto:ctb2159@columbia.edu"
              className="inline-block px-12 py-6 bg-black text-white text-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Get in Touch
            </a>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Email</h3>
              <a 
                href="mailto:ctb2159@columbia.edu"
                className="text-xl text-gray-600 hover:text-black transition-colors"
              >
                ctb2159@columbia.edu
              </a>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Connect</h3>
              <div className="flex gap-6">
                <a 
                  href="https://www.linkedin.com/in/cole-bregman/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-black transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={28} />
                </a>
                <a 
                  href="https://github.com/colebregman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-black transition-colors"
                  aria-label="GitHub"
                >
                  <Github size={28} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 🚀 Implementation Order

1. **Global Styles** (`index.css`) - Base styles
2. **App.tsx** - Layout structure
3. **Navigation.tsx** - Top-right minimal nav
4. **Hero.tsx** - Bold centered hero
5. **About.tsx** - Larger typography
6. **ProjectCard.tsx** - Minimal card design
7. **Projects.tsx** - Updated layout
8. **Experience.tsx** - Simplified timeline
9. **Contact.tsx** - Clean contact section

---

## ✅ Testing Checklist

After implementation:
- [ ] Navigation works and highlights correct section
- [ ] All sections are full-screen or properly sized
- [ ] Typography scales correctly on mobile
- [ ] Images load properly
- [ ] Links work (email, social, projects)
- [ ] Smooth scrolling functions
- [ ] Project detail pages still work
- [ ] Footer displays correctly
- [ ] Build completes without errors

---

## 📝 Notes

- Remove: Breadcrumbs section (not needed in minimal design)
- Remove: Complex scrolling text animations from hero
- Keep: Company logos, WebP images, all optimizations
- Simplify: All animations to basic hover/transitions
- Focus: Bold typography, generous whitespace, clean layout