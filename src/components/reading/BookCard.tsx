import { Book } from '../../data/books';

interface BookCardProps {
  book: Book;
  index: number;
}

export default function BookCard({ book, index }: BookCardProps) {
  const handleClick = () => {
    if (book.link) {
      window.open(book.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`h-full group cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
        book.link ? 'hover:shadow-xl' : ''
      }`}
      onClick={handleClick}
      role={book.link ? 'button' : 'article'}
      tabIndex={book.link ? 0 : undefined}
      onKeyDown={(e) => {
        if (book.link && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Polaroid Card - Fixed height for consistency */}
      <div className="h-full bg-white border-2 border-black p-4 pb-6 flex flex-col">
        {/* Number Badge */}
        <div className="flex justify-start mb-3">
          <div className="bg-black text-white px-3 py-1 text-sm font-mono">
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>

        {/* Book Cover - Fixed aspect ratio */}
        <div className="aspect-[2/3] mb-4 border-2 border-black overflow-hidden bg-gray-100">
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Book Info */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg leading-tight min-h-[3.5rem]">{book.title}</h3>
          <p className="text-gray-600 text-sm">{book.author}</p>
        </div>

        {/* Description - Fixed height for consistency */}
        <div className="mt-4 flex-grow">
          <p className="italic text-base leading-relaxed line-clamp-4 min-h-[4.5rem]">
            "{book.description}"
          </p>
        </div>

        {/* Link */}
        {book.link && (
          <div className="mt-4 pt-2">
            <span className="text-sm inline-flex items-center gap-1 group-hover:underline">
              → Amazon
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
