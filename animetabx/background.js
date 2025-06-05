// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AnimeTabX installed');
});

// Helper function to fetch with retries
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

// Listen for messages from the new tab page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'INITIAL_FETCH') {
    // Handle initial data fetch if needed
    console.log('Initial fetch requested');
  }
  if (request.type === 'fetch') {
    if (!request.url) {
      console.error('No URL provided for fetch request');
      sendResponse({ success: false, error: 'No URL provided' });
      return true;
    }

    console.log('Fetching URL:', request.url);
    fetchWithRetry(request.url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': chrome.runtime.getURL('')
      },
      mode: 'cors',
      credentials: 'omit'
    })
      .then(response => response.text())
      .then(data => {
        console.log('Fetch successful, data length:', data.length);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Background fetch error:', error);
        console.error('Failed URL:', request.url);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
  if (request.type === 'fetchRSS') {
    if (!request.url) {
      console.error('No RSS URL provided');
      sendResponse({ success: false, error: 'No RSS URL provided' });
      return true;
    }

    console.log('Fetching RSS from:', request.url);
    
    // Try direct fetch first
    fetchWithRetry(request.url, {
      headers: {
        'Accept': 'application/xml, text/xml, */*',
        'Content-Type': 'application/xml',
        'Origin': chrome.runtime.getURL('')
      },
      mode: 'cors',
      credentials: 'omit'
    })
      .then(response => response.text())
      .then(data => {
        console.log('RSS Fetch successful, data length:', data.length);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Direct RSS fetch failed, trying proxy:', error);
        // If direct fetch fails, try using allorigins proxy
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(request.url)}`;
        return fetchWithRetry(proxyUrl, {
          headers: {
            'Accept': 'application/xml, text/xml, */*',
            'Content-Type': 'application/xml',
            'Origin': chrome.runtime.getURL('')
          },
          mode: 'cors',
          credentials: 'omit'
        })
          .then(response => response.text())
          .then(data => {
            console.log('Proxy RSS Fetch successful, data length:', data.length);
            sendResponse({ success: true, data });
          })
          .catch(error => {
            console.error('Proxy RSS fetch failed:', error);
            sendResponse({ success: false, error: error.message });
          });
      });
    return true; // Keep the message channel open for async response
  }
}); 