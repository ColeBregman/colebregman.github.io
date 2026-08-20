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
  pressLink?: {
    label: string;
    url: string;
  };
  stats?: {
    label: string;
    value: string;
  }[];
  why: string;
  what: string;
  how: string;
  story?: {
    challenge: string;
    approach: string;
    outcome: string;
    inlineImages?: {
      challenge?: string;
      approach?: string;
      outcome?: string;
    };
  };
  technologies?: string[];
  keyFeatures?: string[];
}

export const projects: Project[] = [
  {
    id: 'AppleMDE',
    title: 'Manufacturing Design at Apple',
    description: 'A year owning yield, cost, and process problems on high-volume consumer hardware. Details kept intentionally vague — the results are real.',
    image: '/assets/apple-mde-cover.svg',
    images: [],
    link: '/project/AppleMDE',
    stats: [
      { label: 'Cost savings driven', value: '$2.8M+' },
      { label: 'Assembly yield (from 65%)', value: '99.7%' },
      { label: 'Raw material cost reduction', value: '71%' }
    ],
    why: "High-volume consumer hardware lives or dies on yield, cost, and cosmetic quality — and the details that drive all three get decided on the factory floor, not in CAD.\nAs a Manufacturing Design Engineering intern, I owned problems where design intent met factory reality: yield issues, cost-downs, and assembly bottlenecks.\nThe work spanned metal injection molding, CNC machining, surface finishing, and final assembly.",
    what: "Drove $2.8M+ in savings through DFM optimizations, targeted design changes, and a novel surface-finish process that improves corrosion resistance and tunes color without PVD.\nRaised assembly yield from 65% to 99.7% through tolerance-stack reduction, design changes, and added feedback in the assembly control loop.\nIntroduced laser welding into the assembly process, cutting assembly time by 50% and total assembly cost by 40%.",
    how: "Designed CNC, sintering, and assembly fixtures in Siemens NX, drove MIM tooling from cold to hot runner, and qualified an alternative material for a 71% raw-material cost reduction.\nRan failure analysis, root-cause investigations, and DOEs (JMP, Python) — including a 4× improvement in a critical strength metric and resolving a 0%-yield proto-build blocker in 10 days with on-site factory support.\nBuilt a hands-on tabletop factory demonstration presented to Apple's CEO, factory leadership, and press for a new US manufacturing partnership.",
    story: {
      challenge: "Most of this work is under NDA, so this page stays at the level of outcomes rather than products and processes. What I can share is what the year taught me: manufacturing is where engineering gets honest. A part that's perfect in CAD means nothing if it can't be made, finished, and assembled at scale with good yield. I learned to own a problem end-to-end — from the data that proves it exists, through the root cause, to the design or process change that fixes it, to getting vendors and cross-functional teams (system PD, cable PD, EE, factory operations) to actually adopt it.",
      approach: "The pattern that worked, over and over: be systematic and bring data. When mechanical performance dropped, that meant thorough failure analysis and root-cause work before touching anything. When a strength metric was failing on injection-molded components, that meant designing DOE experiments, analyzing them in JMP and Python, and iterating with vendors until we had a 4× improvement. When assembly was the bottleneck, that meant tolerance analysis to find where yield was actually being lost, then attacking it from three sides at once — reducing the tolerance stack, improving the assembly design, and adding feedback to the assembly control loop.",
      outcome: "The cumulative result was over $2.8M in savings: a material switch cutting raw material cost 71%, a laser-welding process cutting assembly cost 40%, corrective process changes improving yield strength 108%, and assembly yield climbing from 65% to 99.7%. When a proto build hit a 0%-yield blocker, systematic root-causing and on-site factory support resolved it in 10 days and the build delivered on schedule. And at the end of the year, I designed and built a tabletop factory demonstration used to communicate a new US manufacturing partnership to Apple's CEO, factory leadership, and press."
    },
    technologies: ['Siemens NX', 'DFM', 'Tolerance Analysis', 'DOE', 'JMP', 'Python', 'MIM', 'CNC', 'Laser Welding', 'Surface Finishing'],
    keyFeatures: [
      '$2.8M+ in driven savings',
      'Assembly yield 65% → 99.7%',
      '4× critical strength improvement',
      'Novel surface-finish process',
      'Demo presented to Apple CEO and press'
    ]
  },

  {
    id: 'CorningModel',
    title: 'Tabletop Factory Model',
    description: "A ten-foot working miniature of Corning's Harrodsburg glass plant, built with a small team during my Apple internship so stakeholders and press could understand the process without walking the factory floor.",
    image: '/assets/corning-model-full.webp',
    images: [
      {
        url: '/assets/corning-model-full.webp',
        caption: 'The finished model staged for the event — ten feet of process flow, from sand silos to palletizing'
      },
      {
        url: '/assets/corning-led-matrix.webp',
        caption: 'Assembling the Raspberry Pi-driven LED matrix that stands in for the melting oven, on the shop floor in Harrodsburg'
      },
      {
        url: '/assets/corning-cnbc-segment.webp',
        caption: "The model (circled) in the background of CNBC's segment with Tim Cook and Jim Cramer at the plant"
      }
    ],
    link: '/project/CorningModel',
    pressLink: {
      label: "CNBC: Jim Cramer speaks with Tim Cook at Corning's Harrodsburg plant",
      url: 'https://www.cnbc.com/video/2025/09/12/jim-cramer-speaks-with-apple-ceo-tim-cook-at-corning-plant-in-harrodsburg-ky.html'
    },
    stats: [
      { label: 'Length', value: '10 feet' },
      { label: 'Stations', value: '8 in motion' },
      { label: 'On air', value: 'CNBC · Sept 2025' }
    ],
    why: "Corning's plant in Harrodsburg, KY makes glass for Apple — and the process is genuinely impressive, but the floor is hot ovens, catwalks, and restricted areas you can't walk visitors past.\nWith a new US manufacturing partnership being announced, stakeholders and press needed to understand the whole process without a plant tour.\nThe ask, during my Apple internship: a tabletop model that demonstrates the factory's process flow at a glance — on a very short timeline.",
    what: "A ten-foot tabletop model of the plant's full process flow — sand silos, mixing, auger feeding, oven melting, hopper extrusion, rolling and annealing, cutting, and palletizing — with real motion and programmed light standing in for the machinery.\nBuilt with a small team — another intern and our manager, who had done much of the initial CAD before I joined the project.\nMy scope was motion, electronics, and lighting, plus CAD for parts that were machined and anodized as well as 3D-printed.",
    how: "Drove the model's motion with NEMA stepper motors running off a Duet 3D-printer controller board, and handled the wiring to tie everything together.\nProgrammed the lighting on an Arduino, plus a Raspberry Pi driving the LED-matrix animation that stands in for the melting oven.\nTraveled to Harrodsburg for installation and pre-event troubleshooting — chasing down loose wiring and printing spares for parts that turned out more fragile than expected.",
    story: {
      challenge: "The timeline was the hard part: the event date was fixed, and a working model of an entire factory process had to exist by then — which meant a lot of extra nights and weekends. I also joined a project already in motion. Our manager had done much of the initial CAD before I came on, so the job was to pick up that design intent, fill in everything the model still needed — motion, electronics, lighting — and get it all working together as one piece.",
      approach: "We split the work across the three of us and iterated fast. The model walks through the plant's whole flow — sand silos, mixing, auger feeding, oven melting, hopper extrusion, rolling and annealing, cutting, palletizing — across ten feet of tabletop. For motion, I used NEMA stepper motors driven by a Duet 3D-printer controller board — an off-the-shelf way to coordinate multiple axes without designing custom electronics from scratch. Lighting ran on an Arduino, with a Raspberry Pi animating the LED matrix that stands in for the melting oven, and I did CAD for parts across the model — a mix of machined and anodized components and 3D-printed ones depending on what each piece needed.",
      outcome: "I traveled to the plant in Harrodsburg, KY for installation and pre-event troubleshooting — reseating loose wiring from transit and printing spares for parts that proved more fragile than expected. The model was shown to Corning's CEO, who then walked Apple CEO Tim Cook through it during his plant visit. It's even visible in the background of CNBC's segment from the plant that day. But the part I keep coming back to is simpler: a process you'd normally need a hard hat and an escort to see, made legible on a tabletop."
    },
    technologies: ['CAD', 'NEMA Stepper Motors', 'Duet Controller Board', 'Arduino', 'Raspberry Pi', 'Wiring & Electronics', 'LED Matrix', '3D Printing', 'CNC Machining', 'Anodizing'],
    keyFeatures: [
      'Ten feet of factory process flow in miniature',
      'Eight stations, from sand silos to palletizing',
      'Stepper motion coordinated by a Duet printer board',
      'Arduino lighting + Raspberry Pi LED-matrix oven',
      'Machined, anodized, and 3D-printed parts',
      'Installed on-site at the Harrodsburg plant'
    ]
  },

  {
    id: 'Optics',
    title: 'Live Optical Alignment and Automated Lens Testing',
    description: 'Speeding up the microscope development for optical engineers',
    image: '/assets/OpticsJig-Cl6gbkTQ.webp',
    images: [
      {
        url: '/assets/GUI-D1tlHbqh.webp',
        caption: 'Real-time Python GUI'
      },
      {
        url: '/assets/PriorGUI-CfGspTeB.webp',
        caption: 'Previous iteration showing live usage with laser'
      },
      {
        url: '/assets/Data1-Cd0dS5nb.webp',
        caption: 'Generated data analysis to find focal point'
      },
      {
        url: '/assets/Data2-BDjiV9sT.webp',
        caption: 'Lens and optic fiber reliability analysis'
      }
    ],
    link: '/project/Optics',
    stats: [
      { label: 'Increased Laser Precision', value: '44.4%' },
      { label: 'Reduced Optical Alignment Time', value: '90%' },
      { label: 'GUI Analysis Capability', value: '10+ test cases' }
    ],
    why: "Optical engineers on a strict timeline to develop a novel microscope face the tedious and time-intensive process of manually testing each optic fiber, lens, and laser wavelength combination. This involves making adjustments, collecting data from the laser profiler, calculating key metrics, refining the alignment, and repeating these steps until optimal alignment is achieved. This process demands both a high level of expertise and significant time investment, diverting skilled engineers from other critical tasks.",
    what: "Developed a GUI integrated with a custom-built test rig, featuring a 4-wavelength laser, micrometer stage, and laser profiler. The GUI provides real-time alignment and testing insights, streamlining the alignment process and significantly improving speed and precision. Automated data analysis further enhances laser accuracy. Delivered comprehensive documentation to ensure the company could maintain and adapt the system independently after the internship concluded.",
    how: "Collaborated closely with optical engineers, shadowing alignment sessions to pinpoint inefficiencies and opportunities for automation. Conducted interviews to understand key metrics and challenges faced during alignment and testing processes. Designed and constructed a custom test rig equipped with a 4-wavelength laser, micrometer stage, and laser profiler to facilitate precise testing. Leveraged Python for automation, utilizing libraries such as Python.NET for motor control and wxPython for GUI development. Solicited continuous feedback from engineers, iterating on the system design to meet their needs. Automated data capture from the laser profiler, implemented beam property analysis, and used curve-fitting algorithms to determine the laser's focal point with optimal precision. Presented findings and actionable recommendations to management, leading to the adoption of the system in ongoing microscope development projects.",
    story: {
      challenge: "While I had projects in my coding classes in college, they have always been self contained within the computer. This was my first time using code to interface with the real world and hardware and then also take data from that hardware and analyze it. I learned a lot from this process about how to design experiments and analyze collected data to improve the experiment and come to recommendations for the company to implement. It was also my first time writing code that was not for myself, so I needed to not only ensure it was legible and easy to follow, but also write up documentation about it so that if others have any difficulties, they can refer to my documents.",
      approach: "I set out to create a precise laser-focusing setup for our microscope by guiding beams through mirrors and a Powell lens, aiming for a single focal plane. Throughout this process, I received continuous feedback from the engineers who would use the final product, integrating their suggestions to optimize usability. I automated beam tracking using an image sensor on a transform stage, wrote a Python GUI to analyze the beam in real time, and implemented additional features such as toggling the effective slit and adjusting camera aperture size to refine data quality. Although controlling both the BladeCam2 sensor and the Thorlabs motors together was initially challenging on my laptop, I found a workaround by using the native Kinesis app before switching to Python automation, and everything ran smoothly on the lab desktop without extra steps.",
      outcome: "Once the setup was complete, I presented the system to the team, and they noted how it dramatically simplified their workflow—they mentioned they literally didn't know how they would have done the job without my GUI. I further enhanced the program by adding functionality for NanoScan's photon NS2S-Si/9/5-PRO camera, allowing even more precise measurements of beam width and focus distance. For analysis, I built another wxPython GUI using Matplotlib to streamline data visualization and fit-curve comparisons. Finally, I thoroughly documented all code and procedures so the company can continue using and improving upon the setup after my internship ends."
    },
    technologies: ['Python', 'Metrology', 'Communication', 'Thorlabs', 'Cobalt Lasers', 'DataRay'],
    keyFeatures: [
      'Real-time beam analysis GUI',
      '4-wavelength laser test rig',
      'Automated focal-point curve fitting',
      'Motorized stage control',
      'Comprehensive handoff documentation'
    ]
  },

  {
    id: 'AudiobookPlayer',
    title: 'ode. — Audiobook Player',
    description: 'A distraction-free handheld audiobook player — fully soldered off the breadboard and into its final 3D-printed enclosure. Tentatively named ode.',
    image: '/assets/coverimage-DtUrAx8Y.webp',
    images: [
      {
        url: '/assets/audiobook-final-print.webp',
        caption: 'The finalized enclosure design, fresh off the printer'
      },
      {
        url: '/assets/audiobook-soldered.webp',
        caption: 'Fully soldered stack — round display, controls, and battery, no breadboard in sight'
      },
      {
        url: '/assets/audiobook-round-display.webp',
        caption: 'First test of the round display that replaced the original rectangular screen'
      },
      {
        url: '/assets/audiobook-iterations.webp',
        caption: 'Sketches and the trail of 3D-printed enclosure iterations it took to get here'
      },
      {
        url: '/assets/audiobook-enclosure-v2.webp',
        caption: 'An earlier enclosure version — test-fitting components into the printed shell'
      },
      {
        url: '/assets/audiobook-final-assembly.webp',
        caption: 'Final design mid-assembly'
      },
      {
        url: '/assets/audiobook-macsim.mp4',
        caption: 'Simulating the full interface and I/O on my Mac before wiring anything'
      },
      {
        url: '/assets/examplemenu-BlT3ANCo.gif',
        caption: 'Example of a menu screen'
      },
      {
        url: '/assets/audiobook-breadboard-1.webp',
        caption: 'Where it started — first working prototype on the breadboard'
      },
      {
        url: '/assets/SpriteMap-D3pWvwDB.webp',
        caption: 'Spritemap to hold all GUI elements'
      },
      {
        url: '/assets/initialmockup-B6cGBnij.webp',
        caption: 'Initial mockup in Photoshop'
      }
    ],
    link: '/project/AudiobookPlayer',
    stats: [
      { label: 'Status', value: 'Assembled & working' },
      { label: 'Storage Capacity', value: '256gb' },
      { label: 'Supported Formats', value: 'MP3, M4B, AAC, FLAC' }
    ],
    why: "I love books, however, in college I found that I don't have the time to get lost in a good story like I used to when I was younger. This made me turn my attention to audiobooks, where I now listen all the time. However, while it's convenient listening on my phone, I want to reduce all the distractions and problems my phone brings-especially in the gym.",
    what: "A handheld audiobook player with a simple interface, long battery life, and easy-to-use physical controls. Beyond the basics—speed control, bookmarking, a sleep timer—it has features I always wished audiobook apps had, like automatically transcribing and saving quotes as I listen. Everything is now soldered together off the breadboard, rebuilt around a round display, and living in a 3D-printed enclosure that took many redesigns to get right.",
    how: "Built around a Raspberry Pi with Adafruit components and custom Python software. I started with sketches and design iterations, then simulated the full interface and I/O on my Mac before wiring anything—so by the time I moved to the breadboard, I knew exactly what components I needed and how they would behave. From there it was continuous enclosure redesign—CAD sketches and 3D-print iterations—until the form factor finally felt right in the hand.",
    story: {
      challenge: "Designing a dedicated audiobook player that's genuinely better than a phone app—better physical controls, zero distractions—while learning the hardware side of the build: wiring, power management, and real-device I/O. The interface had to be simple enough to use mid-workout without looking, but still expose the features I actually care about.",
      approach: "I began with the design process: sketches, Photoshop interface mockups, and iterations on the physical layout and spritemap-based GUI. Before touching any hardware, I built a simulation of the entire player on my Mac to validate the interface and confirm exactly which components and I/O I would need. Only then did I move to a breadboard, bringing up the screen, controls, and audio pipeline step by step.",
      outcome: "The player is fully soldered together and off the breadboard—hardware and software working as one device, including the unique features like automatic quote transcription and saving. Along the way I switched to a round display, which sent the enclosure through continuous redesign: rounds of CAD sketches and 3D-printed iterations before settling on a final form factor. The latest design work is about longevity—keeping every component secure inside the enclosure while staying easy to disassemble for future repairs and upgrades."
    },
    technologies: ['Raspberry Pi', 'Python', 'CAD', '3D printing', 'bash', 'design thinking'],
    keyFeatures: [
      'Distraction-free listening',
      'Automatic quote transcription & saving',
      'Long battery life',
      'Simple physical interface',
      'Speed control',
      'Bookmarking & sleep timer'
    ]
  },

  {
    id: 'ToyCar',
    title: 'Toy Car',
    description: 'Making a small toy car for a manufacturing class',
    image: '/assets/carcover.webp',
    images: [
      {
        url: '/assets/carcover.webp',
        caption: 'Finished car'
      },
      {
        url: '/assets/carprototypes.webp',
        caption: 'prototypes of the body'
      },
      {
        url: '/assets/carmoldmachining.webp',
        caption: 'Machining the injection mold'
      },
      {
        url: '/assets/carmoldfinished.webp',
        caption: 'Injection molds for wheels'
      },
      {
        url: '/assets/carbodymold.webp',
        caption: 'Casting the body'
      }
    ],
    link: '/project/ToyCar',
    why: "Tasked with designing and manufacturing a 1920s style toy car for my Materials and Manufacturing class, I wanted to create a car that was not only functional but also aesthetically pleasing.",
    what: "A silicone-cast toy car body made with a 3D printed mold. Wheels made with injection molded PLA with a machined mold. 3D printed cockpit and axle holder.",
    how: "Using Fusion360 to CAD the car as well as the CAM for the wheel molds. Wheel molds were machined out of aluminum using a Tormach 770M CNC mill.",
    technologies: ['Fusion360', 'CAM', 'CAD', '3D printing', 'casting', 'design for manufacturability'],
  }

  // Add other projects here...
];
