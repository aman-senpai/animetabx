import { copyFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

// Create animetabx directory if it doesn't exist
mkdirSync('animetabx', { recursive: true });

// Copy manifest and background files
copyFileSync('manifest.json', 'animetabx/manifest.json');
copyFileSync('background.js', 'animetabx/background.js');

// Ensure icons directory exists
mkdirSync('animetabx/icons', { recursive: true });

// Copy all icons from icons directory
const icons = readdirSync('icons');
icons.forEach(icon => {
  copyFileSync(join('icons', icon), join('animetabx/icons', icon));
});

// Clean up any duplicate files in animetabx root
const animetabxFiles = readdirSync('animetabx');
animetabxFiles.forEach(file => {
  const filePath = join('animetabx', file);
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