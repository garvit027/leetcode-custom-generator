// content-script.js
// Enhanced content script with AI skill assessment, advanced filtering, and smart question recommendations

// Global variables to store user settings and problem data
let userSettings = {};
let problemData = [];
let userSkillLevel = 'beginner';

// Function to find the button container on the LeetCode page
function findRandomButtonContainer() {
  // Try multiple selectors to find the random button or its container
  const selectors = [
    'a[href="/problems/random-one-question/"]',
    'a[href*="random-one-question"]',
    'button[data-cy="random-question"]',
    '[data-cy="random-question"]',
    '.random-question-btn',
    '.random-btn',
    'button:contains("Random")',
    'a:contains("Random")'
  ];

  let randomButton = null;
  
  // Try each selector
  for (const selector of selectors) {
    try {
      if (selector.includes(':contains')) {
        // Handle text-based selectors
        const elements = document.querySelectorAll('a, button');
        for (const el of elements) {
          if (el.textContent.toLowerCase().includes('random')) {
            randomButton = el;
            break;
          }
        }
      } else {
        randomButton = document.querySelector(selector);
      }
      if (randomButton) break;
    } catch (e) {
      console.log('Selector failed:', selector, e);
    }
  }

  if (randomButton) {
    // Try to find the parent container
    let container = randomButton.parentElement;
    
    // Look for common container classes
    const containerSelectors = [
      '.flex', '.flex-row', '.gap-2', '.gap-3', '.gap-4',
      '.space-x-2', '.space-x-3', '.space-x-4',
      '[class*="flex"]', '[class*="gap"]', '[class*="space"]'
    ];
    
    // Go up a few levels to find a good container
    for (let i = 0; i < 5 && container; i++) {
      for (const selector of containerSelectors) {
        if (container.matches(selector)) {
          console.log('Found container at level', i, container);
          return container;
        }
      }
      container = container.parentElement;
    }
    
    // If no specific container found, return the immediate parent
    return randomButton.parentElement;
  }

  // Fallback: look for common button areas
  const fallbackSelectors = [
    '.flex.gap-2', '.flex.gap-3', '.flex.gap-4',
    '.space-x-2', '.space-x-3', '.space-x-4',
    '[class*="button"]', '[class*="action"]', '[class*="toolbar"]'
  ];

  for (const selector of fallbackSelectors) {
    try {
      const container = document.querySelector(selector);
      if (container && container.children.length > 0) {
        console.log('Found fallback container:', container);
        return container;
      }
    } catch (e) {
      console.log('Fallback selector failed:', selector, e);
    }
  }

  // Last resort: create a container in the header area
  const headerSelectors = [
    'header', '.header', '[class*="header"]',
    'nav', '.nav', '[class*="nav"]',
    '.flex.items-center', '.flex.justify-between'
  ];

  for (const selector of headerSelectors) {
    try {
      const header = document.querySelector(selector);
      if (header) {
        console.log('Creating container in header:', header);
        return header;
      }
    } catch (e) {
      console.log('Header selector failed:', selector, e);
    }
  }

  console.warn("Could not find any suitable button container on the page.");
  return null;
}

// Enhanced function to check if a problem is solved
function isProblemSolved(rowElement) {
  // Multiple ways LeetCode indicates solved problems
  const solvedIndicators = [
    'svg.text-green-s', // Green checkmark
    'svg[data-icon="fa-check"]', // Check icon
    '.text-green-s', // Green text class
    '[data-status="solved"]' // Data attribute
  ];
  
  return solvedIndicators.some(selector => rowElement.querySelector(selector));
}

// Enhanced function to check if a problem is premium
function isProblemPremium(rowElement) {
  // Multiple ways LeetCode indicates premium problems
  const premiumIndicators = [
    'svg[data-icon="fa-lock"]', // Lock icon
    'svg[data-icon="fa-crown"]', // Crown icon
    '.text-yellow-s', // Yellow text (premium indicator)
    '[data-premium="true"]', // Data attribute
    '.premium-badge' // Premium badge class
  ];
  
  return premiumIndicators.some(selector => rowElement.querySelector(selector));
}

