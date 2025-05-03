import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Projects } from './components/sections/Projects';
import { Experience } from './components/sections/Experience';
import Breadcrumbs from './components/sections/Breadcrumbs';
import { Contact } from './components/sections/Contact';
import { ProjectDetail } from './pages/ProjectDetail';

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Breadcrumbs />
      <Contact />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="w-screen mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
        
        <footer className="border-t border-gray-200 py-12 px-6 md:pr-32">
          <div className="max-w-6xl mx-auto text-center text-gray-600">
            <p>© 2024 Cole Bregman. All rights reserved.</p>
            <p className="mt-2">Built with React and Tailwind CSS</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}