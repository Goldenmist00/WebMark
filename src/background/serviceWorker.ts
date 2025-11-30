const CONTEXT_MENU_ID = 'webmark-add-note';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Add WebMark',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && tab?.id) {
    const selectedText = info.selectionText || '';
    
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
