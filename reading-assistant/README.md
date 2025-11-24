# ReadEase - Reading Assistant Chrome Extension

A comprehensive Chrome extension that enhances your reading experience on any webpage with text-to-speech, adjustable fonts, contrast modes, and focus mode.

## Features

### 🔊 Text-to-Speech

- Read selected text aloud using Web Speech API
- Adjustable speech rate (0.5x - 2x)
- Adjustable pitch (0.5x - 2x)
- Visual highlight of text being read
- Stop/pause controls

### 🔤 Font Adjustment

- Increase or decrease font size (80% - 200%)
- Smooth transitions
- Persistent across browsing sessions

### 🎨 Contrast Modes

- **Normal**: Default webpage appearance
- **High Contrast**: Enhanced contrast for better readability
- **Dark Mode**: Inverted colors for night reading
- **Sepia**: Easy-on-eyes sepia tone

### 🎯 Focus Mode

- Highlights current paragraph on hover
- Dims surrounding content
- Reduces distractions while reading

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download/Clone the extension files** to a folder on your computer with this structure:

   ```
   ReadEase/
   ├── manifest.json
   ├── popup.html
   ├── popup.css
   ├── popup.js
   ├── content.js
   ├── content.css
   └── icons/
       ├── icon16.png
       ├── icon48.png
       └── icon128.png
   ```

2. **Create icons folder** (if not present) and add icon images:

   - You'll need 3 PNG icons: 16x16px, 48x48px, and 128x128px
   - You can create simple icons or use placeholder images temporarily

3. **Open Chrome** and navigate to:

   ```
   chrome://extensions/
   ```

4. **Enable Developer Mode**:

   - Toggle the switch in the top-right corner

5. **Load the extension**:

   - Click "Load unpacked"
   - Select the ReadEase folder
   - The extension should now appear in your extensions list

6. **Pin the extension** (optional but recommended):
   - Click the puzzle piece icon in Chrome toolbar
   - Find "ReadEase - Reading Assistant"
   - Click the pin icon to keep it visible

## Usage

### Text-to-Speech

1. Select any text on a webpage
2. Click the ReadEase icon
3. Click "Speak Selected Text"
4. Adjust speed and pitch as needed
5. Click "Stop" to pause

### Adjusting Font Size

1. Open ReadEase popup
2. Use the "Font Size" slider
3. Changes apply instantly to the current page

### Changing Contrast Mode

1. Open ReadEase popup
2. Select a mode from the "Contrast" dropdown:
   - Normal
   - High Contrast
   - Dark Mode
   - Sepia

### Focus Mode

1. Open ReadEase popup
2. Toggle "Enable Focus Mode"
3. Hover over paragraphs to highlight them
4. Surrounding content will dim for better focus

### Reset Settings

- Click "Reset All Settings" at the bottom of the popup to restore defaults

## Technical Details

### Architecture

- **Manifest V3** - Uses the latest Chrome extension standards
- **Content Scripts** - Injects functionality into web pages
- **Storage API** - Persists settings across sessions
- **Web Speech API** - Powers text-to-speech functionality

### File Structure

- `manifest.json` - Extension configuration
- `popup.html/css/js` - User interface and controls
- `content.js` - Content script for webpage interaction
- `content.css` - Styles injected into web pages

### Permissions

- `activeTab` - Access current tab for content injection
- `storage` - Save user preferences
- `scripting` - Inject content scripts dynamically

## Browser Compatibility

- Chrome 88+
- Chromium-based browsers (Edge, Brave, Opera)
- Web Speech API support required for TTS features

## Troubleshooting

### Extension Not Working

1. Make sure all files are in the correct folder structure
2. Check that Developer Mode is enabled
3. Try removing and re-loading the extension
4. Check the Chrome console for errors (right-click extension → Inspect popup)

### Text-to-Speech Not Working

1. Ensure text is selected before clicking "Speak"
2. Check browser permissions for speech synthesis
3. Try adjusting rate/pitch settings
4. Some browsers may require user interaction before TTS works

### Settings Not Persisting

1. Check Chrome storage permissions
2. Try resetting settings
3. Clear extension storage and reload

## Future Enhancements

- [ ] Line height adjustment
- [ ] Reading ruler/guide
- [ ] Word highlighting during speech
- [ ] Custom color themes
- [ ] Keyboard shortcuts
- [ ] Multi-language TTS support
- [ ] Reading statistics
- [ ] Bookmark reading positions

## Development

### Code Structure

The codebase follows modern JavaScript best practices:

- **Class-based architecture** for better organization
- **Event-driven design** for responsive UI
- **Separation of concerns** between popup and content scripts
- **Modular functions** for easy maintenance
- **Error handling** throughout

### Adding New Features

1. Update `manifest.json` if new permissions needed
2. Add UI controls in `popup.html`
3. Add event handlers in `popup.js`
4. Implement feature logic in `content.js`
5. Update styles in `popup.css` or `content.css`

### Best Practices Followed

- ✅ Manifest V3 compliance
- ✅ Clean, commented code
- ✅ Modular architecture
- ✅ Error handling
- ✅ User feedback (notifications)
- ✅ Smooth animations
- ✅ Accessible UI
- ✅ Persistent settings

## License

Free to use and modify for personal and commercial projects.

## Support

For issues, questions, or feature requests, please create an issue in the repository.

---

**Enjoy better reading with ReadEase! 📖**
