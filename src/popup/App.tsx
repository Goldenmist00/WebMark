import React, { useState, useEffect } from 'react';
import { getAllNotes, deleteNote, setupStorageListener } from '../shared/storage';
import { Note } from '../shared/types';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'current' | 'all'>('current');

  useEffect(() => {
    loadNotes();
    getCurrentTabUrl();

    setupStorageListener(() => {
      loadNotes();
    });
  }, []);

  const loadNotes = async () => {
    const allNotes = await getAllNotes();
    setNotes(allNotes);
  };

  const getCurrentTabUrl = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      setCurrentUrl(tab.url);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'deleteNote',
          data: { noteId }
        }).catch(err => console.error('Error sending delete message:', err));
      }
      
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleOpenUrl = (url: string) => {
    chrome.tabs.create({ url });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.domLocator.textSnippet.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUrl = viewMode === 'all' || note.url === currentUrl;
    
    return matchesSearch && matchesUrl;
  });

  const groupedNotes = filteredNotes.reduce((acc, note) => {
    if (!acc[note.url]) {
      acc[note.url] = [];
    }
    acc[note.url].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname.substring(0, 30);
    } catch {
      return url.substring(0, 40);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">WebMark</h1>
        <p className="text-sm text-blue-100">Your highlighted notes</p>
      </div>

      <div className="p-4">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => setViewMode('current')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'current'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Current Page ({notes.filter(n => n.url === currentUrl).length})
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          All Notes ({notes.length})
        </button>
      </div>

      <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">📝</p>
            <p>No notes yet</p>
            <p className="text-sm mt-2">Highlight text and right-click to add a WebMark</p>
          </div>
        ) : (
          Object.entries(groupedNotes).map(([url, urlNotes]) => (
            <div key={url} className="mb-4">
              {viewMode === 'all' && (
                <div className="mb-2">
                  <button
                    onClick={() => handleOpenUrl(url)}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>🔗</span>
                    <span className="truncate">{truncateUrl(url)}</span>
                  </button>
                </div>
              )}
              
              {urlNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1 bg-yellow-100 px-2 py-1 rounded inline-block">
                        "{note.domLocator.textSnippet.substring(0, 60)}
                        {note.domLocator.textSnippet.length > 60 ? '...' : ''}"
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-500 hover:text-red-700 ml-2 text-sm"
                      title="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-800 mb-2">{note.content}</p>
                  
                  <div className="text-xs text-gray-400">
                    {formatDate(note.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