// Function to get problem difficulty
function getProblemDifficulty(rowElement) {
  const difficultyElements = rowElement.querySelectorAll('[class*="difficulty"]');
  for (const element of difficultyElements) {
    const className = element.className.toLowerCase();
    if (className.includes('easy')) return 'easy';
    if (className.includes('medium')) return 'medium';
    if (className.includes('hard')) return 'hard';
  }
  return 'medium'; // Default fallback
}

// Enhanced function to get problem topics
function getProblemTopics(rowElement) {
  const topicElements = rowElement.querySelectorAll('a[href*="/tag/"], [class*="tag"]');
  const topics = [];
  
  topicElements.forEach(el => {
    let topic = '';
    if (el.href) {
      // Extract topic from URL
      topic = el.href.split('/').pop();
    } else if (el.textContent) {
      // Extract topic from text content
      topic = el.textContent.trim().toLowerCase();
    }
    
    if (topic && !topics.includes(topic)) {
      topics.push(topic);
    }
  });
  
  return topics;
}

// Function to get problem ID and title
function getProblemInfo(rowElement) {
  const linkElement = rowElement.querySelector('a[href*="/problems/"]');
  if (linkElement) {
    const href = linkElement.href;
    const problemId = href.split('/problems/')[1]?.split('/')[0];
    const title = linkElement.textContent?.trim();
    return { id: problemId, title, href };
  }
  return null;
}

// AI-powered skill level assessment
async function assessUserSkillLevel() {
  try {
    // Get user's submission history and problem solving patterns
    const userData = await collectUserData();
    const skillLevel = calculateSkillLevel(userData);
    
    // Save to storage
    chrome.storage.local.set({ 
      skillLevel, 
      lastAssessment: Date.now(),
      userData 
    });
    
    return skillLevel;
  } catch (error) {
    console.error('Error assessing skill level:', error);
    return 'beginner'; // Default fallback
  }
}

// Collect user data from LeetCode pages
async function collectUserData() {
  const userData = {
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    recentSubmissions: 0,
    averageTime: 0,
    streakDays: 0,
    topicPerformance: {},
    difficultyPerformance: {}
  };

  try {
    // Try to get data from profile page
    const profileResponse = await fetch('https://leetcode.com/api/user/');
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      // Parse profile data if available
      // This is a simplified version - real implementation would parse the actual API response
    }
  } catch (error) {
    console.log('Could not fetch profile data, using fallback method');
  }

  // Fallback: analyze current problems page
  const problemRows = document.querySelectorAll('div[role="row"]');
  let totalProblems = 0;
  let solvedProblems = 0;

  problemRows.forEach(row => {
    const isSolved = isProblemSolved(row);
    const difficulty = getProblemDifficulty(row);
    const topics = getProblemTopics(row);
    
    if (isSolved) {
      solvedProblems++;
      userData[`${difficulty}Solved`]++;
      
      // Track topic performance
      topics.forEach(topic => {
        if (!userData.topicPerformance[topic]) {
          userData.topicPerformance[topic] = { solved: 0, total: 0 };
        }
        userData.topicPerformance[topic].solved++;
      });
    }
    
    totalProblems++;
    
    // Track difficulty distribution
    if (!userData.difficultyPerformance[difficulty]) {
      userData.difficultyPerformance[difficulty] = { solved: 0, total: 0 };
    }
    userData.difficultyPerformance[difficulty].total++;
  });

  userData.totalSolved = solvedProblems;
  
  return userData;
}

// Calculate skill level based on collected data
function calculateSkillLevel(userData) {
  const { totalSolved, easySolved, mediumSolved, hardSolved } = userData;
  
  // Calculate weighted score
  let score = 0;
  score += totalSolved * 0.3;
  score += (mediumSolved + hardSolved) * 0.4;
  score += hardSolved * 0.3;
  
  // Determine skill level
  if (score < 50) return 'beginner';
  if (score < 150) return 'intermediate';
  if (score < 300) return 'advanced';
  return 'expert';
}

// Get recommended difficulty based on skill level
function getRecommendedDifficulty(skillLevel) {
  const difficultyMap = {
    beginner: ['easy', 'medium'],
    intermediate: ['easy', 'medium', 'hard'],
    advanced: ['medium', 'hard'],
    expert: ['hard']
  };
  
  return difficultyMap[skillLevel] || ['easy', 'medium', 'hard'];
}

