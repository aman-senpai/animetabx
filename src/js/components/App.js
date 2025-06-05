import { ApiService } from '../../services/api.js';
import { ThemeHandler } from '../handlers/themeHandler.js';
import { downloadFile } from '../../utils/helpers.js';
import { CONFIG } from '../../config/config.js';

export class App {
  constructor() {
    this.wallpaperImage = document.getElementById('wallpaper-image');
    this.wallpaperLoading = document.getElementById('wallpaper-loading');
    this.downloadBtn = document.getElementById('download-btn');
    this.shuffleBtn = document.getElementById('shuffle-btn');
    this.newsContainer = document.getElementById('news-container');
    this.newsContent = document.getElementById('news-content');
    this.newsToggle = document.getElementById('news-toggle');
    this.timeElement = document.getElementById('time');
    this.dateElement = document.getElementById('date');
    this.nsfwToggle = document.getElementById('nsfw-toggle');
    this.searchInput = document.getElementById('search-input');
    this.searchBtns = document.querySelectorAll('.search-engine-btn');
    
    this.currentWallpaper = null;
    this.allowNSFW = localStorage.getItem('allowNSFW') === 'true';
    this.currentEngine = localStorage.getItem('searchEngine') || 'google'; // Load saved search engine or default to google
    this.isNewsExpanded = localStorage.getItem('newsExpanded') === 'true';
    
    this.initializeEventListeners();
    this.initClock();
    this.updateNSFWToggleState();
    this.initializeNewsSource();
    this.initializeNews();
    this.initializeNewsToggle();
  }

