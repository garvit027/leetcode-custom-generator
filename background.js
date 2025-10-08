// Background script for LeetCode Smart Filter extension
console.log('LeetCode Smart Filter background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed for the first time');
    
    // Set default settings
    chrome.storage.local.set({
      hideSolved: false,
      hidePremium: false,
      skillBased: true,
      includedTopics: [],
      excludedTopics: [],
      difficulties: ['easy', 'medium', 'hard'],
      skillLevel: 'beginner'
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  
  if (request.action === 'getSettings') {
    chrome.storage.local.get(null, (settings) => {
      sendResponse({ success: true, settings });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'updateSettings') {
    chrome.storage.local.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'openPopup') {
    // This could be used to programmatically open the popup
    sendResponse({ success: true });
  }
});

// Handle tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('leetcode.com')) {
    console.log('LeetCode tab updated, injecting content script');
    
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-script.js']
    }).catch(err => {
      console.log('Content script already injected or injection failed:', err);
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('leetcode.com')) {
    console.log('Extension icon clicked on LeetCode tab');
    
    // Send message to content script to trigger smart filter
    chrome.tabs.sendMessage(tab.id, { action: 'triggerSmartFilter' }).catch(err => {
      console.log('Could not send message to content script:', err);
    });
  }
});
