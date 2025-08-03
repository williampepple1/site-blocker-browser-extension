// Login script for Site Blocker extension
document.addEventListener('DOMContentLoaded', () => {
  console.log('Login page loaded');
  
  // Add form submit handler
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Add forgot password handler
  document.getElementById('resetPassword').addEventListener('click', handleResetPassword);
  
  // Add enter key support
  document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  });
});

function handleLogin(e) {
  e.preventDefault();
  
  const password = document.getElementById('password').value;
  
  if (!password) {
    showMessage('Please enter your password', 'error');
    return;
  }
  
  // Hash the entered password
  const hashedPassword = simpleHash(password);
  
  // Check against stored password
  chrome.storage.sync.get(['passwordHash'], (result) => {
    if (result.passwordHash === hashedPassword) {
      // Password correct, set session and redirect to settings
      chrome.storage.local.set({ 
        authenticated: true,
        authTimestamp: Date.now()
      }, () => {
        // Log successful login
        logActivity('login', 'Settings accessed successfully');
        showMessage('Login successful! Redirecting...', 'info');
        setTimeout(() => {
          window.location.href = 'settings.html';
        }, 1000);
      });
    } else {
      showMessage('Incorrect password. Please try again.', 'error');
      document.getElementById('password').value = '';
      document.getElementById('password').focus();
    }
  });
}

function handleResetPassword(e) {
  e.preventDefault();
  
  if (confirm('This will reset your password. You will need to set a new password. Continue?')) {
    chrome.storage.sync.remove(['passwordHash', 'passwordSet'], () => {
      showMessage('Password reset. Redirecting to password setup...', 'info');
      setTimeout(() => {
        window.location.href = 'password.html';
      }, 1500);
    });
  }
}

function simpleHash(str) {
  // Same hash function as in password.js
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString();
}

function logActivity(type, details) {
  const logEntry = {
    type: type,
    details: details,
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

function showMessage(text, type) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = text;
  messageElement.className = `message ${type}`;
  messageElement.style.display = 'block';
  
  // Hide error messages after 5 seconds, info messages after 3 seconds
  const timeout = type === 'error' ? 5000 : 3000;
  setTimeout(() => {
    messageElement.style.display = 'none';
  }, timeout);
} 