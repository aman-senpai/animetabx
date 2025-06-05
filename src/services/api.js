import { CONFIG } from '../config/config.js';
import { safeFetch } from '../utils/helpers.js';

export class ApiService {
  static tags = {
    versatile: [
      "maid",
      "waifu",
      "marin-kitagawa",
      "mori-calliope",
      "raiden-shogun",
      "oppai",
      "selfies",
      "uniform",
      "kamisato-ayaka"
    ],
    nsfw: [
      "ass",
      "hentai",
      "milf",
      "oral",
      "paizuri",
      "ecchi",
      "ero"
    ]
  };

  /**
   * Gets a random SFW tag
   * @returns {string} Random SFW tag
   */
  static getRandomSFWTag() {
    const sfwTags = this.tags.versatile;
    return sfwTags[Math.floor(Math.random() * sfwTags.length)];
  }

  /**
   * Gets a random NSFW tag
   * @returns {string} Random NSFW tag
   */
  static getRandomNSFWTag() {
    const nsfwTags = this.tags.nsfw;
    return nsfwTags[Math.floor(Math.random() * nsfwTags.length)];
  }

  /**
   * Fetches a random anime
   * @returns {Promise<Object>} Anime data
   */
  static async getRandomAnime() {
    try {
      const response = await safeFetch(CONFIG.API.ANIME_RANDOM);
      const data = JSON.parse(response);
      
      if (!data || !data.data) {
        throw new Error('Invalid response from Jikan API');
      }

      const anime = data.data;
      
      // Check if the anime is NSFW based on rating
      const isNSFW = anime.rating === 'Rx - Hentai' || 
                     anime.rating === 'R+ - Mild Nudity' || 
                     anime.rating === 'R - 17+ (violence & profanity)';
      
      // Format the response to include only necessary data
      return {
        id: anime.mal_id,
        url: anime.url,
        title: anime.title,
        titleEnglish: anime.title_english,
        titleJapanese: anime.title_japanese,
        type: anime.type,
        episodes: anime.episodes,
        status: anime.status,
        duration: anime.duration,
        rating: anime.rating,
        isNSFW: isNSFW,
        score: anime.score,
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        genres: anime.genres?.map(genre => genre.name) || [],
        themes: anime.themes?.map(theme => theme.name) || [],
        demographics: anime.demographics?.map(demo => demo.name) || [],
        aired: anime.aired?.string || 'Unknown',
        source: anime.source,
        studios: anime.studios?.map(studio => studio.name) || [],
        producers: anime.producers?.map(producer => producer.name) || []
      };
    } catch (error) {
      console.error('Error fetching random anime:', error);
      throw error;
    }
  }

