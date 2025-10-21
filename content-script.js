// content-script.js
// Enhanced content script with AI skill assessment, advanced filtering, and smart question recommendations

// Global variables to store user settings and problem data
let userSettings = {};
let problemData = [];
let userSkillLevel = 'beginner';

// --- 1. FIND ORIGINAL BUTTON ---
function findRandomButton() {
  const selectors = [
    'a[href="/problems/random-one-question/"]',
    'a[href*="random-one-question"]',
    'button[data-cy="random-question"]',
    '[data-cy="random-question"]',
    '.random-question-btn',
  ];

  for (const selector of selectors) {
    const randomButton = document.querySelector(selector);
    if (randomButton) return randomButton;
  }

  // Text-based fallback
  const elements = document.querySelectorAll('a, button');
  for (const el of elements) {
    // More specific check for "random" text to avoid other buttons
    if (el.textContent.toLowerCase().trim() === 'random' || el.textContent.toLowerCase().includes('random one')) {
      return el;
    }
  }
  return null;
}

// --- 2. FIND CONTAINER FOR INJECTION ---
function findButtonContainer(randomButton) {
  if (randomButton) {
    let container = randomButton.parentElement;
    const containerSelectors = [
      '.flex', // General flex container often used
      '[class*="flex items-center"]' // Common pattern in headers/toolbars
    ];

    // Go up a few levels to find a suitable container
    for (let i = 0; i < 5 && container; i++) {
        // Check if it's a flex container likely holding buttons/links
        if (containerSelectors.some(selector => container.matches(selector)) && container.children.length > 1) {
            // Verify it contains interactive elements (button or a)
             if (container.querySelector('button, a')) {
                 console.log('Confirmed container:', container);
                 return container;
             }
        }
      container = container.parentElement;
    }
    console.log("Using immediate parent as fallback container:", randomButton.parentElement);
    return randomButton.parentElement; // Return immediate parent as last resort
  }

  // Fallback: look for common button areas if randomBtn wasn't found
   console.log("Original random button not found, searching for fallback containers...");
  const fallbackSelectors = [
    'nav [class*="flex items-center"]', // Flex container inside nav
    '.flex.items-center.gap-3',
    '.flex.gap-2', '.flex.gap-3', '.flex.gap-4',
    '.space-x-2', '.space-x-3', '.space-x-4',
    'div[class*="action"], div[class*="toolbar"]' // Divs likely containing actions
  ];
  for (const selector of fallbackSelectors) {
    // Find potentially multiple containers and pick the most likely one (e.g., visible, has children)
    const containers = document.querySelectorAll(selector);
    for(const container of containers) {
        // Check if it's visible and contains interactive elements
        if (container.offsetParent !== null && container.querySelector('button, a')) {
            console.log("Found fallback container:", container, "using selector:", selector);
            return container;
        }
    }
  }
  console.log("No suitable fallback container found via selectors.");
  return null;
}

// --- 3. HELPER FUNCTIONS FOR SCRAPING ---

function isProblemSolved(rowElement) {
  const solvedIndicators = [
    'svg.text-green-s', 'svg[data-icon="fa-check"]', '.text-green-s',
    '[data-status="ac"]', '[data-status="solved"]', // Common data attributes
    'svg[class*="text-green"]', 'svg[class*="check"]', '.text-green-500', '.text-green-600',
    '.text-ac', // Sometimes used
  ];

  if (solvedIndicators.some(selector => rowElement.querySelector(selector))) {
    return true;
  }
  // Fallback check on icons/text within the first few children (status column)
  const statusCell = rowElement.querySelector('div:first-child, td:first-child');
  if (statusCell) {
       const icons = statusCell.querySelectorAll('svg, i');
       for(const icon of icons) {
           // Check for specific class names or fill attributes
           const className = icon.className?.baseVal || icon.className || '';
           const fill = icon.getAttribute('fill');
           if (typeof className === 'string' && (className.includes('green') || className.includes('check'))) return true;
           if (fill === 'currentColor' && window.getComputedStyle(icon).color.includes('rgb(34, 197, 94)')) return true; // Check computed style for green color
           if (icon.closest('[class*="text-green"]')) return true; // Check parent color class
       }
  }
  return false;
}

