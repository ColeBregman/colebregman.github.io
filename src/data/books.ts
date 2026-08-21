export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  // Optional real spine artwork for the 3D shelf. Drop an image in
  // public/assets/Books/spines/ and set e.g. spineUrl: '/assets/Books/spines/SHOE_DOG.webp'.
  // Its aspect ratio sets the 3D book's thickness (use an uncropped spine, ideally
  // in vertical shelf orientation — horizontal scans are auto-rotated). Without it,
  // the shelf generates a dominant-color spine sized by page count.
  spineUrl?: string;
  pages: number; // approximate page count — drives spine thickness on the 3D shelf
  description: string; // Your personal take
  link?: string; // Amazon/Goodreads link
}

export interface BookCategory {
  id: string;
  label: string; // Tab label
  title: string; // Display title
  description?: string;
  books: Book[]; // Exactly 3 books
}

// A book with its category context, for the flat continuous shelf
export interface ShelfBook extends Book {
  categoryId: string;
  categoryLabel: string;
  categoryTitle: string;
}

export const bookCategories: BookCategory[] = [
  {
    id: 'builders',
    label: 'builders',
    title: "You want to get excited about making things",
    books: [
      {
        id: 'book1',
        title: 'Shoe Dog: A Memoir by the Creator of Nike',
        author: 'Phil Knight',
        coverUrl: '/assets/Books/SHOE_DOG.webp',
        spineUrl: '/assets/Books/spines/SHOE_DOG.webp',
        pages: 400,
        description: 'Phil Knight built Nike by selling shoes from his car trunk. Messy, honest, and relatable. Knight was a "loser" at 24, just figuring things out.',
        link: 'https://www.goodreads.com/book/show/27220736-shoe-dog'
      },
      {
        id: 'book2',
        title: 'Skunk Works: A Personal Memoir of My Years at Lockheed',
        author: 'Ben R. Rich, Leo Janos',
        coverUrl: '/assets/Books/SKUNK_WORKS.webp',
        spineUrl: '/assets/Books/spines/SKUNK_WORKS.webp',
        pages: 368,
        description: 'Small teams built the SR-71 and F-117A through trust and rapid prototyping. Filled with R&D anecdotes from pilots, engineers, and machinists. Made me so hyped for engineering.',
        link: 'https://www.goodreads.com/book/show/101438.Skunk_Works'
      },
      {
        id: 'book3',
        title: 'Apple in China: The Capture of the World\'s Greatest Company',
        author: 'Patrick McGee',
        coverUrl: '/assets/Books/APPLE_IN_CHINA.webp',
        spineUrl: '/assets/Books/spines/APPLE_IN_CHINA.webp',
        pages: 448,
        description: 'Reading this while visiting suppliers in Shenzhen as an Apple intern made it surreal. Every decision is political—where to build, whom to partner with, what data to store.',
        link: 'https://www.goodreads.com/book/show/220161058-apple-in-china'
      }
    ]
  },
  {
    id: 'perspective',
    label: 'Perspective',
    title: 'You want to look at the world in a different way',
    books: [
      {
        id: 'book4',
        title: 'Man\'s Search For Meaning',
        author: 'Viktor E. Frankl',
        coverUrl: '/assets/Books/MANS_SEARCH_FOR_MEANING.webp',
        spineUrl: '/assets/Books/spines/MANS_SEARCH_FOR_MEANING.webp',
        pages: 165,
        description: 'A psychiatrist\'s account of surviving Nazi concentration camps and the philosophy he built from it. Argues that finding meaning—even in suffering—is our deepest human drive.',
        link: 'https://www.goodreads.com/book/show/1044863.Man_s_Search_for_Meaning'
      },
      {
        id: 'book5',
        title: '"Surely You\'re Joking, Mr. Feynman!":\nAdventures of a Curious Character',
        author: 'Richard P. Feynman',
        coverUrl: '/assets/Books/MR_FEYNMAN.webp',
        pages: 350,
        description: 'Nobel Prize-winning physicist tells wild stories: cracking safes, picking up women in bars, playing bongos. A celebration of curiosity and refusing to take life too seriously.',
        link: 'https://www.goodreads.com/book/show/35167685-surely-you-re-joking-mr-feynman'
      },
      {
        id: 'book6',
        title: 'Range: Why Generalists Triumph in a Specialized World',
        author: 'David Epstein',
        coverUrl: '/assets/Books/RANGE.webp',
        pages: 352,
        description: 'Made me rethink career success. Epstein argues diverse experiences drive innovation—generalists often triumph. Validated the path of following curiosity wherever it leads.',
        link: 'https://www.goodreads.com/book/show/41795733-range'
      }
    ]
  },
  {
    id: 'nostalgic',
    label: 'Nostalgia',
    title: 'You\'re feeling nostalgic',
    books: [
      {
        id: 'book7',
        title: 'The Wind in the Willows',
        author: 'Kenneth Grahame',
        coverUrl: '/assets/Books/THE_WIND_IN_THE_WILLOWS.webp',
        pages: 256,
        description: 'The coziest read. Mr. Toad\'s foolish enthusiasm is hilarious, but the true heart is the deep kindness and friendship between characters. Left me feeling content.',
        link: 'https://www.goodreads.com/book/show/5659.The_Wind_in_the_Willows'
      },
      {
        id: 'book8',
        title: 'The Little Prince',
        author: 'Antoine de Saint-Exupéry',
        coverUrl: '/assets/Books/THE_LITTLE_PRINCE.webp',
        pages: 96,
        description: 'Magical. A little prince travels across planets learning about what\'s truly valuable in life. The illustrations are equally charming. Loved every moment.',
        link: 'https://www.goodreads.com/book/show/157993.The_Little_Prince'
      },
      {
        id: 'book9',
        title: 'The Last Unicorn',
        author: 'Peter S. Beagle',
        coverUrl: '/assets/Books/THE_LAST_UNICORN.webp',
        pages: 294,
        description: 'Wistful fantasy about the last unicorn searching for others of her kind. Bittersweet and timeless, with beautiful prose that lingers. Deeply comforting.',
        link: 'https://www.goodreads.com/book/show/119086.The_Last_Unicorn'
      }
    ]
  },
  {
    id: 'mindbending',
    label: 'Mind-Bending',
    title: 'You want your brain to hurt',
    books: [
      {
        id: 'book10',
        title: 'The Three-Body Problem',
        author: 'Liu Cixin',
        coverUrl: '/assets/Books/THE_THREE-BODY_PROBLEM.webp',
        pages: 416,
        description: 'Hard sci-fi that takes physics seriously. Big ideas about humanity, first contact, and survival told across centuries. The kind of book that makes you think about space differently.',
        link: 'https://www.goodreads.com/book/show/20518872-the-three-body-problem'
      },
      {
        id: 'book11',
        title: 'Exhalation',
        author: 'Ted Chiang',
        coverUrl: '/assets/Books/EXHALATION.webp',
        pages: 368,
        description: 'Every story turns complex ideas into digestible narratives. Even familiar concepts like the multiverse and AI get unique twists. Mind-bending in the best way.',
        link: 'https://www.goodreads.com/book/show/41160292-exhalation'
      },
      {
        id: 'book12',
        title: 'Flatland:\nA Romance of Many Dimensions',
        author: 'Edwin A. Abbott',
        coverUrl: '/assets/Books/FLATLAND.webp',
        pages: 96,
        description: 'Explores dimensions from multiple perspectives. Felt like a fever dream. A mathematical thought experiment disguised as Victorian satire that somehow works beautifully.',
        link: 'https://www.goodreads.com/book/show/433567.Flatland'
      }
    ]
  },
  {
    id: 'loseyourself',
    label: 'Get Lost',
    title: 'You want to get lost in a world',
    books: [
      {
        id: 'book13',
        title: 'The Way of Kings',
        author: 'Brandon Sanderson',
        coverUrl: '/assets/Books/THE_WAY_OF_KINGS.webp',
        pages: 1007,
        description: 'Sanderson\'s worldbuilding is unmatched. So detailed and immersive you can spend hours thinking about how the magic systems work. Epic fantasy at its finest.',
        link: 'https://www.goodreads.com/book/show/7235533-the-way-of-kings'
      },
      {
        id: 'book14',
        title: 'The Tainted Cup',
        author: 'Robert Jackson Bennett',
        coverUrl: '/assets/Books/THE_TAINTED_CUP.webp',
        pages: 432,
        description: 'Brilliant fantasy murder mystery. Rich, strange worldbuilding and a compelling detective partnership. Couldn\'t put it down.',
        link: 'https://www.goodreads.com/book/show/150247395-the-tainted-cup'
      },
      {
        id: 'book15',
        title: 'The Count of Monte Cristo',
        author: 'Alexandre Dumas',
        coverUrl: '/assets/Books/THE_COUNT_OF_MONTE_CRISTO.webp',
        pages: 1276,
        description: 'The ultimate revenge story. I\'d update my family after every session like it was a TV show. Constantly at the edge of my seat waiting for twists. Themes of hope and forgiveness.',
        link: 'https://www.goodreads.com/book/show/7126.The_Count_of_Monte_Cristo'
      }
    ]
  },
  {
    id: 'manga',
    label: 'Manga',
    title: 'You need some pictures',
    books: [
      {
        id: 'book16',
        title: 'Dorohedoro',
        author: 'Q. Hayashida',
        coverUrl: '/assets/Books/DOROHEDORO.webp',
        pages: 176,
        description: 'Dark, weird, and unique. Grimy aesthetic and chaotic energy. Violent, strange, and deeply compelling. The world Hayashida creates is unforgettable.',
        link: 'https://www.goodreads.com/book/show/6759156-dorohedoro-vol-1'
      },
      {
        id: 'book17',
        title: 'Vinland Saga',
        author: 'Makoto Yukimura',
        coverUrl: '/assets/Books/VINLAND_SAGA.webp',
        pages: 468,
        description: 'Historical epic about Vikings that becomes a meditation on violence and redemption. Exceptional character development grounded in real history. Manga at its most mature.',
        link: 'https://www.goodreads.com/book/show/19087989-vinland-saga-omnibus-vol-1'
      },
      {
        id: 'book18',
        title: 'JoJo\'s Bizarre Adventure',
        author: 'Hirohiko Araki',
        coverUrl: '/assets/Books/JOJO.webp',
        pages: 256,
        description: 'Pure creativity and style. Bizarre, over-the-top, and fabulous. Each part reinvents itself while maintaining Araki\'s wild imagination. Everything that makes manga exciting.',
        link: 'https://www.goodreads.com/book/show/22545983-jojo-s-bizarre-adventure'
      }
    ]
  },
  {
    id: 'connection',
    label: 'Connection',
    title: 'You need connection',
    books: [
      {
        id: 'book19',
        title: 'The Night Circus',
        author: 'Erin Morgenstern',
        coverUrl: '/assets/Books/THE_NIGHT_CIRCUS.webp',
        pages: 512,
        description: 'Magical and romantic with a cozy, dreamy atmosphere. Weaves together love, competition, and enchantment. Timeless and utterly unique. A book to get lost in.',
        link: 'https://www.goodreads.com/book/show/9361589-the-night-circus'
      },
      {
        id: 'book20',
        title: 'Tomorrow, and Tomorrow, and Tomorrow',
        author: 'Gabrielle Zevin',
        coverUrl: '/assets/Books/TOMORROW.webp',
        pages: 401,
        description: 'Reminded me of La La Land—deep relationships without needing romance. Made me feel at peace being my own person. Life is about connections we make and ways we grow together.',
        link: 'https://www.goodreads.com/book/show/58784475-tomorrow-and-tomorrow-and-tomorrow'
      },
      {
        id: 'book21',
        title: 'All the Light We Cannot See',
        author: 'Anthony Doerr',
        coverUrl: '/assets/Books/ALL_THE_LIGHT_WE_CANNOT_SEE.webp',
        pages: 531,
        description: 'Beautiful, heartbreaking WWII story. A blind French girl and a German boy woven together with incredible tenderness. The human connection at the heart stays with you.',
        link: 'https://www.goodreads.com/book/show/18143977-all-the-light-we-cannot-see'
      }
      //HONORABLE MENTIONS: THE ART THIEF, BETWEEN TWO FIRES, WHAT AN OWL KNOWS
    ]
  },
  {
    id: 'obsession',
    label: 'Obsession',
    title: 'You need a new obsession',
    books: [
      {
        id: 'book22',
        title: 'The Maniac',
        author: 'Benjamín Labatut',
        coverUrl: '/assets/Books/THE_MANIAC.webp',
        pages: 368,
        description: 'Von Neumann was a Hungarian-Jewish genius who helped invent the atomic bomb, computers, and game theory. This poetic semi-fiction explores how brilliance and madness intertwine.',
        link: 'https://www.goodreads.com/book/show/75665931-the-maniac'
      },
      {
        id: 'book23',
        title: 'The Art Thief: A True Story of Love, Crime, and a Dangerous Obsession',
        author: 'Michael Finkel',
        coverUrl: '/assets/Books/THE_ART_THIEF.webp',
        pages: 240,
        description: 'True story of love, crime, and dangerous obsession. One of history\'s most prolific art thieves told with the pacing of a thriller. Impossible to put down.',
        link: 'https://www.goodreads.com/book/show/62873378-the-art-thief'
      },
      {
        id: 'book24',
        title: 'What an Owl Knows: The New Science of the World\'s Most Enigmatic Birds',
        author: 'Jennifer Ackerman',
        coverUrl: '/assets/Books/WHAT_AN_OWL_KNOWS.webp',
        pages: 352,
        description: 'A naturalist explores owl behavior, biology, and conservation through vivid storytelling. Equal parts science and wonder—you\'ll never look at these mysterious birds the same way.',
        link: 'https://www.goodreads.com/book/show/63024269-what-an-owl-knows'
      }
    ]
  }
];

// The full catalog flattened in category order — one continuous shelf
export const shelfBooks: ShelfBook[] = bookCategories.flatMap((category) =>
  category.books.map((book) => ({
    ...book,
    categoryId: category.id,
    categoryLabel: category.label,
    categoryTitle: category.title,
  }))
);

// First shelf index of each category, for tab navigation
export const categoryStartIndex: Record<string, number> = Object.fromEntries(
  bookCategories.map((category) => [
    category.id,
    shelfBooks.findIndex((book) => book.categoryId === category.id),
  ])
);
