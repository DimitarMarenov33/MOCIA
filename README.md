# MOCIA Cognitive Training Module

A comprehensive web-based cognitive training application designed specifically for Dutch older adults (60+). This standalone module provides three scientifically validated cognitive exercises that run entirely in the browser with no server dependencies.

## 🎯 **Overview**

This cognitive training module is part of the MOCIA health app, focusing on working memory, attention, and processing speed training through evidence-based exercises optimized for seniors.

### **Key Features**

- ✅ **100% Browser-Based** - No installation, no server required
- ✅ **Mobile-First Design** - Optimized for touchscreens (iOS Safari, Android Chrome)
- ✅ **Accessibility-First** - WCAG AAA compliant with large text and high contrast modes
- ✅ **Offline Capable** - Works without internet connection after initial load
- ✅ **Data Privacy** - All data stored locally using localStorage
- ✅ **Adaptive Difficulty** - Automatically adjusts to user performance
- ✅ **Dutch Language** - Fully localized for Dutch-speaking users
- ✅ **Audio Feedback** - Text-to-speech support with Dutch pronunciation
- ✅ **Progress Tracking** - Comprehensive statistics and performance analytics

## 📋 **Included Exercises**

### 1. **Digit Span Forward** (Easy)
- **Type**: Working Memory
- **Duration**: 5-10 minutes
- **Description**: Remember and recall sequences of digits
- **Research Basis**: Classic digit span test used in neuropsychology
- **Difficulty Range**: 2-9 digits

### 2. **Dual N-Back** (Hard)
- **Type**: Working Memory & Attention
- **Duration**: 15-20 minutes
- **Description**: Track visual positions and auditory letters simultaneously
- **Research Basis**: Effect size of 0.37 for working memory improvements
- **Difficulty Range**: 2-back to 5-back

### 3. **UFOV - Useful Field of View** (Medium)
- **Type**: Processing Speed
- **Duration**: 10-15 minutes
- **Description**: Rapid identification of central and peripheral stimuli
- **Research Basis**: ACTIVE study (N=2,802) - 29% reduction in dementia risk
- **Difficulty Range**: 500ms to 100ms presentation time

## 🚀 **Quick Start**

### **For End Users (Installing the App)**

**The app can be installed on your phone/tablet like a native app:**

1. **Visit the deployed URL** (e.g., `https://mocia.netlify.app`)
2. **Install on your device:**
   - **Android**: Tap "Add to Home screen" when prompted
   - **iOS**: Tap Share → "Add to Home Screen"
   - **Desktop**: Click the install icon in the address bar
3. **App works offline** after first visit - no internet needed!

### **For Developers (Local Testing)**

1. **Open the Application**
   - Simply open `index.html` in any modern web browser
   - Or use a local server: `python3 -m http.server 8000`

2. **Test PWA Features**
   - Open DevTools (F12) → Application tab
   - Verify Service Worker is registered
   - Check manifest.json is loaded
   - Test offline mode (Network tab → Offline checkbox)

### **For Deployment (Making it Live)**

**See `DEPLOYMENT.md` for full deployment guide.**

**Quick deploy with Netlify:**
1. Sign up at netlify.com (free)
2. Drag your project folder into Netlify
3. Get instant HTTPS URL
4. Share with users!

**Before deploying:**
- ⚠️ Create app icons (see DEPLOYMENT.md)
- ⚠️ Test locally first
- ⚠️ Verify Service Worker works

### **For Developers**

```bash
# Clone or download the repository
cd /path/to/project

# Open in browser (no build step required)
open index.html

# Or serve with any HTTP server
python -m http.server 8000
# Navigate to http://localhost:8000
```

## 📁 **Project Structure**

