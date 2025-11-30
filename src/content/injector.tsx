import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

interface NoteInputProps {
  position: { x: number; y: number };
  selectedText: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialContent?: string;
  isEditing?: boolean;
}

const NoteInput: React.FC<NoteInputProps> = ({ position, selectedText, onSave, onCancel, onDelete, initialContent = '', isEditing = false }) => {
  const [content, setContent] = useState(initialContent);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 2147483647,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '3px solid transparent',
        backgroundClip: 'padding-box',
        borderRadius: '16px',
        boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)',
        padding: '20px',
        minWidth: '360px',
        maxWidth: '420px',
        animation: 'slideIn 0.2s ease-out',
      }}
    >
      {/* Header with gradient accent */}
      <div style={{ marginBottom: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '2px solid #e0e7ff'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '10px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', letterSpacing: '-0.02em' }}>
              {isEditing ? 'Edit Note' : 'Add Note'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              {isEditing ? 'Modify your annotation' : 'Create a new annotation'}
            </div>
          </div>
        </div>
        
        {/* Selected text preview with better styling */}
        <div style={{ 
          fontSize: '13px', 
          color: '#475569', 
          background: 'linear-gradient(135deg, #fef9e7 0%, #fef3c7 100%)',
          padding: '12px 14px', 
          borderRadius: '8px', 
          fontStyle: 'italic',
          border: '1px solid #fbbf24',
          lineHeight: '1.5',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            fontSize: '11px',
            fontWeight: '600',
            color: '#92400e',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Selected Text
          </div>
          <div>
            "{selectedText.substring(0, 80)}{selectedText.length > 80 ? '...' : ''}"
          </div>
        </div>
      </div>
      
      {/* Enhanced textarea */}
      <textarea
        ref={inputRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your note here...

Tip: Press Ctrl+Enter to save quickly"
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '14px',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          resize: 'vertical',
          outline: 'none',
          lineHeight: '1.6',
          backgroundColor: '#ffffff',
          color: '#1e293b',
          transition: 'all 0.2s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          e.currentTarget.style.color = '#1e293b';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.color = '#1e293b';
        }}
      />
      
      {/* Modern action buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginTop: '16px', 
        justifyContent: isEditing && onDelete ? 'space-between' : 'flex-end' 
      }}>
        {/* Delete button (only in edit mode) */}
        {isEditing && onDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '10px 20px',
              border: '2px solid #fee2e2',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.borderColor = '#fecaca';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#fee2e2';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Delete</span>
          </button>
        )}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 24px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '10px',
              background: content.trim() 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                : '#cbd5e1',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: content.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'all 0.2s ease',
              boxShadow: content.trim() ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (content.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (content.trim()) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }
            }}
          >
            {isEditing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
            )}
            <span>{isEditing ? 'Update' : 'Save'}</span>
          </button>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div style={{
          marginTop: '12px',
          padding: '14px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
        }}>
          <div style={{
            fontSize: '13px',
            color: '#991b1b',
            fontWeight: '600',
            marginBottom: '10px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Confirm Deletion</span>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#7f1d1d',
            marginBottom: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>
            This action cannot be undone. The note will be permanently removed.
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                padding: '8px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'all 0.2s ease',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDelete?.();
                setShowDeleteConfirm(false);
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              Delete Permanently
            </button>
          </div>
        </div>
      )}
      
      {/* Keyboard shortcuts hint */}
      <div style={{
        marginTop: '12px',
        padding: '8px 12px',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '500',
        border: '1px solid #e2e8f0'
      }}>
        <span style={{ marginRight: '12px' }}><strong>Ctrl+Enter</strong> to save</span>
        <span style={{ color: '#cbd5e1' }}>•</span>
        <span style={{ marginLeft: '12px' }}><strong>Esc</strong> to cancel</span>
      </div>
    </div>
  );
};

export class ShadowDOMInjector {
  private shadowHost: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private reactRoot: Root | null = null;

  public mount(position: { x: number; y: number }, selectedText: string, onSave: (content: string) => void, onCancel: () => void, onDelete?: () => void, initialContent?: string, isEditing?: boolean): void {
    console.log('WebMark Injector: Mounting at position', position);
    
    try {
      // Clean up existing first
      this.unmount();
      
      // Create shadow host
      this.shadowHost = document.createElement('div');
      this.shadowHost.id = 'webmark-shadow-host';
      // Make shadow host not interfere with positioning
      this.shadowHost.style.position = 'absolute';
      this.shadowHost.style.top = '0';
      this.shadowHost.style.left = '0';
      this.shadowHost.style.width = '0';
      this.shadowHost.style.height = '0';
      this.shadowHost.style.zIndex = '2147483647';
      document.body.appendChild(this.shadowHost);

      // Create shadow root
      this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });

      // Create container for React
      const container = document.createElement('div');
      this.shadowRoot.appendChild(container);

      // Add styles (inline for shadow DOM)
      const style = document.createElement('style');
      style.textContent = `
        * {
          box-sizing: border-box;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `;
      this.shadowRoot.appendChild(style);

      // Mount React - create new root each time
      this.reactRoot = createRoot(container);
      this.reactRoot.render(
        <NoteInput
          position={position}
          selectedText={selectedText}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
          initialContent={initialContent}
          isEditing={isEditing}
        />
      );
      
      console.log('WebMark Injector: Mounted successfully');
    } catch (error) {
      console.error('WebMark Injector: Error mounting', error);
      // Clean up on error
      this.unmount();
    }
  }

  public unmount(): void {
    console.log('WebMark Injector: Unmounting');
    
    try {
      // Unmount React first
      if (this.reactRoot) {
        this.reactRoot.unmount();
        this.reactRoot = null;
      }

      // Remove shadow host from DOM
      if (this.shadowHost) {
        if (this.shadowHost.parentNode) {
          this.shadowHost.parentNode.removeChild(this.shadowHost);
        }
        this.shadowHost = null;
      }

      // Clear shadow root reference
      this.shadowRoot = null;
      
      console.log('WebMark Injector: Unmounted successfully');
    } catch (error) {
      console.error('WebMark Injector: Error unmounting', error);
      // Force cleanup even if there's an error
      this.reactRoot = null;
      this.shadowHost = null;
      this.shadowRoot = null;
    }
  }
}
