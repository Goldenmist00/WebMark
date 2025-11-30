import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

interface NoteInputProps {
  position: { x: number; y: number };
  selectedText: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  initialContent?: string;
  isEditing?: boolean;
}

const NoteInput: React.FC<NoteInputProps> = ({ position, selectedText, onSave, onCancel, initialContent = '', isEditing = false }) => {
  const [content, setContent] = useState(initialContent);
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
          gap: '10px',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '2px solid #e0e7ff'
        }}>
          <div style={{ 
            fontSize: '24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            ✍️
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', letterSpacing: '-0.02em' }}>
              {isEditing ? 'Edit Your Note' : 'Add Your Note'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              {isEditing ? 'Update your thoughts' : 'Capture your thoughts'}
            </div>
          </div>
        </div>
        
        {/* Selected text preview with better styling */}
        <div style={{ 
          fontSize: '13px', 
          color: '#475569', 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '12px 14px', 
          borderRadius: '10px', 
          fontStyle: 'italic',
          border: '2px solid #fbbf24',
          lineHeight: '1.5',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute',
            top: '6px',
            left: '6px',
            fontSize: '16px',
            opacity: '0.4'
          }}>
            ✨
          </div>
          <div style={{ paddingLeft: '24px' }}>
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
        placeholder="Write your thoughts here... ✨
        
💡 Tip: Press Ctrl+Enter to save quickly"
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
        justifyContent: 'flex-end' 
      }}>
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
          <span>✕</span>
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
          <span>{isEditing ? '💾' : '📝'}</span>
          <span>{isEditing ? 'Update Note' : 'Save Note'}</span>
        </button>
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div style={{
        marginTop: '12px',
        padding: '8px 12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        <span style={{ marginRight: '12px' }}>⌨️ <strong>Ctrl+Enter</strong> to save</span>
        <span>•</span>
        <span style={{ marginLeft: '12px' }}><strong>Esc</strong> to cancel</span>
      </div>
    </div>
  );
};

export class ShadowDOMInjector {
  private shadowHost: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private reactRoot: Root | null = null;

  public mount(position: { x: number; y: number }, selectedText: string, onSave: (content: string) => void, onCancel: () => void, initialContent?: string, isEditing?: boolean): void {
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
