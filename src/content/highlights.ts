const HIGHLIGHT_CLASS = 'webmark-highlight';
const BADGE_CLASS = 'webmark-badge';

export function createHighlight(range: Range, noteId: string, noteContent: string, onEdit?: (noteId: string, noteContent: string, selectedText: string) => void): void {
  console.log('WebMark Highlight: Creating highlight', { noteId, hasContent: !!noteContent });
  
  try {
    // Check if already highlighted
    const existingHighlight = document.querySelector(`[data-note-id="${noteId}"]`);
    if (existingHighlight) {
      console.log('WebMark Highlight: Already exists, skipping');
      return;
    }

    const span = document.createElement('span');
    span.className = HIGHLIGHT_CLASS;
    span.setAttribute('data-note-id', noteId);
    span.setAttribute('data-note-content', noteContent);
    span.style.backgroundColor = '#fef08a';
    span.style.textDecoration = 'underline';
    span.style.textDecorationColor = '#facc15';
    span.style.textDecorationThickness = '2px';
    span.style.cursor = 'pointer';
    span.style.position = 'relative';
    
    // Add click handler to edit note
    span.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedText = span.textContent || '';
      if (onEdit) {
        onEdit(noteId, noteContent, selectedText);
      } else {
        // Dispatch custom event if no callback provided
        window.dispatchEvent(new CustomEvent('webmark-edit-note', {
          detail: { noteId, noteContent, selectedText }
        }));
      }
    });

    console.log('WebMark Highlight: Attempting to wrap range');
    
    // Try to wrap the range content
    try {
      range.surroundContents(span);
      console.log('WebMark Highlight: Successfully wrapped with surroundContents');
    } catch (surroundError) {
      console.warn('WebMark Highlight: surroundContents failed, using fallback', surroundError);
      // Use fallback method
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      console.log('WebMark Highlight: Successfully wrapped with fallback method');
    }

    // Only add badge and tooltip if there's note content
    if (noteContent && noteContent.trim()) {
      // Create badge
      const badge = document.createElement('span');
      badge.className = BADGE_CLASS;
      badge.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>`;
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        cursor: pointer;
        background: white;
        border: 1.5px solid #3b82f6;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        z-index: 10000;
      `;

      // Create tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'webmark-tooltip';
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

      // Click to toggle tooltip
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
      });
    }

    console.log('WebMark Highlight: Highlight created successfully');
    
  } catch (error) {
    console.error('WebMark Highlight: Error creating highlight:', error);
    
    // Final fallback: try manual wrapping
    try {
      console.log('WebMark Highlight: Attempting final fallback');
      const contents = range.extractContents();
      const span = document.createElement('span');
      span.className = HIGHLIGHT_CLASS;
      span.setAttribute('data-note-id', noteId);
      span.style.backgroundColor = '#fef08a';
      span.style.textDecoration = 'underline';
      span.style.textDecorationColor = '#facc15';
      span.style.textDecorationThickness = '2px';
      span.appendChild(contents);
      range.insertNode(span);
      console.log('WebMark Highlight: Final fallback successful');
    } catch (fallbackError) {
      console.error('WebMark Highlight: Final fallback failed:', fallbackError);
    }
  }
}

export function updateHighlight(noteId: string, newContent: string): void {
  console.log('WebMark Highlight: Updating highlight', { noteId, newContent });
  
  const highlight = document.querySelector(`[data-note-id="${noteId}"]`) as HTMLElement;
  if (!highlight) {
    console.error('WebMark Highlight: Highlight not found for update');
    return;
  }

  // Update data attribute (the click handler will read this updated value)
  highlight.setAttribute('data-note-content', newContent);

  // Find existing badge and tooltip
  const existingBadge = highlight.querySelector(`.${BADGE_CLASS}`);
  const existingTooltip = existingBadge?.querySelector('.webmark-tooltip') as HTMLElement;

  if (newContent && newContent.trim()) {
    // Update or create badge and tooltip
    if (existingTooltip) {
      // Just update the tooltip text
      existingTooltip.textContent = newContent;
      console.log('WebMark Highlight: Updated existing tooltip');
    } else if (existingBadge) {
      // Badge exists but no tooltip, add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'webmark-tooltip';
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
      tooltip.textContent = newContent;
      existingBadge.appendChild(tooltip);
      console.log('WebMark Highlight: Added tooltip to existing badge');
    } else {
      // No badge exists, create new badge with tooltip
      const badge = document.createElement('span');
      badge.className = BADGE_CLASS;
      badge.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>`;
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        cursor: pointer;
        background: white;
        border: 1.5px solid #3b82f6;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        z-index: 10000;
      `;

      const tooltip = document.createElement('div');
      tooltip.className = 'webmark-tooltip';
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
      tooltip.textContent = newContent;

      badge.appendChild(tooltip);
      highlight.appendChild(badge);

      // Add event listeners
      badge.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';
      });

      badge.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
      });

      console.log('WebMark Highlight: Created new badge and tooltip');
    }
  } else {
    // Empty content, remove badge if exists
    if (existingBadge) {
      existingBadge.remove();
      console.log('WebMark Highlight: Removed badge (empty content)');
    }
  }

  console.log('WebMark Highlight: Update complete');
}

export function removeHighlight(noteId: string): void {
  const highlight = document.querySelector(`[data-note-id="${noteId}"]`) as HTMLElement;
  if (highlight && highlight.parentNode) {
    // Create a document fragment to hold the children
    const fragment = document.createDocumentFragment();
    
    // Move all children to the fragment (preserves order and structure)
    while (highlight.firstChild) {
      fragment.appendChild(highlight.firstChild);
    }
    
    // Replace the highlight element with the fragment
    highlight.parentNode.replaceChild(fragment, highlight);
    
    console.log('WebMark Highlight: Removed highlight', noteId);
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
