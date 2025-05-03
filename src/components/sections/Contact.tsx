import React from 'react';

export function Contact() {
  return (
    <section id="contact" className="min-h-screen flex items-center px-6 md:pr-32">
      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
        <p className="text-lg text-gray-600 mb-8">
          I'm always interested in hearing about new projects and opportunities.
          Feel free to reach out if you'd like to connect or collaborate.
        </p>
        <a 
          href="mailto:ctb2159@columbia.edu"
          className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Say Hello
        </a>
      </div>
    </section>
  );
}