  initializeEventListeners() {
    this.downloadBtn.addEventListener('click', () => this.handleDownload());
    this.shuffleBtn.addEventListener('click', () => this.initWallpaper(true));
    this.nsfwToggle.addEventListener('click', () => this.toggleNSFW());
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = this.searchInput.value.trim();
        if (query) {
          chrome.search.query({ text: query });
        }
      }
    });
  }

  initializeSearch() {
    // Set up search engine buttons
    this.searchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActiveEngine(btn.dataset.engine);
      });
    });

    // Set up search input
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
      }
    });

    // Restore saved search engine state
    this.setActiveEngine(this.currentEngine);
  }

  setActiveEngine(engine) {
    this.searchBtns.forEach(btn => {
      if (btn.dataset.engine === engine) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.currentEngine = engine;
    // Save the selected engine to localStorage
    localStorage.setItem('searchEngine', engine);
  }

  performSearch() {
    const query = this.searchInput.value.trim();
    if (!query) return;

    let searchUrl;

    switch (this.currentEngine) {
      case 'google':
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'duckduckgo':
        searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        break;
      case 'gemini':
        searchUrl = `https://gemini.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'anime':
        searchUrl = `https://hianimez.to/search?keyword=${encodeURIComponent(query)}`;
        break;
    }

    window.location.href = searchUrl;
  }

  updateNSFWToggleState() {
    this.nsfwToggle.textContent = this.allowNSFW ? 'NSFW' : 'SFW';
    if (this.allowNSFW) {
      this.nsfwToggle.classList.add('active');
    } else {
      this.nsfwToggle.classList.remove('active');
    }
  }

  toggleNSFW() {
    this.allowNSFW = !this.allowNSFW;
    this.updateNSFWToggleState();
    
    // Save the preference
    localStorage.setItem('allowNSFW', this.allowNSFW);
    
    // Refresh the wallpaper with new setting
    this.initWallpaper(true);
  }

  async loadNSFWPreference() {
    const allowNSFW = localStorage.getItem('allowNSFW') === 'true';
    this.allowNSFW = allowNSFW;
    if (this.allowNSFW) {
      this.nsfwToggle.classList.add('active');
    }
  }

  async loadCachedWallpaper() {
    try {
      const cached = localStorage.getItem('wallpaperCache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        const { wallpaper, allowNSFW } = cacheData;
        this.allowNSFW = allowNSFW;
        if (this.allowNSFW) {
          this.nsfwToggle.classList.add('active');
        }
        this.updateWallpaper(wallpaper);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading cached wallpaper:', error);
      return false;
    }
  }

  async handleDownload() {
    if (this.currentWallpaper) {
      try {
        // Get file extension from URL
        const url = new URL(this.currentWallpaper.url);
        const extension = url.pathname.split('.').pop() || 'jpg';
        
        // Create filename with timestamp and source
        const source = this.currentWallpaper.source.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const filename = `anime_wallpaper_${source}_${Date.now()}.${extension}`;
        
        // Use Chrome's download API
        await chrome.downloads.download({
          url: this.currentWallpaper.url,
          filename: filename,
          saveAs: false
        });
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to old method if Chrome API fails
        downloadFile(
          this.currentWallpaper.url,
          `anime_wallpaper_${Date.now()}.jpg`
        );
      }
    }
  }

  updateWallpaper(wallpaper) {
    // Update image source
    this.wallpaperImage.src = wallpaper.url;
    
    // Set alt text based on available data
    let altText = wallpaper.title;
    if (wallpaper.artist) {
      altText = `Art by ${wallpaper.artist}`;
    } else if (wallpaper.tags && wallpaper.tags.length > 0) {
      altText = wallpaper.tags
        .filter(tag => !tag.includes('exposed_') && !tag.includes('_breasts'))
        .map(tag => tag.replace(/_/g, ' '))
        .join(', ');
    }
    this.wallpaperImage.alt = altText;
    
    // Apply color theme if available
    if (wallpaper.colorPalette) {
      ThemeHandler.applyColorTheme(wallpaper.colorPalette);
    }
    
    // Handle image loading
    this.wallpaperImage.onload = () => {
      this.wallpaperLoading.classList.add('hidden');
      this.wallpaperImage.classList.remove('hidden');
      
      // Update download button title with image info
      if (this.downloadBtn) {
        const sourceText = wallpaper.source !== 'Nekos.best' ? `Source: ${wallpaper.source}` : '';
        const artistText = wallpaper.artist ? `Artist: ${wallpaper.artist}` : '';
        const infoText = [sourceText, artistText].filter(Boolean).join(' | ');
        this.downloadBtn.title = infoText || 'Download wallpaper';
      }
    };
    
    this.currentWallpaper = wallpaper;
  }

  async initWallpaper(forceRefresh = false) {
    try {
      // If not forcing refresh, try to load cached wallpaper first
      if (!forceRefresh) {
        const hasCache = await this.loadCachedWallpaper();
        if (hasCache) {
          return;
        }
      }

      this.wallpaperLoading.classList.remove('hidden');
      this.wallpaperImage.classList.add('hidden');
      
      const wallpaper = await ApiService.getWallpaper(forceRefresh, this.allowNSFW);
      this.updateWallpaper(wallpaper);
    } catch (error) {
      this.wallpaperLoading.innerHTML = `
        <div class="absolute inset-0 flex items-center justify-center">
          <p class="text-gray-400">${error.message}</p>
        </div>
      `;
    }
  }

  updateNews(news) {
    this.newsContainer.innerHTML = news.map(item => `
      <div class="news-item">
        <h3 class="news-title">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
        </h3>
        <p class="news-description">${item.description}</p>
      </div>
    `).join('');
  }

  async initNews() {
    try {
      const source = localStorage.getItem('newsSource') || CONFIG.news.defaultSource;
      const sourceConfig = CONFIG.news.sources[source];
      
      if (source === 'anime') {
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.animenewsnetwork.com/news/rss.xml?ann-edition=us');
        console.log('Fetching news from:', proxyUrl);
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.getElementsByTagName('item');
        
        const news = Array.from(items)
          .slice(0, CONFIG.news.itemsPerPage)
          .map(item => ({
            title: item.getElementsByTagName('title')[0]?.textContent || '',
            link: item.getElementsByTagName('link')[0]?.textContent || '',
            description: item.getElementsByTagName('description')[0]?.textContent || ''
          }));
        
        this.updateNews(news);
      } else if (source === 'hackernews') {
        const response = await fetch(sourceConfig.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const storyIds = await response.json();
        const stories = await Promise.all(
          storyIds.slice(0, CONFIG.news.itemsPerPage).map(id =>
            fetch(`${sourceConfig.itemUrl}${id}.json`).then(res => res.json())
          )
        );
        
        const news = stories.map(story => ({
          title: story.title,
          link: story.url || `${sourceConfig.fallback.url}item?id=${story.id}`,
          description: `${story.score} points by ${story.by}`
        }));
        
        this.updateNews(news);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      this.newsContainer.innerHTML = `
        <div class="news-item">
          <p class="text-gray-400">Failed to load news: ${error.message}</p>
        </div>
      `;
    }
  }

  initClock() {
    const updateClock = () => {
      const now = new Date();
      
      // Format time (HH:MM AM/PM)
      const time = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Format date (Day, Month Date)
      const date = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      
      this.timeElement.textContent = time;
      this.dateElement.textContent = date;
    };

    // Update immediately and then every minute
    updateClock();
    setInterval(updateClock, 60000);
  }

  async init() {
    await Promise.all([
      ThemeHandler.loadSavedTheme(),
      this.loadNSFWPreference(),
      this.initWallpaper(false), // Don't force refresh on init
      this.initNews()
    ]);
  }

  initializeNewsSource() {
    const newsSourceButtons = document.querySelectorAll('.news-source-btn');
    const savedSource = localStorage.getItem('newsSource') || 'anime';

    newsSourceButtons.forEach(button => {
      if (button.dataset.source === savedSource) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }

      button.addEventListener('click', () => {
        newsSourceButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        localStorage.setItem('newsSource', button.dataset.source);
        this.fetchNews();
      });
    });
  }

  async fetchNews() {
    const newsContainer = document.getElementById('news-container');
    const source = localStorage.getItem('newsSource') || CONFIG.news.defaultSource;
    
    // Create loading skeleton
    const loadingSkeleton = Array(CONFIG.news.itemsPerPage).fill(`
      <div class="news-item animate-pulse">
        <div class="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-white/10 rounded w-1/2"></div>
      </div>
    `).join('');
    
    newsContainer.innerHTML = loadingSkeleton;

    try {
      let news;
      const sourceConfig = CONFIG.news.sources[source];

      if (source === 'anime') {
        try {
          const response = await chrome.runtime.sendMessage({
            type: 'fetchRSS',
            url: sourceConfig.url
          });

          if (!response.success) {
            throw new Error(response.error || 'Failed to fetch RSS feed');
          }

          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response.data, 'text/xml');
          const items = xmlDoc.getElementsByTagName('item');

          news = Array.from(items).slice(0, CONFIG.news.itemsPerPage).map(item => {
            const title = item.getElementsByTagName('title')[0]?.textContent || '';
            const link = item.getElementsByTagName('link')[0]?.textContent || '';
            const description = item.getElementsByTagName('description')[0]?.textContent || '';
            const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent || '';
            
            const cleanDescription = description
              .replace(/<[^>]*>/g, '')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 150) + '...';
            
            return {
              title: title,
              url: link,
              description: cleanDescription,
              date: new Date(pubDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            };
          });

          if (news.length < CONFIG.news.itemsPerPage) {
            const fallbackNews = {
              title: sourceConfig.fallback.title,
              url: sourceConfig.fallback.url,
              description: sourceConfig.fallback.description,
              date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            };
            while (news.length < CONFIG.news.itemsPerPage) {
              news.push(fallbackNews);
            }
          }
        } catch (error) {
          console.error('Error fetching anime news:', error);
          news = Array(CONFIG.news.itemsPerPage).fill(null).map(() => ({
            title: sourceConfig.fallback.title,
            url: sourceConfig.fallback.url,
            description: sourceConfig.fallback.description,
            date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }));
        }
      } else if (source === 'hackernews') {
        try {
          const response = await fetch(sourceConfig.url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const storyIds = await response.json();
          const stories = await Promise.all(
            storyIds.slice(0, CONFIG.news.itemsPerPage).map(id =>
              fetch(`${sourceConfig.itemUrl}${id}.json`).then(res => res.json())
            )
          );
          news = stories.map(story => ({
            title: story.title,
            url: story.url || `${sourceConfig.fallback.url}item?id=${story.id}`,
            description: `${story.score} points by ${story.by}`,
            date: new Date(story.time * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }));
        } catch (error) {
          console.error('Error fetching Hacker News:', error);
          news = Array(CONFIG.news.itemsPerPage).fill(null).map(() => ({
            title: sourceConfig.fallback.title,
            url: sourceConfig.fallback.url,
            description: sourceConfig.fallback.description,
            date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }));
        }
      }

      if (!news || news.length === 0) {
        throw new Error('No news items found');
      }

      // Update news content with a smooth transition
      newsContainer.style.opacity = '0';
      setTimeout(() => {
        newsContainer.innerHTML = news.map(item => `
          <div class="news-item">
            <h3 class="news-title">
              <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
            </h3>
            <p class="news-description">${item.description}</p>
            <p class="text-gray-400 text-sm mt-2">${item.date}</p>
          </div>
        `).join('');
        newsContainer.style.opacity = '1';
      }, 150);
    } catch (error) {
      console.error('Error fetching news:', error);
      newsContainer.innerHTML = `
        <div class="news-item">
          <h3 class="news-title">
            <a href="#" class="text-red-400">Failed to load news</a>
          </h3>
          <p class="news-description">Please try again later or switch to a different news source.</p>
        </div>
      `;
    }
  }

  initializeNews() {
    this.fetchNews();
    // Refresh news based on config interval
    setInterval(() => this.fetchNews(), CONFIG.news.refreshInterval);
  }

  initializeNewsToggle() {
    // Set initial state
    this.updateNewsToggleState();

    // Add click handler to the toggle button
    this.newsToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click from bubbling to document
      this.isNewsExpanded = !this.isNewsExpanded;
      this.updateNewsToggleState();
      localStorage.setItem('newsExpanded', this.isNewsExpanded);
    });

    // Add click handler to the news content to prevent closing when clicking inside
    this.newsContent.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click from bubbling to document
    });

    // Add click handler to document to close news when clicking outside
    document.addEventListener('click', () => {
      if (this.isNewsExpanded) {
        this.isNewsExpanded = false;
        this.updateNewsToggleState();
        localStorage.setItem('newsExpanded', this.isNewsExpanded);
      }
    });
  }

  updateNewsToggleState() {
    if (this.isNewsExpanded) {
      this.newsContent.classList.remove('hidden');
      document.querySelector('.news-container').classList.add('expanded');
      document.querySelector('.news-container').classList.remove('collapsed');
    } else {
      this.newsContent.classList.add('hidden');
      document.querySelector('.news-container').classList.add('collapsed');
      document.querySelector('.news-container').classList.remove('expanded');
    }
  }
} 