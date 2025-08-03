// Background script for Site Blocker extension
console.log('Site Blocker extension loaded');

// Initialize blocked sites from storage
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  
  // Set default blocked sites if none exist
  chrome.storage.sync.get(['blockedSites'], (result) => {
    if (!result.blockedSites) {
      chrome.storage.sync.set({
        blockedSites: [
          'facebook.com',
          'twitter.com',
          'instagram.com'
        ]
      });
    }
  });
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'blockSite',
    title: 'Block this site',
    contexts: ['page']
  });
});

// Listen for settings updates and context menu clicks
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'settingsUpdated') {
    console.log('Settings updated, reloading blocked sites');
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'blockSite') {
    const url = new URL(tab.url);
    const hostname = url.hostname.toLowerCase();
    
    // Remove www. prefix if present
    const domain = hostname.replace(/^www\./, '');
    
    chrome.storage.sync.get(['blockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      
      if (blockedSites.includes(domain)) {
        alert(`${domain} is already blocked!`);
      } else {
        blockedSites.push(domain);
        chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
          alert(`${domain} has been added to blocked sites!`);
        });
      }
    });
  }
});

// Block web requests to configured sites
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Check if extension is enabled
    return new Promise((resolve) => {
      chrome.storage.sync.get(['enabled', 'blockedSites'], (result) => {
        const isEnabled = result.enabled !== false; // Default to true
        const blockedSites = result.blockedSites || [];
        
        if (!isEnabled) {
          resolve({ cancel: false });
          return;
        }
        
        const url = new URL(details.url);
        const hostname = url.hostname.toLowerCase();
        
        // Check if the hostname matches any blocked sites
        const isBlocked = blockedSites.some(site => {
          const blockedSite = site.toLowerCase();
          return hostname === blockedSite || hostname.endsWith('.' + blockedSite);
        });
        
        if (isBlocked) {
          console.log(`Blocked access to: ${hostname}`);
          // Redirect to blocked page instead of just canceling
          resolve({ redirectUrl: chrome.runtime.getURL('blocked.html') });
        } else {
          resolve({ cancel: false });
        }
      });
    });
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
); 