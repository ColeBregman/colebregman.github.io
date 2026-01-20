import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ConsoleText } from './ConsoleText';

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: 'about', label: 'ABOUT' },
  { id: 'projects', label: 'WORK' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'breadcrumbs', label: 'MORE' },
  { id: 'contact', label: 'CONTACT' },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-y-2 border-black">
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
  );
}