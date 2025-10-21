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
      // Send a 'ping' to see if the content script is alive
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
      if (result && result.success) {
        return { ready: true, tabId: tab.id };
      } else {
        // Content script might be there but didn't respond correctly
        console.warn("Content script ping failed or returned unsuccessful:", result);
        return { ready: false, reason: 'no-response', tabId: tab.id };
      }
    } catch (error) {
      // Log the specific error for debugging
      console.error("Error sending ping to content script:", error); 
      if (error.message.includes("Could not establish connection")) {
        return { ready: false, reason: 'no-content-script', tabId: tab.id };
      }
      // Handle other potential errors like target tab closed during query
      if (error.message.includes("No tab with id") || error.message.includes("Receiving end does not exist")) {
         return { ready: false, reason: 'tab-closed', tabId: tab.id };
      }
      return { ready: false, reason: 'error', error: error.message };
    }
  } catch (error) {
    console.error("Error querying tabs:", error);
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
      let message = 'Extension may not be ready.';
      let type = 'warning';
      if (status.reason === 'not-leetcode') {
         message = 'Please navigate to leetcode.com to use this extension.';
         type = 'info';
      } else if (status.reason === 'no-content-script' || status.reason === 'no-response') {
         message = 'Extension not active. Please refresh the LeetCode page.';
      } else if (status.reason === 'tab-closed') {
          message = 'LeetCode tab not found or closed.';
          type = 'error';
      } else {
          message = `An error occurred: ${status.error || 'Unknown error'}`;
          type = 'error';
          console.error("Content Script Status Check Error:", status);
      }
      showNotification(message, type);
    } else {
        console.log("Content script is ready on tab:", status.tabId);
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
  if (includeGrid) {
    // Clear previous topics if any (useful for potential reloads)
    includeGrid.innerHTML = ''; 
    topics.forEach(topic => {
      const label = document.createElement('label');
      label.className = 'topic-checkbox-label';
      label.innerHTML = `
        <input type="checkbox" class="topic-checkbox-input" value="${topic}">
        ${topic}
      `;
      includeGrid.appendChild(label);
    });
  } else {
      console.error("Element with ID 'include-topics-grid' not found.");
  }
  
  // Populate exclude topics grid
  const excludeGrid = document.getElementById('exclude-topics-grid');
  if (excludeGrid) {
    // Clear previous topics if any
    excludeGrid.innerHTML = '';
    topics.forEach(topic => {
      const label = document.createElement('label');
      label.className = 'topic-checkbox-label';
      label.innerHTML = `
        <input type="checkbox" class="topic-checkbox-input" value="${topic}">
        ${topic}
      `;
      excludeGrid.appendChild(label);
    });
  } else {
       console.error("Element with ID 'exclude-topics-grid' not found.");
  }
}

// Set up tab switching
function setupTabSwitching() {
  const includeTab = document.getElementById('include-tab');
  const excludeTab = document.getElementById('exclude-tab');
  const includeTopics = document.getElementById('include-topics');
  const excludeTopics = document.getElementById('exclude-topics');
  
  // Ensure all elements exist before adding listeners
  if (includeTab && excludeTab && includeTopics && excludeTopics) {
    includeTab.addEventListener('click', (e) => {
      e.target.style.transform = 'scale(0.95)';
      setTimeout(() => { e.target.style.transform = 'scale(1)'; }, 150);
      
      includeTab.classList.add('active');
      excludeTab.classList.remove('active');
      includeTopics.classList.remove('hidden');
      excludeTopics.classList.add('hidden');
      
      // Add transition effect
      requestAnimationFrame(() => {
          includeTopics.style.opacity = '0';
          includeTopics.style.transform = 'translateX(20px)';
          requestAnimationFrame(() => {
            includeTopics.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            includeTopics.style.opacity = '1';
            includeTopics.style.transform = 'translateX(0)';
          });
      });
    });
  
    excludeTab.addEventListener('click', (e) => {
      e.target.style.transform = 'scale(0.95)';
      setTimeout(() => { e.target.style.transform = 'scale(1)'; }, 150);
      
      excludeTab.classList.add('active');
      includeTab.classList.remove('active');
      excludeTopics.classList.remove('hidden');
      includeTopics.classList.add('hidden');
      
      // Add transition effect
       requestAnimationFrame(() => {
          excludeTopics.style.opacity = '0';
          excludeTopics.style.transform = 'translateX(-20px)';
           requestAnimationFrame(() => {
            excludeTopics.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            excludeTopics.style.opacity = '1';
            excludeTopics.style.transform = 'translateX(0)';
           });
       });
    });
  } else {
      console.error("Tab switching elements not found.");
  }
}

