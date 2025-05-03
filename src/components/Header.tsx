import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" className="text-xl font-semibold">JD</a>
        <div className="flex items-center gap-6">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors">
            <Github size={20} />
          </a>
          <a href="https://www.linkedin.com/in/cole-bregman/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors">
            <Linkedin size={20} />
          </a>
          <a href="mailto:ctb2159@columbia.edu" className="text-gray-600 hover:text-black transition-colors">
            <Mail size={20} />
          </a>
        </div>
      </nav>
    </header>
  );
}