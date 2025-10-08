// Popup script for LeetCode Smart Filter extension
document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  
  // Initialize the popup
  initializePopup();
  
  // Load current settings
  loadSettings();
  
  // Set up event listeners
  setupEventListeners();
});

// Check if content script is ready on the current tab
async function checkContentScriptStatus() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || !tab.url.includes('leetcode.com')) {
      return { ready: false, reason: 'not-leetcode' };
    }
    
    try {
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
      return { ready: true, tabId: tab.id };
    } catch (error) {
      if (error.message.includes("Could not establish connection")) {
        return { ready: false, reason: 'no-content-script', tabId: tab.id };
      }
      return { ready: false, reason: 'error', error: error.message };
    }
  } catch (error) {
    return { ready: false, reason: 'query-failed', error: error.message };
  }
}

// Initialize the popup
function initializePopup() {
  // Initialize topic lists
  initializeTopics();
  
  // Set up tab switching
  setupTabSwitching();
  
  // Initialize skill assessment
  initializeSkillAssessment();
  
  // Add enhanced styles
  addEnhancedStyles();
  
  // Check content script status and show guidance
  checkContentScriptStatus().then(status => {
    if (!status.ready) {
      if (status.reason === 'not-leetcode') {
        showNotification('Please navigate to LeetCode to use this extension', 'info');
      } else if (status.reason === 'no-content-script') {
        showNotification('Extension not ready. Please refresh the LeetCode page.', 'warning');
      }
    }
  });
}

// Initialize topic lists
function initializeTopics() {
  const topics = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
    'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Database',
    'Breadth-First Search', 'Tree', 'Matrix', 'Two Pointers', 'Bit Manipulation',
    'Stack', 'Heap (Priority Queue)', 'Graph', 'Design', 'Backtracking',
    'Sliding Window', 'Union Find', 'Linked List', 'Ordered Set', 'Monotonic Stack',
    'Enumeration', 'Recursion', 'Trie', 'Divide and Conquer', 'Binary Tree',
    'Segment Tree', 'Queue', 'Binary Search Tree', 'Memoization', 'Geometry',
    'Game Theory', 'Shortest Path', 'Combinatorics', 'Simulation', 'Data Stream',
    'Interactive', 'String Matching', 'Rolling Hash', 'Brainteaser', 'Randomized',
    'Monotonic Queue', 'Iterator', 'Merge Sort', 'Bucket Sort', 'Counting Sort',
    'Radix Sort', 'Quickselect', 'Eulerian Circuit', 'Strongly Connected Component'
  ];
  
  // Populate include topics grid
  const includeGrid = document.getElementById('include-topics-grid');
  topics.forEach(topic => {
    const label = document.createElement('label');
    label.className = 'topic-checkbox-label';
    label.innerHTML = `
      <input type="checkbox" class="topic-checkbox-input" value="${topic}">
      ${topic}
    `;
    includeGrid.appendChild(label);
  });
  
  // Populate exclude topics grid
  const excludeGrid = document.getElementById('exclude-topics-grid');
  topics.forEach(topic => {
    const label = document.createElement('label');
    label.className = 'topic-checkbox-label';
    label.innerHTML = `
      <input type="checkbox" class="topic-checkbox-input" value="${topic}">
      ${topic}
    `;
    excludeGrid.appendChild(label);
  });
}

