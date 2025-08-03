# Site Blocker - Parental Controls Browser Extension

A browser extension designed for parental controls to block access to specific websites.

## Features (Planned)

- Block access to configured websites
- Easy-to-use interface for parents
- Password protection for settings
- Time-based restrictions
- Activity logging

## Installation

1. Clone this repository
2. Open your browser's extension management page
3. Enable "Developer mode"
4. Click "Load unpacked" and select this folder

## Current Status

✅ **Step 1 Complete**: Basic extension structure
✅ **Step 2 Complete**: Website blocking functionality
✅ **Step 3 Complete**: Settings interface for managing blocked sites
✅ **Step 4 Complete**: Password protection for settings
✅ **Step 5 Complete**: Time restrictions
✅ **Step 6 Complete**: Activity logging

The extension now includes comprehensive time-based restrictions and detailed activity logging for advanced parental control.

## Files Created

- `manifest.json` - Extension configuration
- `background.js` - Background service worker with blocking logic, context menu, and time restrictions
- `popup.html` - Extension popup interface with time status
- `popup.js` - Popup functionality with toggle controls, settings link, and time status
- `blocked.html` - Page shown when accessing blocked sites with reason display
- `blocked.js` - Blocked page functionality for showing blocking reasons
- `settings.html` - Settings page for managing blocked sites and time restrictions
- `settings.js` - Settings page functionality with authentication and time management
- `password.html` - Password setup page
- `password.js` - Password setup functionality
- `login.html` - Login page for accessing settings
- `login.js` - Login authentication functionality
- `activity.html` - Activity logging page with statistics and filtering
- `activity.js` - Activity logging functionality
- `icons/` - Extension icons (PNG files created from SVG)

## Features Implemented

- ✅ Website blocking using webRequest API
- ✅ Redirect to blocked page instead of just canceling requests
- ✅ Enable/disable extension toggle
- ✅ Display list of currently blocked sites
- ✅ Default blocked sites (facebook.com, twitter.com, instagram.com)
- ✅ Settings page for adding/removing blocked sites
- ✅ Domain validation and duplicate prevention
- ✅ Context menu option to block current site
- ✅ Real-time settings updates
- ✅ Password protection for settings access
- ✅ Secure password hashing and storage
- ✅ Session management with timeout
- ✅ Password reset functionality
- ✅ Authentication required for context menu blocking
- ✅ Time-based restrictions with custom hours
- ✅ Day-of-week restrictions
- ✅ Overnight restriction support (e.g., 10 PM to 7 AM)
- ✅ Time status display in popup
- ✅ Blocking reason display on blocked page
- ✅ Daily time limit settings (UI ready)
- ✅ Comprehensive activity logging
- ✅ Activity statistics dashboard
- ✅ Filterable activity logs by type and date
- ✅ Logged events: blocked attempts, settings changes, login events
- ✅ Automatic log cleanup (keeps last 1000 entries)

## Next Steps

- Implement daily time limit functionality (UI ready, logic pending)
- Add export functionality for activity logs
- Add email notifications for blocked attempts
- Add whitelist functionality for trusted sites