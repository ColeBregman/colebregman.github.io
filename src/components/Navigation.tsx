import React, { useEffect, useState } from 'react';
import { Github, Linkedin, Mail, Menu, X } from 'lucide-react';
import gsap from 'gsap';

interface Section {
  id: string;
  label: string;
}

export const sections: Section[] = [
  { id: 'hero', label: 'introduction' },
  { id: 'about', label: 'about' },
  { id: 'projects', label: 'projects' },
  { id: 'experience', label: 'experience' },
  { id: 'breadcrumbs', label: 'breadcrumbs' },
  { id: 'contact', label: 'contact' },
] as const;

export function Navigation() {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Scroll event to toggle navigation bar visibility
    const handleScroll = () => {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setShowNav(heroBottom <= 0); // Show nav only if Hero is out of view
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showNav) {
      gsap.fromTo(
        '.navbar',
        { opacity: 0, y: -20 }, // Starting properties
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' } // Animation
      );
    }
  }, [showNav]); // Trigger animation when `showNav` changes

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const SocialLinks = () => (
    <div className="flex md:flex-col items-center md:items-end gap-4">
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
        <Github size={20} />
      </a>
      <a href="https://www.linkedin.com/in/cole-bregman/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
        <Linkedin size={20} />
      </a>
      <a href="mailto:ctb2159@columbia.edu" className="text-gray-400 hover:text-black transition-colors">
        <Mail size={20} />
      </a>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation */}
      {showNav && (
        <nav className="navbar md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <span className="text-xl font-semibold">CB</span>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 hover:text-black">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
              <div className="space-y-4">
                {sections.map(({ id, label }) => (
                  <a
                    key={id}
                    onClick={() => handleNavClick(id)}
                    className={`block py-2 ${
                      activeSection === id ? 'text-black font-semibold' : 'text-gray-400'
                    } transition-colors hover:text-black`}
                  >
                    {label}
                  </a>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <SocialLinks />
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Desktop Navigation */}
      {showNav && (
        <nav className="navbar hidden md:block fixed right-2 top-1/2 -translate-y-1/2 z-[9999]">
          <div className="flex flex-col items-end gap-6">
            <div className="space-y-4">
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className="group flex items-center justify-end cursor-pointer"
                >
                  <span
                    className={`text-sm font-medium tracking-wider ${
                      activeSection === id ? 'text-black font-semibold' : 'text-gray-400'
                    } transition-colors hover:text-black`}
                  >
                    {label}
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <SocialLinks />
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