// Set up tab switching
function setupTabSwitching() {
  const includeTab = document.getElementById('include-tab');
  const excludeTab = document.getElementById('exclude-tab');
  const includeTopics = document.getElementById('include-topics');
  const excludeTopics = document.getElementById('exclude-topics');
  
  includeTab.addEventListener('click', (e) => {
    // Add click effect
    e.target.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      e.target.style.transform = 'scale(1)';
    }, 150);
    
    includeTab.classList.add('active');
    excludeTab.classList.remove('active');
    includeTopics.classList.remove('hidden');
    excludeTopics.classList.add('hidden');
    
    // Add transition effect
    includeTopics.style.opacity = '0';
    includeTopics.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      includeTopics.style.transition = 'all 0.3s ease';
      includeTopics.style.opacity = '1';
      includeTopics.style.transform = 'translateX(0)';
    }, 50);
  });
  
  excludeTab.addEventListener('click', (e) => {
    // Add click effect
    e.target.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      e.target.style.transform = 'scale(1)';
    }, 150);
    
    excludeTab.classList.add('active');
    includeTab.classList.remove('active');
    excludeTopics.classList.remove('hidden');
    includeTopics.classList.add('hidden');
    
    // Add transition effect
    excludeTopics.style.opacity = '0';
    excludeTopics.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
      excludeTopics.style.transition = 'all 0.3s ease';
      excludeTopics.style.opacity = '1';
      excludeTopics.style.transform = 'translateX(0)';
    }, 50);
  });
}

// Initialize skill assessment
function initializeSkillAssessment() {
  const assessButton = document.getElementById('assess-skill');
  if (assessButton) {
    assessButton.addEventListener('click', async (e) => {
      // Add click effect
      e.target.style.transform = 'scale(0.95)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
      }, 150);
      
      await assessSkillLevel();
    });
  }
}

// Set up event listeners
function setupEventListeners() {
  // Toggle switches
  const toggles = ['solved-toggle', 'premium-toggle', 'skill-based-toggle'];
  toggles.forEach(toggleId => {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        // Add visual feedback
        const container = e.target.closest('.toggle-container');
        if (container) {
          container.style.transform = 'scale(1.05)';
          container.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
          container.style.borderColor = '#3b82f6';
          
          setTimeout(() => {
            container.style.transform = 'scale(1)';
            container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            container.style.borderColor = 'rgba(148, 163, 184, 0.2)';
          }, 300);
        }
        
        saveSettings();
      });
    }
  });
  
  // Difficulty checkboxes
  const difficulties = ['easy-difficulty', 'medium-difficulty', 'hard-difficulty'];
  difficulties.forEach(diffId => {
    const checkbox = document.getElementById(diffId);
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        // Add visual feedback
        const container = e.target.closest('.difficulty-option');
        if (container) {
          if (e.target.checked) {
            container.style.transform = 'scale(1.05) translateX(10px)';
            container.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
            container.style.borderColor = '#10b981';
            
            // Add checkmark animation
            const checkmark = document.createElement('div');
            checkmark.innerHTML = '✓';
            checkmark.style.cssText = `
              position: absolute;
              right: 20px;
              top: 50%;
              transform: translateY(-50%);
              color: #10b981;
              font-size: 20px;
              font-weight: bold;
              animation: checkmarkAppear 0.5s ease-out;
            `;
            container.style.position = 'relative';
            container.appendChild(checkmark);
            
            setTimeout(() => {
              checkmark.remove();
              container.style.transform = 'scale(1) translateX(0)';
              container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              container.style.borderColor = 'rgba(148, 163, 184, 0.2)';
            }, 500);
          } else {
            container.style.transform = 'scale(0.95)';
            container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            container.style.borderColor = 'rgba(148, 163, 184, 0.1)';
            
            setTimeout(() => {
              container.style.transform = 'scale(1)';
              container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              container.style.borderColor = 'rgba(148, 163, 184, 0.2)';
            }, 300);
          }
        }
        
        saveSettings();
      });
    }
  });
  
  // Topic checkboxes
  const topicCheckboxes = document.querySelectorAll('.topic-checkbox-input');
  topicCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      // Add visual feedback
      const label = e.target.closest('.topic-checkbox-label');
      if (label) {
        if (e.target.checked) {
          label.style.transform = 'scale(1.1)';
          label.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
          label.style.borderColor = '#3b82f6';
          
          // Add sparkle effect
          addSparkleEffect(label);
          
          setTimeout(() => {
            label.style.transform = 'scale(1)';
            label.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            label.style.borderColor = 'rgba(148, 163, 184, 0.3)';
          }, 400);
        } else {
          label.style.transform = 'scale(0.9)';
          label.style.opacity = '0.7';
          
          setTimeout(() => {
            label.style.transform = 'scale(1)';
            label.style.opacity = '1';
          }, 300);
        }
      }
      
      saveSettings();
    });
  });
  
  // Quick actions
  const quickRandom = document.getElementById('quick-random');
  if (quickRandom) {
    quickRandom.addEventListener('click', async (e) => {
      // Add click effect
      e.target.style.transform = 'scale(0.95)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
      }, 150);
      
      await handleQuickRandom();
    });
  }
  
  const clearFilters = document.getElementById('clear-filters');
  if (clearFilters) {
    clearFilters.addEventListener('click', async (e) => {
      // Add click effect
      e.target.style.transform = 'scale(0.95)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.4)';
      }, 150);
      
      await handleClearFilters();
    });
  }
  
  const resetSettings = document.getElementById('reset-settings');
  if (resetSettings) {
    resetSettings.addEventListener('click', async (e) => {
      // Add click effect
      e.target.style.transform = 'scale(0.95)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.4)';
      }, 150);
      
      await resetSettingsToDefault();
    });
  }
  
  const refreshPage = document.getElementById('refresh-page');
  if (refreshPage) {
    refreshPage.addEventListener('click', async (e) => {
      // Add click effect
      e.target.style.transform = 'scale(0.95)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.4)';
      }, 150);
      
      await handleRefreshPage();
    });
  }
}