```
/
├── index.html                 # Main menu / launcher
├── README.md                  # This file
├── ARCHITECTURE.md            # Technical architecture documentation
│
├── assets/                    # Media assets
│   ├── icons/                 # SVG icons
│   └── sounds/                # Optional sound effects
│
├── shared/                    # Shared resources
│   ├── styles/
│   │   ├── design-system.css  # Core design system
│   │   ├── components.css     # Reusable UI components
│   │   └── animations.css     # Animation definitions
│   │
│   ├── js/
│   │   ├── constants.js       # Global constants
│   │   ├── audio-manager.js   # Text-to-speech & haptics
│   │   ├── data-tracker.js    # Data persistence
│   │   ├── difficulty-adapter.js  # Adaptive difficulty
│   │   └── ui-components.js   # Dynamic UI generators
│   │
│   └── utils/
│       ├── statistics.js      # Statistical calculations
│       └── validation.js      # Input validation
│
├── exercises/                 # Individual exercises
│   ├── digit-span/
│   │   ├── index.html
│   │   ├── digit-span.js
│   │   ├── digit-span.css
│   │   └── config.json
│   │
│   ├── dual-n-back/
│   │   ├── index.html
│   │   ├── dual-n-back.js
│   │   ├── dual-n-back.css
│   │   └── config.json
│   │
│   └── ufov/
│       ├── index.html
│       ├── ufov.js
│       ├── ufov.css
│       └── config.json
│
└── tests/                     # Testing documentation
    ├── accessibility-checklist.md
    └── browser-compatibility.md
```

## 🎨 **Design Principles**

### **Accessibility for Seniors**

1. **Large Touch Targets** - Minimum 48x48px, recommended 60px+
2. **Large Text** - Base font size 20px, can scale up to 24px+
3. **High Contrast** - 7:1+ contrast ratio (WCAG AAA)
4. **Simple Navigation** - Maximum 3 levels deep
5. **Clear Feedback** - Visual, audio, and haptic confirmation
6. **No Time Pressure** - Generous response windows
7. **Forgiving Interface** - Easy error correction

### **Color Palette**