// Enhanced filtering function
function filterProblems(problems, settings) {
  return problems.filter(problem => {
    // Check if problem is solved
    if (settings.hideSolved && problem.solved) {
      return false;
    }
    
    // Check if problem is premium
    if (settings.hidePremium && problem.premium) {
      return false;
    }
    
    // Check difficulty filter
    if (settings.difficulties && settings.difficulties.length > 0) {
      if (!settings.difficulties.includes(problem.difficulty)) {
        return false;
      }
    }
    
    // Check include topics filter
    if (settings.includedTopics && settings.includedTopics.length > 0) {
      const hasIncludedTopic = settings.includedTopics.some(topic => 
        problem.topics.includes(topic)
      );
      if (!hasIncludedTopic) {
        return false;
      }
    }
    
    // Check exclude topics filter
    if (settings.excludedTopics && settings.excludedTopics.length > 0) {
      const hasExcludedTopic = settings.excludedTopics.some(topic => 
        problem.topics.includes(topic)
      );
      if (hasExcludedTopic) {
        return false;
      }
    }
    
    // Skill-based difficulty adjustment
    if (settings.skillBased) {
      const recommendedDifficulties = getRecommendedDifficulty(userSkillLevel);
      if (!recommendedDifficulties.includes(problem.difficulty)) {
        return false;
      }
    }
    
    return true;
  });
}

// Collect all problem data from the current page
function collectProblemData() {
  const problemRows = document.querySelectorAll('div[role="row"]');
  const problems = [];
  
  problemRows.forEach(row => {
    const problemInfo = getProblemInfo(row);
    if (problemInfo) {
      problems.push({
        ...problemInfo,
        solved: isProblemSolved(row),
        premium: isProblemPremium(row),
        difficulty: getProblemDifficulty(row),
        topics: getProblemTopics(row)
      });
    }
  });
  
  return problems;
}

// Function to show notifications
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.leetcode-notification');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `leetcode-notification ${type}`;
  notification.textContent = message;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
  `;
  
  // Add type-specific styles
  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
  } else if (type === 'warning') {
    notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
  }
  
  // Add keyframe animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-out';
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
}

// Function to inject the new button into the LeetCode page
function injectNewButton() {
  const container = findRandomButtonContainer();
  
  if (!container) {
    console.warn("No suitable button container found. Creating a new container in the page header.");
    
    // Try to create a container in the header area
    const headerSelectors = [
      'header', '.header', '[class*="header"]',
      'nav', '.nav', '[class*="nav"]',
      '.flex.items-center', '.flex.justify-between',
      '[data-cy="header"]', '[data-cy="nav"]'
    ];
    
    let header = null;
    for (const selector of headerSelectors) {
      try {
        header = document.querySelector(selector);
        if (header) break;
      } catch (e) {
        console.log('Header selector failed:', selector, e);
      }
    }
    
    if (header) {
      // Create a new button container in the header
      const newContainer = document.createElement('div');
      newContainer.className = 'flex items-center gap-2 ml-4';
      newContainer.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-left: 1rem;';
      
      // Insert the container into the header
      header.appendChild(newContainer);
      console.log('Created new button container in header:', newContainer);
      
      // Create and inject the button
      createAndInjectButton(newContainer);
      return;
    }
    
    // Last resort: create a floating button
    console.warn("Creating floating button as last resort");
    createFloatingButton();
    return;
  }
  
  // Check if button already exists
  if (container.querySelector('#leetcode-smart-filter-btn')) {
    console.log('Button already exists, skipping injection');
    return;
  }
  
  createAndInjectButton(container);
}

// Function to create and inject the button into a container
function createAndInjectButton(container) {
  const button = document.createElement('button');
  button.id = 'leetcode-smart-filter-btn';
  button.className = 'leetcode-smart-filter-btn';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
    </svg>
    Smart Filter
  `;
  
  // Add styles
  button.style.cssText = `
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    margin-left: 8px;
  `;
  
  // Add hover effects
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
  });
  
  // Add click handler
  button.addEventListener('click', handleSmartFilterClick);
  
  // Insert the button
  container.appendChild(button);
  console.log('Successfully injected Smart Filter button into container:', container);
}