// Initialize skill assessment
function initializeSkillAssessment() {
  const assessButton = document.getElementById('assess-skill');
  if (assessButton) {
    assessButton.addEventListener('click', async (e) => {
      e.target.style.transform = 'scale(0.95)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'; // Restore hover shadow
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
        // Add visual feedback (optional)
        const container = e.target.closest('.toggle-container');
        if (container) {
          container.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease'; // Quicker transition
          container.style.transform = 'scale(1.03)';
          container.style.boxShadow = '0 6px 15px rgba(59, 130, 246, 0.2)';
          container.style.borderColor = '#3b82f6';
          
          setTimeout(() => {
            container.style.transform = 'scale(1)';
            container.style.boxShadow = ''; // Reset to default CSS
            container.style.borderColor = ''; // Reset to default CSS
          }, 150);
        }
        
        saveSettings();
      });
    } else {
        console.warn(`Toggle switch with ID '${toggleId}' not found.`);
    }
  });
  
  // Difficulty checkboxes
  const difficulties = ['easy-difficulty', 'medium-difficulty', 'hard-difficulty'];
  difficulties.forEach(diffId => {
    const checkbox = document.getElementById(diffId);
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        // Optional: Visual feedback could be added here similar to toggles
        saveSettings();
      });
    } else {
         console.warn(`Difficulty checkbox with ID '${diffId}' not found.`);
    }
  });
  
  // Topic checkboxes (Event delegation for dynamically added elements)
  const includeGrid = document.getElementById('include-topics-grid');
  const excludeGrid = document.getElementById('exclude-topics-grid');

  const handleTopicChange = (e) => {
      if (e.target.matches('.topic-checkbox-input')) {
          // Optional: Visual feedback for label
          const label = e.target.closest('.topic-checkbox-label');
           if (label) {
               label.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
               label.style.transform = e.target.checked ? 'scale(1.08)' : 'scale(0.95)';
               label.style.boxShadow = e.target.checked ? '0 6px 15px rgba(59, 130, 246, 0.3)' : '';
               setTimeout(() => {
                   label.style.transform = 'scale(1)';
                   label.style.boxShadow = '';
               }, 150);
           }
          saveSettings();
      }
  };

  if (includeGrid) {
      includeGrid.addEventListener('change', handleTopicChange);
  }
  if (excludeGrid) {
      excludeGrid.addEventListener('change', handleTopicChange);
  }
  
  // Quick actions
  const quickRandom = document.getElementById('quick-random');
  if (quickRandom) {
    quickRandom.addEventListener('click', async (e) => {
      e.target.style.transform = 'scale(0.95)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = ''; // Reset to default
      }, 150);
      
      await handleQuickRandom();
    });
  }
  
  const clearFilters = document.getElementById('clear-filters');
  if (clearFilters) {
    clearFilters.addEventListener('click', async (e) => {
      e.target.style.transform = 'scale(0.95)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = ''; // Reset to default
      }, 150);
      
      await handleClearFilters();
    });
  }
  
  const resetSettings = document.getElementById('reset-settings');
  if (resetSettings) {
    resetSettings.addEventListener('click', async (e) => {
       e.target.style.transform = 'scale(0.95)';
       e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
       setTimeout(() => {
         e.target.style.transform = 'scale(1)';
         e.target.style.boxShadow = ''; // Reset to default
       }, 150);
       
      await resetSettingsToDefault();
    });
  }
  
  const refreshPage = document.getElementById('refresh-page');
  if (refreshPage) {
    refreshPage.addEventListener('click', async (e) => {
       e.target.style.transform = 'scale(0.95)';
       e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
       setTimeout(() => {
         e.target.style.transform = 'scale(1)';
         e.target.style.boxShadow = ''; // Reset to default
       }, 150);
       
      await handleRefreshPage();
    });
  }
}