function isProblemPremium(rowElement) {
  const premiumIndicators = [
    'svg[data-icon="fa-lock"]', 'svg[data-icon="fa-crown"]', '.text-yellow-s',
    '[data-premium="true"]', '.premium-badge',
    'svg[class*="lock"]', 'svg[class*="crown"]', 'svg[class*="text-yellow"]', 'svg[class*="text-orange"]',
    '.text-brand-orange', // Used for premium text sometimes
  ];
   if (premiumIndicators.some(selector => rowElement.querySelector(selector))) {
    return true;
  }
   // Check specific common locations (like next to the title link)
   const titleLink = rowElement.querySelector('a[href*="/problems/"]');
   if(titleLink?.parentElement?.querySelector('svg[class*="lock"], svg[class*="crown"]')) {
       return true;
   }
  return false;
}

function getProblemDifficulty(rowElement) {
  // Prefer text content within spans that have difficulty-related classes or specific text
  const potentialSpans = rowElement.querySelectorAll('span[class*="difficulty"], span.text-xs');
  for (const el of potentialSpans) {
      const text = el.textContent.toLowerCase().trim();
      if (text === 'easy' || text === 'medium' || text === 'hard') return text;
  }
   // Fallback: search any span/div text content more broadly
  const textElements = rowElement.querySelectorAll('span, div');
  for (const el of textElements) {
      // Check parent element too, sometimes difficulty is in parent class
      const parentClass = el.parentElement?.className?.toLowerCase() || '';
      const text = el.textContent.toLowerCase().trim();

      if (text === 'easy' || parentClass.includes('difficulty-easy')) return 'easy';
      if (text === 'medium' || parentClass.includes('difficulty-medium')) return 'medium';
      if (text === 'hard' || parentClass.includes('difficulty-hard')) return 'hard';
  }

  return null; // Return null if not found
}

function getProblemTopics(rowElement) {
  // Target specific topic tag elements if possible
  const topicCells = rowElement.querySelectorAll('div:nth-child(6), td:nth-child(6)'); // Approx tags column
  const topics = new Set();

  topicCells.forEach(cell => {
      const topicElements = cell.querySelectorAll('a[href*="/tag/"], span[class*="tag"], div[class*="tag"]');
      topicElements.forEach(el => {
        let topic = '';
        if (el.href) {
          topic = el.href.split('/').pop()?.replace(/-/g, ' ').toLowerCase();
        } else if (el.textContent && el.textContent.trim().length > 1) { // Ensure text is not empty
          topic = el.textContent.trim().toLowerCase();
        }
        if (topic) topics.add(topic);
      });
  });

   // Fallback if specific column fails
   if (topics.size === 0) {
       const fallbackElements = rowElement.querySelectorAll('a[href*="/tag/"]');
        fallbackElements.forEach(el => {
           let topic = el.href.split('/').pop()?.replace(/-/g, ' ').toLowerCase();
            if (topic) topics.add(topic);
        });
   }

  return Array.from(topics);
}

function getProblemInfo(rowElement) {
    const titleCell = rowElement.querySelector('div:nth-child(2), td:nth-child(2)');
    let linkElement = titleCell?.querySelector('a[href*="/problems/"]');
    if (!linkElement) linkElement = rowElement.querySelector('a[href*="/problems/"]'); // Fallback

    if (linkElement) {
        const href = linkElement.href;
        if (!href || !href.includes('/problems/')) return null;
        const urlParts = href.split('/problems/');
        if (urlParts.length < 2) return null;
        const problemSlug = urlParts[1]?.split('/')[0];
        if (!problemSlug) return null;

        // Try getting text from common title structures first
        let title = linkElement.querySelector('.truncate')?.textContent?.trim() // Common class for title text
                 || linkElement.querySelector('span')?.textContent?.trim()
                 || linkElement.textContent?.trim()
                 || "Unknown Title";

        title = title.replace(/^\d+\.\s*/, '').trim(); // Clean leading number

        if (!title || title.length < 2 || title === "Unknown Title" || title.includes('<svg')) {
             const cleanText = Array.from(linkElement.childNodes)
                                 .filter(node => node.nodeType === Node.TEXT_NODE)
                                 .map(n => n.textContent.trim())
                                 .join(' ').replace(/^\d+\.\s*/, '').trim();
             if (cleanText && cleanText.length > 1) {
                 title = cleanText;
             } else {
                 // console.warn("Could not extract valid title for href:", href); // Reduce noise
                 return null;
             }
        }
        return { id: problemSlug, title: title, href: href };
    }
    return null;
}


