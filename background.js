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
            // Update blocking rules after adding site
            updateBlockingRules();
          });
        }
      });
    });
  }
});

// Function to update blocking rules based on settings
function updateBlockingRules() {
  chrome.storage.sync.get(['enabled', 'blockedSites', 'timeRestrictions'], (result) => {
    const isEnabled = result.enabled !== false; // Default to true
    const blockedSites = result.blockedSites || [];
    const timeRestrictions = result.timeRestrictions || {};
    
    if (!isEnabled) {
      // Disable all rules if extension is disabled
      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // Remove any existing rules
      });
      return;
    }
    
    // Check time restrictions
    if (timeRestrictions.enabled && !isWithinAllowedTime(timeRestrictions)) {
      // Add time restriction rule
      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Remove existing rules
        addRules: [{
          id: 1,
          priority: 1,
          action: {
            type: "redirect",
            redirect: {
              url: chrome.runtime.getURL('blocked.html?reason=Time restriction active')
            }
          },
          condition: {
            urlFilter: "*",
            resourceTypes: ["main_frame"]
          }
        }]
      });
      return;
    }
    
    // Create rules for blocked sites
    const rules = blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          url: chrome.runtime.getURL('blocked.html?reason=Website is in blocked list')
        }
      },
      condition: {
        urlFilter: `||${site}/*`,
        resourceTypes: ["main_frame"]
      }
    }));
    
    // Update rules
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Remove existing rules
      addRules: rules
    });
  });
}

// Update rules when extension starts
updateBlockingRules();

// Listen for settings updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'settingsUpdated') {
    console.log('Settings updated, updating blocking rules');
    updateBlockingRules();
  }
});

// Listen for storage changes to update rules automatically
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.blockedSites || changes.enabled || changes.timeRestrictions)) {
    console.log('Storage changed, updating blocking rules');
    updateBlockingRules();
  }
});

// Listen for tab updates to log blocked attempts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if this is a blocked page
    if (tab.url.includes('blocked.html')) {
      const urlParams = new URLSearchParams(tab.url.split('?')[1] || '');
      const reason = urlParams.get('reason') || 'Website is in blocked list';
      
      // Get the original URL from the referrer or session storage
      chrome.storage.local.get(['lastBlockedUrl'], (result) => {
        if (result.lastBlockedUrl) {
          logActivity('blocked', `Blocked access - ${reason}`, result.lastBlockedUrl);
          chrome.storage.local.remove(['lastBlockedUrl']);
        }
      });
    } else {
      // Store the URL in case it gets blocked
      chrome.storage.local.set({ lastBlockedUrl: tab.url });
    }
  }
});

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