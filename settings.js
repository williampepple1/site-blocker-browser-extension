// Settings page script for Site Blocker extension
let blockedSites = [];

document.addEventListener('DOMContentLoaded', () => {
  console.log('Settings page loaded');
  loadBlockedSites();
  
  // Add enter key support for input field
  document.getElementById('newSite').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSite();
    }
  });
});

function loadBlockedSites() {
  chrome.storage.sync.get(['blockedSites'], (result) => {
    blockedSites = result.blockedSites || [];
    displaySites();
  });
}

function displaySites() {
  const siteList = document.getElementById('siteList');
  
  if (blockedSites.length === 0) {
    siteList.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">No sites are currently blocked</p>';
    return;
  }
  
  siteList.innerHTML = blockedSites.map((site, index) => `
    <div class="site-item">
      <span class="site-name">${site}</span>
      <button class="remove-btn" onclick="removeSite(${index})">Remove</button>
    </div>
  `).join('');
}

function addSite() {
  const input = document.getElementById('newSite');
  const site = input.value.trim().toLowerCase();
  
  if (!site) {
    showMessage('Please enter a domain name', 'error');
    return;
  }
  
  // Basic validation for domain format
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(site)) {
    showMessage('Please enter a valid domain name (e.g., facebook.com)', 'error');
    return;
  }
  
  // Check if site already exists
  if (blockedSites.includes(site)) {
    showMessage('This site is already in the blocked list', 'error');
    return;
  }
  
  blockedSites.push(site);
  displaySites();
  input.value = '';
  showMessage(`Added ${site} to blocked sites`, 'success');
}

function removeSite(index) {
  const removedSite = blockedSites[index];
  blockedSites.splice(index, 1);
  displaySites();
  showMessage(`Removed ${removedSite} from blocked sites`, 'success');
}

function saveSettings() {
  chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
    showMessage('Settings saved successfully!', 'success');
    
    // Notify background script about the change
    chrome.runtime.sendMessage({ action: 'settingsUpdated' });
  });
}

function showMessage(text, type) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = text;
  messageElement.className = `message ${type}`;
  messageElement.style.display = 'block';
  
  // Hide message after 3 seconds
  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 3000);
} 