// --- 4. CORE LOGIC FUNCTIONS ---

// Simplified skill assessment from page data
function assessUserSkills() {
  try {
    let solvedCount = 0;
    // Find rows directly
    const problemRows = document.querySelectorAll('div[role="row"], tr[role="row"]');

    problemRows.forEach(row => {
        // Ensure it's a valid problem row
        if (!row.querySelector('[role="columnheader"]') && row.querySelector('a[href*="/problems/"]')) {
           if (isProblemSolved(row)) solvedCount++;
        }
    });
    console.log(`Assess Skills: Found ${solvedCount} solved problems on page.`);

    let skillLevel = 'beginner';
    if (solvedCount >= 200) skillLevel = 'expert';
    else if (solvedCount >= 100) skillLevel = 'advanced';
    else if (solvedCount >= 30) skillLevel = 'intermediate';
    else if (solvedCount >= 5) skillLevel = 'beginner';

    console.log(`Skill level determined: ${skillLevel}`);
    return skillLevel;

  } catch (error) {
    console.error('Error in assessUserSkills:', error);
    return 'beginner';
  }
}


function getRecommendedDifficulty(skillLevel) {
  const difficultyMap = {
    beginner: ['easy'],
    intermediate: ['easy', 'medium'],
    advanced: ['medium', 'hard'],
    expert: ['hard']
  };
  return difficultyMap[skillLevel.toLowerCase()] || ['easy', 'medium', 'hard'];
}

function filterProblems(problems, settings) {
   console.log(`Filtering ${problems.length} problems with settings:`, settings);
   const filtered = problems.filter(problem => {
    // Basic validation
    if (!problem || !problem.difficulty || !problem.topics) {
        console.warn("Skipping invalid problem object in filter:", problem);
        return false;
    }

    if (settings.hideSolved && problem.solved) return false;
    if (settings.hidePremium && problem.premium) return false;

    const difficulties = settings.difficulties || [];
    if (difficulties.length > 0 && !difficulties.includes(problem.difficulty)) {
        return false;
    }

    const includedTopics = settings.includedTopics || [];
    if (includedTopics.length > 0 && !includedTopics.some(topic => problem.topics.includes(topic))) {
      return false;
    }

    const excludedTopics = settings.excludedTopics || [];
    if (excludedTopics.length > 0 && excludedTopics.some(topic => problem.topics.includes(topic))) {
      return false;
    }

    if (settings.skillBased) {
      const recommended = getRecommendedDifficulty(settings.skillLevel || 'beginner');
      if (!recommended.includes(problem.difficulty)) {
        return false;
      }
    }

    return true;
  });
  console.log(`Filtering resulted in ${filtered.length} problems.`);
  return filtered;
}

// *** UPDATED: Data collection - Find rows directly ***
function collectProblemData() {
  const problems = [];
  // *** FIND ALL POTENTIAL ROWS DIRECTLY ***
  const potentialRows = document.querySelectorAll('div[role="row"], tr[role="row"]');
  console.log(`CollectData: Found ${potentialRows.length} potential row elements.`);
  const processedHrefs = new Set(); // Avoid duplicates

  potentialRows.forEach((rowElement, index) => {
      // Skip header row
      if (rowElement.querySelector('[role="columnheader"]')) return;
      // Ensure it looks like a problem row (contains a link)
      if (!rowElement.querySelector('a[href*="/problems/"]')) return;

      const problemInfo = getProblemInfo(rowElement);

      // Ensure info is valid and href hasn't been processed
      if (problemInfo && problemInfo.title && problemInfo.href && !processedHrefs.has(problemInfo.href)) {
          const difficulty = getProblemDifficulty(rowElement);
          if(difficulty) { // Only add if difficulty is found
              problems.push({
                  ...problemInfo,
                  solved: isProblemSolved(rowElement),
                  premium: isProblemPremium(rowElement),
                  difficulty: difficulty,
                  topics: getProblemTopics(rowElement)
              });
              processedHrefs.add(problemInfo.href); // Mark as processed
          } else {
               // console.warn(`CollectData: Skipping row ${index} (${problemInfo.title}) - No difficulty.`);
          }
      }
  });

  console.log(`CollectData: Collected ${problems.length} valid problems with difficulty.`);
  return problems;
}


