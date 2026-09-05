export interface SmallProject {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  rotate?: boolean; // For images that need rotation
}

export const smallProjects: SmallProject[] = [
  {
    id: 'applecards',
    title: 'Apple Card Game',
    description: 'Designed the deck and a heavily-iterated 3D-printed sliding case',
    image: '/assets/apple-card-game.webp',
  },
  {
    id: 'smiski',
    title: 'Smiski House',
    description: '3D-printed, glow-lit display house for Smiski figures',
    image: '/assets/smiski-display.webp',
  },
  {
    id: 'zoovadis',
    title: 'Zoo Vadis Insert',
    description: '3D-printed board game organizer',
    image: '/assets/zoo-vadis.jpg',
  },
  {
    id: 'arcade',
    title: 'Custom Arcade Cabinet',
    description: 'CNC-cut cabinet running RetroPie on a Raspberry Pi — 200+ games',
    image: '/assets/arcade-cabinet.jpg',
  },
  {
    id: 'violin',
    title: 'Violin',
    description: 'Embroidery project',
    image: '/assets/violin-BqRdxQ0W.webp',
  },
  {
    id: 'rose',
    title: 'Copper Rose',
    description: 'Waterjet sheets hand worked',
    image: '/assets/Rose-BvPnEJYy.webp',
  },
  {
    id: 'embroidery',
    title: 'Embroidered Phone',
    description: 'Textile craft project',
    image: '/assets/embroiderphone.webp',
  },
  {
    id: 'owl',
    title: 'Owl Book',
    description: 'Bookbinding project',
    image: '/assets/owlbook.webp',
    rotate: true, // Rotate 90 degrees clockwise
  },
  {
    id: 'caiman',
    title: 'Caiman Toy',
    description: '3D modeling exploration',
    image: '/assets/Caiman-IujZ76k3.webp',
  },
  {
    id: 'chainsaw',
    title: 'Chainsawman',
    description: 'Technical embroidery',
    image: '/assets/chainsaw-L9O015hr.webp',
  },
  {
    id: 'bunny',
    title: 'Bunny',
    description: 'Pottery painting',
    image: '/assets/bunny-B0hxmrp7.webp',
  },
  {
    id: 'chairs',
    title: 'Chairs',
    description: '3D furniture design',
    image: '/assets/chairs-C7I6Kj6j.webp',
  },
  {
    id: 'lamp',
    title: 'Lamp',
    description: '3D printed lighting design',
    image: '/assets/lamp-q6TuXykl.webp',
  },
  {
    id: 'archvis',
    title: 'Architectural Visualization',
    description: '3D rendering',
    image: '/assets/archVis-Dn9hslr4.webp',
  }
];