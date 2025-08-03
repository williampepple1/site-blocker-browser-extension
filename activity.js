// Activity logging script for Site Blocker extension
let allLogs = [];
let filteredLogs = [];

document.addEventListener('DOMContentLoaded', () => {
  console.log('Activity page loaded');
  
  // Check authentication first
  checkAuthentication();
  
  // Set default date range (last 7 days)
  setDefaultDateRange();
});

function checkAuthentication() {
  chrome.storage.local.get(['authenticated', 'authTimestamp'], (result) => {
    const now = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    
    // Check if authenticated and session is still valid
    if (result.authenticated && result.authTimestamp && (now - result.authTimestamp) < sessionTimeout) {
      // Session is valid, load logs
      loadActivityLogs();
    } else {
      // Not authenticated or session expired, redirect to login
      window.location.href = 'login.html';
    }
  });
}

function setDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
  document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
}

function loadActivityLogs() {
  chrome.storage.local.get(['activityLogs'], (result) => {
    allLogs = result.activityLogs || [];
    filteredLogs = [...allLogs];
    
    updateStatistics();
    displayLogs();
  });
}

function updateStatistics() {
  const today = new Date().toDateString();
  
  const totalBlocked = allLogs.filter(log => log.type === 'blocked').length;
  const todayBlocked = allLogs.filter(log => 
    log.type === 'blocked' && new Date(log.timestamp).toDateString() === today
  ).length;
  const totalLogins = allLogs.filter(log => log.type === 'login').length;
  const totalChanges = allLogs.filter(log => log.type === 'settings').length;
  
  document.getElementById('totalBlocked').textContent = totalBlocked;
  document.getElementById('todayBlocked').textContent = todayBlocked;
  document.getElementById('totalLogins').textContent = totalLogins;
  document.getElementById('totalChanges').textContent = totalChanges;
}

function displayLogs() {
  const tbody = document.getElementById('logTableBody');
  
  if (filteredLogs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="no-logs">No activity logs found for the selected criteria.</td>
      </tr>
    `;
    return;
  }
  
  // Sort logs by timestamp (newest first)
  const sortedLogs = filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
  
  tbody.innerHTML = sortedLogs.map(log => {
    const date = new Date(log.timestamp);
    const timeString = date.toLocaleString();
    const dateString = date.toDateString();
    
    return `
      <tr>
        <td>
          <div class="log-time">${dateString}</div>
          <div>${timeString}</div>
        </td>
        <td>
          <span class="log-type ${log.type}">${getTypeLabel(log.type)}</span>
        </td>
        <td class="log-entry">${log.details}</td>
        <td>${log.url || '-'}</td>
      </tr>
    `;
  }).join('');
}

function getTypeLabel(type) {
  const labels = {
    'blocked': 'Blocked',
    'settings': 'Settings',
    'login': 'Login'
  };
  return labels[type] || type;
}

function filterLogs() {
  const typeFilter = document.getElementById('typeFilter').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  filteredLogs = allLogs.filter(log => {
    // Type filter
    if (typeFilter !== 'all' && log.type !== typeFilter) {
      return false;
    }
    
    // Date filter
    if (startDate && endDate) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (logDate < startDate || logDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
  
  displayLogs();
}

function clearFilters() {
  document.getElementById('typeFilter').value = 'all';
  setDefaultDateRange();
  filteredLogs = [...allLogs];
  displayLogs();
}

function clearLogs() {
  if (confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
    chrome.storage.local.remove(['activityLogs'], () => {
      allLogs = [];
      filteredLogs = [];
      updateStatistics();
      displayLogs();
    });
  }
} 