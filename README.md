# Custom LeetCode Generator 🚀

A Chrome extension that lets you find a random LeetCode problem based on your exact preferences. Stop searching and start solving!

![Screenshot of the LeetCode Generator popup](https://i.postimg.cc/pr4y9ptH/Screenshot-2025-10-24-at-8-30-02-PM.png)



---

## 🎯 Features

This extension adds a popup to your browser that lets you filter for the *exact* kind of problem you want to practice:

* **By Topic:** (e.g., Array, String, Hash Table, Graph)
* **By Difficulty:** (Easy, Medium, Hard)
* **By Solved Status:** (Not Solved, Solved/Accepted, Attempted)
* **By Premium Status:** (All Problems, Free Only, Premium Only)

Click "Generate Problem," and the extension will instantly open a new tab with a random problem that matches all your filters.

If no problems match your criteria (e.g., "Hard" + "Solved" + "Array" and you haven't solved any), it will show you a "No problems found" message.

---

## 🛠️ How It Works

This extension doesn't scrape the LeetCode website. Instead, it uses LeetCode's internal **GraphQL API**—the same one the official website uses.

1.  It reads your preferences from the popup.
2.  It makes a query to the API to find the **total number** of problems that match your filters.
3.  It picks a random number between 0 and that total.
4.  It makes a second query to fetch the *one* problem at that random position.
5.  It opens the problem's URL (`https://leetcode.com/problems/...`) in a new tab.

---

## 🔧 Installation (for Development)

Since this extension is not yet on the Chrome Web Store, you can load it locally:

1.  **Download or Clone:** Download this project's code and unzip it, or clone the repository.
2.  **Open Chrome Extensions:** Open Google Chrome and navigate to `chrome://extensions`.
3.  **Enable Developer Mode:** Turn on the "Developer mode" toggle in the top-right corner.
4.  **Load Unpacked:** Click the "Load unpacked" button.
5.  **Select Folder:** Select the folder containing the project files (the one with `manifest.json` in it).
6.  **Done!** The extension icon should now appear in your browser's toolbar. You may need to click the "puzzle piece" icon to pin it.

---
