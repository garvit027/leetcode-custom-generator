// background.js

// 1. Listen for the message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "FETCH_PROBLEM") {
        // Pass sendResponse to the async function so it can reply
        fetchProblem(request.preferences, sendResponse);
    }
    // MUST return true to indicate you will send a response asynchronously
    return true;
});

const LEETCODE_API_URL = "https://leetcode.com/graphql";

const PROBLEMSET_QUERY = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
        ) {
            total: totalNum
            questions: data {
                titleSlug
            }
        }
    }
`;

async function fetchProblem(prefs, sendResponse) {
    // 2. Set up the filters for the query
    const variables = {
        categorySlug: "all-code-essentials",
        limit: 1, // We only need 1 problem
        skip: 0,  // We will change this
        filters: {}
    };

    // Add filters from preferences
    if (prefs.difficulty !== "all") {
        variables.filters.difficulty = prefs.difficulty;
    }
    if (prefs.topic !== "all") {
        variables.filters.tags = [prefs.topic];
    }
    if (prefs.solvedStatus !== "all") {
        variables.filters.status = prefs.solvedStatus;
    }

    // *** THIS IS THE NEW, CORRECTED PREMIUM LOGIC ***
    if (prefs.premium === "FREE") {
        variables.filters.premiumOnly = false;
    } else if (prefs.premium === "PREMIUM") {
        variables.filters.premiumOnly = true;
    }
    // If prefs.premium is "ALL", we add no filter, which is correct.

    try {
        // --- FIRST REQUEST: Get the TOTAL count ---
        const firstResponse = await fetch(LEETCODE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                query: PROBLEMSET_QUERY,
                variables: { ...variables, limit: 1, skip: 0 } 
            })
        });

        const firstData = await firstResponse.json();

        // Check for API errors (e.g., if LeetCode changes their API)
        if (firstData.errors) {
            throw new Error(firstData.errors.map(e => e.message).join(', '));
        }

        const totalMatchingProblems = firstData.data.problemsetQuestionList.total;

        // 3. Check if any problems were found
        if (totalMatchingProblems === 0) {
            console.log("No questions found matching criteria.");
            // Send a failure message back to the popup
            sendResponse({ success: false, message: "No problems found with these filters." });
            return;
        }

        // --- SECOND REQUEST: Get the RANDOM problem ---

        // 4. Calculate a truly random skip based on the *matching* total
        const randomSkip = Math.floor(Math.random() * totalMatchingProblems);

        // 5. Set the new variables for the second request
        const secondVariables = { ...variables, limit: 1, skip: randomSkip };
        
        const secondResponse = await fetch(LEETCODE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                query: PROBLEMSET_QUERY,
                variables: secondVariables
            })
        });

        const secondData = await secondResponse.json();
        
        if (secondData.errors) {
            throw new Error(secondData.errors.map(e => e.message).join(', '));
        }

        const questions = secondData.data.problemsetQuestionList.questions;

        // 6. Pick the problem and open it
        if (questions && questions.length > 0) {
            const problem = questions[0]; 
            const problemUrl = `https://leetcode.com/problems/${problem.titleSlug}/`;

            // 7. Open the new tab
            chrome.tabs.create({ url: problemUrl });

            // 8. Send a SUCCESS message back to the popup
            sendResponse({ success: true });
        } else {
            // This shouldn't happen, but good to have a fallback
            throw new Error("Found total, but failed to fetch random problem.");
        }

    } catch (error) {
        console.error("Error fetching LeetCode data:", error);
        // 8. Send a FAILURE message back to the popup
        sendResponse({ success: false, message: error.message });
    }
}