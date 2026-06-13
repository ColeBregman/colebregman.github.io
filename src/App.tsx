import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Projects } from './components/sections/Projects';
import { Experience } from './components/sections/Experience';
import Reading from './components/sections/Reading';
import Breadcrumbs from './components/sections/Breadcrumbs';
import { Contact } from './components/sections/Contact';
import { ProjectDetail } from './pages/ProjectDetail';

// BrowserRouter doesn't scroll to #anchors on navigation (e.g. "/#projects"
// from a project page), so handle it manually.
function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a tick so the home page sections exist before scrolling
      requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [pathname, hash]);

  return null;
}

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Reading />
      <Breadcrumbs />
      <Contact />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToHash />
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