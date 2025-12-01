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
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical' | 'updated'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'highlights'>('all');

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

  const handleExportJSON = () => {
    const exportData = viewMode === 'current' 
      ? filteredNotes 
      : notes;
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `webmark-notes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const exportNotes = viewMode === 'current' 
      ? filteredNotes 
      : notes;
    
    let markdown = '# WebMark Notes\n\n';
    markdown += `Exported: ${new Date().toLocaleString()}\n\n`;
    markdown += `Total Notes: ${exportNotes.length}\n\n`;
    markdown += '---\n\n';

    // Group by URL
    const grouped = exportNotes.reduce((acc, note) => {
      if (!acc[note.url]) {
        acc[note.url] = [];
      }
      acc[note.url].push(note);
      return acc;
    }, {} as Record<string, Note[]>);

    Object.entries(grouped).forEach(([url, urlNotes]) => {
      markdown += `## ${url}\n\n`;
      urlNotes.forEach((note, index) => {
        markdown += `### Note ${index + 1}\n\n`;
        markdown += `**Highlighted Text:** "${note.domLocator.textSnippet}"\n\n`;
        markdown += `**Note:** ${note.content || '(No content)'}\n\n`;
        markdown += `**Created:** ${new Date(note.createdAt).toLocaleString()}\n\n`;
        if (note.updatedAt !== note.createdAt) {
          markdown += `**Last Updated:** ${new Date(note.updatedAt).toLocaleString()}\n\n`;
        }
        markdown += '---\n\n';
      });
    });

    const dataBlob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `webmark-notes-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.domLocator.textSnippet.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUrl = viewMode === 'all' || note.url === currentUrl;
    
    // Filter by type
    const matchesType = 
      filterType === 'all' ? true :
      filterType === 'notes' ? note.content.trim() !== '' :
      filterType === 'highlights' ? note.content.trim() === '' :
      true;
    
    return matchesSearch && matchesUrl && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.createdAt - a.createdAt;
      case 'oldest':
        return a.createdAt - b.createdAt;
      case 'alphabetical':
        return a.domLocator.textSnippet.localeCompare(b.domLocator.textSnippet);
      case 'updated':
        return b.updatedAt - a.updatedAt;
      default:
        return 0;
    }
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
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">WebMark</h1>
              <p className="text-xs text-blue-100 font-medium">Web Annotation Tool</p>
            </div>
          </div>

        </div>
      </div>

      {/* Search Bar and Sort Dropdown */}
      <div className="p-4 pb-3 space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search annotations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm hover:shadow-md text-sm"
          />
        </div>
        
        {/* Sort Dropdown */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <line x1="4" y1="6" x2="16" y2="6"></line>
              <line x1="4" y1="12" x2="13" y2="12"></line>
              <line x1="4" y1="18" x2="10" y2="18"></line>
            </svg>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm hover:shadow-md text-sm appearance-none cursor-pointer"
          >
            <option value="newest">Sort by: Newest First</option>
            <option value="oldest">Sort by: Oldest First</option>
            <option value="updated">Sort by: Recently Updated</option>
            <option value="alphabetical">Sort by: A-Z (Highlighted Text)</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Modern Toggle Buttons */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => setViewMode('current')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            viewMode === 'current'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-200 scale-105'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>Current Page</span>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <span>All Notes</span>
            <span className="text-xs opacity-75">({notes.length})</span>
          </div>
        </button>
      </div>

      {/* Filter Type Buttons */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
            filterType === 'all'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span>All</span>
          </div>
        </button>
        <button
          onClick={() => setFilterType('notes')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
            filterType === 'notes'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Notes</span>
          </div>
        </button>
        <button
          onClick={() => setFilterType('highlights')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
            filterType === 'highlights'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span>Highlights</span>
          </div>
        </button>
      </div>

      {/* Export Buttons */}
      {filteredNotes.length > 0 && (
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={handleExportJSON}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-green-300 hover:text-green-600 transition-all"
          >
            <div className="flex items-center justify-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export JSON</span>
            </div>
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-gray-600 bg-white border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-all"
          >
            <div className="flex items-center justify-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export MD</span>
            </div>
          </button>
        </div>
      )}

      {/* Notes List with Enhanced Cards */}
      <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <p className="text-gray-700 font-semibold mb-2">No Annotations Found</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Select text on any webpage, right-click,<br/>
                and choose <span className="font-semibold text-blue-600">WebMark</span> to create your first annotation
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5 text-yellow-600">
                          <path d="M12 2v20M2 12h20"></path>
                        </svg>
                        <span className="italic">
                          "{note.domLocator.textSnippet.substring(0, 50)}
                          {note.domLocator.textSnippet.length > 50 ? '...' : ''}"
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-gray-400 hover:text-blue-500 transition-all hover:scale-110"
                        title="Edit note"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-gray-400 hover:text-red-500 transition-all hover:scale-110"
                        title="Delete note"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
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
                    <>
                      {note.content.trim() ? (
                        <p className="text-sm text-gray-700 leading-relaxed mb-3 font-medium">{note.content}</p>
                      ) : (
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg text-xs font-semibold text-purple-600">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 11l3 3L22 4"></path>
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                            Highlight Only
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{formatDate(note.createdAt)}</span>
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-2 text-blue-400 font-medium">(edited)</span>
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
