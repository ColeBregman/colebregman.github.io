# Book Recommendations Section - Design Plan

## Concept Overview

Add a curated book recommendations section to your portfolio that showcases your interests beyond technical work, adding personality and conversation starters.

## Structure Inspiration

Based on the Substack example: "What to Read When..." format
- Situational categories (moods, genres, purposes)
- Book covers + titles + authors
- Short, personal descriptions
- Clean, scannable format

## Design Options for Your Portfolio

### Option A: Dedicated Page
**Route:** `/#reading` or `/books`

```
┌─────────────────────────────────┐
│ Navigation (with "Reading" tab) │
├─────────────────────────────────┤
│                                 │
│   WHAT TO READ WHEN...          │
│   Your reading recommendations  │
│                                 │
│   ┌──────────────────┐          │
│   │ ... You need     │          │
│   │     inspiration  │          │
│   ├──────────────────┤          │
│   │ [Book] [Book]    │          │
│   └──────────────────┘          │
│                                 │
└─────────────────────────────────┘
```

### Option B: Section on Main Page
Add between Experience and Contact sections

```
Home Page:
1. Hero
2. About
3. Projects
4. Experience
5. Reading ← NEW
6. Breadcrumbs (More)
7. Contact
```

### Option C: Expandable Module
Small teaser in main flow, expands to full view

## Recommended Layout: Dedicated Section

### Page Structure

```
┌─────────────────────────────────────────┐
│         WHAT I'M READING                │
│         Personal book recommendations   │
│         ~ 2 min browse                  │
├─────────────────────────────────────────┤
│                                         │
│  [Category Tab Navigation]              │
│  Inspiration | Classics | Technical    │
│  Fiction | Biography | Current Reads   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  When you need inspiration              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━       │
│                                         │
│  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ Book 1 │  │ Book 2 │  │ Book 3 │   │
│  │ Cover  │  │ Cover  │  │ Cover  │   │
│  ├────────┤  ├────────┤  ├────────┤   │
│  │ Title  │  │ Title  │  │ Title  │   │
│  │ Author │  │ Author │  │ Author │   │
│  │        │  │        │  │        │   │
│  │ "Why"  │  │ "Why"  │  │ "Why"  │   │
│  └────────┘  └────────┘  └────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Data Structure

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string;
  description: string; // Personal take on why it's recommended
  amazonLink?: string;
  goodreadsLink?: string;
  rating?: number; // Your rating
}

interface BookCategory {
  id: string;
  title: string; // "When you need inspiration"
  description?: string;
  books: Book[];
}

const bookCategories: BookCategory[] = [
  {
    id: 'inspiration',
    title: 'When you need inspiration',
    books: [...]
  },
  {
    id: 'technical',
    title: 'When you want to level up',
    description: 'Technical books that changed how I work',
    books: [...]
  }
]
```

## Visual Design (Monochrome Theme)

### Book Cards
```
┌─────────────────┐
│                 │
│   Book Cover    │ ← Polaroid-style frame
│   (200x300px)   │   (matches project gallery)
│                 │
├─────────────────┤
│ Book Title      │ ← Bold, 18px
│ Author Name     │ ← Gray, 14px
│                 │
│ "Your personal  │ ← Italic, 16px
│  take on why    │   Max 2-3 lines
│  it's great"    │
├─────────────────┤
│ [Links]         │ ← Small icons
└─────────────────┘
```

### Category Sections
- **Header:** Large typography (H2, 32-36px)
- **Description:** Optional subtitle
- **Grid:** 3-4 books per row (desktop), 1-2 (mobile)
- **Spacing:** Consistent with project page sections
- **Separator:** Black line between categories

## Layout Variations

### Grid Layout (Recommended)
```
┌──────┬──────┬──────┬──────┐
│ B1   │ B2   │ B3   │ B4   │
│      │      │      │      │
└──────┴──────┴──────┴──────┘
```

### Featured + Grid
```
┌──────────────┬──────┬──────┐
│              │ B2   │ B3   │
│   Featured   ├──────┼──────┤
│   Book 1     │ B4   │ B5   │
└──────────────┴──────┴──────┘
```

### Horizontal Scroll (Mobile-friendly)
```
← [B1] [B2] [B3] [B4] [B5] →
  Swipe to explore
```

## Component Architecture

### Files to Create

1. **`src/pages/Reading.tsx`** - Main reading page (if dedicated)
2. **`src/components/sections/Reading.tsx`** - Reading section component
3. **`src/components/reading/BookCard.tsx`** - Individual book card
4. **`src/components/reading/BookCategory.tsx`** - Category section
5. **`src/types/book.ts`** - Book data types and content
6. **`src/data/books.ts`** - Book data (alternative to types file)

### Integration Points

**Navigation:**
```typescript
// Add to Navigation.tsx
const sections: Section[] = [
  { id: 'about', label: 'ABOUT' },
  { id: 'projects', label: 'WORK' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'reading', label: 'READING' }, // ← NEW
  { id: 'breadcrumbs', label: 'MORE' },
  { id: 'contact', label: 'CONTACT' },
];
```

**App Routing (if dedicated page):**
```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/project/:id" element={<ProjectDetail />} />
  <Route path="/reading" element={<Reading />} /> // ← NEW
</Routes>
```

## Category Ideas for Your Books

### Technical/Professional
- "When you want to level up" - Design/engineering books
- "When you're learning something new" - Educational

### Inspiration/Motivation  
- "When you need inspiration" - Autobiographies, startup stories
- "When you're stuck" - Creative thinking books

### Fiction/Enjoyment
- "When you want to escape" - Fiction favorites
- "When you want a quick read" - Short books/essays

### Specific Interests
- "When you're thinking about design" - Design philosophy
- "When you're curious about the future" - Sci-fi, tech futurism

### Current
- "What I'm reading now" - Dynamic section
- "What I want to read next" - Reading list

## Interactive Features

### Basic (Phase 1)
- Grid of book cards
- Hover effects on covers
- Click to view details
- Links to Amazon/Goodreads

### Enhanced (Phase 2)
- Filter by category (tabs)
- Search functionality
- Sort by rating/date added
- "Random recommendation" button

### Advanced (Phase 3)
- Reading progress tracker
- Goodreads API integration
- Social sharing
- Comments/discussion

## Monochrome Styling

```css
/* Book Card */
.book-card {
  background: white;
  padding: 16px;
  border: 2px solid #E5E5E5;
  transition: all 0.3s ease;
}

.book-card:hover {
  border-color: #000;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

/* Book Cover */
.book-cover {
  width: 100%;
  height: auto;
  aspect-ratio: 2/3;
  object-fit: cover;
  filter: grayscale(20%); /* Slight desaturation
