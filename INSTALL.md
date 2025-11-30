# Installation Guide for ContextMemo

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Extension

```bash
npm run build
```

This will create a `dist/` folder with the compiled extension.

### 3. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project
5. The ContextMemo extension should now appear in your extensions list

### 4. Test It Out

1. Navigate to any webpage (e.g., Wikipedia, news site)
2. Select some text
3. Right-click and choose "Add ContextMemo"
4. Type a note and click "Save Note"
5. The text is now highlighted with a 📝 badge
6. Click the extension icon to view your notes

## Development Mode

For development with hot reload:

```bash
npm run dev
```

Note: You'll still need to manually reload the extension in Chrome after changes.

## Troubleshooting

### Build Errors

If you get TypeScript errors:
```bash
npm install --save-dev @types/node
```

### Extension Not Loading

- Make sure you selected the `dist/` folder, not the project root
- Check for errors in `chrome://extensions/` (click "Errors" button)
- Try removing and re-adding the extension

### Context Menu Not Appearing

- Reload the extension
- Refresh the webpage
- Make sure text is selected before right-clicking

### Notes Not Saving

- Check browser console (F12) for errors
- Verify storage permissions in manifest
- Try clearing extension storage and reloading

## File Structure After Build

```
dist/
├── manifest.json
├── popup/
│   └── index.html
├── background/
│   └── serviceWorker.js
├── content/
│   ├── contentScript.js
│   └── uiStyles.css
└── assets/
    └── [compiled JS and CSS files]
```

## Next Steps

- Customize the highlight color in `src/content/highlights.ts`
- Modify the popup UI in `src/popup/App.tsx`
- Add keyboard shortcuts in `manifest.json`
- Implement export/import features

## Support

For issues or questions, check the README.md for detailed documentation.
