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

The extension now has a complete settings interface where parents can easily manage which websites are blocked.

## Files Created

- `manifest.json` - Extension configuration
- `background.js` - Background service worker with blocking logic and context menu
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality with toggle controls and settings link
- `blocked.html` - Page shown when accessing blocked sites
- `settings.html` - Settings page for managing blocked sites
- `settings.js` - Settings page functionality
- `icons/` - Extension icons (to be added)

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

## Next Steps

- Add password protection for settings
- Implement time restrictions
- Add activity logging