// Function to create a floating button as last resort
function createFloatingButton() {
  const floatingButton = document.createElement('button');
  floatingButton.id = 'leetcode-smart-filter-btn';
  floatingButton.className = 'leetcode-smart-filter-btn floating';
  floatingButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
    </svg>
    Smart Filter
  `;
  
  // Add floating button styles
  floatingButton.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 10000;
    display: inline-flex;
    align-items: center;
    padding: 12px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    backdrop-filter: blur(10px);
  `;
  
  // Add hover effects
  floatingButton.addEventListener('mouseenter', () => {
    floatingButton.style.transform = 'translateY(-2px) scale(1.05)';
    floatingButton.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)';
  });
  
  floatingButton.addEventListener('mouseleave', () => {
    floatingButton.style.transform = 'translateY(0) scale(1)';
    floatingButton.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
  });
  
  // Add click handler
  floatingButton.addEventListener('click', handleSmartFilterClick);
  
  // Insert the floating button
  document.body.appendChild(floatingButton);
  console.log('Created floating Smart Filter button as last resort');
}

// Handle the smart filter button click
function handleSmartFilterClick() {
  console.log('Smart Filter button clicked!');
  
  // Show a notification
  showNotification('Applying Smart Filter...', 'info');
  
  // Get current settings and apply filters
  chrome.storage.local.get([
    'hideSolved', 'hidePremium', 'skillBased', 'includedTopics', 
    'excludedTopics', 'difficulties', 'skillLevel'
  ], (settings) => {
    console.log('Applying filters with settings:', settings);
    
    // Apply the filters to the current page
    applyFiltersToPage(settings);
    
    // Show success message
    setTimeout(() => {
      showNotification('Smart Filter applied successfully!', 'success');
    }, 1000);
  });
}

// Clear all applied filters
function clearAllFilters() {
  try {
    console.log('Clearing all filters...');
    
    const problemsTable = document.querySelector('table, [role="grid"], .problems-table, .question-list, [data-cy="problems-table"]');
    if (!problemsTable) {
      console.log('No problems table found to clear filters');
      return;
    }
    
    const problemRows = problemsTable.querySelectorAll('tr, [role="row"], .question-item, [data-cy="problem-row"]');
    
    problemRows.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      
      // Show all rows
      showProblemRow(row);
    });
    
    // Update problem count
    updateProblemCount();
    
    console.log('All filters cleared');
    showNotification('All filters cleared!', 'success');
    
  } catch (error) {
    console.error('Error clearing filters:', error);
    showNotification('Error clearing filters', 'error');
  }
}

