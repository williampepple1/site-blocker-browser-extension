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
}); 