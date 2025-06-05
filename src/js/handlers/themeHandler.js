import { CONFIG } from '../../config/config.js';
import { rgbToHex } from '../../utils/helpers.js';

export class ThemeHandler {
  /**
   * Applies a color theme based on the provided palette
   * @param {Array<Array<number>>} palette - Array of RGB color arrays
   */
  static applyColorTheme(palette) {
    const root = document.documentElement;
    
    // Use the first color for text
    const textColor = rgbToHex(...palette[0]);
    // Use the second color for backgrounds
    const bgColor = rgbToHex(...palette[1]);
    // Use the third color for accents
    const accentColor = rgbToHex(...palette[2]);
    
    // Apply colors to CSS variables
    root.style.setProperty('--text-color', textColor);
    root.style.setProperty('--bg-color', bgColor);
    root.style.setProperty('--accent-color', accentColor);
    
    // Update button backgrounds
    const buttons = document.querySelectorAll('#download-btn, #shuffle-btn');
    buttons.forEach(btn => {
      btn.style.backgroundColor = `${bgColor}${CONFIG.UI.WALLPAPER_OPACITY}`;
      btn.style.borderColor = accentColor;
    });
    
    // Update news items
    const newsItems = document.querySelectorAll('.news-item');
    newsItems.forEach(item => {
      item.style.backgroundColor = `${bgColor}${CONFIG.UI.WALLPAPER_OPACITY}`;
      item.style.borderColor = `${accentColor}${CONFIG.UI.BORDER_OPACITY}`;
    });

    // Save theme to storage
    chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.THEME]: { textColor, bgColor, accentColor } });
  }

  /**
   * Loads the saved theme from storage
   */
  static async loadSavedTheme() {
    try {
      const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.THEME);
      if (result[CONFIG.STORAGE_KEYS.THEME]) {
        const { textColor, bgColor, accentColor } = result[CONFIG.STORAGE_KEYS.THEME];
        const root = document.documentElement;
        
        root.style.setProperty('--text-color', textColor);
        root.style.setProperty('--bg-color', bgColor);
        root.style.setProperty('--accent-color', accentColor);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  }
} 