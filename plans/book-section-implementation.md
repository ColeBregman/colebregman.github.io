# Book Recommendations Section - Complete Design Plan

## Concept Overview

Add a curated book recommendations section inspired by the "What to Read When..." Substack format, adapted to your portfolio's monochrome aesthetic.

## Placement Options

### Option A: Main Page Section (Recommended)
Add between Experience and Contact sections

**Pros:**
- Keeps everything on one scrollable page
- Easy to discover
- Consistent with current single-page design
- No routing changes needed

**Cons:**
- Lengthens homepage
- Limited space for many books

### Option B: Dedicated Page
New route at `/#reading` or separate `/books`

**Pros:**
- More space for content
- Can have more books/categories
- Doesn't lengthen homepage
- Can be more detailed

**Cons:**
- Requires navigation
- Might get less traffic
- Additional routing needed

## Recommended Approach: Main Page Section

### Visual Design - Monochrome

```
┌─────────────────────────────────────────┐
│                                         │
│         WHAT I'M READING                │
│         Book recommendations organized   │
│         by mood and purpose             │
│                                         │
│         ~ 2 minute browse               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [Category Tabs - horizontal scroll]    │
│  ┌──────┬──────┬──────┬──────┬─────┐   │
│  │ All  │Inspir│Class │Tech  │More │   │
│  └──────┴──────┴──────┴──────┴─────┘   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  When you need inspiration              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │          │ │          │ │          ││
│  │   Book   │ │   Book   │ │   Book   ││
│  │   Cover  │ │   Cover  │ │   Cover  ││
│  │          │ │          │ │          ││
│  ├──────────┤ ├──────────┤ ├──────────┤│
│  │ 01       │ │ 02       │ │ 03       ││
│  │          │ │          │ │          ││
│  │The Design│ │Thinking  │ │Making    ││
│  │of Every  │ │Fast and  │ │Things    ││
│  │day Things│ │  Slow    │ │  Move    ││
│  │          │ │          │ │          ││
│  │Don Norman│ │Kahneman  │ │Kocienda  ││
│  │          │ │          │ │          ││
│  │"Changed  │ │"Essential│ │"Behind   ││
│  │ how I... │ │ for..."  │ │ the..."  ││
│  │          │ │          │ │          ││
│  │ [→ Link] │ │ [→ Link] │ │ [→ Link] ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                         │
│  When you want to understand design     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  ... more books ...                     │
│                                         │
└─────────────────────────────────────────┘
```

### Styling Details

**Book Cards:**
- White Polaroid-style frames (matches project gallery)
- Black borders (2px)
- Number badge (01, 02, 03...) like project images
- Cover: Slight desaturation for consistency
- Hover: Lift effect + shadow (matches other cards)
- Responsive: 1 column (mobile), 2-3 columns (tablet), 3-4 columns (desktop)

