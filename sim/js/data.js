// Demo library — public-domain titles so quote transcripts are real text.
// Durations are per-chapter seconds; book duration is derived.

const min = (m) => Math.round(m * 60);

export const BOOKS = [
  {
    id: 'artthief',
    title: 'The Art Thief',
    author: 'Michael Finkel',
    color: ['#2f5c8f', '#8fb8dd'],
    initials: 'AT',
    cover: 'covers/art-thief.jpg',
    chapters: [
      { t: 'A Quiet Museum', d: min(58) },
      { t: 'The First Piece', d: min(63) },
      { t: 'Anne-Catherine', d: min(49) },
      { t: 'The Attic Room', d: min(71) },
      { t: 'Method & Nerve', d: min(66) },
      { t: 'Unraveling', d: min(74) },
      { t: 'The Reckoning', d: min(61) },
      { t: 'Aftermath', d: min(52) },
    ],
    // Original filler lines (the book is in copyright — not real excerpts).
    quoteBank: [
      'He never sold a single piece — he stole only what he loved, and kept it all in one hidden room.',
      'For years the museums never noticed, because he took what no one thought to guard.',
      'Beauty, to him, was less something to own than something to stay near.',
      'The boldest thefts happened in daylight, in minutes, with nothing but a steady pulse.',
    ],
    recall: [
      'What set this collector apart from an ordinary thief?',
      'Where did he keep the works he took?',
      'How did the museums finally begin to notice?',
    ],
    summary: [
      'A portrait of a collector who stole art only to possess it and stay near it, never to sell.',
      'A hidden attic room becomes a private museum of Europe’s missing masterpieces.',
      'The quiet method unravels, and the true scale of what he took comes to light.',
    ],
  },
  {
    id: 'mobydick',
    title: 'Moby-Dick',
    author: 'Herman Melville',
    color: ['#2e6f9e', '#54a4d8'],
    initials: 'MD',
    chapters: [
      { t: 'Loomings', d: min(82) },
      { t: 'The Carpet-Bag', d: min(88) },
      { t: 'The Spouter-Inn', d: min(95) },
      { t: 'The Counterpane', d: min(78) },
      { t: 'Breakfast', d: min(71) },
      { t: 'The Street', d: min(84) },
      { t: 'The Chapel', d: min(90) },
      { t: 'The Pulpit', d: min(87) },
      { t: 'The Sermon', d: min(102) },
      { t: 'A Bosom Friend', d: min(93) },
      { t: 'Nightgown', d: min(76) },
      { t: 'Biographical', d: min(89) },
      { t: 'Wheelbarrow', d: min(95) },
      { t: 'Nantucket', d: min(100) },
    ],
    quoteBank: [
      'Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
      'It is not down on any map; true places never are.',
      'Better to sleep with a sober cannibal than a drunken Christian.',
      'I know not all that may be coming, but be it what it will, I will go to it laughing.',
      'Ignorance is the parent of fear.',
    ],
    recall: [
      'Why does Ishmael say he goes to sea whenever it is a damp, drizzly November in his soul?',
      'What first unsettles Ishmael about sharing a room at the Spouter-Inn?',
      'What does Father Mapple’s sermon about Jonah ask of the listener?',
    ],
    summary: [
      'Ishmael, restless and broke, decides to go to sea and travels to New Bedford seeking a whaling voyage.',
      'At the Spouter-Inn he is forced to share a bed with the harpooneer Queequeg, and an unlikely deep friendship forms.',
      'Father Mapple’s sermon on Jonah frames obedience, defiance, and the sea as moral forces before the voyage begins.',
    ],
  },
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    color: ['#7a5fb0', '#a98fd8'],
    initials: 'M',
    chapters: Array.from({ length: 12 }, (_, i) => ({
      t: `Book ${['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][i]}`,
      d: min(22 + ((i * 7) % 14)),
    })),
    quoteBank: [
      'You have power over your mind, not outside events. Realize this, and you will find strength.',
      'Waste no more time arguing about what a good man should be. Be one.',
      'The impediment to action advances action. What stands in the way becomes the way.',
      'Confine yourself to the present.',
      'Dwell on the beauty of life. Watch the stars, and see yourself running with them.',
    ],
    recall: [
      'What debt does Marcus say he owes to his teachers in Book I?',
      'How does Marcus advise treating an obstacle in your path?',
      'What does Marcus say is the proper response to people who wrong you?',
    ],
    summary: [
      'Book I is a ledger of gratitude: the virtues Marcus learned from family, teachers, and the gods.',
      'The middle books return to core Stoic drills — control what is yours, accept what is not, act for the common good.',
      'The final books meditate on mortality: death is natural, and the present moment is the only thing anyone can lose.',
    ],
  },
  {
    id: 'sherlock',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    color: ['#2f7a56', '#54ad82'],
    initials: 'SH',
    chapters: [
      'A Scandal in Bohemia', 'The Red-Headed League', 'A Case of Identity',
      'The Boscombe Valley Mystery', 'The Five Orange Pips', 'The Man with the Twisted Lip',
      'The Blue Carbuncle', 'The Speckled Band', 'The Engineer’s Thumb',
      'The Noble Bachelor', 'The Beryl Coronet', 'The Copper Beeches',
    ].map((t, i) => ({ t, d: min(46 + ((i * 5) % 16)) })),
    quoteBank: [
      'It is a capital mistake to theorize before one has data. Insensibly one begins to twist facts to suit theories, instead of theories to suit facts.',
      'You see, but you do not observe. The distinction is clear.',
      'The little things are infinitely the most important.',
      'There is nothing more deceptive than an obvious fact.',
    ],
    recall: [
      'How does Irene Adler get the better of Holmes in A Scandal in Bohemia?',
      'What was the real purpose of the Red-Headed League?',
      'What clue does the speckled band turn out to be?',
    ],
    summary: [
      'Twelve cases told by Watson, each a puzzle of observation over assumption.',
      'Irene Adler outwits Holmes — the one opponent he never stops calling “the woman.”',
      'The Speckled Band remains the darkest entry: a locked room, a whistle in the night, and a killer that leaves no trace.',
    ],
  },
  {
    id: 'walden',
    title: 'Walden',
    author: 'Henry David Thoreau',
    color: ['#5f8232', '#8fb356'],
    initials: 'W',
    chapters: [
      ['Economy', 150], ['Where I Lived, and What I Lived For', 55], ['Reading', 40],
      ['Sounds', 55], ['Solitude', 35], ['Visitors', 45], ['The Bean-Field', 40],
      ['The Village', 25], ['The Ponds', 70], ['Higher Laws', 35], ['Brute Neighbors', 40],
      ['House-Warming', 45], ['The Pond in Winter', 40], ['Spring', 50], ['Conclusion', 40],
    ].map(([t, d]) => ({ t, d: min(d) })),
    quoteBank: [
      'I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived.',
      'The mass of men lead lives of quiet desperation.',
      'Simplify, simplify.',
      'However mean your life is, meet it and live it; do not shun it and call it hard names.',
    ],
    recall: [
      'Why did Thoreau go to live at Walden Pond, in his own words?',
      'What does Thoreau count as the true cost of a thing?',
      'What conclusion does Thoreau draw about advancing confidently toward one’s dreams?',
    ],
    summary: [
      'Thoreau builds a cabin at Walden Pond to strip life to its essentials and audit its true costs.',
      'Economy argues that the cost of a thing is the amount of life exchanged for it.',
      'The book closes with the famous charge: advance confidently in the direction of your dreams.',
    ],
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    color: ['#4a6a86', '#7f9fba'],
    initials: 'F',
    chapters: [
      ['Letters I–IV', 42], ['The Student of Ingolstadt', 48], ['The Spark of Being', 44],
      ['Flight and Fever', 40], ['The Trial of Justine', 46], ['The Creature Speaks', 52],
      ['The Cottagers', 50], ['The Demand', 44], ['The Second Creation', 46],
      ['The Wedding Night', 42], ['Pursuit Across the Ice', 40], ['Walton, in Continuation', 38],
    ].map(([t, d]) => ({ t, d: min(d) })),
    quoteBank: [
      'Beware; for I am fearless, and therefore powerful.',
      'Nothing is so painful to the human mind as a great and sudden change.',
      'I ought to be thy Adam, but I am rather the fallen angel.',
      'If I cannot inspire love, I will cause fear.',
    ],
    recall: [
      'Who is Robert Walton writing to, and what is he searching for?',
      'What does the creature learn while hiding beside the De Lacey cottage?',
      'What bargain does the creature offer Victor on the glacier?',
    ],
    summary: [
      'Told through Walton’s letters from the Arctic, framing Victor Frankenstein’s confession.',
      'Victor animates a creature and abandons it; the creature educates itself watching the De Lacey family.',
      'Rejected everywhere, the creature demands a companion — and the refusal turns the story into a chase to the ice.',
    ],
  },
];

