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
  chrome.storage.local.get(['enabled'], (result) => {
    const isEnabled = result.enabled !== false; // Default to true
    updateStatus(isEnabled);
  });
}

function loadBlockedSites() {
  chrome.storage.local.get(['blockedSites', 'timeRestrictions'], (result) => {
    const blockedSites = result.blockedSites || [];
    const timeRestrictions = result.timeRestrictions || {};
    const siteListElement = document.getElementById('siteList');
    
    if (blockedSites.length === 0) {
      siteListElement.innerHTML = '<div class="site-item">No sites blocked</div>';
    } else {
      siteListElement.innerHTML = blockedSites.map(site => 
        `<div class="site-item">• ${site}</div>`
      ).join('');
    }
    
    loadTimeStatus(timeRestrictions);
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
  chrome.storage.local.get(['enabled'], (result) => {
    const currentStatus = result.enabled !== false; // Default to true
    const newStatus = !currentStatus;
    
    chrome.storage.local.set({ enabled: newStatus }, () => {
      updateStatus(newStatus);
      console.log(`Extension ${newStatus ? 'enabled' : 'disabled'}`);
    });
  });
}

function loadTimeStatus(timeRestrictions) {
  const timeStatusElement = document.getElementById('timeStatus');
  
  if (!timeRestrictions.enabled) {
    timeStatusElement.innerHTML = '<div class="site-item">Time restrictions disabled</div>';
    return;
  }
  
  const now = new Date();
  const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const startTime = timeRestrictions.startTime || '22:00';
  const endTime = timeRestrictions.endTime || '07:00';
  const days = timeRestrictions.days || [];
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  let isActive = false;
  if (days.includes(currentDay)) {
    if (startMinutes > endMinutes) {
      // Overnight restriction
      isActive = currentTime >= startMinutes || currentTime <= endMinutes;
    } else {
      // Same day restriction
      isActive = currentTime >= startMinutes && currentTime <= endMinutes;
    }
  }
  
  const status = isActive ? 'Active' : 'Inactive';
  const statusColor = isActive ? '#dc3545' : '#28a745';
  
  timeStatusElement.innerHTML = `
    <div class="site-item" style="color: ${statusColor}; font-weight: bold;">• ${status}</div>
    <div class="site-item">• ${startTime} - ${endTime}</div>
    <div class="site-item">• Days: ${days.join(', ')}</div>
  `;
}

function openSettings() {
  // Check if password is set
  chrome.storage.sync.get(['passwordSet'], (result) => {
    if (result.passwordSet) {
      // Password is set, go to login page
      chrome.tabs.create({ url: chrome.runtime.getURL('login.html') });
    } else {
      // No password set, go to password setup
      chrome.tabs.create({ url: chrome.runtime.getURL('password.html') });
    }
  });
} 