import { copyFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

// Create dist directory if it doesn't exist
mkdirSync('dist', { recursive: true });

// Copy only necessary files to dist
copyFileSync('manifest.json', 'dist/manifest.json');
copyFileSync('background.js', 'dist/background.js');

// Ensure icons directory exists
mkdirSync('dist/icons', { recursive: true });

// Copy all icons from icons directory
const icons = readdirSync('icons');
icons.forEach(icon => {
  copyFileSync(join('icons', icon), join('dist/icons', icon));
});

// Clean up any duplicate files in dist root
const distFiles = readdirSync('dist');
distFiles.forEach(file => {
  const filePath = join('dist', file);
  // Remove any PNG files from root that are not icon-*.png
  if (file.endsWith('.png') && !file.startsWith('icon-')) {
    try {
      unlinkSync(filePath);
    } catch (error) {
      console.error(`Error removing duplicate file ${file}:`, error);
    }
  }
  // Remove any SVG files from root
  if (file.endsWith('.svg')) {
    try {
      unlinkSync(filePath);
    } catch (error) {
      console.error(`Error removing SVG file ${file}:`, error);
    }
  }
}); 