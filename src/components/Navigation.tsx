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
                      activeSection === id ? 'opacity-100' : 'opacity-50 hover:opacity-80'
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
                href="https://codepen.io"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-wipe flex items-center justify-center px-4 py-3 overflow-hidden"
                aria-label="CodePen"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 8.182l-.018-.087-.017-.05c-.01-.024-.018-.05-.03-.075-.003-.018-.015-.034-.02-.05l-.035-.067-.03-.05-.044-.06-.046-.045-.06-.045-.046-.03-.06-.044-.044-.04-.015-.02L12.58.19c-.347-.232-.796-.232-1.142 0L.453 7.502l-.015.015-.044.035-.06.05-.038.04-.05.056-.037.045-.05.06c-.02.017-.03.03-.03.046l-.05.06-.02.06c-.02.01-.02.04-.03.07l-.01.05C0 8.12 0 8.15 0 8.18v7.497c0 .044.003.09.01.135l.01.046c.005.03.01.06.02.086l.015.05c.01.027.016.053.027.075l.022.05c0 .01.015.04.03.06l.03.04c.015.01.03.04.045.06l.03.04.04.04c.01.013.01.03.03.03l.06.042.04.03.01.014 10.97 7.33c.164.12.375.163.57.163s.39-.06.57-.18l10.99-7.28.014-.01.046-.037.06-.043.048-.036.052-.058.033-.045.04-.06.03-.05.03-.07.016-.052.03-.077.015-.045.03-.08v-7.5c0-.05 0-.095-.016-.14h-.002zm-11.99 6.28l-3.65-2.44 3.65-2.442 3.65 2.44-3.65 2.44zm-1.034-6.674l-4.473 2.99L2.89 8.362l8.086-5.39V7.79zm-6.33 4.233l-2.582 1.73V10.3l2.582 1.73zm1.857 1.25l4.473 2.99v4.82L2.89 15.69l3.618-2.417v-.004zm6.537 2.99l4.474-2.98 3.613 2.42-8.087 5.39v-4.82zm6.33-4.23l2.583-1.72v3.456l-2.583-1.73zm-1.855-1.24L13.042 7.8V2.97l8.085 5.39-3.612 2.415v.003z"/>
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
              </div>
            </div>

            {/* QR Code */}
            <div className="hidden xl:flex items-center px-4 py-4">
              <div className="w-14 h-14 border-2 border-black p-1">
                <div className="w-full h-full bg-black/10 flex items-center justify-center text-[6px] font-mono opacity-40">
                  QR
                </div>
              </div>
            </div>
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
                <div className="flex gap-4 justify-center">
                  <a 
                    href="https://codepen.io" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 flex items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-colors"
                    aria-label="CodePen"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 8.182l-.018-.087-.017-.05c-.01-.024-.018-.05-.03-.075-.003-.018-.015-.034-.02-.05l-.035-.067-.03-.05-.044-.06-.046-.045-.06-.045-.046-.03-.06-.044-.044-.04-.015-.02L12.58.19c-.347-.232-.796-.232-1.142 0L.453 7.502l-.015.015-.044.035-.06.05-.038.04-.05.056-.037.045-.05.06c-.02.017-.03.03-.03.046l-.05.06-.02.06c-.02.01-.02.04-.03.07l-.01.05C0 8.12 0 8.15 0 8.18v7.497c0 .044.003.09.01.135l.01.046c.005.03.01.06.02.086l.015.05c.01.027.016.053.027.075l.022.05c0 .01.015.04.03.06l.03.04c.015.01.03.04.045.06l.03.04.04.04c.01.013.01.03.03.03l.06.042.04.03.01.014 10.97 7.33c.164.12.375.163.57.163s.39-.06.57-.18l10.99-7.28.014-.01.046-.037.06-.043.048-.036.052-.058.033-.045.04-.06.03-.05.03-.07.016-.052.03-.077.015-.045.03-.08v-7.5c0-.05 0-.095-.016-.14h-.002zm-11.99 6.28l-3.65-2.44 3.65-2.442 3.65 2.44-3.65 2.44zm-1.034-6.674l-4.473 2.99L2.89 8.362l8.086-5.39V7.79zm-6.33 4.233l-2.582 1.73V10.3l2.582 1.73zm1.857 1.25l4.473 2.99v4.82L2.89 15.69l3.618-2.417v-.004zm6.537 2.99l4.474-2.98 3.613 2.42-8.087 5.39v-4.82zm6.33-4.23l2.583-1.72v3.456l-2.583-1.73zm-1.855-1.24L13.042 7.8V2.97l8.085 5.39-3.612 2.415v.003z"/>
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