- **Success/Start**: Green (#2E7D32)
- **Info/Primary**: Blue (#1976D2)
- **Warning/Highlight**: Orange (#F57C00)
- **Error/Stop**: Red (#C62828)
- **Text**: Very Dark Gray (#212121)
- **Background**: White (#FFFFFF)

## 💾 **Data Management**

### **What Data is Stored?**

All data is stored locally in the browser's `localStorage`. No data is sent to any server.

**Stored Information:**
- Session history (date, duration, scores)
- Performance metrics (accuracy, response times)
- Difficulty progression
- User preferences (audio, text size, contrast)

### **Data Export**

Users can export their data at any time:
1. Click Settings (⚙️) button
2. Click "Exporteer Gegevens"
3. Save the JSON file to your device

### **Data Privacy**

- **100% Local Storage** - Data never leaves the device
- **No Analytics** - No tracking or telemetry
- **No Network Calls** - Works completely offline
- **User Control** - Users can export or delete data anytime

## 🔧 **Configuration**

### **Exercise Configuration**

Each exercise has a `config.json` file that allows customization:

```json
{
  "parameters": {
    "startDifficulty": 2,
    "minDifficulty": 2,
    "maxDifficulty": 9,
    "totalTrials": 10
  },
  "scoring": {
    "pointsPerCorrect": 10
  },
  "instructions": {
    "title": "How to Play",
    "steps": ["...", "..."]
  }
}
```

### **User Settings**

Available in the Settings menu (⚙️):
- Audio feedback on/off
- Large text mode
- High contrast mode
- Data export
- Data reset

## 🌐 **Browser Compatibility**

### **Fully Supported**
- ✅ Chrome 90+ (Desktop & Android)
- ✅ Safari 14+ (Desktop & iOS)
- ✅ Firefox 88+
- ✅ Edge 90+

### **Required Features**
- localStorage API
- Web Speech API (for text-to-speech)
- CSS Grid & Flexbox
- ES6 JavaScript
- Vibration API (optional, for haptic feedback)

### **Testing Recommendations**

Test on actual devices, especially:
- iPad (Safari)
- iPhone (Safari)
- Android tablet (Chrome)
- Android phone (Chrome)

## 🧪 **Testing**

### **Manual Testing Checklist**

See `tests/accessibility-checklist.md` for comprehensive testing procedures.

**Quick Test:**
1. ✓ Open main menu - all exercises visible
2. ✓ Start each exercise - instructions clear
3. ✓ Complete a trial - feedback appropriate
4. ✓ Check settings - all options work
5. ✓ Export data - JSON file downloads
6. ✓ Test on mobile - touch targets large enough

### **Accessibility Testing**

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Ensure logical tab order
   - Verify visible focus indicators

2. **Screen Reader**
   - Test with VoiceOver (iOS/Mac) or TalkBack (Android)
   - Verify all images have alt text
   - Check ARIA labels on buttons

3. **Contrast**
   - Use browser dev tools to check contrast ratios
   - Verify 7:1+ for all text

4. **Text Scaling**
   - Zoom to 200% - layout should not break
   - Enable large text mode - should be readable

## 📊 **Performance Metrics**

### **Expected Outcomes**

Based on research literature:

**Digit Span:**
- Initial span: 5-6 digits (age 60-70)
- Improvement: +1-2 digits after 10-15 sessions
- Maintenance: Weekly practice recommended

**Dual N-Back:**
- Initial level: 2-back
- Improvement: Can reach 3-4 back with practice
- Transfer effects: General working memory improvement

**UFOV:**
- Initial threshold: 300-500ms (age 60-70)
- Improvement: 50-100ms reduction possible
- Real-world benefit: Safer driving, fall prevention

## 🔒 **Security & Privacy**

- **No External Dependencies** - All code is self-contained
- **No CDNs** - All resources loaded locally
- **No Analytics** - No tracking scripts
- **No Cookies** - Only localStorage used
- **No Backend** - Static files only

## ⚠️ **Limitations**

1. **localStorage Limits** - Typically 5-10MB per domain
2. **No Cloud Sync** - Data stored only on device
3. **Browser-Specific** - Data doesn't transfer between browsers
4. **Device-Specific** - Data doesn't transfer between devices
5. **Text-to-Speech** - Quality varies by browser/platform

## 🆘 **Troubleshooting**

### **Common Issues**

**Problem: Data not saving**
- Solution: Check localStorage is enabled in browser settings
- Solution: Ensure private/incognito mode isn't blocking storage

**Problem: Audio not working**
- Solution: Check browser supports Web Speech API
- Solution: Verify audio isn't muted in browser/system
- Solution: Try toggling audio off and on in settings

**Problem: Layout broken on mobile**
- Solution: Ensure viewport meta tag is present
- Solution: Test in actual browser, not dev tools
- Solution: Clear browser cache

**Problem: Slow performance**
- Solution: Close other browser tabs
- Solution: Restart browser
- Solution: Update to latest browser version

## 📞 **Support & Contributions**

### **Getting Help**

For issues or questions:
1. Check this README and ARCHITECTURE.md
2. Review the troubleshooting section above
3. Check browser console for error messages

### **Adding New Exercises**

See `ARCHITECTURE.md` for detailed instructions on creating new exercises. The modular design makes it straightforward to add new cognitive training tasks.

## 📜 **License**

This project is created for the MOCIA health app thesis project.

## 🙏 **Acknowledgments**

**Research Foundations:**
- Digit Span: Wechsler Adult Intelligence Scale (WAIS)
- Dual N-Back: Jaeggi et al. (2008) - Working memory training
- UFOV: ACTIVE Study - Ball et al. (2002) - Cognitive training in older adults

**Design Inspiration:**
- Material Design accessibility guidelines
- WCAG 2.1 Level AAA standards
- iOS Human Interface Guidelines for seniors

## 📈 **Version History**

### Version 1.0.0 (Current)
- ✅ Three complete exercises
- ✅ Full data tracking and analytics
- ✅ Adaptive difficulty for all exercises
- ✅ Audio feedback (Dutch text-to-speech)
- ✅ Accessibility features (large text, high contrast)
- ✅ Data export functionality
- ✅ Mobile-optimized interface

---

**Built with ❤️ for older adults**

For technical details, see [ARCHITECTURE.md](ARCHITECTURE.md)
