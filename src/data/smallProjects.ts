export interface SmallProject {
    title: string;
    description: string;
    link: string;
    technologies: string[];
    image: string;
  }
  
  export const smallProjects: SmallProject[] = [
    {
      title: 'Task Management CLI',
      description: 'Command-line tool for managing tasks and projects',
      link: 'https://github.com/example/task-cli',
      technologies: ['Node.js', 'Commander.js', 'SQLite'],
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Weather Dashboard',
      description: 'Real-time weather monitoring dashboard',
      link: 'https://github.com/example/weather-dash',
      technologies: ['React', 'D3.js', 'OpenWeather API'],
      image: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'PDF Parser',
      description: 'Extract and analyze text from PDF documents',
      link: 'https://github.com/example/pdf-parser',
      technologies: ['Python', 'PyPDF2', 'NLTK'],
      image: 'https://images.unsplash.com/photo-1568025130544-78a9ee89c982?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Music Visualizer',
      description: 'Audio visualization using WebGL',
      link: 'https://github.com/example/music-viz',
      technologies: ['WebGL', 'Three.js', 'Web Audio API'],
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Recipe Manager',
      description: 'Personal recipe collection and meal planner',
      link: 'https://github.com/example/recipe-app',
      technologies: ['React Native', 'Firebase', 'Redux'],
      image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80'
    }
  ];