**Typography:**
- Section title: H1 (48px desktop, 36px mobile)
- Category headers: H2 (32px desktop, 24px mobile)
- Book title: 18px, bold
- Author: 14px, gray (#666)
- Description: 16px, light, italic, max 3 lines

**Colors:**
- Pure monochrome (black, white, grays)
- Number badges: white text on black background
- Links: Black, underline on hover

## Category Ideas

Based on your interests and portfolio:

### Technical/Professional
**"When you want to level up"**
- Design of Everyday Things - Don Norman
- Thinking, Fast and Slow - Daniel Kahneman
- The Lean Startup - Eric Ries
- Creative Confidence - Tom & David Kelley

### Inspiration/Making
**"When you need inspiration"**
- Make - various authors on making/crafts
- Shop Class as Soulcraft - Matthew Crawford
- The Craftsman - Richard Sennett
- Range - David Epstein

### Fiction/Escape
**"When you want to escape"**
- Project Hail Mary - Andy Weir
- The Martian - Andy Weir
- Ready Player One - Ernest Cline

### Currently Reading
**"What I'm reading now"**
- Dynamic section with 1-2 current books
- Can update regularly

## Component Specification

### BookCard Component

```typescript
interface BookCardProps {
  number: string; // "01", "02", etc.
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  amazonLink?: string;
  goodreadsLink?: string;
}

export function BookCard({...}: BookCardProps) {
  return (
    <motion.div
      className="book-card"
      whileHover={{ y: -4 }}
    >
      {/* Polaroid frame */}
      <div className="relative bg-white p-4 border-2 border-black">
        {/* Number badge */}
        <div className="absolute top-6 left-6 bg-black text-white px-3 py-1">
          {number}
        </div>
        
        {/* Book cover */}
        <img 
          src={coverUrl}
          alt={`${title} by ${author}`}
          className="w-full h-auto grayscale-[20%]"
        />
      </div>
      
      {/* Book info */}
      <div className="mt-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-gray-600">{author}</p>
        
        <p className="mt-2 text-base italic text-gray-700 line-clamp-3">
          "{description}"
        </p>
        
        {/* Links */}
        {amazonLink && (
          <a href={amazonLink} className="inline-block mt-2 text-sm hover:underline">
            → View on Amazon
          </a>
        )}
      </div>
    </motion.div>
  )
}
```

### BookCategory Component

```typescript
interface BookCategoryProps {
  title: string;
  description?: string;
  books: Book[];
}

export function BookCategory({...}: BookCategoryProps) {
  return (
    <motion.section className="py-16">
      {/* Category header */}
      <div className="mb-12">
        <h2 className="text-h2 font-medium mb-2">{title}</h2>
        {description && (
          <p className="text-body text-secondary-text">{description}</p>
        )}
      </div>
      
      {/* Book grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map((book, index) => (
          <BookCard
            key={book.id}
            number={`0${index + 1}`}
            {...book}
          />
        ))}
      </div>
      
      {/* Separator */}
      <div className="separator-line mt-16" />
    </motion.section>
  )
}
```

### Reading Section Component

```typescript
export function Reading() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  return (
    <section id="reading" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="mb-16 text-center">
          <h1 className="text-h1 font-medium mb-4">
            What I'm Reading
          </h1>
          <p className="text-body text-secondary-text max-w-2xl mx-auto">
            Book recommendations organized by mood and purpose.
            Because what you read shapes how you think.
          </p>
          <p className="text-caption text-tertiary-text uppercase tracking-wider mt-4">
            ~ 2 minute browse
          </p>
        </motion.div>
        
        {/* Category tabs */}
        <div className="flex gap-4 mb-16 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 border-2 transition-all ${
                activeCategory === cat.id
                  ? 'bg-black text-white border-black'
                  : 'border-black hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        {/* Book categories */}
        {bookCategories
          .filter(cat => activeCategory === 'all' || cat.id === activeCategory)
          .map(category => (
            <BookCategory key={category.id} {...category} />
          ))}
      </div>
    </section>
  )
}
```

## Data Structure Example

```typescript
// src/types/book.ts
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  amazonLink?: string;
  goodreadsLink?: string;
  rating?: number;
  dateAdded?: string;
}

export interface BookCategory {
  id: string;
  title: string;
  description?: string;
  books: Book[];
}

export const bookCategories: BookCategory[] = [
  {
    id: 'inspiration',
    title: 'When you need inspiration',
    description: 'Books that spark creativity and motivation',
    books: [
      {
        id: 'design-everyday',
        title: 'The Design of Everyday Things',
        author: 'Don Norman',
        coverUrl: '/assets/books/design-everyday.jpg',
        description: 'Changed how I see every object around me. Norman explains why good design is invisible and bad design is frustrating.',
        amazonLink: 'https://amazon.com/...',
        rating: 5
      },
      // More books...
    ]
  },
  {
    id: 'technical',
    title: 'When you want to learn',
    books: [...]
  }
]
```

## Implementation Plan

### Phase 1: Basic Structure
1. Create Book and BookCategory types
2. Create sample book data
3. Create BookCard component
4. Create BookCategory component
5. Create Reading section component
6. Add to navigation
7. Add to main page or create route

### Phase 2: Styling
8. Apply Polaroid frames
9. Add number badges
10. Implement hover effects
11. Add scroll animations
12. Mobile responsiveness

### Phase 3: Interactivity
13. Category filtering/tabs
14. Smooth transitions
15. External links (Amazon, Goodreads)
16. Optional: lightbox for book details

### Phase 4: Content
17. Add real book data
18. Find/optimize book cover images
19. Write personal descriptions
20. Organize into categories

## Mobile Considerations

**Layout:**
- 1 column on mobile
- 2 columns on tablet
- 3-4 columns on desktop

**Tabs:**
- Horizontal scroll on mobile
- Swipe gesture friendly
- Sticky on scroll (optional)

**Book Cards:**
- Larger touch targets
- Simplified on small screens
- Maintain readability

## Alternative Layouts

### Horizontal Scroll (More Casual)
```
Category: When you need inspiration

← [Book 1] [Book 2] [Book 3] [Book 4] →
  Swipe for more
```

### List View (More Detailed)
```
┌─────────┬───────────────────────────┐
│  Book   │ Title by Author           │
│  Cover  │ "Description goes here... │
│         │  personal take on why it's│
│         │  worth reading"           │
└─────────┴───────────────────────────┘
```

### Magazine Grid (Most Visual)
```
┌──────────────┬──────┬──────┐
│              │  B2  │  B3  │
│   Featured   ├──────┴──────┤
│   Current    │             │
│   Read       │     B4      │
└──────────────┴─────────────┘
```

## Next Steps

1. **Choose placement**: Main page section vs dedicated page?
2. **Choose layout**: Grid, horizontal scroll, or list?
3. **Gather content**: What books do you want to feature?
4. **Category structure**: What categories resonate with you?

Would you like me to implement this with a specific approach, or would you prefer to see mockups of different layout options first?
