import { Note, StorageData } from './types';

const STORAGE_KEY = 'contextmemo_notes';

export async function getAllNotes(): Promise<Note[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const data: StorageData = result[STORAGE_KEY] || { notes: [] };
    return data.notes;
  } catch (error) {
    console.error('Error getting all notes:', error);
    return [];
  }
}

export async function getNotesForUrl(url: string): Promise<Note[]> {
  const allNotes = await getAllNotes();
  return allNotes.filter(note => note.url === url);
}

export async function saveNote(note: Note): Promise<void> {
  try {
    const allNotes = await getAllNotes();
    const existingIndex = allNotes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      // Update existing note with version increment
      allNotes[existingIndex] = {
        ...note,
        updatedAt: Date.now(),
        version: allNotes[existingIndex].version + 1,
      };
    } else {
      // Add new note
      allNotes.push({
        ...note,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
    }
    
    await chrome.storage.local.set({
      [STORAGE_KEY]: { notes: allNotes }
    });
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  try {
    const allNotes = await getAllNotes();
    const filteredNotes = allNotes.filter(note => note.id !== noteId);
    
    await chrome.storage.local.set({
      [STORAGE_KEY]: { notes: filteredNotes }
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

export function setupStorageListener(callback: (changes: any) => void): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY]);
    }
  });
}
