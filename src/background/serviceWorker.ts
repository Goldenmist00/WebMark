const PARENT_MENU_ID = 'webmark-parent';
const HIGHLIGHT_MENU_ID = 'webmark-highlight';
const ADD_NOTE_MENU_ID = 'webmark-add-note';

chrome.runtime.onInstalled.addListener(() => {
  console.log('WebMark: Installing context menus...');
  
  // Create parent menu
  chrome.contextMenus.create({
    id: PARENT_MENU_ID,
    title: 'WebMark',
    contexts: ['selection'],
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error creating parent menu:', chrome.runtime.lastError);
    } else {
      console.log('WebMark: Parent menu created');
    }
  });

  // Create "Highlight" submenu
  chrome.contextMenus.create({
    id: HIGHLIGHT_MENU_ID,
    parentId: PARENT_MENU_ID,
    title: 'Highlight',
    contexts: ['selection'],
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error creating Highlight menu:', chrome.runtime.lastError);
    } else {
      console.log('WebMark: Highlight menu created');
    }
  });

  // Create "Add Note" submenu
  chrome.contextMenus.create({
    id: ADD_NOTE_MENU_ID,
    parentId: PARENT_MENU_ID,
    title: 'Add Note',
    contexts: ['selection'],
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error creating Add Note menu:', chrome.runtime.lastError);
    } else {
      console.log('WebMark: Add Note menu created');
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('WebMark: Context menu clicked', info.menuItemId);
  
  if (!tab?.id) {
    console.error('WebMark: No tab ID available');
    return;
  }

  const selectedText = info.selectionText || '';
  console.log('WebMark: Selected text:', selectedText.substring(0, 50));

  if (info.menuItemId === HIGHLIGHT_MENU_ID) {
    console.log('WebMark: Sending highlightOnly message');
    // Just highlight without note
    chrome.tabs.sendMessage(tab.id, {
      action: 'highlightOnly',
      data: { selectedText }
    }).then(() => {
      console.log('WebMark: highlightOnly message sent successfully');
    }).catch(error => {
      console.error('WebMark: Error sending highlightOnly message:', error);
    });
  } else if (info.menuItemId === ADD_NOTE_MENU_ID) {
    console.log('WebMark: Sending showNoteInput message');
    // Show note input
    chrome.tabs.sendMessage(tab.id, {
      action: 'showNoteInput',
      data: { selectedText }
    }).then(() => {
      console.log('WebMark: showNoteInput message sent successfully');
    }).catch(error => {
      console.error('WebMark: Error sending showNoteInput message:', error);
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'getNoteForHighlight') {
    sendResponse({ success: true });
  }
  return true;
});
