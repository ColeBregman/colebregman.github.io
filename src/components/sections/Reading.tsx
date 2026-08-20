import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { bookCategories } from '../../data/books';
import BookCard from '../reading/BookCard';

// Three.js loads in its own chunk, only once the section is near the viewport
const BookShelf3D = lazy(() => import('../reading/BookShelf3D'));

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// Flat grid fallback for devices without WebGL
function BookGrid() {
  const [activeCategory, setActiveCategory] = useState(bookCategories[0].id);
  const currentCategory =
    bookCategories.find((cat) => cat.id === activeCategory) || bookCategories[0];

  return (
    <div>
      <div className="flex gap-3 justify-center flex-wrap mb-12">
        {bookCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 border-2 border-black font-mono text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-bold">{currentCategory.title}</h3>
      </div>

      <div
        key={currentCategory.id}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {currentCategory.books.map((book, index) => (
          <div
            key={book.id}
            className="fade-in-visible"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <BookCard book={book} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ShelfLoading() {
  return (
    <div className="h-[68vh] min-h-[480px] max-h-[820px] border-2 border-black flex items-center justify-center">
      <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
        Assembling the shelf…
      </p>
    </div>
  );
}

export default function Reading() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const webgl = useMemo(supportsWebGL, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Catch the case where the section is already on screen at mount
    // (e.g. landing directly on /#reading)
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05, rootMargin: '200px 0px' }
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="reading"
      ref={sectionRef}
      className="min-h-screen py-32 px-6 bg-white relative z-10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4 uppercase tracking-tight">
            What to read when...
          </h2>
          <p className="text-lg text-gray-600">Personal book recommendations</p>
        </div>

        {/* The shelf (or flat grid where WebGL isn't available) */}
        <div
          className={`transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {isVisible &&
            (webgl ? (
              <Suspense fallback={<ShelfLoading />}>
                <BookShelf3D />
              </Suspense>
            ) : (
              <BookGrid />
            ))}
          {!isVisible && <ShelfLoading />}
        </div>

        {/* Goodreads CTA */}
        <div
          className={`mt-20 text-center border-t-2 border-black pt-12 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-lg text-gray-600 mb-6">Want to see more of what I'm reading?</p>
          <a
            href="https://www.goodreads.com/user/show/94865966-cole-bregman"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-black bg-white text-black font-medium hover:bg-black hover:text-white transition-all duration-300"
          >
            Friend me on Goodreads →
          </a>
        </div>
      </div>
    </section>
  );
}
