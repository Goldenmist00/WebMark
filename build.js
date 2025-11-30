import { resolve, dirname } from 'path';
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function postBuild() {
  console.log('Running post-build tasks...');
  
  const distDir = resolve(__dirname, 'dist');
  
  // Ensure directories exist
  const dirs = ['popup', 'content', 'background'];
  dirs.forEach(dir => {
    const dirPath = resolve(distDir, dir);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  });
  
  // Copy manifest
  console.log('Copying manifest.json...');
  copyFileSync(
    resolve(__dirname, 'public/manifest.json'),
    resolve(distDir, 'manifest.json')
  );
  
  // Copy CSS
  console.log('Copying uiStyles.css...');
  copyFileSync(
    resolve(__dirname, 'src/content/uiStyles.css'),
    resolve(distDir, 'content/uiStyles.css')
  );
  
  // Fix popup HTML paths
  const popupHtml = resolve(distDir, 'popup/index.html');
  if (existsSync(popupHtml)) {
    console.log('Fixing popup HTML paths...');
    let html = readFileSync(popupHtml, 'utf-8');
    html = html.replace(/\/assets\//g, '../assets/');
    html = html.replace(/\/popup\//g, '../popup/');
    writeFileSync(popupHtml, html);
  }
  
  console.log('✅ Build complete! Load the dist/ folder in Chrome.');
  console.log('   Go to chrome://extensions/ and click "Load unpacked"');
}

postBuild();