// Add sparkle effect to elements
function addSparkleEffect(element) {
  const sparkles = ['✨', '⭐', '💫', '🌟'];
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57'];
  
  for (let i = 0; i < 4; i++) { // Reduced number slightly
    const sparkle = document.createElement('span');
    sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)]; // Random sparkle
    sparkle.style.cssText = `
      position: absolute;
      font-size: ${12 + Math.random() * 6}px; /* Random size */
      color: ${colors[Math.floor(Math.random() * colors.length)]}; /* Random color */
      pointer-events: none;
      /* Use separate animations for position and fade */
      animation: sparkleMove 0.8s ease-out forwards, sparkleFade 0.8s ease-out forwards;
      z-index: 10;
      /* Random start position within the element */
      left: ${Math.random() * 100}%; 
      top: ${Math.random() * 100}%;
    `;
    
    // Ensure parent is positioned to contain absolute children
    if (window.getComputedStyle(element).position === 'static') {
      element.style.position = 'relative'; 
    }
    element.appendChild(sparkle);
    
    // Remove after animation (adjust time if animation duration changes)
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.remove();
      }
    }, 800);
  }
}

// Add CSS animations for enhanced interactions
function addEnhancedStyles() {
  const styleId = 'leetcode-smart-filter-animations';
  if (document.getElementById(styleId)) return; // Don't add multiple times

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes checkmarkAppear {
      0% { opacity: 0; transform: translateY(-50%) scale(0); }
      50% { opacity: 1; transform: translateY(-50%) scale(1.2); }
      100% { opacity: 1; transform: translateY(-50%) scale(1); }
    }
    
    /* Separate animations for sparkle */
    @keyframes sparkleMove {
      from { transform: translate(0, 0) rotate(0deg); }
      to { transform: translate(${(Math.random() - 0.5) * 40}px, -30px) rotate(${Math.random() * 360}deg); } /* Random horizontal & up movement */
    }
    @keyframes sparkleFade {
       from { opacity: 1; }
       to { opacity: 0; }
    }
    
    /* Hover effects (can be kept in CSS file too) */
    .toggle-container:hover, .difficulty-option:hover, .topic-checkbox-label:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    .action-button:hover, .assess-button:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 35px rgba(0,0,0,0.2);
    }
    /* Specific hover shadows from original CSS */
     .assess-button:hover {
        box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
     }
  `;
  document.head.appendChild(style);
}

// Load current settings
async function loadSettings() {
  try {
    const result = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (result && result.success) {
      const settings = result.settings;
      console.log('Loading settings:', settings); // Log loaded settings
      
      // Update toggle switches
      const solvedToggle = document.getElementById('solved-toggle');
      if (solvedToggle) solvedToggle.checked = !!settings.hideSolved; // Use !! for boolean conversion
      
      const premiumToggle = document.getElementById('premium-toggle');
      if (premiumToggle) premiumToggle.checked = !!settings.hidePremium;
      
      const skillToggle = document.getElementById('skill-based-toggle');
      if (skillToggle) skillToggle.checked = !!settings.skillBased;
      
      // Update difficulty checkboxes
      const difficulties = settings.difficulties || ['easy', 'medium', 'hard']; // Default if undefined
      ['easy', 'medium', 'hard'].forEach(diff => {
         const checkbox = document.getElementById(`${diff}-difficulty`);
         if (checkbox) checkbox.checked = difficulties.includes(diff);
      });
      
      // Update topic checkboxes
      const includedTopics = settings.includedTopics || [];
      document.querySelectorAll('#include-topics-grid .topic-checkbox-input').forEach(cb => {
          cb.checked = includedTopics.includes(cb.value);
      });

      const excludedTopics = settings.excludedTopics || [];
       document.querySelectorAll('#exclude-topics-grid .topic-checkbox-input').forEach(cb => {
          cb.checked = excludedTopics.includes(cb.value);
      });
      
      // Update skill level display
      if (settings.skillLevel) {
        updateSkillLevelDisplay(settings.skillLevel);
      } else {
        updateSkillLevelDisplay('beginner'); // Default if not set
      }
      
      console.log('Settings loaded successfully into UI.');
    } else {
        console.error('Failed to get settings from background script:', result?.error);
        showNotification('Could not load settings.', 'error');
    }
  } catch (error) {
    // Catch errors during message sending (e.g., background script inactive)
    console.error('Error sending getSettings message:', error);
    showNotification('Error contacting background script.', 'error');
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
      // Note: We don't save skillLevel here, it's saved by assessSkillLevel
    };
    
    console.log('Saving settings:', settings); // Log settings being saved

    const result = await chrome.runtime.sendMessage({ 
      action: 'updateSettings', 
      settings 
    });
    
    if (result && result.success) {
      console.log('Settings saved successfully via background script.');
      // Subtle confirmation instead of notification spam on every click
      // showNotification('Settings saved!', 'success'); 
    } else {
        console.error('Failed to save settings via background script:', result?.error);
        showNotification('Error saving settings', 'error');
    }
  } catch (error) {
     // Catch errors during message sending
    console.error('Error sending updateSettings message:', error);
    showNotification('Error contacting background script to save.', 'error');
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
  
  // If none selected, default to all (or consider user preference?)
  // return difficulties.length > 0 ? difficulties : ['easy', 'medium', 'hard']; 
  return difficulties; // Return empty if none selected, filtering logic handles this
}

// Get selected topics
function getSelectedTopics(type) {
  const grid = document.getElementById(`${type}-topics-grid`);
  if (!grid) return [];
  const checkboxes = grid.querySelectorAll('.topic-checkbox-input:checked'); // More specific selector
  return Array.from(checkboxes).map(cb => cb.value);
}

// Handle quick random ("Smart Pick")
async function handleQuickRandom() {
  try {
    const status = await checkContentScriptStatus(); // Check readiness first
    if (!status.ready) {
        let message = 'Extension is not ready.';
         if (status.reason === 'not-leetcode') {
           message = 'Please navigate to LeetCode first.';
         } else if (status.reason === 'no-content-script' || status.reason === 'no-response') {
           message = 'Please refresh the LeetCode page and try again.';
         }
        showNotification(message, 'warning');
        return; // Stop if not ready
    }

    const tabId = status.tabId;
    console.log('Attempting Smart Pick on tab:', tabId);
    
    // Try to send message to content script
    try {
      const result = await chrome.tabs.sendMessage(tabId, { action: 'triggerSmartRandom' });
      console.log('Smart Pick result:', result);
      
      if (result && result.success) {
        // Notification is handled by content script on navigation start
        // showNotification('Smart Pick activated!', 'success'); 
        window.close(); // Close popup on success
      } else {
        // Content script might have failed internally
        console.error("Content script reported failure for triggerSmartRandom:", result?.error);
        showNotification(result?.error || 'Failed to trigger Smart Pick', 'error');
      }
    } catch (messageError) {
      // Error sending the message itself (connection lost, etc.)
      console.error('Error sending triggerSmartRandom message:', messageError);
       if (messageError.message.includes("Could not establish connection") || messageError.message.includes("Receiving end does not exist")) {
         showNotification('Connection lost. Please refresh LeetCode page.', 'error');
       } else {
         showNotification('Error communicating with page.', 'error');
       }
    }
  } catch (error) {
    // Error during the initial checkContentScriptStatus or tab query
    console.error('Error in handleQuickRandom:', error);
    showNotification('Could not get LeetCode tab info.', 'error');
  }
}

// Handle clear filters
async function handleClearFilters() {
   try {
    const status = await checkContentScriptStatus();
    if (!status.ready) {
        let message = 'Extension is not ready.';
         if (status.reason === 'not-leetcode') {
           message = 'Please navigate to LeetCode first.';
         } else if (status.reason === 'no-content-script' || status.reason === 'no-response') {
           message = 'Please refresh the LeetCode page and try again.';
         }
        showNotification(message, 'warning');
        return;
    }

    const tabId = status.tabId;
    console.log('Attempting to clear filters on tab:', tabId);

    try {
      const result = await chrome.tabs.sendMessage(tabId, { action: 'clearFilters' });
      console.log('Clear filters result:', result);
      if (result && result.success) {
        showNotification('Filters cleared on page!', 'success');
      } else {
        console.error("Content script reported failure for clearFilters:", result?.error);
        showNotification(result?.error || 'Failed to clear filters on page.', 'error');
      }
    } catch (messageError) {
      console.error('Error sending clearFilters message:', messageError);
       if (messageError.message.includes("Could not establish connection") || messageError.message.includes("Receiving end does not exist")) {
         showNotification('Connection lost. Please refresh LeetCode page.', 'error');
       } else {
         showNotification('Error communicating with page.', 'error');
       }
    }
  } catch (error) {
    console.error('Error in handleClearFilters:', error);
     showNotification('Could not get LeetCode tab info.', 'error');
  }
}

// Handle refresh page
async function handleRefreshPage() {
   try {
    const status = await checkContentScriptStatus();
    if (!status.ready) {
        let message = 'Extension is not ready.';
         if (status.reason === 'not-leetcode') {
           message = 'Cannot refresh, not on LeetCode.';
         } else if (status.reason === 'no-content-script' || status.reason === 'no-response') {
           message = 'Cannot send refresh command. Refresh manually or reload extension.';
         }
        showNotification(message, 'warning');
        // As a fallback, try direct refresh if content script is missing
        if (status.reason !== 'not-leetcode' && status.tabId) {
             console.log("Attempting direct refresh fallback...");
             try {
                 await chrome.tabs.reload(status.tabId);
                 showNotification('Page refresh initiated (fallback).', 'info');
                 window.close();
             } catch (reloadError) {
                  console.error("Direct refresh fallback failed:", reloadError);
                  showNotification('Failed to refresh page.', 'error');
             }
        }
        return;
    }

    const tabId = status.tabId;
    console.log('Attempting to refresh page via content script on tab:', tabId);

    try {
      // Send message, but don't necessarily wait for response as page reloads
      chrome.tabs.sendMessage(tabId, { action: 'refreshPage' }).catch(e => console.log("Ignoring error sending refresh message:", e));
      showNotification('Page refresh initiated!', 'info');
      setTimeout(window.close, 300); // Close popup shortly after sending command

    } catch (messageError) {
      // This catch might not be reliable if sendMessage doesn't throw before reload starts
      console.error('Error sending refreshPage message:', messageError);
      showNotification('Error initiating refresh.', 'error');
    }
  } catch (error) {
    console.error('Error in handleRefreshPage:', error);
    showNotification('Could not get LeetCode tab info.', 'error');
  }
}

// Reset settings to default
async function resetSettingsToDefault() {
  try {
    // Show confirmation dialog? (Optional)
    // if (!confirm("Are you sure you want to reset all settings to their defaults?")) {
    //     return;
    // }

    const defaultSettings = {
      hideSolved: false,
      hidePremium: false,
      skillBased: true,
      includedTopics: [],
      excludedTopics: [],
      difficulties: ['easy', 'medium', 'hard'],
      skillLevel: 'beginner' // Reset skill level too
    };
    
    const result = await chrome.runtime.sendMessage({ 
      action: 'updateSettings', 
      settings: defaultSettings 
    });
    
    if (result && result.success) {
      showNotification('Settings reset to default!', 'success');
      // Reload the popup UI to reflect changes immediately
      loadSettings(); // Call loadSettings instead of full page reload
    } else {
        console.error("Failed to reset settings via background script:", result?.error);
        showNotification('Error resetting settings.', 'error');
    }
  } catch (error) {
    console.error('Error sending reset settings message:', error);
    showNotification('Error contacting background script to reset.', 'error');
  }
}

// Assess skill level
async function assessSkillLevel() {
  const assessButton = document.getElementById('assess-skill');
  try {
     if (assessButton) {
      assessButton.disabled = true;
      assessButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Assessing...';
    }

    const status = await checkContentScriptStatus();
    if (!status.ready) {
        let message = 'Cannot assess skills now.';
         if (status.reason === 'not-leetcode') {
           message = 'Please navigate to LeetCode first.';
         } else if (status.reason === 'no-content-script' || status.reason === 'no-response') {
           message = 'Please refresh the LeetCode page and try again.';
         }
        showNotification(message, 'warning');
        return; // Stop if not ready
    }
    
    const tabId = status.tabId;
    console.log('Attempting to assess skills on tab:', tabId);
    
    // Try to send message to content script
    try {
      const result = await chrome.tabs.sendMessage(tabId, { action: 'assessSkills' });
      console.log('Skill assessment result:', result);
      
      if (result && result.success && result.skillLevel) {
        updateSkillLevelDisplay(result.skillLevel);
        showNotification(`Skill assessment completed: ${result.skillLevel}!`, 'success');
        
        // Save the assessed skill level back to storage via background script
        try {
          await chrome.runtime.sendMessage({ 
            action: 'updateSettings', 
            settings: { skillLevel: result.skillLevel } // Only update skillLevel
          });
          console.log("Assessed skill level saved.");
        } catch (storageError) {
          console.error('Could not save assessed skill level to storage:', storageError);
          // Non-critical error, assessment still displayed
        }
      } else {
         console.error("Content script failed assessment:", result?.error);
         throw new Error(result?.error || 'Assessment failed in content script');
      }
    } catch (messageError) {
       console.error('Error sending assessSkills message:', messageError);
       if (messageError.message.includes("Could not establish connection") || messageError.message.includes("Receiving end does not exist")) {
         showNotification('Connection lost. Please refresh LeetCode page.', 'error');
       } else {
          // Attempt fallback assessment directly if messaging fails
          console.log("Attempting fallback skill assessment...");
          try {
              const fallbackLevel = await performFallbackAssessment(tabId);
              if (fallbackLevel) {
                  updateSkillLevelDisplay(fallbackLevel);
                  showNotification(`Skill assessed (fallback): ${fallbackLevel}!`, 'success');
                   // Save fallback level
                   await chrome.runtime.sendMessage({ action: 'updateSettings', settings: { skillLevel: fallbackLevel }});
              } else {
                  throw new Error("Fallback assessment returned null");
              }
          } catch (fallbackError) {
               console.error("Fallback assessment also failed:", fallbackError);
               showNotification('Error assessing skills, even with fallback.', 'error');
          }
       }
    }
  } catch (error) {
    // General errors (tab query, etc.)
    console.error('Error in assessSkillLevel:', error);
    showNotification(error.message || 'Unknown error during skill assessment', 'error');
  } finally {
    // Re-enable button regardless of outcome
    if (assessButton) {
      assessButton.disabled = false;
      assessButton.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Assess My Skills';
    }
  }
}

// Fallback skill assessment that runs directly in the page context
async function performFallbackAssessment(tabId) {
  if (!tabId) return null; // Need tabId for scripting execution
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      // Inject the isProblemSolved function and assessment logic
      func: () => {
          // --- Start of injected code ---
          // Helper function (must be self-contained)
          const injectedIsProblemSolved = (rowEl) => {
              const selectors = ['svg.text-green-s', 'svg[data-icon="fa-check"]', '.text-green-s', '[data-status="solved"]','svg[class*="green"]','svg[class*="check"]','.text-green-500'];
              if (selectors.some(s => rowEl.querySelector(s))) return true;
              const indicators = rowEl.querySelectorAll('svg, i, span, div');
              for (const ind of indicators) {
                const cn = ind.className || '';
                if (typeof cn === 'string' && (cn.includes('green') || cn.includes('check') || cn.includes('solved'))) return true;
              }
              return false;
          };

          // Main assessment logic (must be self-contained)
          try {
            console.log('Performing fallback skill assessment (injected)...');
            let solvedCount = 0;
            const problemsTable = document.querySelector('div[role="rowgroup"]'); // Primary target
            if (problemsTable) {
                const problemRows = problemsTable.querySelectorAll(':scope > div[role="row"]');
                problemRows.forEach(row => {
                   if (!row.querySelector('[role="columnheader"]') && row.querySelector('a[href*="/problems/"]')) {
                       if (injectedIsProblemSolved(row)) {
                           solvedCount++;
                       }
                   }
                });
            } else {
                console.warn("Fallback assessment: Problem table not found.");
                // Try simpler count if table fails
                const solvedIndicators = document.querySelectorAll('svg.text-green-s, svg[data-icon="fa-check"], .text-green-s, [data-status="solved"], svg[class*="green"], svg[class*="check"]');
                solvedCount = solvedIndicators.length; // Less accurate, but better than nothing
            }

            // Profile stats are harder to get reliably without message passing
            console.log(`Fallback assessment: Found ~${solvedCount} solved indicators.`);
            
            // Calculate skill level
            let skillLevel = 'beginner';
            if (solvedCount >= 200) skillLevel = 'expert';
            else if (solvedCount >= 100) skillLevel = 'advanced';
            else if (solvedCount >= 30) skillLevel = 'intermediate';
            else if (solvedCount >= 5) skillLevel = 'beginner'; 
            
            return skillLevel;
          } catch (error) {
            console.error('Error within injected fallback assessment:', error);
            return 'beginner'; // Default on error inside injection
          }
          // --- End of injected code ---
      }
    });
    
    // Check results from executeScript
    if (results && results[0] && results[0].result) {
      console.log("Fallback assessment successful, result:", results[0].result);
      return results[0].result;
    } else {
       console.warn("Fallback assessment executeScript returned no result or failed.");
       return null;
    }
  } catch (error) {
    // Error executing the script itself (permissions, invalid target, etc.)
    console.error('Error executing fallback assessment script:', error);
    return null;
  }
}

// Update skill level display
function updateSkillLevelDisplay(skillLevel) {
  const skillLevelElement = document.getElementById('skill-level');
  const progressBar = document.getElementById('skill-progress-bar');
  
  if (skillLevelElement) {
    // Capitalize first letter
    skillLevelElement.textContent = skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
  }
  
  if (progressBar) {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const lowerSkillLevel = skillLevel.toLowerCase();

    // Ensure skillLevel is valid before proceeding
    if (!validLevels.includes(lowerSkillLevel)) {
        console.warn(`Invalid skill level "${skillLevel}" passed to updateSkillLevelDisplay. Defaulting to beginner.`);
        skillLevel = 'beginner'; 
    } else {
        skillLevel = lowerSkillLevel; // Use the validated lowercase version
    }

    // Remove existing skill classes
    progressBar.classList.remove('skill-beginner', 'skill-intermediate', 'skill-advanced', 'skill-expert');
    
    // Add new skill class and update width
    let width = '25%'; // Default to beginner
    let skillClass = 'skill-beginner';
    
    switch (skillLevel) {
      // case 'beginner': // Already default
      //   break;
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
    
    // Apply styles
    progressBar.style.width = width;
    progressBar.classList.add(skillClass);
  }
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  // Make accessible
  notification.setAttribute('role', 'alert');
  notification.style.position = 'fixed'; // Ensure it's fixed
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '2147483647'; // Max z-index
  // Add base styles that might be missing from CSS
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '8px';
  notification.style.color = 'white';
  notification.style.fontSize = '14px';
  notification.style.fontWeight = '500';
  notification.style.maxWidth = '300px';
  notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  
  // Add type-specific background
  switch (type) {
      case 'success': notification.style.background = 'linear-gradient(135deg, #10b981, #059669)'; break;
      case 'error': notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)'; break;
      case 'warning': notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)'; break;
      default: notification.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)'; break; // info
  }

  // Animate in
  notification.style.opacity = '0';
  notification.style.transform = 'translateX(100%)';
  notification.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';

  document.body.appendChild(notification);

  // Trigger animation
  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  });
  
  // Remove after duration
  setTimeout(() => {
    if (notification.parentNode) {
      // Animate out
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      // Remove element after transition finishes
      notification.addEventListener('transitionend', () => {
         if (notification.parentNode) {
            notification.remove();
         }
      }, { once: true });
    }
  }, duration);
}