// --- 5. NOTIFICATION FUNCTION ---
function showNotification(message, type = 'info', duration = 3000) {
  document.querySelectorAll('.leetcode-notification').forEach(n => n.remove());
  const notification = document.createElement('div');
  notification.className = `leetcode-notification ${type}`;
  notification.textContent = message;
  notification.setAttribute('role', 'alert');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 2147483647;
    padding: 12px 20px; border-radius: 8px; color: white;
    font-family: sans-serif; font-size: 14px; font-weight: 500;
    max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    opacity: 0; transform: translateX(100%);
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  `;
  switch (type) {
      case 'success': notification.style.background = 'linear-gradient(135deg, #10b981, #059669)'; break;
      case 'error': notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)'; break;
      case 'warning': notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)'; break;
      default: notification.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)'; break;
  }
  document.body.appendChild(notification);
  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  });
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      notification.addEventListener('transitionend', () => notification.remove(), { once: true });
    }
  }, duration);
}


// --- 6. BUTTON INJECTION LOGIC ---

function injectNewButton() {
  console.log("Attempting to inject button...");
  const originalRandomButton = findRandomButton();
  const container = findButtonContainer(originalRandomButton);

  // If container not found, try floating button (ensure no duplicates)
  if (!container) {
    console.warn("No suitable button container found. Using floating button fallback.");
    if (!document.getElementById('leetcode-smart-pick-btn-floating')) {
      createFloatingButton();
    }
    return;
  }

  // If container found, remove any existing floating button
  document.getElementById('leetcode-smart-pick-btn-floating')?.remove();

  // Hide original button if needed
  if (originalRandomButton && window.getComputedStyle(originalRandomButton).display !== 'none') {
    console.log("Hiding original LeetCode random button:", originalRandomButton);
    originalRandomButton.style.display = 'none';
  }

  // Check if our button is already in the container
  if (container.querySelector('#leetcode-smart-pick-btn')) {
    console.log('Smart Pick button already exists in container, skipping injection');
    return;
  }

  createAndInjectButton(container);
}

// Consolidated Button Creation (Smart Pick ONLY)
function createAndInjectButton(container) {
  // Remove any old versions first just in case
  container.querySelector('#leetcode-smart-pick-btn')?.remove();

  const smartPickButton = document.createElement('button');
  smartPickButton.id = 'leetcode-smart-pick-btn';
  smartPickButton.className = 'leetcode-smart-filter-btn'; // Reusable style class name
  smartPickButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
    </svg>
    Smart Pick
  `;
  smartPickButton.style.cssText = `
    display: inline-flex; align-items: center; padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white; border: none; border-radius: 8px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    margin-left: 8px; /* Ensure spacing */
  `;
  smartPickButton.addEventListener('mouseenter', () => {
    smartPickButton.style.transform = 'translateY(-2px)';
    smartPickButton.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
  });
  smartPickButton.addEventListener('mouseleave', () => {
    smartPickButton.style.transform = 'translateY(0)';
    smartPickButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
  });
  smartPickButton.addEventListener('click', handleSmartRandomClick);

  // Append button to the container
  container.appendChild(smartPickButton);
  console.log('Successfully injected Smart Pick button into:', container);
}

