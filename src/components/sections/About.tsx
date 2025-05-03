import React from 'react';

export function About() {
  return (
    <section id="about" className="flex items-center px-6 md:pr-32 py-24">
      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold mb-8">About Me</h2>
        <div className="space-y-3 text-lg text-gray-600">
          <p>
            I'm a Mechanical Engineering student at Columbia University, also pursuing a minor in Computer Science. I love 
            getting handson and making things—whether I'm prototyping in the Creative Machines Lab or conducting 
            research in the Musculoskeletal Biomechanics Lab.
          </p>
          <p>
            My favorite hobby is exploring new hobbies, whether that be embroidery, 3D modeling, or crocheting—my latest 
            endeavor is learning bookbinding.
          </p>
        </div>
      </div>
    </section>
  );
}