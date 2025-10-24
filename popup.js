// popup.js
document.getElementById('generate-btn').addEventListener('click', () => {
    // 1. Get all the values from the form
    const topic = document.getElementById('topic').value;
    const difficulty = document.getElementById('difficulty').value;
    const premium = document.getElementById('premium').value; // Changed from isPremium
    const solvedStatus = document.getElementById('status').value;

    const btn = document.getElementById('generate-btn');
    const errorDiv = document.getElementById('error-message');

    // Show loading state
    btn.textContent = 'Finding...';
    btn.disabled = true;
    errorDiv.style.display = 'none';

    // 2. Send these preferences to the background script
    chrome.runtime.sendMessage(
        {
            type: "FETCH_PROBLEM",
            preferences: { 
                topic, 
                difficulty, 
                premium, // Pass the new premium value
                solvedStatus 
            }
        },
        // 3. This is the "callback" function that runs when the background script replies
        (response) => {
            // Re-enable the button
            btn.textContent = 'Generate Problem';
            btn.disabled = false;

            if (chrome.runtime.lastError) {
                // Handle errors from the messaging system itself
                errorDiv.textContent = `Error: ${chrome.runtime.lastError.message}`;
                errorDiv.style.display = 'block';
                return;
            }

            if (response && response.success) {
                // Success! The background script opened the tab.
                window.close();
            } else if (response && !response.success) {
                // Failure! The background script sent an error message.
                errorDiv.textContent = response.message;
                errorDiv.style.display = 'block';
            } else {
                // Fallback for any other weird errors
                errorDiv.textContent = 'An unknown error occurred.';
                errorDiv.style.display = 'block';
            }
        }
    );
});