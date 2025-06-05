export const CONFIG = {
  API: {
    ANIME_RANDOM: 'https://api.jikan.moe/v4/random/anime',
    WALLPAPER: 'https://api.waifu.im/search',
    NEKO: 'https://api.nekos.best/v2'
  },
  UI: {
    NEWS_ITEMS_LIMIT: 10,
    WALLPAPER_OPACITY: 'cc', // 80% opacity
    BORDER_OPACITY: '4d'     // 30% opacity
  },
  STORAGE_KEYS: {
    LAST_WALLPAPER: 'lastWallpaper',
    THEME: 'theme'
  },
  news: {
    sources: {
      anime: {
        name: 'Anime News Network',
        url: 'https://www.animenewsnetwork.com/news/rss.xml?ann-edition=us',
        fallback: {
          title: 'Anime News Network',
          url: 'https://www.animenewsnetwork.com/news/',
          description: 'Visit Anime News Network for the latest anime news and updates'
        }
      },
      hackernews: {
        name: 'Hacker News',
        url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
        itemUrl: 'https://hacker-news.firebaseio.com/v0/item/',
        fallback: {
          title: 'Hacker News',
          url: 'https://news.ycombinator.com/',
          description: 'Visit Hacker News for the latest tech news and discussions'
        }
      }
    },
    defaultSource: 'anime',
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    itemsPerPage: 10
  }
}; 