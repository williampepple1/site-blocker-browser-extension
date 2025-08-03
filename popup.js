// Popup script for Site Blocker extension
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded');
  
  loadExtensionStatus();
  loadBlockedSites();
  
  // Add event listener for toggle button
  document.getElementById('toggleButton').addEventListener('click', toggleExtension);
  
  // Add event listener for settings link
  document.getElementById('settingsLink').addEventListener('click', openSettings);
});

function loadExtensionStatus() {
  // Check if extension is enabled
  chrome.storage.sync.get(['enabled'], (result) => {
    const isEnabled = result.enabled !== false; // Default to true
    updateStatus(isEnabled);
  });
}

function loadBlockedSites() {
  chrome.storage.sync.get(['blockedSites'], (result) => {
    const blockedSites = result.blockedSites || [];
    const siteListElement = document.getElementById('siteList');
    
    if (blockedSites.length === 0) {
      siteListElement.innerHTML = '<div class="site-item">No sites blocked</div>';
    } else {
      siteListElement.innerHTML = blockedSites.map(site => 
        `<div class="site-item">• ${site}</div>`
      ).join('');
    }
  });
}

function updateStatus(enabled) {
  const statusElement = document.getElementById('status');
  const toggleButton = document.getElementById('toggleButton');
  
  if (enabled) {
    statusElement.textContent = 'Extension is active';
    statusElement.className = 'status enabled';
    toggleButton.textContent = 'Disable Extension';
    toggleButton.className = 'toggle-button';
  } else {
    statusElement.textContent = 'Extension is disabled';
    statusElement.className = 'status disabled';
    toggleButton.textContent = 'Enable Extension';
    toggleButton.className = 'toggle-button disabled';
  }
}

function toggleExtension() {
  chrome.storage.sync.get(['enabled'], (result) => {
    const currentStatus = result.enabled !== false; // Default to true
    const newStatus = !currentStatus;
    
    chrome.storage.sync.set({ enabled: newStatus }, () => {
      updateStatus(newStatus);
      console.log(`Extension ${newStatus ? 'enabled' : 'disabled'}`);
    });
  });
}

function openSettings() {
  chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
} 