function createFloatingButton() {
   // Prevent duplicate floating buttons
  if (document.getElementById('leetcode-smart-pick-btn-floating')) return;
  // Remove any non-floating button if we resort to floating
  document.getElementById('leetcode-smart-pick-btn')?.remove();

  const floatingButton = document.createElement('button');
  floatingButton.id = 'leetcode-smart-pick-btn-floating';
  floatingButton.className = 'leetcode-smart-filter-btn floating';
  floatingButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
    </svg>
    Smart Pick
  `;
  floatingButton.style.cssText = `
    position: fixed; top: 100px; right: 20px; z-index: 10000;
    display: inline-flex; align-items: center; padding: 12px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white; border: none; border-radius: 12px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    backdrop-filter: blur(10px);
  `;
  floatingButton.addEventListener('mouseenter', () => {
    floatingButton.style.transform = 'translateY(-2px) scale(1.05)';
    floatingButton.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)';
  });
  floatingButton.addEventListener('mouseleave', () => {
    floatingButton.style.transform = 'translateY(0) scale(1)';
    floatingButton.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
  });
  floatingButton.addEventListener('click', handleSmartRandomClick);
  document.body.appendChild(floatingButton);
  console.log('Created floating Smart Pick button');
}

// --- 7. BUTTON CLICK HANDLERS & CORE LOGIC ---

function handleSmartRandomClick() {
  console.log('Smart Pick button clicked!');
  // Check if we are on the problem set page AND if data collection works reasonably well NOW
  const isOnProblemSet = window.location.href.includes("/problemset/");
  const currentProblems = isOnProblemSet ? collectProblemData() : []; // Only collect if on the right page

  if (isOnProblemSet && currentProblems.length > 10) { // Check if we have enough data already
    showNotification('Finding a smart question...', 'info');
    runSmartRandomLogic(); // Run directly using current data
  } else {
    // If not on problem set, or if data collection failed, redirect and wait
    const reason = isOnProblemSet ? `only ${currentProblems.length} problems found` : "not on problem set page";
    console.warn(`Redirecting because: ${reason}`);
    showNotification('Navigating to problem list to find question...', 'info');
    chrome.storage.local.set({ runSmartRandomOnLoad: true }, () => {
      window.location.href = 'https://leetcode.com/problemset/';
    });
  }
}


// Core logic for picking and navigating (includes debug logs)
function runSmartRandomLogic() {
  console.log('Running Smart Random Logic...');
  chrome.storage.local.get(null, (settings) => {
     if (chrome.runtime.lastError) {
         console.error("Error getting settings:", chrome.runtime.lastError);
         showNotification('Could not load settings for filtering.', 'error');
         return;
     }

    // Define default settings inline
    const effectiveSettings = {
        hideSolved: settings.hideSolved || false,
        hidePremium: settings.hidePremium || false,
        skillBased: settings.skillBased === undefined ? true : settings.skillBased,
        includedTopics: settings.includedTopics || [],
        excludedTopics: settings.excludedTopics || [],
        difficulties: settings.difficulties && settings.difficulties.length > 0 ? settings.difficulties : ['easy', 'medium', 'hard'], // Default if empty
        skillLevel: settings.skillLevel || 'beginner'
    };
    userSkillLevel = effectiveSettings.skillLevel;

    console.log('--- Debug: Applying random pick with effective settings:', effectiveSettings);

    const allProblems = collectProblemData(); // Re-collect data just to be sure it's fresh
    console.log(`--- Debug: Collected ${allProblems.length} problems from the page.`);

    if (allProblems.length === 0) {
      showNotification('Could not find any problems. Try refreshing the page.', 'error');
      console.error("--- Debug: collectProblemData returned an empty array.");
      return;
    }

    const filteredProblems = filterProblems(allProblems, effectiveSettings);
    console.log(`--- Debug: Filtered down to ${filteredProblems.length} problems.`);


    if (filteredProblems.length === 0) {
      showNotification('No problems match your criteria. Try adjusting filters in the popup.', 'warning');
      console.warn("--- Debug: filterProblems returned an empty array. Check filters/data.");
      return;
    }

    const chosenProblem = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
    console.log('--- Debug: Chosen problem:', chosenProblem);

    if (!chosenProblem || !chosenProblem.href) {
        showNotification('Error selecting problem. Could not find URL.', 'error');
        console.error("--- Debug: Chosen problem is invalid or missing href.", chosenProblem);
        return;
    }

    console.log('Chosen problem title:', chosenProblem.title);
    showNotification(`Navigating to: ${chosenProblem.title}`, 'success');

    console.log(`--- Debug: Navigating to ${chosenProblem.href}`);
    setTimeout(() => {
      try {
           const absoluteUrl = new URL(chosenProblem.href, window.location.origin).href;
           window.location.href = absoluteUrl;
      } catch (e) {
           console.error("Error creating absolute URL or navigating:", e, chosenProblem.href);
           showNotification('Failed to navigate to the chosen problem.', 'error');
      }
    }, 1200); // Slightly longer delay
  });
}

// REMOVED functions related to visual filtering

// --- 8. MAIN EXECUTION & MESSAGE LISTENER ---
// *** UPDATED with SIMPLIFIED page ready check ***
function main() {
  console.log('LeetCode Smart Filter extension loaded');
  const problemListUrl = 'leetcode.com/problemset';

  // Check for redirect flag
  chrome.storage.local.get('runSmartRandomOnLoad', (result) => {
    if (result.runSmartRandomOnLoad && window.location.href.includes(problemListUrl)) {
      console.log('Flag found after redirect, preparing to run Smart Pick...');
      chrome.storage.local.remove('runSmartRandomOnLoad');
      showNotification('Loading problem list for Smart Pick...', 'info');

      const maxWaitTime = 20000;
      const checkInterval = 500;
      let elapsedTime = 0;

      // *** SIMPLIFIED CHECK: Rely only on finding enough links ***
      const linkSelector = 'a[href*="/problems/"]';
      const minLinks = 20; // Wait for at least 20 problem links

      const checkPageReady = setInterval(() => {
        elapsedTime += checkInterval;
        const linksFound = document.querySelectorAll(linkSelector).length;

        // *** Proceed if enough links are found ***
        if (linksFound >= minLinks) {
          clearInterval(checkPageReady);
          console.log(`Problem list ready (${linksFound} links found). Running Smart Pick logic.`);
          // Give slightly more time for data extraction functions to work reliably
          setTimeout(runSmartRandomLogic, 1000); // Increased delay
        } else if (elapsedTime >= maxWaitTime) {
          clearInterval(checkPageReady);
          console.error(`Timeout waiting for problem list links (${linksFound}/${minLinks} found).`);
          showNotification('Could not load problem list fully after redirect.', 'error');
        }
      }, checkInterval);
    } else if (result.runSmartRandomOnLoad) {
        console.warn('Redirect flag found, but not on problem list page. Clearing.');
        chrome.storage.local.remove('runSmartRandomOnLoad');
    }
  });

  // Inject button after page load
   if (document.readyState === 'complete') {
       requestAnimationFrame(() => setTimeout(injectNewButton, 500));
   } else {
       window.addEventListener('load', () => {
          requestAnimationFrame(() => setTimeout(injectNewButton, 500));
       }, { once: true });
   }

  // Observe SPA navigation
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        // Debounce injection slightly
        setTimeout(() => {
            if(location.href === currentUrl) { // Check again in case of rapid navigation
                lastUrl = currentUrl;
                console.log('URL changed (SPA), re-injecting button');
                requestAnimationFrame(() => setTimeout(injectNewButton, 1000));
            }
        }, 300);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);

    switch (request.action) {
        case 'ping':
            sendResponse({ success: true, message: 'Content script is ready' });
            break;
        case 'triggerSmartRandom':
            handleSmartRandomClick();
            sendResponse({ success: true, message: 'Smart random triggered' });
            break;
        case 'assessSkills':
            try {
                const skillLevel = assessUserSkills();
                sendResponse({ success: true, skillLevel });
            } catch (e) { sendResponse({ success: false, error: e.message }); }
            break;
        case 'clearFilters':
             console.log("'clearFilters' received, no visual action taken.");
             sendResponse({ success: true, message: 'No visual filters to clear.' });
             break;
        case 'refreshPage':
             window.location.reload();
             break;
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
    return false; // All responses are synchronous
  });
}

// Start the extension
main();