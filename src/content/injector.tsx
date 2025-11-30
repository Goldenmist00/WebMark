import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

interface NoteInputProps {
  position: { x: number; y: number };
  selectedText: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

const NoteInput: React.FC<NoteInputProps> = ({ position, selectedText, onSave, onCancel }) => {
  const [content, setContent] = useState('');
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
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 2147483647,
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '16px',
        minWidth: '320px',
        maxWidth: '400px',
      }}
    >
      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <strong>Selected:</strong> {selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}
      </div>
      <textarea
        ref={inputRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add your note here... (Ctrl+Enter to save)"
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '8px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          resize: 'vertical',
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '6px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          style={{
            padding: '6px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: content.trim() ? '#3b82f6' : '#9ca3af',
            color: 'white',
            fontSize: '14px',
            cursor: content.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Save Note
        </button>
      </div>
    </div>
  );
};

export class ShadowDOMInjector {
  private shadowHost: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private reactRoot: Root | null = null;

  public mount(position: { x: number; y: number }, selectedText: string, onSave: (content: string) => void, onCancel: () => void): void {
    // Clean up existing
    this.unmount();

    // Create shadow host
    this.shadowHost = document.createElement('div');
    this.shadowHost.id = 'webmark-shadow-host';
    document.body.appendChild(this.shadowHost);

    // Create shadow root
    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });

    // Create container for React
    const container = document.createElement('div');
    this.shadowRoot.appendChild(container);

    // Add Tailwind styles (inline for shadow DOM)
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }
    `;
    this.shadowRoot.appendChild(style);

    // Mount React
    this.reactRoot = createRoot(container);
    this.reactRoot.render(
      <NoteInput
        position={position}
        selectedText={selectedText}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  public unmount(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }

    if (this.shadowHost && this.shadowHost.parentNode) {
      this.shadowHost.parentNode.removeChild(this.shadowHost);
    }

    this.shadowHost = null;
    this.shadowRoot = null;
  }
}
