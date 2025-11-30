const PARENT_MENU_ID = 'webmark-parent';
const HIGHLIGHT_MENU_ID = 'webmark-highlight';
const ADD_NOTE_MENU_ID = 'webmark-add-note';

chrome.runtime.onInstalled.addListener(() => {
  // Create parent menu
  chrome.contextMenus.create({
    id: PARENT_MENU_ID,
    title: 'WebMark',
    contexts: ['selection'],
  });

  // Create "Highlight" submenu
  chrome.contextMenus.create({
    id: HIGHLIGHT_MENU_ID,
    parentId: PARENT_MENU_ID,
    title: 'Highlight',
    contexts: ['selection'],
  });

  // Create "Add Note" submenu
  chrome.contextMenus.create({
    id: ADD_NOTE_MENU_ID,
    parentId: PARENT_MENU_ID,
    title: 'Add Note',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  const selectedText = info.selectionText || '';

  if (info.menuItemId === HIGHLIGHT_MENU_ID) {
    // Just highlight without note
    chrome.tabs.sendMessage(tab.id, {
      action: 'highlightOnly',
      data: { selectedText }
    }).catch(error => {
      console.error('Error sending message to content script:', error);
    });
  } else if (info.menuItemId === ADD_NOTE_MENU_ID) {
    // Show note input
    chrome.tabs.sendMessage(tab.id, {
      action: 'showNoteInput',
      data: { selectedText }
    }).catch(error => {
      console.error('Error sending message to content script:', error);
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'getNoteForHighlight') {
    sendResponse({ success: true });
  }
  return true;
});
