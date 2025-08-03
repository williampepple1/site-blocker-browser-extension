# Site Blocker Extension Icons

This folder contains SVG icons for the Site Blocker browser extension.

## Icon Files

- `icon.svg` - Full-featured icon with shield, lock, and blocked lines (best for 128x128)
- `icon-simple.svg` - Simplified version with shield and blocked X (good for 48x48)
- `icon-minimal.svg` - Minimal version with just shield and X (best for 16x16)

## Converting to PNG

To convert these SVG files to PNG, you can use:

### Online Tools:
- [Convertio](https://convertio.co/svg-png/)
- [CloudConvert](https://cloudconvert.com/svg-to-png)
- [SVG to PNG](https://svgtopng.com/)

### Command Line (if you have ImageMagick):
```bash
# For 16x16
convert icon-minimal.svg -resize 16x16 icon16.png

# For 48x48
convert icon-simple.svg -resize 48x48 icon48.png

# For 128x128
convert icon.svg -resize 128x128 icon128.png
```

### Using Inkscape:
```bash
inkscape icon.svg --export-png=icon128.png --export-width=128 --export-height=128
inkscape icon-simple.svg --export-png=icon48.png --export-width=48 --export-height=48
inkscape icon-minimal.svg --export-png=icon16.png --export-width=16 --export-height=16
```

## Icon Design

The icons feature:
- **Blue background circle** - Represents the extension's protective nature
- **White shield** - Symbolizes protection and security
- **Red X or blocked lines** - Indicates blocking functionality
- **Lock symbol** (in full version) - Represents password protection

## Color Scheme

- Primary Blue: `#007bff` (Bootstrap primary)
- Dark Blue: `#0056b3` (Bootstrap primary dark)
- Red: `#dc3545` (Bootstrap danger)
- Dark Red: `#721c24` (Bootstrap danger dark)
- White: `#ffffff`

## Required PNG Files

After conversion, you'll need these files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

These will be referenced in the `manifest.json` file. 