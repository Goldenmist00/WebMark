import { Note } from '../shared/types';

const HIGHLIGHT_CLASS = 'contextmemo-highlight';
const BADGE_CLASS = 'contextmemo-badge';

export function createHighlight(range: Range, noteId: string, noteContent: string): void {
  try {
    // Check if already highlighted
    const existingHighlight = document.querySelector(`[data-note-id="${noteId}"]`);
    if (existingHighlight) {
      return;
    }

    const span = document.createElement('span');
    span.className = HIGHLIGHT_CLASS;
    span.setAttribute('data-note-id', noteId);
    span.style.backgroundColor = '#fef08a';
    span.style.cursor = 'pointer';
    span.style.position = 'relative';

    // Wrap the range content
    range.surroundContents(span);

    // Create badge
    const badge = document.createElement('span');
    badge.className = BADGE_CLASS;
    badge.textContent = '📝';
    badge.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 12px;
      cursor: pointer;
      background: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      z-index: 10000;
    `;

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'contextmemo-tooltip';
    tooltip.style.cssText = `
      display: none;
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      white-space: nowrap;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 8px;
      z-index: 10001;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `;
    tooltip.textContent = noteContent;

    badge.appendChild(tooltip);
    span.appendChild(badge);

    // Show tooltip on hover
    badge.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block';
    });

    badge.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    // Click to edit (future enhancement)
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
    });

  } catch (error) {
    console.error('Error creating highlight:', error);
    
    // Fallback: try manual wrapping
    try {
      const contents = range.extractContents();
      const span = document.createElement('span');
      span.className = HIGHLIGHT_CLASS;
      span.setAttribute('data-note-id', noteId);
      span.style.backgroundColor = '#fef08a';
      span.appendChild(contents);
      range.insertNode(span);
    } catch (fallbackError) {
      console.error('Fallback highlight failed:', fallbackError);
    }
  }
}

export function removeHighlight(noteId: string): void {
  const highlight = document.querySelector(`[data-note-id="${noteId}"]`);
  if (highlight) {
    const parent = highlight.parentNode;
    if (parent) {
      // Move children out of the highlight span
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    }
  }
}

export function removeAllHighlights(): void {
  const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
  highlights.forEach(highlight => {
    const noteId = highlight.getAttribute('data-note-id');
    if (noteId) {
      removeHighlight(noteId);
    }
  });
}