// Pre-seeded quotes so the device and web UI have life on first boot.
export const SEED_QUOTES = [
  {
    id: 'q-seed-0', bookId: 'artthief', chapter: 2,
    t0: 4180, t1: 4210, status: 'done',
    text: 'He never sold a single piece — he stole only what he loved, and kept it all in one hidden room.',
    created: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'q-seed-1', bookId: 'mobydick', chapter: 1,
    t0: 6260, t1: 6290, status: 'done',
    text: 'It is not down on any map; true places never are.',
    created: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: 'q-seed-2', bookId: 'meditations', chapter: 4,
    t0: 5030, t1: 5060, status: 'done',
    text: 'The impediment to action advances action. What stands in the way becomes the way.',
    created: Date.now() - 1000 * 60 * 60 * 49,
  },
  {
    id: 'q-seed-3', bookId: 'mobydick', chapter: 2,
    t0: 9840, t1: 9902, status: 'done',
    text: 'Better to sleep with a sober cannibal than a drunken Christian.',
    created: Date.now() - 1000 * 60 * 60 * 5,
  },
];

// Voice notes are the user's own thoughts — pre-seeded example + the pool the
// simulated local Whisper "transcribes" from.
export const SEED_NOTES = [
  {
    id: 'n-seed-1', bookId: 'mobydick', chapter: 8,
    t0: 42300, recDur: 14, status: 'done',
    text: 'Note to self: the sermon frames obedience versus defiance — I bet this maps directly onto Ahab later. Check back when I reach the quarter-deck scene.',
    created: Date.now() - 1000 * 60 * 60 * 20,
  },
];

export const NOTE_POOL = [
  'Note to self: this connects to what I read last month about attention — the author is making the same argument from the other side.',
  'I think the narrator is being unreliable here. Listen to this chapter again once the motive is revealed.',
  'Use this framing in Thursday’s review — constraints as the actual creative material, not the obstacle.',
  'The pacing completely changed in this chapter — the sentences got shorter. Deliberate?',
  'This would make a great recall prompt: why did the plan fail the first time?',
  'Strong counterpoint to the argument in chapter two. Compare the two passages side by side.',
];

export function bookDur(book) {
  return book.chapters.reduce((a, c) => a + c.d, 0);
}
