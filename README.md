# LeetCode Smart Filter Chrome Extension

A powerful Chrome extension that provides AI-powered problem filtering, skill assessment, and smart recommendations for LeetCode users.

## 🚀 Features

### **AI-Powered Skill Assessment**
- Automatically analyzes your solved problems and performance patterns
- Determines skill level (Beginner/Intermediate/Advanced/Expert)
- Provides visual progress indicators and statistics

### **Advanced Problem Filtering**
- **Hide Solved Problems**: Filter out completed problems to focus on new challenges
- **Hide Premium Problems**: Remove premium content to focus on free problems
- **Difficulty Filtering**: Filter by Easy, Medium, or Hard problems
- **Topic Filtering**: Include/exclude specific algorithm topics (50+ categories)
- **Real-time Filtering**: Instant visual feedback with problem count updates

### **Smart Recommendations**
- Skill-based difficulty recommendations
- Topic-based problem suggestions
- Personalized learning paths

## 🛠️ Installation

1. **Download the Extension**
   ```bash
   git clone https://github.com/yourusername/leetcode-smart-filter.git
   cd leetcode-smart-filter
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the project folder
   - The extension will appear in your Chrome toolbar

3. **Start Using**
   - Navigate to [LeetCode Problems](https://leetcode.com/problemset/)
   - Click the extension icon to open the Smart Filter
   - Configure your preferences and start filtering!

## 📁 Project Structure

```
leetcode-smart-filter/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality and UI logic
├── content-script.js     # Content script for LeetCode page interaction
├── background.js         # Background service worker
├── images/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## 🎯 How to Use

### **Skill Assessment**
1. Click "Assess My Skills" button
2. Extension analyzes your LeetCode profile
3. View your skill level and progress statistics

### **Problem Filtering**
1. Configure your filter preferences:
   - Toggle "Hide Solved Problems"
   - Toggle "Hide Premium Problems"
   - Select difficulty levels
   - Choose topics to include/exclude
2. Click "Smart Filter" to apply filters
3. Use "Clear Filters" to reset

### **Quick Actions**
- **Smart Filter**: Apply all configured filters
- **Clear Filters**: Remove all applied filters
- **Reset Settings**: Return to default configuration
- **Refresh Page**: Reload the LeetCode page

## 🛡️ Privacy & Security

- **No Data Collection**: All processing happens locally in your browser
- **No External APIs**: No data is sent to external servers
- **Chrome Storage**: Settings are stored locally using Chrome's storage API
- **Open Source**: Full source code available for review

## 🔧 Technical Details

### **Technologies Used**
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Chrome APIs**: Extension APIs, Storage API, Runtime API, Scripting API
- **Architecture**: Manifest V3, Content Scripts, Background Service Worker

### **Key Features**
- **DOM Manipulation**: Advanced parsing and filtering of LeetCode pages
- **Asynchronous Programming**: Async/await patterns with error handling
- **Cross-Script Communication**: Message passing between extension components
- **Performance Optimization**: Efficient DOM queries and memory management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- LeetCode for providing the platform
- Chrome Extension API documentation
- Open source community for inspiration

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review the Chrome extension documentation

---

**Made with ❤️ for the LeetCode community**