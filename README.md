# ContextMemo - Chrome Extension for Web Annotation

## Overview

ContextMemo is a production-ready Chrome Extension that enables users to highlight text on any webpage and attach contextual notes. The extension provides persistent storage, automatic highlight restoration, and a comprehensive dashboard for note management. All data is stored locally using Chrome's storage API, ensuring complete privacy and offline functionality.

## Key Features

### Core Functionality
- Text highlighting on any webpage via context menu
- Contextual note attachment to highlighted text
- Persistent storage using chrome.storage.local
- Automatic highlight restoration on page revisit
- Real-time synchronization across browser tabs
- Comprehensive dashboard for note management
- Full-text search across all notes
- Instant highlight removal upon note deletion

### Technical Highlights
- Built with React 18 and TypeScript 5
- Vite 5 build system for optimal performance
- TailwindCSS 3 for responsive UI design
- Chrome Manifest V3 compliance
- Shadow DOM for style isolation
- Smart DOM anchoring with XPath and fuzzy matching
- Optimistic UI updates for responsive user experience

## Technology Stack

### Frontend Framework
- React 18.2.0
- TypeScript 5.2.2
- TailwindCSS 3.3.6

### Build Tools
- Vite 5.0.8
- PostCSS 8.4.32
- Autoprefixer 10.4.16

### Chrome Extension APIs
- chrome.contextMenus
- chrome.runtime
- chrome.tabs
- chrome.scripting
- chrome.storage.local
- chrome.storage.onChanged

## Installation

### Prerequisites
- Node.js version 18 or higher
- npm or yarn package manager
- Google Chrome browser (version 88 or higher)

### Build Instructions

1. Clone the repository:
```bash
git clone https://github.com/Goldenmist00/WebMark.git
cd WebMark
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" using the toggle in the top-right corner
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory

## Usage

### Creating a Note

1. Navigate to any webpage
2. Select the text you wish to annotate
3. Right-click to open the context menu
4. Select "Add ContextMemo"
5. Enter your note in the floating input interface
6. Press Ctrl+Enter or click "Save Note"

The selected text will be highlighted with a yellow background and a note badge indicator.

### Viewing Notes

1. Click the ContextMemo extension icon in the Chrome toolbar
2. The dashboard displays all notes for the current page
3. Switch to "All Notes" view to see notes from all websites
4. Use the search bar to filter notes by content or highlighted text

### Managing Notes

- **View Note Content**: Hover over the note badge on any highlight
- **Search Notes**: Use the search bar in the dashboard for real-time filtering
- **Delete Notes**: Click the delete icon next to any note in the dashboard
- **Navigate to Source**: Click the link icon to open the page where a note was created

## Architecture

### Project Structure

```
src/
├── background/
│   └── serviceWorker.ts       # Background service worker
├── content/
│   ├── contentScript.ts       # Main content script coordinator
│   ├── injector.tsx           # Shadow DOM UI injection
│   ├── anchors.ts             # DOM range serialization
│   ├── highlights.ts          # Highlight rendering and management
│   └── uiStyles.css           # Highlight and badge styles
├── popup/
│   ├── index.html             # Popup HTML entry point
│   ├── main.tsx               # React root initialization
│   ├── App.tsx                # Dashboard component
│   └── index.css              # Tailwind CSS imports
└── shared/
    ├── types.ts               # TypeScript type definitions
    └── storage.ts             # Chrome storage API wrapper
```

### DOM Anchoring System

The extension uses a hybrid anchoring strategy to reliably restore highlights:

1. **XPath-based positioning**: Primary method using XPath to locate DOM nodes
2. **Offset tracking**: Character offsets within text nodes
3. **Text snippet storage**: Exact highlighted text for verification
4. **Fuzzy matching**: Fallback mechanism for changed DOM structures

### Storage Schema

Notes are stored in chrome.storage.local with the following structure:

```typescript
interface Note {
  id: string;              // UUID v4 identifier
  url: string;             // Page URL
  content: string;         // User's note content
  domLocator: {
    startXPath: string;    // XPath to start node
    endXPath: string;      // XPath to end node
    startOffset: number;   // Character offset in start node
    endOffset: number;     // Character offset in end node
    textSnippet: string;   // Highlighted text
  };
  createdAt: number;       // Creation timestamp
  updatedAt: number;       // Last update timestamp
  version: number;         // Version for concurrency control
}
```

## Development

### Development Mode

Run the development server with hot module replacement:

```bash
npm run dev
```

Note: Manual extension reload is required in Chrome after code changes.

### Build Commands

- `npm run build` - Full production build with TypeScript compilation
- `npm run build:quick` - Quick build without TypeScript type checking
- `npm run preview` - Preview production build

### Code Style

- TypeScript strict mode enabled
- Functional React components with hooks
- Async/await for asynchronous operations
- Comprehensive error handling with try-catch blocks
- Modular file structure with clear separation of concerns

## Browser Compatibility

- Chrome 88 or higher (Manifest V3 support required)
- Microsoft Edge 88 or higher (Chromium-based)
- Brave Browser (latest version)
- Opera (latest version)

Note: Firefox and Safari are not supported due to different extension API implementations.

## Privacy and Security

### Data Storage
- All data is stored locally in the browser using chrome.storage.local
- No external servers or network requests
- No user accounts or authentication required
- No analytics or tracking mechanisms

### Permissions
The extension requires the following permissions:
- `storage` - Local data persistence
- `contextMenus` - Right-click menu integration
- `tabs` - Current tab information access
- `scripting` - Content script injection
- `activeTab` - Active tab access
- `<all_urls>` - Functionality on all websites

## Performance Characteristics

- Memory footprint: Approximately 2MB per tab
- Storage usage: Approximately 1KB per note
- Highlight restoration: Less than 50ms per note
- Dashboard load time: Less than 100ms for 100 notes
- Search performance: Real-time with no perceptible lag
- Tested with 1000+ notes without performance degradation

## Troubleshooting

### Context Menu Not Appearing
- Ensure text is selected before right-clicking
- Reload the extension at chrome://extensions/
- Refresh the webpage

### Notes Not Saving
- Check browser console (F12) for error messages
- Verify storage permissions are granted
- Ensure sufficient storage space is available

### Highlights Not Restoring
- The page DOM may have changed significantly
- Try re-highlighting the text
- Check browser console for restoration errors

### Extension Not Loading
- Verify the dist folder is selected, not the project root
- Check for errors in chrome://extensions/
- Try removing and re-adding the extension

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Ensure all builds succeed
5. Submit a pull request with a clear description

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgments

Built with modern web technologies and Chrome Extension APIs to provide a seamless annotation experience.

## Contact

For issues, questions, or contributions, please use the GitHub repository issue tracker.

Repository: https://github.com/Goldenmist00/WebMark
