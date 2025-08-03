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
    // Check if password is set
    chrome.storage.sync.get(['passwordSet'], (result) => {
      if (!result.passwordSet) {
        alert('Please set up a password first to use this feature!');
        return;
      }
      
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
    });
  }
});

// Block web requests to configured sites
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Check if extension is enabled
    return new Promise((resolve) => {
      chrome.storage.sync.get(['enabled', 'blockedSites', 'timeRestrictions'], (result) => {
        const isEnabled = result.enabled !== false; // Default to true
        const blockedSites = result.blockedSites || [];
        const timeRestrictions = result.timeRestrictions || {};
        
        if (!isEnabled) {
          resolve({ cancel: false });
          return;
        }
        
        // Check time restrictions
        if (timeRestrictions.enabled && !isWithinAllowedTime(timeRestrictions)) {
          console.log('Access blocked due to time restrictions');
          logActivity('blocked', 'Access blocked due to time restrictions', details.url);
          resolve({ redirectUrl: chrome.runtime.getURL('blocked.html?reason=Time restriction active') });
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
          logActivity('blocked', `Blocked access to ${hostname}`, details.url);
          // Redirect to blocked page instead of just canceling
          resolve({ redirectUrl: chrome.runtime.getURL('blocked.html?reason=Website is in blocked list') });
        } else {
          resolve({ cancel: false });
        }
      });
    });
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Function to check if current time is within allowed hours
function isWithinAllowedTime(timeRestrictions) {
  if (!timeRestrictions.enabled) return true;
  
  const now = new Date();
  const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes
  
  // Check if current day is allowed
  if (!timeRestrictions.days || !timeRestrictions.days.includes(currentDay)) {
    return false;
  }
  
  // Parse start and end times
  const startTime = timeRestrictions.startTime || '22:00';
  const endTime = timeRestrictions.endTime || '07:00';
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  // Handle overnight restrictions (e.g., 22:00 to 07:00)
  if (startMinutes > endMinutes) {
    // Overnight restriction
    return currentTime >= startMinutes || currentTime <= endMinutes;
  } else {
    // Same day restriction
    return currentTime >= startMinutes && currentTime <= endMinutes;
  }
}

// Function to log activity
function logActivity(type, details, url = null) {
  const logEntry = {
    type: type,
    details: details,
    url: url,
    timestamp: Date.now()
  };
  
  chrome.storage.local.get(['activityLogs'], (result) => {
    const logs = result.activityLogs || [];
    logs.push(logEntry);
    
    // Keep only last 1000 logs to prevent storage bloat
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    chrome.storage.local.set({ activityLogs: logs });
  });
} 