// Enhanced filter application with better error handling
function applyFiltersToPage(settings) {
  try {
    console.log('Applying enhanced filters to page:', settings);
    
    // Find the problems table with multiple selectors
    const tableSelectors = [
      'table', 
      '[role="grid"]', 
      '.problems-table', 
      '.question-list', 
      '[data-cy="problems-table"]',
      '.problems-list',
      '[class*="problem"]',
      '[class*="question"]'
    ];
    
    let problemsTable = null;
    for (const selector of tableSelectors) {
      problemsTable = document.querySelector(selector);
      if (problemsTable) {
        console.log(`Found problems table with selector: ${selector}`);
        break;
      }
    }
    
    if (!problemsTable) {
      console.log('No problems table found with any selector');
      showNotification('No problems table found on this page', 'warning');
      return;
    }
    
    // Get all problem rows with multiple selectors
    const rowSelectors = [
      'tr', 
      '[role="row"]', 
      '.question-item', 
      '[data-cy="problem-row"]',
      '.problem-item',
      '[class*="problem-row"]',
      '[class*="question-row"]'
    ];
    
    let problemRows = [];
    for (const selector of rowSelectors) {
      const rows = problemsTable.querySelectorAll(selector);
      if (rows.length > 0) {
        problemRows = Array.from(rows);
        console.log(`Found ${rows.length} problem rows with selector: ${selector}`);
        break;
      }
    }
    
    if (problemRows.length === 0) {
      console.log('No problem rows found');
      showNotification('No problem rows found on this page', 'warning');
      return;
    }
    
    let hiddenCount = 0;
    let totalCount = problemRows.length;
    
    problemRows.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      
      let shouldHide = false;
      let hideReason = '';
      
      try {
        // Check if problem is solved
        if (settings.hideSolved && isProblemSolved(row)) {
          shouldHide = true;
          hideReason = 'solved';
        }
        
        // Check if problem is premium
        if (settings.hidePremium && isProblemPremium(row)) {
          shouldHide = true;
          hideReason = 'premium';
        }
        
        // Check difficulty filter
        if (settings.difficulties && settings.difficulties.length > 0) {
          const difficulty = getProblemDifficulty(row);
          if (difficulty && !settings.difficulties.includes(difficulty.toLowerCase())) {
            shouldHide = true;
            hideReason = 'difficulty';
          }
        }
        
        // Check topic filters
        if (settings.includedTopics && settings.includedTopics.length > 0) {
          const topics = getProblemTopics(row);
          const hasIncludedTopic = topics.some(topic => 
            settings.includedTopics.includes(topic)
          );
          if (!hasIncludedTopic) {
            shouldHide = true;
            hideReason = 'topic-include';
          }
        }
        
        if (settings.excludedTopics && settings.excludedTopics.length > 0) {
          const topics = getProblemTopics(row);
          const hasExcludedTopic = topics.some(topic => 
            settings.excludedTopics.includes(topic)
          );
          if (hasExcludedTopic) {
            shouldHide = true;
            hideReason = 'topic-exclude';
          }
        }
        
        // Apply hiding/showing
        if (shouldHide) {
          hideProblemRow(row, hideReason);
          hiddenCount++;
        } else {
          showProblemRow(row);
        }
        
      } catch (rowError) {
        console.error(`Error processing row ${index}:`, rowError);
        // Continue with other rows
      }
    });
    
    // Update problem count display
    updateProblemCount();
    
    const visibleCount = totalCount - hiddenCount - 1; // -1 for header
    console.log(`Filtering complete: ${visibleCount} visible out of ${totalCount - 1} total problems`);
    
    showNotification(`Filter applied: ${visibleCount} problems visible`, 'success');
    
  } catch (error) {
    console.error('Error applying enhanced filters:', error);
    showNotification('Error applying filters: ' + error.message, 'error');
  }
}

// Check if a problem is solved
function isProblemSolved(row) {
  const solvedIndicators = row.querySelectorAll('svg, i, span, div');
  
  for (const indicator of solvedIndicators) {
    const className = indicator.className || '';
    const textContent = indicator.textContent || '';
    const innerHTML = indicator.innerHTML || '';
    
    if (className.includes('green') || 
        className.includes('check') || 
        className.includes('solved') ||
        className.includes('accepted') ||
        textContent.includes('✓') ||
        innerHTML.includes('check') ||
        innerHTML.includes('solved')) {
      return true;
    }
  }
  
  return false;
}

// Check if a problem is premium
function isProblemPremium(row) {
  const premiumIndicators = row.querySelectorAll('svg, i, span, div');
  
  for (const indicator of premiumIndicators) {
    const className = indicator.className || '';
    const textContent = indicator.textContent || '';
    
    if (className.includes('premium') || 
        className.includes('crown') || 
        className.includes('lock') ||
        textContent.includes('Premium') ||
        textContent.includes('Crown')) {
      return true;
    }
  }
  
  return false;
}

// Get problem difficulty
function getProblemDifficulty(row) {
  const difficultyElements = row.querySelectorAll('[class*="difficulty"], [class*="level"], span, div');
  
  for (const element of difficultyElements) {
    const className = element.className || '';
    const textContent = element.textContent || '';
    
    if (className.includes('easy') || textContent.includes('Easy')) {
      return 'easy';
    } else if (className.includes('medium') || textContent.includes('Medium')) {
      return 'medium';
    } else if (className.includes('hard') || textContent.includes('Hard')) {
      return 'hard';
    }
  }
  
  return null;
}

// Get problem topics
function getProblemTopics(row) {
  const topics = [];
  const topicElements = row.querySelectorAll('a[href*="/tag/"], [class*="tag"], span[class*="topic"]');
  
  topicElements.forEach(element => {
    let topic = '';
    if (element.href) {
      topic = element.href.split('/').pop()?.toLowerCase();
    } else if (element.textContent) {
      topic = element.textContent.trim().toLowerCase();
    }
    
    if (topic && topic.length > 0) {
      topics.push(topic);
    }
  });
  
  return topics;
}

