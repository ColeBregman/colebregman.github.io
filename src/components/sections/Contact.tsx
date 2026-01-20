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