// Add sparkle effect to elements
function addSparkleEffect(element) {
  const sparkles = ['✨', '⭐', '💫', '🌟', '✨'];
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
  
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement('span');
    sparkle.textContent = sparkles[i];
    sparkle.style.cssText = `
      position: absolute;
      font-size: 16px;
      color: ${colors[i]};
      pointer-events: none;
      animation: sparkleFloat 1s ease-out forwards;
      z-index: 10;
    `;
    
    // Random position around the element
    const rect = element.getBoundingClientRect();
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    
    element.style.position = 'relative';
    element.appendChild(sparkle);
    
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.remove();
      }
    }, 1000);
  }
}

// Add CSS animations for enhanced interactions
function addEnhancedStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes checkmarkAppear {
      0% { 
        opacity: 0; 
        transform: translateY(-50%) scale(0); 
      }
      50% { 
        opacity: 1; 
        transform: translateY(-50%) scale(1.2); 
      }
      100% { 
        opacity: 1; 
        transform: translateY(-50%) scale(1); 
      }
    }
    
    @keyframes sparkleFloat {
      0% { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
      100% { 
        opacity: 0; 
        transform: translateY(-30px) scale(0.5); 
      }
    }
    
    .toggle-container:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
    }
    
    .difficulty-option:hover {
      transform: translateX(5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .topic-checkbox-label:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .action-button:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 35px rgba(0,0,0,0.2);
    }
    
    .assess-button:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
    }
  `;
  document.head.appendChild(style);
}

// Load current settings
async function loadSettings() {
  try {
    const result = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (result.success) {
      const settings = result.settings;
      
      // Update toggle switches
      if (settings.hideSolved !== undefined) {
        const solvedToggle = document.getElementById('solved-toggle');
        if (solvedToggle) solvedToggle.checked = settings.hideSolved;
      }
      
      if (settings.hidePremium !== undefined) {
        const premiumToggle = document.getElementById('premium-toggle');
        if (premiumToggle) premiumToggle.checked = settings.hidePremium;
      }
      
      if (settings.skillBased !== undefined) {
        const skillToggle = document.getElementById('skill-based-toggle');
        if (skillToggle) skillToggle.checked = settings.skillBased;
      }
      
      // Update difficulty checkboxes
      if (settings.difficulties) {
        settings.difficulties.forEach(diff => {
          const checkbox = document.getElementById(`${diff}-difficulty`);
          if (checkbox) checkbox.checked = true;
        });
      }
      
      // Update topic checkboxes
      if (settings.includedTopics) {
        settings.includedTopics.forEach(topic => {
          const checkbox = document.querySelector(`#include-topics-grid input[value="${topic}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      
      if (settings.excludedTopics) {
        settings.excludedTopics.forEach(topic => {
          const checkbox = document.querySelector(`#exclude-topics-grid input[value="${topic}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      
      // Update skill level display
      if (settings.skillLevel) {
        updateSkillLevelDisplay(settings.skillLevel);
      }
      
      console.log('Settings loaded successfully');
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings
async function saveSettings() {
  try {
    const settings = {
      hideSolved: document.getElementById('solved-toggle')?.checked || false,
      hidePremium: document.getElementById('premium-toggle')?.checked || false,
      skillBased: document.getElementById('skill-based-toggle')?.checked || false,
      difficulties: getSelectedDifficulties(),
      includedTopics: getSelectedTopics('include'),
      excludedTopics: getSelectedTopics('exclude')
    };
    
    const result = await chrome.runtime.sendMessage({ 
      action: 'updateSettings', 
      settings 
    });
    
    if (result.success) {
      console.log('Settings saved successfully');
      showNotification('Settings saved!', 'success');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Error saving settings', 'error');
  }
}

// Get selected difficulties
function getSelectedDifficulties() {
  const difficulties = [];
  const easy = document.getElementById('easy-difficulty');
  const medium = document.getElementById('medium-difficulty');
  const hard = document.getElementById('hard-difficulty');
  
  if (easy?.checked) difficulties.push('easy');
  if (medium?.checked) difficulties.push('medium');
  if (hard?.checked) difficulties.push('hard');
  
  return difficulties;
}

// Get selected topics
function getSelectedTopics(type) {
  const grid = document.getElementById(`${type}-topics-grid`);
  const checkboxes = grid.querySelectorAll('input:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

// Handle quick random
async function handleQuickRandom() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showNotification('No active tab found', 'error');
      return;
    }
    
    if (!tab.url || !tab.url.includes('leetcode.com')) {
      showNotification('Please navigate to LeetCode to use this feature', 'warning');
      return;
    }
    
    console.log('Attempting quick random on tab:', tab.id, tab.url);
    
    // Try to send message to content script
    try {
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'triggerSmartFilter' });
      console.log('Quick random result:', result);
      
      if (result && result.success) {
        showNotification('Smart filter activated!', 'success');
      } else {
        showNotification('Failed to trigger smart filter', 'error');
      }
    } catch (messageError) {
      console.log('Message error:', messageError);
      
      // If content script is not ready, try to inject it
      if (messageError.message.includes("Could not establish connection")) {
        console.log('Content script not ready, attempting to inject...');
        
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-script.js']
          });
          
          // Wait a bit for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Try again
          try {
            const retryResult = await chrome.tabs.sendMessage(tab.id, { action: 'triggerSmartFilter' });
            console.log('Retry result:', retryResult);
            
            if (retryResult && retryResult.success) {
              showNotification('Smart filter activated!', 'success');
            } else {
              showNotification('Failed to trigger smart filter after injection', 'error');
            }
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            showNotification('Please refresh the LeetCode page and try again', 'warning');
          }
        } catch (injectionError) {
          console.error('Failed to inject content script:', injectionError);
          showNotification('Failed to initialize extension. Please refresh the LeetCode page.', 'error');
        }
      } else {
        throw messageError;
      }
    }
  } catch (error) {
    console.error('Error in quick random:', error);
    
    let errorMessage = 'Error triggering quick random';
    if (error.message.includes('Could not establish connection')) {
      errorMessage = 'Extension not ready. Please refresh the LeetCode page and try again.';
    } else if (error.message.includes('Failed to initialize')) {
      errorMessage = 'Extension initialization failed. Please refresh the page.';
    } else {
      errorMessage = error.message || 'Unknown error occurred';
    }
    
    showNotification(errorMessage, 'error');
  }
}

// Handle clear filters
async function handleClearFilters() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      showNotification('No active tab found', 'error');
      return;
    }

    if (!tab.url || !tab.url.includes('leetcode.com')) {
      showNotification('Please navigate to LeetCode to use this feature', 'warning');
      return;
    }

    console.log('Attempting to clear filters on tab:', tab.id, tab.url);

    // Try to send message to content script
    try {
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'clearFilters' });
      console.log('Clear filters result:', result);

      if (result && result.success) {
        showNotification('Filters cleared!', 'success');
      } else {
        showNotification('Failed to clear filters', 'error');
      }
    } catch (messageError) {
      console.log('Message error:', messageError);

      // If content script is not ready, try to inject it
      if (messageError.message.includes("Could not establish connection")) {
        console.log('Content script not ready, attempting to inject...');

        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-script.js']
          });

          // Wait a bit for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Try again
          try {
            const retryResult = await chrome.tabs.sendMessage(tab.id, { action: 'clearFilters' });
            console.log('Retry result:', retryResult);

            if (retryResult && retryResult.success) {
              showNotification('Filters cleared!', 'success');
            } else {
              showNotification('Failed to clear filters after injection', 'error');
            }
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            showNotification('Please refresh the LeetCode page and try again', 'warning');
          }
        } catch (injectionError) {
          console.error('Failed to inject content script:', injectionError);
          showNotification('Failed to initialize extension. Please refresh the LeetCode page.', 'error');
        }
      } else {
        throw messageError;
      }
    }
  } catch (error) {
    console.error('Error in handleClearFilters:', error);
    showNotification('Error clearing filters', 'error');
  }
}

// Handle refresh page
async function handleRefreshPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      showNotification('No active tab found', 'error');
      return;
    }

    if (!tab.url || !tab.url.includes('leetcode.com')) {
      showNotification('Please navigate to LeetCode to use this feature', 'warning');
      return;
    }

    console.log('Attempting to refresh page on tab:', tab.id, tab.url);

    // Try to send message to content script
    try {
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'refreshPage' });
      console.log('Refresh page result:', result);

      if (result && result.success) {
        showNotification('Page refreshed!', 'success');
      } else {
        showNotification('Failed to refresh page', 'error');
      }
    } catch (messageError) {
      console.log('Message error:', messageError);

      // If content script is not ready, try to inject it
      if (messageError.message.includes("Could not establish connection")) {
        console.log('Content script not ready, attempting to inject...');

        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-script.js']
          });

          // Wait a bit for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Try again
          try {
            const retryResult = await chrome.tabs.sendMessage(tab.id, { action: 'refreshPage' });
            console.log('Retry result:', retryResult);

            if (retryResult && retryResult.success) {
              showNotification('Page refreshed!', 'success');
            } else {
              showNotification('Failed to refresh page after injection', 'error');
            }
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            showNotification('Please refresh the LeetCode page and try again', 'warning');
          }
        } catch (injectionError) {
          console.error('Failed to inject content script:', injectionError);
          showNotification('Failed to initialize extension. Please refresh the LeetCode page.', 'error');
        }
      } else {
        throw messageError;
      }
    }
  } catch (error) {
    console.error('Error in handleRefreshPage:', error);
    showNotification('Error refreshing page', 'error');
  }
}

// Reset settings to default
async function resetSettingsToDefault() {
  try {
    const defaultSettings = {
      hideSolved: false,
      hidePremium: false,
      skillBased: true,
      includedTopics: [],
      excludedTopics: [],
      difficulties: ['easy', 'medium', 'hard'],
      skillLevel: 'beginner'
    };
    
    const result = await chrome.runtime.sendMessage({ 
      action: 'updateSettings', 
      settings: defaultSettings 
    });
    
    if (result.success) {
      // Reload the popup to reflect changes
      window.location.reload();
    }
  } catch (error) {
    console.error('Error resetting settings:', error);
    showNotification('Error resetting settings', 'error');
  }
}

// Assess skill level
async function assessSkillLevel() {
  try {
    const assessButton = document.getElementById('assess-skill');
    if (assessButton) {
      assessButton.disabled = true;
      assessButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Assessing...';
    }
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('No active tab found');
    }
    
    if (!tab.url || !tab.url.includes('leetcode.com')) {
      showNotification('Please navigate to LeetCode to assess your skills', 'warning');
      return;
    }
    
    console.log('Attempting to assess skills on tab:', tab.id, tab.url);
    
    // Try to send message to content script
    try {
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'assessSkills' });
      console.log('Skill assessment result:', result);
      
      if (result && result.success) {
        updateSkillLevelDisplay(result.skillLevel);
        showNotification('Skill assessment completed!', 'success');
        
        // Save the skill level to storage
        try {
          await chrome.runtime.sendMessage({ 
            action: 'updateSettings', 
            settings: { skillLevel: result.skillLevel } 
          });
        } catch (storageError) {
          console.log('Could not save skill level to storage:', storageError);
        }
      } else {
        throw new Error(result?.error || 'Assessment failed');
      }
    } catch (messageError) {
      console.log('Message error:', messageError);
      
      // If content script is not ready, try to inject it
      if (messageError.message.includes("Could not establish connection")) {
        console.log('Content script not ready, attempting to inject...');
        
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-script.js']
          });
          
          // Wait a bit for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Try again
          try {
            const retryResult = await chrome.tabs.sendMessage(tab.id, { action: 'assessSkills' });
            console.log('Retry result:', retryResult);
            
            if (retryResult && retryResult.success) {
              updateSkillLevelDisplay(retryResult.skillLevel);
              showNotification('Skill assessment completed!', 'success');
              
              // Save the skill level to storage
              try {
                await chrome.runtime.sendMessage({ 
                  action: 'updateSettings', 
                  settings: { skillLevel: retryResult.skillLevel } 
                });
              } catch (storageError) {
                console.log('Could not save skill level to storage:', storageError);
              }
              return;
            } else {
              throw new Error('Retry assessment failed');
            }
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            
            // Fallback: try to assess from the page directly
            console.log('Attempting fallback assessment...');
            try {
              const fallbackResult = await performFallbackAssessment(tab.id);
              if (fallbackResult) {
                updateSkillLevelDisplay(fallbackResult);
                showNotification('Skill assessment completed (fallback method)!', 'success');
                
                // Save the skill level to storage
                try {
                  await chrome.runtime.sendMessage({ 
                    action: 'updateSettings', 
                    settings: { skillLevel: fallbackResult } 
                  });
                } catch (storageError) {
                  console.log('Could not save skill level to storage:', storageError);
                }
                return;
              }
            } catch (fallbackError) {
              console.log('Fallback assessment also failed:', fallbackError);
            }
            
            throw new Error('Please refresh the LeetCode page and try again');
          }
        } catch (injectionError) {
          console.error('Failed to inject content script:', injectionError);
          
          // Fallback: try to assess from the page directly
          console.log('Attempting fallback assessment after injection failure...');
          try {
            const fallbackResult = await performFallbackAssessment(tab.id);
            if (fallbackResult) {
              updateSkillLevelDisplay(fallbackResult);
              showNotification('Skill assessment completed (fallback method)!', 'success');
              
              // Save the skill level to storage
              try {
                await chrome.runtime.sendMessage({ 
                  action: 'updateSettings', 
                  settings: { skillLevel: fallbackResult } 
                });
              } catch (storageError) {
                console.log('Could not save skill level to storage:', storageError);
              }
              return;
            }
          } catch (fallbackError) {
            console.log('Fallback assessment also failed:', fallbackError);
          }
          
          throw new Error('Failed to initialize extension. Please refresh the LeetCode page and try again.');
        }
      } else {
        throw messageError;
      }
    }
    
  } catch (error) {
    console.error('Error assessing skill level:', error);
    
    let errorMessage = 'Error assessing skill level';
    if (error.message.includes('Could not establish connection')) {
      errorMessage = 'Extension not ready. Please refresh the LeetCode page and try again.';
    } else if (error.message.includes('Failed to initialize')) {
      errorMessage = 'Extension initialization failed. Please refresh the page.';
    } else if (error.message.includes('No active tab')) {
      errorMessage = 'No active tab found. Please try again.';
    } else if (error.message.includes('Please refresh')) {
      errorMessage = error.message;
    } else {
      errorMessage = error.message || 'Unknown error occurred';
    }
    
    showNotification(errorMessage, 'error');
  } finally {
    const assessButton = document.getElementById('assess-skill');
    if (assessButton) {
      assessButton.disabled = false;
      assessButton.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Assess My Skills';
    }
  }
}

// Fallback skill assessment that runs directly in the page context
async function performFallbackAssessment(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: () => {
        try {
          console.log('Performing fallback skill assessment...');
          
          // Look for solved problems with multiple strategies
          const solvedSelectors = [
            'svg.text-green-s', 
            'svg[data-icon="fa-check"]', 
            '.text-green-s',
            '[data-status="solved"]',
            'svg[class*="green"]',
            'i[class*="check"]',
            'svg[class*="check"]',
            '.text-green-500',
            '.text-green-600',
            '[class*="solved"]',
            '[class*="accepted"]'
          ];
          
          let solvedCount = 0;
          
          // Search for solved indicators
          solvedSelectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              solvedCount += elements.length;
            } catch (e) {
              // Ignore selector errors
            }
          });
          
          // Also try to find solved count from profile/stats
          const profileSelectors = [
            '[class*="profile"]',
            '[class*="stats"]',
            '[class*="achievement"]',
            '[class*="solved"]',
            '[class*="count"]'
          ];
          
          profileSelectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              elements.forEach(element => {
                const text = element.textContent;
                const solvedMatch = text.match(/(\d+)\s*(?:problems?|solved)/i);
                if (solvedMatch) {
                  const count = parseInt(solvedMatch[1]);
                  if (count > solvedCount) {
                    solvedCount = count;
                  }
                }
              });
            } catch (e) {
              // Ignore selector errors
            }
          });
          
          console.log(`Fallback assessment: ${solvedCount} solved problems`);
          
          // Calculate skill level
          let skillLevel = 'beginner';
          if (solvedCount >= 200) skillLevel = 'expert';
          else if (solvedCount >= 100) skillLevel = 'advanced';
          else if (solvedCount >= 30) skillLevel = 'intermediate';
          else if (solvedCount >= 5) skillLevel = 'beginner';
          
          return skillLevel;
        } catch (error) {
          console.error('Error in fallback assessment:', error);
          return 'beginner';
        }
      }
    });
    
    if (results && results[0] && results[0].result) {
      return results[0].result;
    }
    
    return null;
  } catch (error) {
    console.error('Error in fallback assessment:', error);
    return null;
  }
}

// Update skill level display
function updateSkillLevelDisplay(skillLevel) {
  const skillLevelElement = document.getElementById('skill-level');
  const progressBar = document.getElementById('skill-progress-bar');
  
  if (skillLevelElement) {
    skillLevelElement.textContent = skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
  }
  
  if (progressBar) {
    // Remove existing skill classes
    progressBar.classList.remove('skill-beginner', 'skill-intermediate', 'skill-advanced', 'skill-expert');
    
    // Add new skill class and update width
    let width = '25%';
    let skillClass = 'skill-beginner';
    
    switch (skillLevel.toLowerCase()) {
      case 'beginner':
        width = '25%';
        skillClass = 'skill-beginner';
        break;
      case 'intermediate':
        width = '50%';
        skillClass = 'skill-intermediate';
        break;
      case 'advanced':
        width = '75%';
        skillClass = 'skill-advanced';
        break;
      case 'expert':
        width = '100%';
        skillClass = 'skill-expert';
        break;
    }
    
    progressBar.style.width = width;
    progressBar.classList.add(skillClass);
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}
