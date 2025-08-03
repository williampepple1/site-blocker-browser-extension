// Settings page script for Site Blocker extension
let blockedSites = [];

document.addEventListener('DOMContentLoaded', () => {
  console.log('Settings page loaded');
  
  // Check authentication first
  checkAuthentication();
  
  // Add enter key support for input field
  document.getElementById('newSite').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSite();
    }
  });
  
  // Add logout handler
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Add time restrictions handlers
  document.getElementById('timeRestrictionsEnabled').addEventListener('change', toggleTimeRestrictionsPanel);
  document.getElementById('dailyLimitEnabled').addEventListener('change', toggleDailyLimitInput);
});

function checkAuthentication() {
  chrome.storage.local.get(['authenticated', 'authTimestamp'], (result) => {
    const now = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    
    // Check if authenticated and session is still valid
    if (result.authenticated && result.authTimestamp && (now - result.authTimestamp) < sessionTimeout) {
      // Session is valid, load settings
      loadBlockedSites();
    } else {
      // Not authenticated or session expired, redirect to login
      window.location.href = 'login.html';
    }
  });
}

function loadBlockedSites() {
  chrome.storage.sync.get(['blockedSites', 'timeRestrictions'], (result) => {
    blockedSites = result.blockedSites || [];
    displaySites();
    loadTimeRestrictions(result.timeRestrictions);
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
  const timeRestrictions = getTimeRestrictions();
  
  chrome.storage.sync.set({ 
    blockedSites: blockedSites,
    timeRestrictions: timeRestrictions
  }, () => {
    showMessage('Settings saved successfully!', 'success');
    
    // Notify background script about the change
    chrome.runtime.sendMessage({ action: 'settingsUpdated' });
  });
}

function loadTimeRestrictions(timeRestrictions) {
  if (!timeRestrictions) {
    // Set default values
    document.getElementById('timeRestrictionsEnabled').checked = false;
    document.getElementById('startTime').value = '22:00';
    document.getElementById('endTime').value = '07:00';
    document.getElementById('dailyLimitEnabled').checked = false;
    document.getElementById('dailyLimitHours').value = '2';
    return;
  }
  
  document.getElementById('timeRestrictionsEnabled').checked = timeRestrictions.enabled || false;
  document.getElementById('startTime').value = timeRestrictions.startTime || '22:00';
  document.getElementById('endTime').value = timeRestrictions.endTime || '07:00';
  document.getElementById('dailyLimitEnabled').checked = timeRestrictions.dailyLimitEnabled || false;
  document.getElementById('dailyLimitHours').value = timeRestrictions.dailyLimitHours || '2';
  
  // Set day checkboxes
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  days.forEach(day => {
    const checkbox = document.getElementById(`day${day}`);
    if (checkbox) {
      checkbox.checked = timeRestrictions.days ? timeRestrictions.days.includes(day) : true;
    }
  });
  
  toggleTimeRestrictionsPanel();
  toggleDailyLimitInput();
}

function getTimeRestrictions() {
  const enabled = document.getElementById('timeRestrictionsEnabled').checked;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const dailyLimitEnabled = document.getElementById('dailyLimitEnabled').checked;
  const dailyLimitHours = document.getElementById('dailyLimitHours').value;
  
  // Get selected days
  const days = [];
  const dayCheckboxes = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  dayCheckboxes.forEach(day => {
    const checkbox = document.getElementById(`day${day}`);
    if (checkbox && checkbox.checked) {
      days.push(day);
    }
  });
  
  return {
    enabled: enabled,
    startTime: startTime,
    endTime: endTime,
    days: days,
    dailyLimitEnabled: dailyLimitEnabled,
    dailyLimitHours: parseInt(dailyLimitHours) || 2
  };
}

function toggleTimeRestrictionsPanel() {
  const enabled = document.getElementById('timeRestrictionsEnabled').checked;
  const panel = document.getElementById('timeRestrictionsPanel');
  panel.style.display = enabled ? 'block' : 'none';
}

function toggleDailyLimitInput() {
  const enabled = document.getElementById('dailyLimitEnabled').checked;
  const input = document.getElementById('dailyLimitHours');
  input.disabled = !enabled;
  input.style.opacity = enabled ? '1' : '0.5';
}

function handleLogout() {
  chrome.storage.local.remove(['authenticated', 'authTimestamp'], () => {
    showMessage('Logged out successfully!', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
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