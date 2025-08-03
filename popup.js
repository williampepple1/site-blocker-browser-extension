// Popup script for Site Blocker extension
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded');
  
  // Check if extension is enabled
  chrome.storage.sync.get(['enabled'], (result) => {
    const isEnabled = result.enabled !== false; // Default to true
    updateStatus(isEnabled);
  });
});

function updateStatus(enabled) {
  const statusElement = document.getElementById('status');
  if (enabled) {
    statusElement.textContent = 'Extension is active';
    statusElement.className = 'status enabled';
  } else {
    statusElement.textContent = 'Extension is disabled';
    statusElement.className = 'status disabled';
  }
} 