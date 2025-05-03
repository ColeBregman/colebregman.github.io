interface ProjectImage {
  url: string;
  caption: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  images: ProjectImage[];
  link: string;
  stats?: {
    label: string;
    value: string;
  }[];
  why: string;
  what: string;
  how: string;
  story: {
    challenge: string;
    approach: string;
    outcome: string;
  };
  technologies?: string[];
  keyFeatures?: string[];
}

export const projects: Project[] = [
  {
    id: 'Optics',
    title: 'Live Optical Alignment and Automated Lense Testing',
    description: 'Speeding up the microscope development for optical engineers',
    image: '/assets/OpticsJig-Cl6gbkTQ.png',
    images: [
      {
        url: '/assets/GUI-D1tlHbqh.png',
        caption: 'Real-time Python GUI'
      },
      {
        url: '/assets/PriorGUI-CfGspTeB.png',
        caption: 'Previous iteration showing live usage with laser'
      },
      {
        url: '/assets/Data1-Cd0dS5nb.png',
        caption: 'Generated data analysis to find focal point'
      },
      {
        url: '/assets/Data2-BDjiV9sT.png',
        caption: 'Lense and Optic fiber reliability analysis'
      }
    ],
    link: '/project/Optics',
    stats: [
      { label: 'Increased Laser Precision', value: '44.4%' },
      { label: 'Reduced Optical Alignment Time', value: '90%' },
      { label: 'GUI Analysis Capability', value: '10+ test cases' }
    ],
    why: "Optical engineers on a strict timeline to develop a novel microscrope face the tedious and time-intensive process of manually testing each optic fiber, lens, and laser wavelength combination. This involves making adjustments, collecting data from the laser profiler, calculating key metrics, refining the alignment, and repeating these steps until optimal alignment is achieved. This process demands both a high level of expertise and significant time investment, diverting skilled engineers from other critical tasks.",
    what: "Developed a GUI integrated with a custom-built test rig, featuring a 4-wavelength laser, micrometer stage, and laser profiler. The GUI provides real-time alignment and testing insights, streamlining the alignment process and significantly improving speed and precision. Automated data analysis further enhances laser accuracy. Delivered comprehensive documentation to ensure the company could maintain and adapt the system independently after the internship concluded.",
    how: "Collaborated closely with optical engineers, shadowing alignment sessions to pinpoint inefficiencies and opportunities for automation. Conducted interviews to understand key metrics and challenges faced during alignment and testing processes. Designed and constructed a custom test rig equipped with a 4-wavelength laser, micrometer stage, and laser profiler to facilitate precise testing. Leveraged Python for automation, utilizing libraries such as Python.NET for motor control and wxPython for GUI development. Solicited continuous feedback from engineers, iterating on the system design to meet their needs. Automated data capture from the laser profiler, implemented beam property analysis, and used curve-fitting algorithms to determine the laser's focal point with optimal precision. Presented findings and actionable recommendations to management, leading to the adoption of the system in ongoing microscope development projects.",
    story: {
      challenge: "While I had projects in my coding classes in college, they have always been self contained within the computer. This was my first time using code to interface with the real world and hardware and then also take data from that hardware and analyze it. I learned a lot from this process about how to design experiments and analyze collected data to improve the experiment and come to reccomendations for the company to implement. It was also my first time writing code that was not for myself, so I needed to not only ensure it was legible and easy to follow, but also write up documentation about it so that if others have any difficulties, they can refer to my documents.",
      approach: "I set out to create a precise laser-focusing setup for our microscope by guiding beams through mirrors and a Powell lens, aiming for a single focal plane. Throughout this process, I received continuous feedback from the engineers who would use the final product, integrating their suggestions to optimize usability. I automated beam tracking using an image sensor on a transform stage, wrote a Python GUI to analyze the beam in real time, and implemented additional features such as toggling the effective slit and adjusting camera aperture size to refine data quality. Although controlling both the BladeCam2 sensor and the Thorlabs motors together was initially challenging on my laptop, I found a workaround by using the native Kinesis app before switching to Python automation, and everything ran smoothly on the lab desktop without extra steps.",
      outcome: "Once the setup was complete, I presented the system to the team, and they noted how it dramatically simplified their workflow—they mentioned they literally didn't know how they would have done the job without my GUI. I further enhanced the program by adding functionality for NanoScan's photon NS2S-Si/9/5-PRO camera, allowing even more precise measurements of beam width and focus distance. For analysis, I built another wxPython GUI using Matplotlib to streamline data visualization and fit-curve comparisons. Finally, I thoroughly documented all code and procedures so the company can continue using and improving upon the setup after my internship ends."
    },
    technologies: ['Python', 'Metrology', 'Communication', 'Thorlabs', 'Cobalt Lasers', 'DataRay'],
    keyFeatures: [
      'Real-time data processing',
      'Predictive analytics',
      'Interactive dashboards',
      'Automated reporting',
      'Custom alert system'
    ]
  },

  {
    id: 'AudiobookPlayer',
    title: 'Audiobook Player',
    description: 'Coming soon...',
    image: '/assets/coverimage-DtUrAx8Y.png',
    images: [
      {
        url: '/assets/coverimage-DtUrAx8Y.png',
        caption: 'Project overview'
      },
      {
        url: '/assets/examplemenu-BlT3ANCo.gif',
        caption: 'Example of a menu screen'
      },
      {
        url: '/assets/SpriteMap-D3pWvwDB.png',
        caption: 'Spritemap to hold all GUI elements'
      },
      {
        url: '/assets/initialmockup-B6cGBnij.png',
        caption: 'Initial mockup in Photoshop'
      }
    ],
    link: '/project/AudiobookPlayer',
    stats: [
      { label: 'Storage Capacity', value: '256gb' },
      { label: 'Supported Formats', value: 'MP3, M4B, AAC, FLAC' },
      { label: 'Weight', value: 'TBD' }
    ],
    why: "I love books, however, in college I found that I don't have the time to get lost in a good story like I used to when I was younger. This made me turn my attention to audiobooks, where I now listen all the time. However, while it's convenient listening on my phone, I want to reduce all the distractions and problems my phone brings-especially in the gym.",
    what: "A handheld audiobook player with a simple interface, long battery life, and easy-to-use controls. The device will also be able to change speeds, bookmark, have a sleep timer, as well as various other features I wish a lot of audiobook apps had.",
    how: "The device is built using a Raspberry Pi and components from Adafruit. The hardware is complemented by custom software to provide a seamless and distraction-free audiobook listening experience.",
    story: {
      challenge: "Designing a user-friendly interface for a dedicated audiobook player that provides better functionality than smartphone apps while eliminating distractions.",
      approach: "In progress...",
      outcome: "In progress..."
    },
    technologies: ['Raspberry Pi', 'Python', 'CAD', '3D printing', 'bash', 'design thinking'],
    keyFeatures: [
      'Distraction-free reading',
      'Long battery life',
      'Simple interface',
      'Speed control',
      'Bookmarking capability',
      'Sleep timer'
    ]
  }
  
  // Add other projects here...
];