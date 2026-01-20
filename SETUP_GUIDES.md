# Setup Guides for Portfolio Website

## 1. Converting Images to WebP Format

WebP images provide 25-35% better compression than PNG/JPG while maintaining quality. Here's how to convert your images:

### Method 1: Using Online Tools (Easiest)
1. Go to https://squoosh.app/ or https://convertio.co/
2. Upload your images
3. Select WebP as output format
4. Adjust quality (recommended: 80-90)
5. Download converted images

### Method 2: Using Command Line (Batch Conversion)

**Install webp tools:**
```bash
# macOS
brew install webp

# Ubuntu/Debian
sudo apt-get install webp

# Windows - Download from:
# https://developers.google.com/speed/webp/download
```

**Convert all images in public/assets/:**
```bash
# Navigate to your project
cd /Users/cole/Documents/GitHub/colebregman.github.io

# Convert all JPG/PNG to WebP
find public/assets -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -exec sh -c 'cwebp -q 85 "$1" -o "${1%.*}.webp"' _ {} \;
```

**Convert specific image:**
```bash
cwebp -q 85 public/assets/headshot-M8coJzZI.png -o public/assets/headshot-M8coJzZI.webp
```

### Method 3: Using Node.js Script

**Install sharp package:**
```bash
npm install --save-dev sharp
```

**Create conversion script** (`convert-to-webp.js`):
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'public/assets');
const imageFiles = fs.readdirSync(assetsDir)
  .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

imageFiles.forEach(async (file) => {
  const inputPath = path.join(assetsDir, file);
  const outputPath = path.join(assetsDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
  
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    console.log(`Converted: ${file} -> ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`Error converting ${file}:`, error);
  }
});
```

**Run the script:**
```bash
node convert-to-webp.js
```

### After Conversion: Update Image References

1. **Update project.ts** to use WebP images:
```typescript
// Before
image: '/assets/headshot-M8coJzZI.png',

// After  
image: '/assets/headshot-M8coJzZI.webp',
```

2. **Update Hero.tsx**:
```typescript
// Change import or public path to .webp
import headshotImage from '../../images/headshot.webp';
```

3. **Add fallback for browser compatibility** (optional):
```tsx
<picture>
  <source srcSet="/assets/image.webp" type="image/webp" />
  <img src="/assets/image.png" alt="Description" />
</picture>
```

---

## 2. Adding Company Logos to Experience Section

### Step 1: Prepare Logo Images

**Recommended Specifications:**
- Format: PNG or SVG (SVG preferred for scalability)
- Size: 100x100px to 200x200px
- Background: Transparent or white
- File naming: `company-logo.png` (e.g., `apple-logo.png`)

### Step 2: Add Logos to Project

**Create logos directory:**
```bash
mkdir -p public/assets/logos
```

**Add your logo files:**
```
public/assets/logos/
  ├── apple-logo.png
  ├── columbia-logo.png
  ├── eikon-logo.png
  ├── design-visionaries-logo.png
  └── stanford-logo.png
```

### Step 3: Update Experience Data Structure

**Edit** `src/components/sections/Experience.tsx`:

```typescript
interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  date: string;
  description: string[];
  logo?: string;  // Add this field
}

const experiences: ExperienceItem[] = [
  {
    title: 'Manufacturing Design Engineering Intern',
    company: 'Apple',
    location: 'Cupertino, California, United States',
    date: 'May 2025 - Present',
    description: [
      'Working on manufacturing design and engineering projects for upcoming products.',
      'Collaborating with cross-functional teams to improve product manufacturability.'
    ],
    logo: '/assets/logos/apple-logo.png',  // Add logo path
  },
  {
    title: 'Student Researcher',
    company: 'Columbia Engineering',
    location: 'New York, New York, United States',
    date: 'Feb 2024 - May 2025',
    description: [
      'MBL Lab: Designed CAD models for NITRO knee replacement and co-developed test rig for mechanical testing.',
      'Creative Machines Lab: Developed a low-cost food 3D printer for a restaurant and a self-diagnostic 3D-printing robot.'
    ],
    logo: '/assets/logos/columbia-logo.png',
  },
  // ... add logos to other experiences
];
```

### Step 4: Update Experience Component JSX

Replace the circle marker with logo display:

```typescript
export function Experience() {
  return (
    <section id="experience" className="min-h-screen py-24 px-6 md:pr-32">
      <div className="w-full">
        <h2 className="text-4xl font-bold mb-16">Experience</h2>
        
        <div className="relative pl-12">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 z-0"></div>
          
          {/* Experience items */}
          {experiences.map((exp, index) => (
            <div key={index} className="relative mb-20">
              {/* Logo marker (replaces circle) */}
              {exp.logo ? (
                <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-white border-2 border-gray-300 z-10 p-1.5 flex items-center justify-center">
                  <img 
                    src={exp.logo} 
                    alt={`${exp.company} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-4 border-gray-300 z-10"></div>
              )}
              
              <div className="pl-16">
                <h3 className="text-2xl font-bold mb-1">{exp.title} @ {exp.company}</h3>
                <p className="text-gray-600 mb-2">{exp.date}</p>
                {exp.location && <p className="text-gray-600 mb-3">{exp.location}</p>}
                
                {exp.description.length > 0 && (
                  <ul className="list-disc pl-5 space-y-3">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="text-gray-700">{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Step 5: Finding Company Logos

**Free Logo Resources:**
1. **Official Company Websites** - Press/Media kit sections
2. **Clearbit Logo API**: `https://logo.clearbit.com/[domain]`
   - Example: `https://logo.clearbit.com/apple.com`
3. **Brandfetch**: https://brandfetch.com/
4. **Wikipedia**: Often has company logos in their info boxes
5. **LinkedIn**: Company pages usually have high-res logos

**Example using Clearbit API:**
```typescript
logo: 'https://logo.clearbit.com/apple.com',
logo: 'https://logo.clearbit.com/columbia.edu',
logo: 'https://logo.clearbit.com/eikontherapeutics.com',
```

### Alternative: Circular Letter Avatars (No Logo Needed)

If you can't find logos, use letter avatars:

```typescript
<div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 z-10 flex items-center justify-center">
  <span className="text-white font-bold text-lg">
    {exp.company.charAt(0)}
  </span>
</div>
```

---

## 3. Quick Reference Commands

### View website locally:
```bash
npm run dev
# Open http://localhost:5173
```

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Deploy to GitHub Pages:
```bash
npm run deploy
```

---

## 4. Troubleshooting

### Images not loading:
- Check file paths are correct
- Ensure images are in `public/assets/` directory
- Clear browser cache (Cmd+Shift+R on Mac)
- Check browser console for 404 errors

### WebP not supported in older browsers:
Add fallback using `<picture>` tag (see conversion section above)

### Logos appear distorted:
- Use `object-contain` instead of `object-cover`
- Ensure logos have transparent backgrounds
- Try SVG format for better scaling

---

## Next Steps

1. ✅ Convert hero image to WebP for better performance
2. ✅ Add company logos to Experience section
3. Consider adding lazy loading to all images
4. Optimize any remaining large images
5. Test on multiple devices and browsers