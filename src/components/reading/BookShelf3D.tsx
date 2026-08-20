import { useEffect, useMemo, useRef, useState } from 'react';
import { bookCategories, categoryStartIndex, shelfBooks } from '../../data/books';
import { BookShelfEngine, type ShelfMode } from './bookShelfEngine';

// Interactive 3D shelf: browse spines, pull a volume forward, orbit and read.
// Shelf mechanics adapted from mint.gg's "The Complete Shelf" (MIT License).
export default function BookShelf3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BookShelfEngine | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<ShelfMode>('browse');
  const [ready, setReady] = useState(false);

  const activeBook = shelfBooks[activeIndex];
  const selectedBook = useMemo(
    () => (selectedIndex === null ? null : shelfBooks[selectedIndex]),
    [selectedIndex]
  );
  const isFocused = mode !== 'browse';

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new BookShelfEngine(canvasRef.current, shelfBooks, {
      onActiveIndex: setActiveIndex,
      onMode: (nextMode, index) => {
        setMode(nextMode);
        setSelectedIndex(index);
      },
      onReady: () => setReady(true),
    });
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Rendered top-left over the empty wall on desktop, below the canvas on
  // mobile — never over the shelf itself.
  const browseCaption = (
    <>
      <p className="font-mono text-xs text-gray-500 mb-2">
        #{String(activeIndex + 1).padStart(2, '0')} / {String(shelfBooks.length).padStart(2, '0')}
      </p>
      <p className="font-mono text-[0.65rem] uppercase tracking-widest text-gray-500 mb-2">
        {activeBook.categoryTitle}
      </p>
      <h3 className="text-2xl md:text-3xl font-bold leading-tight">
        {activeBook.title.split('\n')[0]}
      </h3>
      <p className="text-sm text-gray-600 mt-1.5">{activeBook.author}</p>
      <button
        type="button"
        disabled={isFocused}
        onClick={() => engineRef.current?.focusBook(activeIndex)}
        className="group inline-flex items-center gap-2 mt-4 font-mono text-xs uppercase tracking-widest font-bold hover:opacity-60 transition-opacity"
      >
        Inspect volume
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
    </>
  );

  return (
    <div>
      {/* Category tabs jump the shelf to each mood */}
      <div className="flex gap-3 justify-center flex-wrap mb-10">
        {bookCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => engineRef.current?.browseTo(categoryStartIndex[category.id])}
            disabled={isFocused}
            className={`px-4 py-2 border-2 border-black font-mono text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap disabled:opacity-40 ${
              activeBook.categoryId === category.id
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* The shelf */}
      <div className="relative h-[68vh] min-h-[480px] max-h-[820px] overflow-hidden border-2 border-black">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="application"
          aria-label={`Interactive three-dimensional shelf of ${shelfBooks.length} books. Drag or use the arrow keys to browse. Press Enter to inspect the selected book.`}
          className="absolute inset-0 w-full h-full block outline-none [touch-action:pan-y]"
        />

        {/* Browse caption — desktop: over the empty wall, top-left */}
        <div
          aria-hidden={isFocused}
          className={`hidden md:block absolute left-8 top-8 max-w-sm transition-all duration-500 ${
            isFocused ? 'opacity-0 -translate-x-3 pointer-events-none' : 'opacity-100 translate-x-0'
          }`}
        >
          {browseCaption}
        </div>

        {/* Browse arrows */}
        <button
          type="button"
          aria-label="Previous book"
          disabled={isFocused || activeIndex === 0}
          onClick={() => engineRef.current?.browseBy(-1)}
          className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 border-2 border-black bg-white/90 text-black font-mono transition-all duration-300 hover:bg-black hover:text-white disabled:opacity-0 disabled:pointer-events-none"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Next book"
          disabled={isFocused || activeIndex === shelfBooks.length - 1}
          onClick={() => engineRef.current?.browseBy(1)}
          className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 border-2 border-black bg-white/90 text-black font-mono transition-all duration-300 hover:bg-black hover:text-white disabled:opacity-0 disabled:pointer-events-none"
        >
          →
        </button>

        {/* Position ticks */}
        <nav
          aria-label="Shelf position"
          className={`absolute bottom-5 right-5 md:right-8 hidden sm:flex items-end gap-[5px] transition-opacity duration-500 ${
            isFocused ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {shelfBooks.map((book, index) => (
            <button
              key={book.id}
              type="button"
              aria-label={`Browse to ${book.title.split('\n')[0]}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              disabled={isFocused}
              onClick={() => engineRef.current?.browseTo(index)}
              className={`w-[3px] transition-all duration-300 ${
                index === activeIndex ? 'h-5 bg-black' : 'h-3 bg-gray-300 hover:bg-gray-500'
              } ${index > 0 && book.categoryId !== shelfBooks[index - 1].categoryId ? 'ml-2' : ''}`}
            />
          ))}
        </nav>

        {/* Input hint */}
        <p
          aria-hidden="true"
          className={`absolute top-4 right-5 md:right-8 font-mono text-[0.6rem] uppercase tracking-widest text-gray-400 transition-opacity duration-500 ${
            isFocused ? 'opacity-0' : 'opacity-100'
          }`}
        >
          Drag · Arrows · Click a book
        </p>

        {/* Details panel (inspect mode) */}
        <aside
          aria-hidden={!isFocused}
          aria-label={selectedBook ? `Details for ${selectedBook.title}` : 'Book details'}
          className={`absolute max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[56%] md:right-0 md:top-0 md:bottom-0 md:w-[min(46%,560px)] bg-white/95 backdrop-blur-sm border-black max-md:border-t-2 md:border-l-2 overflow-y-auto transition-all duration-500 ${
            isFocused
              ? 'opacity-100 translate-x-0 translate-y-0'
              : 'opacity-0 md:translate-x-8 max-md:translate-y-8 pointer-events-none'
          }`}
        >
          {selectedBook && (
            <div className="p-6 md:p-10 flex flex-col min-h-full">
              <button
                type="button"
                onClick={() => engineRef.current?.returnToShelf()}
                className="group self-start inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-6 md:mb-10"
              >
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
                Return to shelf
              </button>

              <p className="font-mono text-[0.65rem] uppercase tracking-widest text-gray-500 mb-3">
                {selectedBook.categoryTitle}
              </p>
              <h3 className="text-2xl md:text-4xl font-bold leading-tight">
                {selectedBook.title.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h3>
              <p className="text-sm md:text-base text-gray-600 mt-3">{selectedBook.author}</p>

              <blockquote className="italic text-base md:text-lg leading-relaxed text-gray-700 border-l-2 border-black pl-4 mt-6 md:mt-8">
                &ldquo;{selectedBook.description}&rdquo;
              </blockquote>

              {selectedBook.link && (
                <a
                  href={selectedBook.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group self-start inline-flex items-center gap-2 mt-6 md:mt-8 font-mono text-xs uppercase tracking-widest font-bold border-b-2 border-black pb-0.5 hover:opacity-60 transition-opacity"
                >
                  View on Goodreads
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
                </a>
              )}

              <p className="font-mono text-[0.6rem] uppercase tracking-widest text-gray-400 mt-auto pt-8">
                Drag to orbit · Scroll to zoom · Esc to close
              </p>
            </div>
          )}
        </aside>

        {/* Loading veil */}
        <div
          aria-hidden={ready}
          className={`absolute inset-0 flex items-center justify-center bg-white transition-opacity duration-700 ${
            ready ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
            Assembling {shelfBooks.length} volumes…
          </p>
        </div>
      </div>

      {/* Browse caption — mobile: below the canvas, never over the shelf */}
      <div aria-hidden={isFocused} className={`md:hidden mt-6 text-center ${isFocused ? 'invisible' : ''}`}>
        {browseCaption}
      </div>

      {/* Screen-reader fallback listing */}
      <ul className="sr-only">
        {shelfBooks.map((book) => (
          <li key={book.id}>
            {book.title.split('\n')[0]} by {book.author} — {book.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
