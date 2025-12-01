import { ShadowDOMInjector } from './injector';
import { serializeRange, deserializeRange } from './anchors';
import { createHighlight, removeHighlight, updateHighlight } from './highlights';
import { saveNote, getNotesForUrl, setupStorageListener } from '../shared/storage';
import { Note } from '../shared/types';
import { v4 as uuidv4 } from 'uuid';

console.log('WebMark Content Script: File loaded on', window.location.href);

const injector = new ShadowDOMInjector();
let currentRange: Range | null = null;

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('WebMark Content: Received message', message.action, 'on', window.location.hostname);
  
  if (message.action === 'showNoteInput') {
    console.log('WebMark Content: Handling showNoteInput');
    handleShowNoteInput();
    sendResponse({ success: true });
  } else if (message.action === 'highlightOnly') {
    console.log('WebMark Content: Handling highlightOnly');
    handleHighlightOnly();
    sendResponse({ success: true });
  } else if (message.action === 'deleteNote') {
    console.log('WebMark Content: Handling deleteNote');
    handleDeleteNote(message.data.noteId);
    sendResponse({ success: true });
  } else if (message.action === 'updateNote') {
    console.log('WebMark Content: Handling updateNote');
    handleUpdateNote(message.data.note);
    sendResponse({ success: true });
  }
  return true;
});

function handleShowNoteInput(): void {
  console.log('WebMark Content: handleShowNoteInput called');
  const selection = window.getSelection();
  
  if (!selection || selection.rangeCount === 0) {
    console.error('WebMark Content: No selection or range');
    return;
  }

  currentRange = selection.getRangeAt(0);
  const selectedText = currentRange.toString().trim();
  
  console.log('WebMark Content: Selected text:', selectedText.substring(0, 50));
  
  if (!selectedText) {
    console.error('WebMark Content: Empty selection');
    return;
  }

  const rect = currentRange.getBoundingClientRect();
  const position = {
    x: rect.left + window.scrollX,
    y: rect.bottom + window.scrollY + 10,
  };

  console.log('WebMark Content: Mounting injector at position', position);
  injector.mount(
    position,
    selectedText,
    (content) => handleSaveNote(content),
    () => injector.unmount()
  );
}

async function handleHighlightOnly(): Promise<void> {
  console.log('WebMark Content: handleHighlightOnly called');
  const selection = window.getSelection();
  
  if (!selection || selection.rangeCount === 0) {
    console.error('WebMark Content: No selection or range for highlight');
    alert('Please select text first');
    return;
  }

  const range = selection.getRangeAt(0).cloneRange(); // Clone the range to preserve it
  const selectedText = range.toString().trim();
  
  console.log('WebMark Content: Highlighting text:', selectedText.substring(0, 50));
  
  if (!selectedText) {
    console.error('WebMark Content: Empty selection for highlight');
    alert('Please select some text');
    return;
  }

  const noteId = uuidv4();
  const domLocator = serializeRange(range);
  
  console.log('WebMark Content: Created DOM locator', domLocator);
  
  const note: Note = {
    id: noteId,
    url: window.location.href,
    content: '', // Empty content for highlight-only
    domLocator,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  };

  try {
    console.log('WebMark Content: Saving highlight to storage');
    await saveNote(note);
    console.log('WebMark Content: Creating highlight visual');
    createHighlight(range, noteId, '', handleEditFromHighlight); // Empty content means no tooltip
    console.log('WebMark Content: Highlight created successfully');
    
    // Clear selection after highlighting
    selection.removeAllRanges();
  } catch (error) {
    console.error('WebMark Content: Error saving highlight:', error);
    alert('Failed to save highlight. Please try again.');
  }
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
    createHighlight(currentRange, noteId, content, handleEditFromHighlight);
    injector.unmount();
    currentRange = null;
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Failed to save note. Please try again.');
  }
}

async function handleEditFromHighlight(noteId: string, currentContent: string, selectedText: string): Promise<void> {
  console.log('WebMark Content: Edit clicked on highlight', noteId);
  
  // Get the highlight element to position the modal near it
  const highlightElement = document.querySelector(`[data-note-id="${noteId}"]`);
  if (!highlightElement) {
    console.error('WebMark Content: Highlight element not found');
    return;
  }
  
  const rect = highlightElement.getBoundingClientRect();
  const position = {
    x: rect.left + window.scrollX,
    y: rect.bottom + window.scrollY + 10,
  };
  
  injector.mount(
    position,
    selectedText,
    (newContent) => handleUpdateNoteFromHighlight(noteId, newContent),
    () => {
      injector.unmount();
    },
    () => handleDeleteNoteFromHighlight(noteId),
    currentContent,
    undefined,
    undefined,
    true // isEditing flag
  );
}

async function handleDeleteNoteFromHighlight(noteId: string): Promise<void> {
  console.log('WebMark Content: Delete clicked from highlight', noteId);
  
  try {
    // Import deleteNote function
    const { deleteNote } = await import('../shared/storage');
    
    // Delete the note from storage
    await deleteNote(noteId);
    
    // Remove the highlight
    removeHighlight(noteId);
    
    // Close the modal
    injector.unmount();
    
    console.log('WebMark Content: Note deleted successfully');
  } catch (error) {
    console.error('WebMark Content: Error deleting note:', error);
    alert('Failed to delete note. Please try again.');
  }
}

async function handleUpdateNoteFromHighlight(noteId: string, newContent: string): Promise<void> {
  console.log('WebMark Content: Updating note from highlight', noteId);
  
  try {
    // Get the existing note
    const notes = await getNotesForUrl(window.location.href);
    const existingNote = notes.find(n => n.id === noteId);
    
    if (!existingNote) {
      console.error('WebMark Content: Note not found');
      alert('Note not found. Please try again.');
      return;
    }
    
    // Update the note
    const updatedNote = {
      ...existingNote,
      content: newContent.trim(),
    };
    
    await saveNote(updatedNote);
    
    // Update the highlight in place (don't remove and recreate)
    updateHighlight(noteId, newContent);
    
    injector.unmount();
  } catch (error) {
    console.error('WebMark Content: Error updating note:', error);
    alert('Failed to update note. Please try again.');
  }
}

function handleDeleteNote(noteId: string): void {
  removeHighlight(noteId);
}

function handleUpdateNote(note: Note): void {
  // Update highlight in place (don't remove and recreate)
  updateHighlight(note.id, note.content);
}

// Restore highlights on page load
async function restoreHighlights(): Promise<void> {
  const notes = await getNotesForUrl(window.location.href);
  
  for (const note of notes) {
    const range = deserializeRange(note.domLocator);
    if (range) {
      createHighlight(range, note.id, note.content, handleEditFromHighlight);
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
console.log('WebMark Content Script: Initializing...');
console.log('WebMark Content Script: Document ready state:', document.readyState);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('WebMark Content Script: DOMContentLoaded fired');
    restoreHighlights();
  });
} else {
  console.log('WebMark Content Script: Document already loaded, restoring highlights');
  restoreHighlights();
}

console.log('WebMark Content Script: Setup complete');
