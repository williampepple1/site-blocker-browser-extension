// Blocked page script for Site Blocker extension
document.addEventListener('DOMContentLoaded', () => {
  console.log('Blocked page loaded');
  
  // Get the reason from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const reason = urlParams.get('reason') || 'Website is in blocked list';
  
  // Update the reason text
  const reasonElement = document.getElementById('reasonText');
  if (reasonElement) {
    reasonElement.textContent = reason;
  }
  
  // Add current time information if it's a time restriction
  if (reason.includes('time restriction')) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    
    const timeInfo = document.createElement('div');
    timeInfo.style.marginTop = '10px';
    timeInfo.style.fontSize = '14px';
    timeInfo.style.color = '#6c757d';
    timeInfo.textContent = `Current time: ${timeString} on ${dateString}`;
    
    const blockReason = document.getElementById('blockReason');
    if (blockReason) {
      blockReason.appendChild(timeInfo);
    }
  }
}); 