// Hide a problem row
function hideProblemRow(row, reason) {
  if (!row.dataset.originalDisplay) {
    row.dataset.originalDisplay = row.style.display || 'table-row';
  }
  
  row.style.display = 'none';
  row.dataset.filteredReason = reason;
  
  // Add visual indicator that it's filtered
  if (!row.querySelector('.filter-indicator')) {
    const indicator = document.createElement('div');
    indicator.className = 'filter-indicator';
    indicator.textContent = `Filtered: ${reason}`;
    indicator.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      background: #ef4444;
      color: white;
      padding: 2px 6px;
      font-size: 10px;
      border-radius: 4px;
      z-index: 10;
    `;
    
    row.style.position = 'relative';
    row.appendChild(indicator);
  }
}

// Show a problem row
function showProblemRow(row) {
  if (row.dataset.originalDisplay) {
    row.style.display = row.dataset.originalDisplay;
    delete row.dataset.filteredReason;
    
    // Remove filter indicator
    const indicator = row.querySelector('.filter-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
}

// Update problem count display
function updateProblemCount() {
  const problemsTable = document.querySelector('table, [role="grid"], .problems-table, .question-list, [data-cy="problems-table"]');
  if (!problemsTable) return;
  
  const visibleRows = Array.from(problemsTable.querySelectorAll('tr, [role="row"], .question-item, [data-cy="problem-row"]'))
    .filter(row => row.style.display !== 'none');
  
  const totalRows = problemsTable.querySelectorAll('tr, [role="row"], .question-item, [data-cy="problem-row"]').length - 1; // -1 for header
  const visibleCount = visibleRows.length - 1; // -1 for header
  
  console.log(`Filtered problems: ${visibleCount} visible out of ${totalRows} total`);
  
  // Try to update any count display on the page
  const countSelectors = [
    '[class*="count"]',
    '[class*="total"]',
    '[class*="problems"]',
    '[data-cy="problem-count"]'
  ];
  
  countSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent;
        if (text.match(/\d+/)) {
          element.textContent = text.replace(/\d+/, visibleCount);
        }
      });
    } catch (e) {
      // Ignore errors
    }
  });
}

// Main execution function
function main() {
  console.log('LeetCode Smart Filter extension loaded');
  
  // Wait for the page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(injectNewButton, 1000);
    });
  } else {
    setTimeout(injectNewButton, 1000);
  }
  
  // Also listen for navigation changes (for SPA behavior)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('URL changed, re-injecting button');
      setTimeout(injectNewButton, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Listen for messages from popup and background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    if (request.action === 'ping') {
      // Respond to ping to confirm content script is ready
      sendResponse({ success: true, message: 'Content script is ready' });
      return true;
    }
    
    if (request.action === 'triggerSmartFilter') {
      handleSmartFilterClick();
      sendResponse({ success: true, message: 'Smart filter triggered' });
    }
    
    if (request.action === 'assessSkills') {
      // Simple skill assessment for now
      const skillLevel = assessUserSkills();
      sendResponse({ success: true, skillLevel });
    }
    
    if (request.action === 'clearFilters') {
      clearAllFilters();
      sendResponse({ success: true, message: 'Filters cleared' });
    }
    
    if (request.action === 'refreshPage') {
      // Refresh the current page
      window.location.reload();
      sendResponse({ success: true, message: 'Page refresh initiated' });
    }
    
    return true; // Keep message channel open for async response
  });
}

// Simple skill assessment function
function assessUserSkills() {
  try {
    console.log('Starting comprehensive skill assessment...');
    
    let solvedCount = 0;
    let totalProblems = 0;
    let premiumCount = 0;
    
    // Strategy 1: Look for problems table/list with better selectors
    const problemsTable = document.querySelector('table, [role="grid"], .problems-table, .question-list, [data-cy="problems-table"]');
    
    if (problemsTable) {
      console.log('Found problems table, analyzing...');
      
      // Look for problem rows
      const problemRows = problemsTable.querySelectorAll('tr, [role="row"], .question-item, [data-cy="problem-row"]');
      totalProblems = problemRows.length;
      console.log(`Total problem rows found: ${totalProblems}`);
      
      // Count solved problems by looking for checkmarks in each row
      problemRows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        
        // Look for solved indicators in this row
        const solvedIndicators = row.querySelectorAll('svg, i, span, div');
        let isSolved = false;
        
        solvedIndicators.forEach(indicator => {
          const className = indicator.className || '';
          const textContent = indicator.textContent || '';
          const innerHTML = indicator.innerHTML || '';
          
          // Check for various solved indicators
          if (className.includes('green') || 
              className.includes('check') || 
              className.includes('solved') ||
              className.includes('accepted') ||
              textContent.includes('✓') ||
              innerHTML.includes('check') ||
              innerHTML.includes('solved')) {
            isSolved = true;
          }
        });
        
        if (isSolved) {
          solvedCount++;
          console.log(`Row ${index} is solved`);
        }
        
        // Check for premium problems
        const premiumIndicators = row.querySelectorAll('svg, i, span, div');
        let isPremium = false;
        
        premiumIndicators.forEach(indicator => {
          const className = indicator.className || '';
          const textContent = indicator.textContent || '';
          
          if (className.includes('premium') || 
              className.includes('crown') || 
              className.includes('lock') ||
              textContent.includes('Premium') ||
              textContent.includes('Crown')) {
            isPremium = true;
          }
        });
        
        if (isPremium) {
          premiumCount++;
        }
      });
    }
    
    // Strategy 2: Look for solved count in profile/stats area
    const profileSelectors = [
      '[class*="profile"]',
      '[class*="stats"]',
      '[class*="achievement"]',
      '[class*="solved"]',
      '[class*="count"]',
      '[data-cy="profile"]',
      '[data-cy="stats"]'
    ];
    
    profileSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const text = element.textContent;
          
          // Look for various statistics
          const solvedMatch = text.match(/(\d+)\s*(?:problems?|solved|completed)/i);
          if (solvedMatch) {
            const count = parseInt(solvedMatch[1]);
            if (count > solvedCount) {
              solvedCount = count;
              console.log(`Found higher solved count from profile: ${count}`);
            }
          }
          
          const totalMatch = text.match(/(\d+)\s*(?:total|problems?|questions)/i);
          if (totalMatch) {
            const count = parseInt(totalMatch[1]);
            if (count > totalProblems) {
              totalProblems = count;
              console.log(`Found total problems count: ${count}`);
            }
          }
        });
      } catch (e) {
        console.log('Profile selector failed:', selector, e);
      }
    });
    
    // Strategy 3: Look for specific LeetCode elements
    const leetcodeSelectors = [
      'a[href*="/problems/"]',
      '[data-cy="problem-title"]',
      '.question-title',
      '.problem-title'
    ];
    
    leetcodeSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > totalProblems) {
          totalProblems = elements.length;
          console.log(`Found ${elements.length} problems with selector: ${selector}`);
        }
      } catch (e) {
        console.log('LeetCode selector failed:', selector, e);
      }
    });
    
    // Strategy 4: Look for difficulty indicators to estimate total
    const difficultySelectors = [
      '[class*="difficulty"]',
      '[class*="level"]',
      'span[class*="easy"]',
      'span[class*="medium"]',
      'span[class*="hard"]'
    ];
    
    let difficultyCount = 0;
    difficultySelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        difficultyCount += elements.length;
      } catch (e) {
        console.log('Difficulty selector failed:', selector, e);
      }
    });
    
    if (difficultyCount > totalProblems) {
      totalProblems = difficultyCount;
      console.log(`Estimated total problems from difficulty indicators: ${difficultyCount}`);
    }
    
    console.log(`Final assessment: ${solvedCount} solved problems out of ${totalProblems} total, ${premiumCount} premium`);
    
    // Calculate skill level based on solved problems
    let skillLevel = 'beginner';
    
    if (solvedCount >= 200) {
      skillLevel = 'expert';
    } else if (solvedCount >= 100) {
      skillLevel = 'advanced';
    } else if (solvedCount >= 30) {
      skillLevel = 'intermediate';
    } else if (solvedCount >= 5) {
      skillLevel = 'beginner';
    } else {
      skillLevel = 'beginner';
    }
    
    console.log(`Skill level determined: ${skillLevel}`);
    return skillLevel;
    
  } catch (error) {
    console.error('Error in skill assessment:', error);
    return 'beginner'; // Default fallback
  }
}

// Start the extension
main();
