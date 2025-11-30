# ContextMemo - Quick Start (30 seconds)

## Three Commands to Get Started

```bash
# 1. Install dependencies
npm install

# 2. Build the extension
npm run build

# 3. Load in Chrome
# Open chrome://extensions/
# Enable "Developer mode"
# Click "Load unpacked"
# Select the "dist" folder
```

## First Use

1. Go to any webpage (try Wikipedia)
2. Select text → Right-click → "Add ContextMemo"
3. Type your note → Save
4. Click extension icon to view all notes

That's it! 🎉

## What You Get

✅ Highlight text on any webpage
✅ Add contextual notes
✅ Persistent storage (survives page refresh)
✅ Dashboard to manage all notes
✅ Search across all notes
✅ Works completely offline
✅ No account needed

## Project Structure

```
ContextMemo/
├── src/
│   ├── background/        # Service worker
│   ├── content/           # Content scripts & UI
│   ├── popup/             # Dashboard UI
│   └── shared/            # Shared utilities
├── public/
│   └── manifest.json      # Extension manifest
├── dist/                  # Built extension (load this in Chrome)
└── package.json
```

## Key Files

- `src/content/contentScript.ts` - Main content script
- `src/content/highlights.ts` - Highlight management
- `src/content/anchors.ts` - DOM position tracking
- `src/popup/App.tsx` - Dashboard UI
- `src/shared/storage.ts` - Storage layer

## Development

```bash
# Watch mode (requires manual extension reload)
npm run dev

# Production build
npm run build

# Quick build (skip TypeScript check)
npm run build:quick
```

## Customization

Want to change the highlight color? Edit `src/content/highlights.ts`:

```typescript
span.style.backgroundColor = '#fef08a'; // Change this!
```

Then rebuild:
```bash
npm run build
```

## Troubleshooting

**Extension not loading?**
- Make sure you selected the `dist/` folder
- Check for errors at chrome://extensions

**Context menu not showing?**
- Reload the extension
- Refresh the webpage
- Make sure text is selected

**Notes not saving?**
- Check browser console (F12)
- Verify storage permissions

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [DEMO.md](DEMO.md) for demo scenarios
- See [INSTALL.md](INSTALL.md) for detailed setup

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Chrome Manifest V3
- Shadow DOM (UI isolation)

Enjoy! 📝
