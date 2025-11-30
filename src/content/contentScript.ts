import { ShadowDOMInjector } from './injector';
import { serializeRange, deserializeRange } from './anchors';
import { createHighlight, removeHighlight } from './highlights';
import { saveNote, getNotesForUrl, setupStorageListener } from '../shared/storage';
import { Note } from '../shared/types';
import { v4 as uuidv4 } from 'uuid';

const injector = new ShadowDOMInjector();
let currentRange: Range | null = null;

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showNoteInput') {
    handleShowNoteInput();
    sendResponse({ success: true });
  } else if (message.action === 'deleteNote') {
    handleDeleteNote(message.data.noteId);
    sendResponse({ success: true });
  }
  return true;
});

function handleShowNoteInput(): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  currentRange = selection.getRangeAt(0);
  const selectedText = currentRange.toString().trim();
  
  if (!selectedText) {
    return;
  }

  const rect = currentRange.getBoundingClientRect();
  const position = {
    x: rect.left + window.scrollX,
    y: rect.bottom + window.scrollY + 10,
  };

  injector.mount(
    position,
    selectedText,
    (content) => handleSaveNote(content),
    () => injector.unmount()
  );
}

async function handleSaveNote(content: string): Promise<void> {
  if (!currentRange) {
    return;
  }

  const noteId = uuidv4();
  const domLocator = serializeRange(currentRange);
  
  const note: Note = {
    id: noteId,
    url: window.location.href,
    content,
    domLocator,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  };

  try {
    await saveNote(note);
    createHighlight(currentRange, noteId, content);
    injector.unmount();
    currentRange = null;
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Failed to save note. Please try again.');
  }
}

function handleDeleteNote(noteId: string): void {
  removeHighlight(noteId);
}

// Restore highlights on page load
async function restoreHighlights(): Promise<void> {
  const notes = await getNotesForUrl(window.location.href);
  
  for (const note of notes) {
    const range = deserializeRange(note.domLocator);
    if (range) {
      createHighlight(range, note.id, note.content);
    }
  }
}

// Listen for storage changes
setupStorageListener((changes) => {
  if (changes.newValue) {
    restoreHighlights();
  }
});

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', restoreHighlights);
} else {
  restoreHighlights();
}
