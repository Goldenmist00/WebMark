# Getting Started with ContextMemo 🚀

## What is ContextMemo?

ContextMemo is a Chrome Extension that lets you highlight text on any webpage and add notes to it. Think of it as a digital highlighter with sticky notes that works on every website!

## Quick Demo (30 seconds)

1. **Install** → 2. **Highlight** → 3. **Note** → 4. **Done!**

```
Select text → Right-click → Add ContextMemo → Type note → Save
```

Your text is now highlighted with a 📝 badge. Hover to see your note!

## Installation (3 steps)

### Step 1: Build the Extension

Open your terminal in the project folder:

```bash
npm install
npm run build
```

Wait for it to complete (~30 seconds). You'll see a `dist/` folder appear.

### Step 2: Load in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Turn ON "Developer mode" (top-right toggle)
4. Click "Load unpacked" button
5. Select the `dist/` folder
6. Done! ✅

### Step 3: Test It

1. Go to any website (try Wikipedia)
2. Select some text
3. Right-click → "Add ContextMemo"
4. Type a note → Click "Save Note"
5. See your highlight with 📝 badge!

## Your First Note

Let's create your first note:

### 1. Navigate to a Page
```
Open: https://en.wikipedia.org/wiki/Chrome_extension
```

### 2. Select Text
```
Highlight any interesting paragraph
```

### 3. Add Note
```
Right-click → "Add ContextMemo"
Type: "This is important for my project"
Press: Ctrl+Enter (or click Save)
```

### 4. See Result
```
✅ Text is highlighted in yellow
✅ 📝 badge appears
✅ Hover badge to see your note
```

## Using the Dashboard

Click the ContextMemo icon in your Chrome toolbar:

### Current Page View
- See all notes for the page you're on
- Quick access to your annotations

### All Notes View
- See notes from all websites
- Click 🔗 to open the page
- Search across all notes

### Search
- Type in the search box
- Filters notes in real-time
- Searches both note content and highlighted text

### Delete
- Click 🗑️ next to any note
- Note is removed
- Highlight disappears from page

## Common Use Cases

### 📚 Research
```
Highlight key findings
Add notes with your thoughts
Search later to find specific info
```

### 📖 Reading Articles
```
Mark important quotes
Add context or questions
Review highlights later
```

### 🎓 Learning
```
Highlight concepts
Add explanations in your own words
Build your knowledge base
```

### 💼 Work
```
Mark action items
Add follow-up notes
Track important information
```

## Keyboard Shortcuts

While adding a note:
- `Ctrl+Enter` - Save note
- `Escape` - Cancel

## Tips & Tricks

### Tip 1: Hover for Quick View
Don't open the dashboard every time. Just hover over the 📝 badge to see your note!

### Tip 2: Use Search
Have lots of notes? Use the search bar in the dashboard to find specific ones quickly.

### Tip 3: View Modes
- Use "Current Page" when working on one article
- Use "All Notes" to review everything

### Tip 4: Persistent Highlights
Your highlights survive:
- ✅ Page refresh (F5)
- ✅ Browser restart
- ✅ Coming back days later

### Tip 5: Works Everywhere
ContextMemo works on:
- ✅ News sites
- ✅ Wikipedia
- ✅ Blogs
- ✅ Documentation
- ✅ Any webpage!

## Troubleshooting

### Context Menu Not Showing?
**Problem**: Right-click doesn't show "Add ContextMemo"
**Solution**: 
1. Make sure text is selected
2. Reload the extension at chrome://extensions/
3. Refresh the webpage

### Note Not Saving?
**Problem**: Note disappears after saving
**Solution**:
1. Check browser console (F12) for errors
2. Verify extension has storage permission
3. Try reloading the extension

### Highlight Not Appearing?
**Problem**: Text doesn't get highlighted
**Solution**:
1. Make sure you clicked "Save Note"
2. Check if the text is still on the page
3. Try refreshing the page

### Dashboard Empty?
**Problem**: Dashboard shows no notes
**Solution**:
1. Make sure you're on the right page (check view mode)
2. Try switching between "Current Page" and "All Notes"
3. Check if notes were actually saved

## Understanding the UI

### Floating Note Input
```
┌─────────────────────────────────┐
│ Selected: "This is the text..." │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Add your note here...       │ │
│ │ (Ctrl+Enter to save)        │ │
│ └─────────────────────────────┘ │
│                                 │
│         [Cancel]  [Save Note]   │
└─────────────────────────────────┘
```

### Highlight with Badge
```
This is some regular text on the page.
[This is highlighted text 📝] More regular text.
                          ↑
                    Hover to see note
```

### Dashboard
```
┌─────────────────────────────────────┐
│ ContextMemo                         │
│ Your highlighted notes              │
├─────────────────────────────────────┤
│ [Search notes...]                   │
├─────────────────────────────────────┤
│ [Current Page (3)] [All Notes (15)] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ "This is the highlighted text"  │ │
│ │                            🗑️   │ │
│ │ Your note content here          │ │
│ │ Nov 30, 2:30 PM                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ "Another highlight..."      🗑️  │ │
│ │ Another note...                 │ │
│ │ Nov 30, 1:15 PM                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## What Makes ContextMemo Special?

### 🔒 Privacy First
- All data stored locally in your browser
- No external servers
- No accounts needed
- No tracking

### ⚡ Fast & Lightweight
- Instant highlight restoration
- Real-time search
- No performance impact

### 🎯 Smart Technology
- Highlights survive page changes
- Works on dynamic websites
- Fuzzy matching for reliability

### 🎨 Clean Design
- Shadow DOM prevents style conflicts
- Minimal, unobtrusive UI
- Professional appearance

## Next Steps

### Customize It
Want to change the highlight color? Check out:
- `src/content/highlights.ts` - Change colors
- `src/popup/App.tsx` - Modify dashboard UI

### Learn More
- Read `README.md` for technical details
- Check `PROJECT_STRUCTURE.md` for architecture
- See `DEMO.md` for more use cases

### Contribute
- Add new features
- Improve the UI
- Fix bugs
- Share with others

## Support

### Need Help?
1. Check this guide first
2. Read the troubleshooting section
3. Look at the README.md
4. Check browser console for errors

### Found a Bug?
1. Note the steps to reproduce
2. Check browser console (F12)
3. Try reloading the extension
4. Document the issue

## Enjoy ContextMemo! 📝

Start highlighting and taking notes on any webpage. Your knowledge base is just a right-click away!

---

**Quick Reference Card**

```
Add Note:     Select text → Right-click → Add ContextMemo
View Notes:   Click extension icon
Search:       Type in dashboard search box
Delete:       Click 🗑️ in dashboard
Quick View:   Hover over 📝 badge
```

Happy note-taking! 🎉
