export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
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
        coverUrl: '/public/assets/books/SHOE_DOG.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/27220736-shoe-dog'
      },
      {
        id: 'book2',
        title: 'Skunk Works: A Personal Memoir of My Years at Lockheed',
        author: 'Ben R. Rich, Leo Janos',
        coverUrl: '/public/assets/books/SKUNK_WORKS.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/101438.Skunk_Works'
      },
      {
        id: 'book3',
        title: 'Apple in China: The Capture of the World\'s Greatest Company',
        author: 'Patrick McGee',
        coverUrl: '/public/assets/books/APPLE_IN_CHINA.webp',
        description: 'To be added...',
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
        coverUrl: '/public/assets/books/MANS_SEARCH_FOR_MEANING.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/1044863.Man_s_Search_for_Meaning'
      },
      {
        id: 'book5',
        title: '\"Surely You\'re Joking, Mr. Feynman!\":\nAdventures of a Curious Character',
        author: 'Richard P. Feynman',
        coverUrl: '/public/assets/books/MR_FEYNMAN.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/35167685-surely-you-re-joking-mr-feynman'
      },
      {
        id: 'book6',
        title: 'Range: Why Generalists Triumph in a Specialized World',
        author: 'David Epstein',
        coverUrl: '/public/assets/books/RANGE.webp',
        description: 'To be added...',
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
        coverUrl: '/public/assets/books/THE_WIND_IN_THE_WILLOWS.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/5659.The_Wind_in_the_Willows'
      },
      {
        id: 'book8',
        title: 'The Little Prince',
        author: 'Antoine de Saint-Exupéry',
        coverUrl: '/public/assets/books/THE_LITTLE_PRINCE.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/157993.The_Little_Prince'
      },
      {
        id: 'book9',
        title: 'The Last Unicorn',
        author: 'Peter S. Beagle',
        coverUrl: '/public/assets/books/THE_LAST_UNICORN.webp',
        description: 'To be added...',
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
        coverUrl: '/public/assets/books/THE_THREE-BODY_PROBLEM.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/20518872-the-three-body-problem'
      },
      {
        id: 'book11',
        title: 'Exhalation',
        author: 'Ted Chiang',
        coverUrl: '/public/assets/books/EXHALATION.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/41160292-exhalation'
      },
      {
        id: 'book12',
        title: 'Flatland:\nA Romance of Many Dimensions',
        author: 'Edwin A. Abbott',
        coverUrl: '/public/assets/books/FLATLAND.webp',
        description: 'To be added...',
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
        coverUrl: '/public/assets/books/THE_WAY_OF_KINGS.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/7235533-the-way-of-kings'
      },
      {
        id: 'book14',
        title: 'The Tainted Cup',
        author: 'Robert Jackson Bennett',
        coverUrl: '/public/assets/books/THE_TAINTED_CUP.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/150247395-the-tainted-cup'
      },
      {
        id: 'book15',
        title: 'The Count of Monte Cristo',
        author: 'Alexandre Dumas',
        coverUrl: '/public/assets/books/THE_COUNT_OF_MONTE_CRISTO.webp',
        description: 'To be added...',
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
        coverUrl: '/public/assets/books/DOROHEDORO.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/6759156-dorohedoro-vol-1'
      },
      {
        id: 'book17',
        title: 'Vinland Saga',
        author: 'Makoto Yukimura',
        coverUrl: '/public/assets/books/VINLAND_SAGA.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/19087989-vinland-saga-omnibus-vol-1'
      },
      {
        id: 'book18',
        title: 'JoJo\'s Bizarre Adventure',
        author: 'Hirohiko Araki',
        coverUrl: '/public/assets/books/JOJO.webp',
        description: 'To be added...',
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
        coverUrl: '/public/assets/books/THE_NIGHT_CIRCUS.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/9361589-the-night-circus'
      },
      {
        id: 'book20',
        title: 'Tomorrow, and Tomorrow, and Tomorrow',
        author: 'Gabrielle Zevin',
        coverUrl: '/public/assets/books/TOMORROW.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/58784475-tomorrow-and-tomorrow-and-tomorrow'
      },
      {
        id: 'book21',
        title: 'All the Light We Cannot See',
        author: 'Anthony Doerr',
        coverUrl: '/public/assets/books/ALL_THE_LIGHT_WE_CANNOT_SEE.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/18143977-all-the-light-we-cannot-see'
      }
      //HONORABLE MENTIONS: THE ART THIEF, BETWEEN TWO FIRES, WHAT AN OWL KNOWS
    ]
  },
  {
    id: 'obsession',
    label: 'Obssession',
    title: 'You need a new obsession',
    books: [
      {
        id: 'book22',
        title: 'The Maniac',
        author: 'Benjamín Labatut',
        coverUrl: '/public/assets/books/THE_MANIAC.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/75665931-the-maniac'
      },
      {
        id: 'book23',
        title: 'The Art Thief: A True Story of Love, Crime, and a Dangerous Obsession',
        author: 'Michael Finkel',
        coverUrl: '/public/assets/books/THE_ART_THIEF.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/62873378-the-art-thief'
      },
      {
        id: 'book24',
        title: 'What an Owl Knows: The New Science of the World\'s Most Enigmatic Birds',
        author: 'Jennifer Ackerman',
        coverUrl: '/public/assets/books/WHAT_AN_OWL_KNOWS.webp',
        description: 'To be added...',
        link: 'https://www.goodreads.com/book/show/63024269-what-an-owl-knows'
      }
    ]
  }
];
