/**
 * Makes a fetch request with error handling through the background script
 * @param {string} url - The URL to fetch
 * @returns {Promise<any>} The response data
 */
export async function safeFetch(url) {
  try {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'fetch', url }, response => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Failed to fetch data'));
        }
      });
    });
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Converts RGB array to hex color
 * @param {number} r - Red value
 * @param {number} g - Green value
 * @param {number} b - Blue value
 * @returns {string} Hex color code
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Downloads a file
 * @param {string} url - The URL of the file to download
 * @param {string} filename - The name of the file
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 