// Simple script to create placeholder icons
// In production, replace with actual icon images

const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];

// Create a simple SVG icon
const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3B82F6" rx="${size/8}"/>
  <text x="50%" y="50%" font-size="${size*0.6}" fill="white" text-anchor="middle" dy=".35em" font-family="Arial">📝</text>
</svg>
`;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create SVG icons
sizes.forEach(size => {
  const svg = createSVG(size);
  fs.writeFileSync(path.join(publicDir, `icon${size}.svg`), svg);
  console.log(`Created icon${size}.svg`);
});

console.log('\nNote: For production, replace SVG files with PNG icons.');
console.log('You can use a tool like Inkscape or online converters to create PNG from SVG.');
