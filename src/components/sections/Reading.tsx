import { useState, useEffect, useRef } from 'react';
import { bookCategories } from '../../data/books';
import BookCard from '../reading/BookCard';

export default function Reading() {
  const [activeCategory, setActiveCategory] = useState(bookCategories[0].id);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const currentCategory = bookCategories.find((cat) => cat.id === activeCategory) || bookCategories[0];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      id="reading"
      ref={sectionRef}
      className="min-h-screen py-20 px-6 bg-white relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4 uppercase tracking-tight">
            What to read when...
          </h2>
          <p className="text-lg text-gray-600 mb-2">Personal book recommendations</p>
        </div>

        {/* Category Tabs */}
        <div
          className={`mb-12 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex gap-4 justify-center flex-wrap md:flex-nowrap overflow-x-auto pb-2">
            {bookCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 border-2 border-black font-medium transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Title */}
        <div
          className={`text-center mb-12 transition-all duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-2">{currentCategory.title}</h3>
          {currentCategory.description && (
            <p className="text-gray-600">{currentCategory.description}</p>
          )}
        </div>

        {/* Books Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {currentCategory.books.map((book, index) => (
            <div
              key={book.id}
              className="transition-all duration-500"
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <BookCard book={book} index={index} />
            </div>
          ))}
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