  /**
   * Fetches anime news
   * @returns {Promise<Array>} Array of news items
   */
  static async getAnimeNews() {
    try {
      const response = await safeFetch(CONFIG.API.ANIME_NEWS);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response, 'text/xml');
      const items = xmlDoc.getElementsByTagName('item');
      
      return Array.from(items)
        .slice(0, CONFIG.UI.NEWS_ITEMS_LIMIT)
        .map(item => ({
          title: item.getElementsByTagName('title')[0].textContent,
          link: item.getElementsByTagName('link')[0].textContent,
          description: item.getElementsByTagName('description')[0].textContent
        }));
    } catch (error) {
      console.error('Error fetching anime news:', error);
      throw error;
    }
  }

  /**
   * Checks if an image is landscape oriented
   * @param {string} url - The URL of the image to check
   * @returns {Promise<boolean>} True if the image is landscape
   */
  static async isLandscapeImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.width > img.height);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = url;
    });
  }

  /**
   * Fetches a random image from Nekos.best API
   * @param {boolean} allowNSFW - Whether to allow NSFW content
   * @returns {Promise<Object>} Image data
   */
  static async getNekoImage(allowNSFW = false) {
    try {
      // Get a random SFW category
      const categories = ['neko', 'kitsune', 'husbando', 'waifu'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const response = await safeFetch(`${CONFIG.API.NEKO}/${randomCategory}`);
      const data = JSON.parse(response);
      
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        throw new Error('Invalid response from Nekos.best API');
      }

      const image = data.results[0];
      
      // Validate the image URL
      if (!image.url) {
        throw new Error('Invalid image URL');
      }

      return {
        url: image.url,
        title: image.artist_name ? `Art by ${image.artist_name}` : 'Nekos.best',
        source: image.source_url || 'Nekos.best',
        colorPalette: null,
        rating: 'safe',
        tags: [],
        artist: image.artist_name || null,
        animeName: image.anime_name || null
      };
    } catch (error) {
      console.error('Error fetching from Nekos.best API:', error);
      throw error;
    }
  }

  /**
   * Fetches a random wallpaper from Waifu.im
   * @param {boolean} allowNSFW - Whether to allow NSFW content
   * @returns {Promise<Object>} Wallpaper data
   */
  static async getWaifuImage(allowNSFW = false) {
    try {
      // Get a random tag based on NSFW preference
      const tag = allowNSFW 
        ? this.getRandomNSFWTag()
        : this.getRandomSFWTag();

      // Build the URL with parameters
      const url = new URL(CONFIG.API.WALLPAPER);
      url.searchParams.append('included_tags', tag);
      url.searchParams.append('width', '>=2000');
      url.searchParams.append('is_nsfw', allowNSFW.toString());

      const response = await safeFetch(url.toString());
      const data = JSON.parse(response);
      
      if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
        throw new Error('No wallpapers found');
      }
      
      const randomImage = data.images[0]; // API already returns a random image
      
      // Validate the image URL
      if (!randomImage.url) {
        throw new Error('Invalid image URL');
      }
      
      return {
        url: randomImage.url,
        title: randomImage.tags.map(tag => tag.name).join(', '),
        source: 'Waifu.im',
        colorPalette: null
      };
    } catch (error) {
      console.error('Failed to fetch from Waifu.im:', error);
      throw error;
    }
  }

  /**
   * Fetches a random wallpaper using parallel API calls
   * @param {boolean} allowNSFW - Whether to allow NSFW content
   * @returns {Promise<Object>} Wallpaper data
   */
  static async getRandomWallpaper(allowNSFW = false) {
    try {
      // Create promises for both APIs with timeouts
      const waifuPromise = Promise.race([
        this.getWaifuImage(allowNSFW),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Waifu.im timeout')), 5000)
        )
      ]).catch(error => {
        console.error('Waifu.im API failed:', error);
        return null;
      });
      
      const nekoPromise = Promise.race([
        this.getNekoImage(allowNSFW),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Nekos.best API timeout')), 5000)
        )
      ]).catch(error => {
        console.error('Nekos.best API failed:', error);
        return null;
      });

      // Wait for both promises to settle
      const [waifuResult, nekoResult] = await Promise.all([waifuPromise, nekoPromise]);

      // Randomly choose between the successful results
      const successfulResults = [waifuResult, nekoResult].filter(result => result !== null);
      
      if (successfulResults.length === 0) {
        throw new Error('All APIs failed to return suitable images');
      }

      // Randomly select one of the successful results
      const selectedResult = successfulResults[Math.floor(Math.random() * successfulResults.length)];
      console.log(`Using image from ${selectedResult.source}`);
      
      return selectedResult;
    } catch (error) {
      console.error('Error getting random wallpaper:', error);
      throw error;
    }
  }

  /**
   * Gets the cached wallpaper or fetches a new one if needed
   * @param {boolean} forceRefresh - If true, bypass cache and fetch new wallpaper
   * @param {boolean} allowNSFW - Whether to allow NSFW content
   * @returns {Promise<Object>} Wallpaper data
   */
  static async getWallpaper(forceRefresh = false, allowNSFW = false) {
    try {
      // Try to get cached wallpaper first
      const cached = localStorage.getItem('wallpaperCache');
      const now = Date.now();
      
      // Check if we have a valid cache
      if (!forceRefresh && cached) {
        const cacheData = JSON.parse(cached);
        const { wallpaper, timestamp, cachedAllowNSFW } = cacheData;
        const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
        
        // If cache is less than 4 hours old and NSFW setting matches, return cached wallpaper
        if (now - timestamp < fourHours && cachedAllowNSFW === allowNSFW) {
          console.log('Using cached wallpaper');
          return wallpaper;
        }
      }
      
      console.log('Fetching new wallpaper');
      // Fetch new wallpaper
      const wallpaper = await this.getRandomWallpaper(allowNSFW);
      
      // Cache the new wallpaper
      const cacheData = {
        wallpaper,
        timestamp: now,
        allowNSFW
      };
      
      localStorage.setItem('wallpaperCache', JSON.stringify(cacheData));
      console.log('Cached new wallpaper');
      
      return wallpaper;
    } catch (error) {
      console.error('Error getting wallpaper:', error);
      throw error;
    }
  }
} 