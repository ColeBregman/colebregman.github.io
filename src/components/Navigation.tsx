import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConsoleText } from './ConsoleText';

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: 'about', label: 'ABOUT' },
  { id: 'projects', label: 'WORK' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'reading', label: 'READING' },
  { id: 'breadcrumbs', label: 'MORE' },
  { id: 'contact', label: 'CONTACT' },
];

export function Navigation() {
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isHomePage) return;

    // Sections are taller than the viewport, so a high visibility threshold
    // never fires. Instead, mark a section active when it crosses a narrow
    // band around the vertical center of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0, rootMargin: '-45% 0px -45% 0px' }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isHomePage]);

  // Body scroll lock when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Keyboard support (Escape to close)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
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
    <>
      {/* Desktop Navigation - Hidden on Mobile */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white border-y-2 border-black">
        <div className="flex items-stretch justify-between">
          {/* Left: Logo + Console with dividers */}
          <div className="flex items-stretch divide-x-2 divide-black">
            {/* Cole Logo */}
            <div className="flex items-center px-4 py-4">
              <img
                src="/assets/Cole Logo.svg"
                alt="Cole Bregman Logo"
                className="h-12 w-auto"
              />
            </div>
            
            {/* Console Text - Fixed Width */}
            <div className="hidden md:flex items-center px-4 py-4 w-64">
              <ConsoleText />
            </div>
          </div>

          {/* Right: All Other Elements with Dividers */}
          <div className="flex items-stretch divide-x-2 divide-black border-l-2 border-black">
            {/* Navigation Links */}
            <nav className="flex items-center px-8 py-4">
              <div className="flex gap-8">
                {sections.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => handleNavClick(id)}
                    className={`nav-link text-sm font-bold tracking-[0.15em] transition-opacity ${
                      activeSection === id
                        ? 'opacity-100 underline underline-offset-8 decoration-2'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Stacked Icons with Full-Width Horizontal Divider */}
            <div className="flex flex-col divide-y-2 divide-black">
              <a
                href="https://github.com/colebregman"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-wipe flex items-center justify-center px-4 py-3 overflow-hidden"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/cole-bregman/"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-wipe flex items-center justify-center px-4 py-3 overflow-hidden"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>

            {/* Text Info */}
            <div className="hidden xl:flex items-center px-6 py-4">
              <div className="flex flex-col items-end gap-0.5 text-xs leading-tight">
                <span className="opacity-50 font-light">design  from the bay.</span>
                <a href="#contact" className="font-semibold hover:opacity-60 transition-opacity">
                  Always happy to chat → <span className="font-bold">Reach out</span>
                </a>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:opacity-60 transition-opacity"
                >
                  Resume <span className="font-bold">↓</span>
                </a>
              </div>
            </div>

            {/* QR Code → LinkedIn */}
            <a
              href="https://www.linkedin.com/in/cole-bregman/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center px-4 py-4 hover:opacity-70 transition-opacity"
              aria-label="Scan to connect on LinkedIn"
              title="Scan to connect on LinkedIn"
            >
              <div className="w-14 h-14 border-2 border-black p-1 bg-white">
                <img
                  src="/assets/qr-linkedin.svg"
                  alt="QR code linking to Cole Bregman's LinkedIn"
                  className="w-full h-full"
                />
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Visible on Mobile Only */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Logo */}
          <img 
            src="/assets/Cole Logo.svg" 
            alt="Cole Bregman Logo" 
            className="h-10 w-auto" 
          />
          
          {/* Hamburger Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay and Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel - Slide from Right */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white border-l-2 border-black z-50 flex flex-col"
            >
              {/* Close Button Header */}
              <div className="flex justify-end p-4 border-b-2 border-black">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              </div>
              
              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {sections.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => handleNavClick(id)}
                      className={`block w-full text-left px-4 py-4 text-lg font-bold tracking-wider border-b border-gray-200 last:border-0 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                        activeSection === id ? 'opacity-100 bg-gray-50' : 'opacity-70'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </nav>
              
              {/* Social Icons Footer */}
              <div className="border-t-2 border-black p-6">
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 mb-4 border-2 border-black font-bold tracking-wider hover:bg-black hover:text-white transition-colors"
                >
                  RESUME ↓
                </a>
                <div className="flex gap-4 justify-center">
                  <a
                    href="https://github.com/colebregman"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 flex items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-colors"
                    aria-label="GitHub"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </a>

                  <a 
                    href="https://www.linkedin.com/in/cole-bregman/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 flex items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
