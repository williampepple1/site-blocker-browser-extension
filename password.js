// Password setup script for Site Blocker extension
document.addEventListener('DOMContentLoaded', () => {
  console.log('Password setup page loaded');
  
  // Check if password is already set
  chrome.storage.sync.get(['passwordSet'], (result) => {
    if (result.passwordSet) {
      // Password already set, redirect to settings
      window.location.href = 'settings.html';
    }
  });
  
  // Add form submit handler
  document.getElementById('passwordForm').addEventListener('submit', handlePasswordSetup);
});

function handlePasswordSetup(e) {
  e.preventDefault();
  
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validate password
  if (!validatePassword(password, confirmPassword)) {
    return;
  }
  
  // Hash the password (simple hash for demo - in production use proper hashing)
  const hashedPassword = simpleHash(password);
  
  // Save the hashed password
  chrome.storage.sync.set({
    passwordHash: hashedPassword,
    passwordSet: true
  }, () => {
    showMessage('Password set successfully! Redirecting to settings...', 'info');
    
    // Redirect to settings after a short delay
    setTimeout(() => {
      window.location.href = 'settings.html';
    }, 1500);
  });
}

function validatePassword(password, confirmPassword) {
  // Check if passwords match
  if (password !== confirmPassword) {
    showMessage('Passwords do not match!', 'error');
    return false;
  }
  
  // Check minimum length
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters long!', 'error');
    return false;
  }
  
  // Check if password is not too simple
  if (password.toLowerCase() === 'password' || password.toLowerCase() === '123456') {
    showMessage('Please choose a more secure password!', 'error');
    return false;
  }
  
  return true;
}

function simpleHash(str) {
  // Simple hash function for demo purposes
  // In a real application, use proper cryptographic hashing
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString();
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