import React, { useState, useEffect } from 'react';
import { getAllNotes, deleteNote, saveNote, setupStorageListener } from '../shared/storage';
import { Note } from '../shared/types';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'current' | 'all'>('current');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');

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

  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (note: Note) => {
    if (!editContent.trim()) {
      return;
    }

    try {
      const updatedNote = {
        ...note,
        content: editContent.trim(),
      };
      
      await saveNote(updatedNote);
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateNote',
          data: { note: updatedNote }
        }).catch(err => console.error('Error sending update message:', err));
      }
      
      setEditingNoteId(null);
      setEditContent('');
      loadNotes();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
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
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-1">
          <div className="text-2xl">📝</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">WebMark</h1>
            <p className="text-xs text-blue-100 font-medium">Capture your thoughts</p>
          </div>
        </div>
      </div>

      {/* Search Bar with Icon */}
      <div className="p-4 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm hover:shadow-md text-sm"
          />
        </div>
      </div>

      {/* Modern Toggle Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => setViewMode('current')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            viewMode === 'current'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-200 scale-105'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span>📄</span>
            <span>This Page</span>
            <span className="text-xs opacity-75">({notes.filter(n => n.url === currentUrl).length})</span>
          </div>
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            viewMode === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-200 scale-105'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span>🌐</span>
            <span>All Notes</span>
            <span className="text-xs opacity-75">({notes.length})</span>
          </div>
        </button>
      </div>

      {/* Notes List with Enhanced Cards */}
      <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-3">✨</div>
              <p className="text-gray-700 font-semibold mb-2">No notes yet</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Select text on any webpage, right-click,<br/>
                and choose <span className="font-semibold text-blue-600">WebMark</span> to get started
              </p>
            </div>
          </div>
        ) : (
          Object.entries(groupedNotes).map(([url, urlNotes]) => (
            <div key={url} className="mb-4">
              {viewMode === 'all' && (
                <div className="mb-2 px-1">
                  <button
                    onClick={() => handleOpenUrl(url)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 hover:gap-2 transition-all group"
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">🔗</span>
                    <span className="truncate max-w-xs group-hover:underline">{truncateUrl(url)}</span>
                  </button>
                </div>
              )}
              
              {urlNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border-2 border-gray-100 rounded-xl p-4 mb-3 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-600 mb-2 bg-gradient-to-r from-yellow-50 to-amber-50 px-3 py-2 rounded-lg border border-yellow-200 inline-block">
                        <span className="text-yellow-600 mr-1">✨</span>
                        <span className="italic">
                          "{note.domLocator.textSnippet.substring(0, 50)}
                          {note.domLocator.textSnippet.length > 50 ? '...' : ''}"
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-gray-400 hover:text-blue-500 text-lg transition-all hover:scale-110"
                        title="Edit note"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-gray-400 hover:text-red-500 text-lg transition-all hover:scale-110"
                        title="Delete note"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {editingNoteId === note.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(note)}
                          disabled={!editContent.trim()}
                          className={`px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all ${
                            editContent.trim()
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-md'
                              : 'bg-gray-300 cursor-not-allowed'
                          }`}
                        >
                          💾 Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed mb-3 font-medium">{note.content}</p>
                  )}
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>🕒</span>
                    <span>{formatDate(note.createdAt)}</span>
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-2 text-blue-400">(edited)</span>
                    )}
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
