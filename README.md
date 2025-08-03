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

The extension now actively blocks access to configured websites and shows a blocked page when users try to access them.

## Files Created

- `manifest.json` - Extension configuration
- `background.js` - Background service worker with blocking logic
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality with toggle controls
- `blocked.html` - Page shown when accessing blocked sites
- `icons/` - Extension icons (to be added)

## Features Implemented

- ✅ Website blocking using webRequest API
- ✅ Redirect to blocked page instead of just canceling requests
- ✅ Enable/disable extension toggle
- ✅ Display list of currently blocked sites
- ✅ Default blocked sites (facebook.com, twitter.com, instagram.com)

## Next Steps

- Create settings interface for managing blocked sites
- Add password protection for settings
- Implement time restrictions
- Add activity logging