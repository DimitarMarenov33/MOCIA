# Architecture Documentation

## 📐 **System Overview**

The MOCIA Cognitive Training Module is a client-side web application built with vanilla HTML, CSS, and JavaScript. It follows a modular architecture where each exercise is self-contained but shares common utilities, styling, and data management.

### **Design Philosophy**

1. **No Build Tools** - Direct browser execution, no compilation needed
2. **Modular Components** - Each exercise is independent
3. **Shared Utilities** - Common functionality centralized
4. **Progressive Enhancement** - Core functionality works everywhere
5. **Accessibility First** - WCAG AAA compliance throughout
6. **Data Privacy** - All data stays on device

## 🏗️ **Architecture Layers**

```
┌─────────────────────────────────────────────┐
│         User Interface Layer                │
│  (HTML, CSS, DOM Manipulation)              │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│        Exercise Logic Layer                 │
│  (Individual exercise implementations)      │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│      Shared Services Layer                  │
│  (Audio, Data, Difficulty, UI Components)   │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│       Utility Layer                         │
│  (Statistics, Validation, Constants)        │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│      Browser APIs Layer                     │
│  (localStorage, Web Speech, Vibration)      │
└─────────────────────────────────────────────┘
```

## 🧩 **Core Components**

### **1. Main Menu (index.html)**

**Purpose**: Application entry point and exercise launcher

**Responsibilities**:
- Display available exercises with metadata
- Show aggregate statistics across all exercises
- Provide access to settings
- Handle data export/import
- Navigate to exercises

**Key Features**:
- Dynamically loads exercise history
- Calculates performance trends
- Recommends exercises based on usage
- Manages global settings

**Data Flow**:
```
User → Main Menu → DataTracker.getAggregateStats()
                 → Display statistics
                 → User selects exercise
                 → Navigate to exercise HTML
```

### **2. Shared Services**

#### **AudioManager** (Singleton)

**Purpose**: Centralized audio and haptic feedback management

**Methods**:
```javascript
speak(text, options)           // Text-to-speech
stop()                         // Stop current speech
toggle()                       // Enable/disable audio
hapticPress()                  // Button press feedback
hapticSuccess()                // Success vibration
hapticError()                  // Error vibration
```

**Implementation Details**:
- Uses Web Speech API for text-to-speech
- Queues multiple speech requests
- Supports priority interruption
- Persists settings to localStorage
- Falls back gracefully if API unavailable

#### **DataTracker** (Singleton)

**Purpose**: Manage all data persistence and session tracking

**Data Structure**:
```javascript
{
  version: "1.0.0",
  userId: "default_user",
  createdAt: "2025-01-01T00:00:00Z",
  lastAccessedAt: "2025-01-01T00:00:00Z",
  exercises: {
    digit_span: {
      sessions: [ /* array of session objects */ ],
      totalSessions: 10,
      bestPerformance: { /* best scores */ },
      averageAccuracy: 0.85,
      lastPlayed: "2025-01-01T00:00:00Z",
      performanceTrend: "improving"
    },
    // ... other exercises
  }
}
```

**Session Object Structure**:
```javascript
{
  id: "session_1234567890_abc123",
  exerciseType: "digit_span",
  startTime: "2025-01-01T10:00:00Z",
  endTime: "2025-01-01T10:05:00Z",
  status: "completed",
  initialDifficulty: 3,
  finalDifficulty: 4,
  trials: [ /* array of trial objects */ ],
  statistics: {
    score: 150,
    accuracy: 0.85,
    maxSpan: 7,
    averageResponseTime: 2500
  }
}
```

**Key Methods**:
```javascript
startSession(exerciseType, config)    // Begin new session
recordTrial(trialData)                // Record individual trial
endSession(finalStats, status)        // Complete and save session
getExerciseHistory(exerciseType)      // Retrieve history
getAggregateStats()                   // Get overall statistics
exportData()                          // Export to JSON
clearAllData()                        // Reset everything
```

#### **DifficultyAdapter** (Base Class)

**Purpose**: Implement adaptive difficulty algorithms

**Algorithm**:
```
IF consecutiveCorrect >= threshold:
    difficulty += step
    consecutiveCorrect = 0

IF consecutiveIncorrect >= threshold:
    difficulty -= step
    consecutiveIncorrect = 0

difficulty = clamp(difficulty, min, max)
```

**Specialized Adapters**:

1. **DigitSpanAdapter**
   - Adjusts sequence length (2-9 digits)
   - Tracks maximum span achieved

2. **DualNBackAdapter**
   - Adjusts N-back level (2-5)
   - Uses block-level accuracy instead of trial-level

3. **UFOVAdapter**
   - Adjusts presentation duration (100-500ms)
   - Implements staircase procedure
   - Calculates threshold at 75% accuracy

#### **UIComponents** (Utility Object)

**Purpose**: Generate consistent UI elements dynamically

**Key Methods**:
```javascript
createButton(text, onClick, options)
createStatsPanel(stats)
createProgressBar(current, max, options)
createFeedbackPanel(message, type, options)
createModal(title, content, buttons)
createNumberPad(onNumberClick)
createExerciseCard(config)
```

**Benefits**:
- Ensures visual consistency
- Reduces code duplication
- Centralizes accessibility attributes
- Easy to update design globally

### **3. Exercise Structure**

Each exercise follows a standard template:

#### **File Structure**
```
exercises/{exercise-name}/
├── index.html          # HTML structure
├── {exercise-name}.js  # Exercise logic
├── {exercise-name}.css # Custom styles
└── config.json         # Configuration
```

#### **Exercise Class Pattern**

All exercises follow this structure:

```javascript
class ExerciseName {
  constructor() {
    this.config = null;
    this.currentTrial = 0;
    // ... exercise-specific state
    this.init();
  }

  async init() {
    await this.loadConfig();
    this.cacheElements();
    this.setupEventListeners();
    this.loadSettings();
  }

  async loadConfig() {
    // Load config.json
  }

  cacheElements() {
    // Store references to DOM elements
  }

  setupEventListeners() {
    // Bind event handlers
  }

  async startExercise() {
    // Initialize exercise
    window.DataTracker.startSession(...);
    this.startTrial();
  }

  async startTrial() {
    // Run single trial
    // Present stimulus
    // Collect response
    // Process result
  }

  processResult() {
    // Check correctness
    // Update difficulty
    // Record data
    window.DataTracker.recordTrial(...);
  }

  endExercise() {
    // Calculate final stats
    window.DataTracker.endSession(...);
    // Show results
  }
}
```

#### **Exercise Lifecycle**

```
1. Welcome Screen
   ↓
2. [Optional] Practice Mode
   ↓
3. Start Session
   - DataTracker.startSession()
   - Initialize difficulty adapter
   ↓
4. Trial Loop
   For each trial:
     - Present stimulus
     - Collect response
     - Show feedback
     - DataTracker.recordTrial()
     - Update difficulty
   ↓
5. End Session
   - Calculate statistics
   - DataTracker.endSession()
   ↓
6. Results Screen
   - Display performance
   - Show comparisons
   - Offer retry or return to menu
```

## 🎨 **Design System**

### **CSS Architecture**

**Three-Layer CSS System**:

1. **design-system.css** - Foundation
   - CSS custom properties (variables)
   - Reset and base styles
   - Typography scale
   - Color palette
   - Spacing system
   - Breakpoints
   - Utility classes

2. **components.css** - Reusable Components
   - Buttons (variants, sizes)
   - Cards
   - Panels
   - Progress bars
   - Stats displays
   - Modals
   - Badges

3. **animations.css** - Motion Design
   - Keyframe animations
   - Transition utilities
   - Hover effects
   - Respects prefers-reduced-motion

**Exercise-Specific CSS**:
- Each exercise has custom CSS for unique elements
- Must not override shared design system
- Should extend, not replace, base styles

### **Responsive Design Strategy**

**Breakpoints**:
```css
/* Mobile (default) */
320px - 768px

/* Tablet */
769px - 1024px

/* Desktop */
1025px+
```

**Mobile-First Approach**:
```css
/* Mobile styles (default) */
.element {
  font-size: 16px;
}

/* Tablet and up */
@media (min-width: 769px) {
  .element {
    font-size: 18px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .element {
    font-size: 20px;
  }
}
```

### **Accessibility Standards**

**WCAG AAA Compliance**:

1. **Contrast Ratios**
   - Normal text: 7:1 minimum
   - Large text: 4.5:1 minimum
   - UI components: 3:1 minimum

2. **Touch Targets**
   - Minimum: 48x48px
   - Recommended: 60x60px
   - Spacing: 8px minimum between targets

3. **Keyboard Navigation**
   - All interactive elements tabbable
   - Logical tab order
   - Visible focus indicators (3px outline)

4. **Screen Reader Support**
   - Semantic HTML elements
   - ARIA labels where needed
   - Live regions for dynamic content

5. **Text Scaling**
   - Works up to 200% zoom
   - Relative units (rem, em, %)
   - No fixed widths on text containers

## 📊 **Data Flow**

### **Session Data Flow**

```
User Action
    ↓
Exercise Logic
    ↓
DataTracker.recordTrial()
    ↓
Trial Data Object
    ↓
Session Array
    ↓
localStorage
    ↓
Aggregate Statistics
    ↓
Main Menu Display
```

### **Adaptive Difficulty Flow**

```
Trial Result
    ↓
DifficultyAdapter.processResult(correct)
    ↓
Update Consecutive Counters
    ↓
Check Thresholds
    ↓
Adjust Difficulty (if needed)
    ↓
Return New Difficulty
    ↓
Apply to Next Trial
```

### **Statistics Calculation**

**Real-time Stats** (during exercise):
```javascript
accuracy = correctTrials / totalTrials
maxSpan = max(allDifficulties)
averageResponseTime = mean(allResponseTimes)
```

**Aggregate Stats** (across sessions):
```javascript
averageAccuracy = mean(sessionAccuracies)
trend = compareRecentToHistorical()
bestPerformance = max(allSessionScores)
```

## 🔌 **Browser API Usage**

### **localStorage API**

**Usage**:
```javascript
// Save
localStorage.setItem(key, JSON.stringify(data));

// Load
const data = JSON.parse(localStorage.getItem(key));

// Remove
localStorage.removeItem(key);
```

**Quota Management**:
- Typical limit: 5-10MB per origin
- Monitor usage via `navigator.storage.estimate()`
- Implement cleanup for old sessions

**Error Handling**:
```javascript
try {
  localStorage.setItem(key, data);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Clean up old data
    this.cleanupOldSessions();
  }
}
```

### **Web Speech API**

**Usage**:
```javascript
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 0.9;  // Slightly slower for seniors
utterance.pitch = 1.0;
utterance.volume = 1.0;

speechSynthesis.speak(utterance);
```

**Browser Support**:
- Chrome/Edge: Excellent
- Safari: Good
- Firefox: Limited voices

**Fallback**:
- Gracefully degrade if unavailable
- Continue without audio
- User can toggle manually

### **Vibration API**

**Usage**:
```javascript
// Single vibration
navigator.vibrate(50);

// Pattern
navigator.vibrate([50, 100, 50]);
```

**Support**:
- Android: Good
- iOS: Not supported (ignored gracefully)

## 🔄 **State Management**

### **Exercise State**

Each exercise manages its own state:

```javascript
class Exercise {
  constructor() {
    // Exercise configuration
    this.config = null;

    // Session state
    this.currentTrial = 0;
    this.totalTrials = 10;

    // Trial state
    this.currentStimulus = null;
    this.userResponse = null;

    // Performance tracking
    this.score = 0;
    this.trials = [];

    // Difficulty state
    this.difficultyAdapter = null;
    this.currentDifficulty = 3;
  }
}
```

### **Global State**

Shared via singletons:

```javascript
// Audio state
window.AudioManager.enabled
window.AudioManager.rate

// Data state
window.DataTracker.currentSession
window.DataTracker.userData

// Settings state (in localStorage)
{
  audio: { enabled: true, rate: 0.9 },
  display: { largeText: false, highContrast: false }
}
```

## 🧪 **Adding New Exercises**

### **Step 1: Create Directory Structure**

```bash
mkdir exercises/my-exercise
cd exercises/my-exercise
touch index.html my-exercise.js my-exercise.css config.json
```

### **Step 2: Create Configuration**

```json
{
  "exerciseId": "my_exercise",
  "exerciseName": "My Exercise",
  "difficulty": "medium",
  "description": "Description here",
  "parameters": {
    "totalTrials": 10,
    "startDifficulty": 3
  },
  "scoring": {
    "pointsPerCorrect": 10
  },
  "instructions": {
    "title": "How to Play",
    "steps": ["Step 1", "Step 2"]
  }
}
```

### **Step 3: Create HTML Structure**

Use existing exercises as templates. Essential elements:

```html
<!DOCTYPE html>
<html lang="nl">
<head>
  <!-- Link shared stylesheets -->
  <link rel="stylesheet" href="../../shared/styles/design-system.css">
  <link rel="stylesheet" href="../../shared/styles/components.css">
  <link rel="stylesheet" href="../../shared/styles/animations.css">
  <link rel="stylesheet" href="my-exercise.css">
</head>
<body>
  <!-- Welcome screen -->
  <div id="welcome-screen">...</div>

  <!-- Exercise screen -->
  <div id="exercise-screen" class="hidden">...</div>

  <!-- Results screen -->
  <div id="results-screen" class="hidden">...</div>

  <!-- Load shared scripts -->
  <script src="../../shared/js/constants.js"></script>
  <script src="../../shared/js/audio-manager.js"></script>
  <script src="../../shared/js/data-tracker.js"></script>
  <script src="../../shared/js/difficulty-adapter.js"></script>
  <script src="../../shared/js/ui-components.js"></script>
  <script src="../../shared/utils/statistics.js"></script>
  <script src="../../shared/utils/validation.js"></script>

  <!-- Exercise script -->
  <script src="my-exercise.js"></script>
</body>
</html>
```

### **Step 4: Implement Exercise Class**

```javascript
class MyExercise {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadConfig();
    this.cacheElements();
    this.setupEventListeners();
  }

  async startExercise() {
    window.DataTracker.startSession(this.config.exerciseId, {
      initialDifficulty: this.currentDifficulty
    });
    this.startTrial();
  }

  async startTrial() {
    // Your exercise logic here
  }

  processResult(correct) {
    // Record trial
    window.DataTracker.recordTrial({
      difficulty: this.currentDifficulty,
      correct: correct,
      // ... other data
    });

    // Update difficulty
    this.difficultyAdapter.processResult(correct);
  }

  endExercise() {
    const stats = this.calculateStats();
    window.DataTracker.endSession(stats);
    this.showResults(stats);
  }
}

// Initialize
new MyExercise();
```

### **Step 5: Add to Main Menu**

In `index.html`, add to exercises array:

```javascript
{
  id: 'my_exercise',
  title: 'My Exercise',
  icon: '🎮',
  difficulty: 'medium',
  description: 'Description here',
  path: 'exercises/my-exercise/index.html',
  estimatedTime: '10 minutes',
}
```

### **Step 6: Add Constants**

In `shared/js/constants.js`, add exercise type:

```javascript
EXERCISE_TYPES: {
  MY_EXERCISE: 'my_exercise',
  // ... other types
}
```

## 🐛 **Debugging**

### **Common Issues**

**Data Not Saving**:
```javascript
// Check localStorage availability
if (!this.storageAvailable) {
  console.error('localStorage not available');
}

// Check quota
navigator.storage.estimate().then(estimate => {
  console.log(`Used: ${estimate.usage} of ${estimate.quota}`);
});
```

**Audio Not Working**:
```javascript
// Check API availability
if (!('speechSynthesis' in window)) {
  console.error('Speech synthesis not supported');
}

// Check voices loaded
speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  console.log('Available voices:', voices);
};
```

**Performance Issues**:
```javascript
// Add timing logs
console.time('trial-start');
await this.startTrial();
console.timeEnd('trial-start');

// Monitor memory
console.log(performance.memory);
```

### **Browser Console Commands**

```javascript
// View all stored data
JSON.parse(localStorage.getItem('mocia_user_data'));

// Clear all data
localStorage.clear();

// Check settings
JSON.parse(localStorage.getItem('mocia_settings'));

// Force audio on/off
window.AudioManager.enable();
window.AudioManager.disable();

// View current session
window.DataTracker.getCurrentSession();
```

## 📦 **Deployment**

### **Static Hosting**

The application is completely static and can be hosted on:

- **GitHub Pages**
- **Netlify**
- **Vercel**
- **AWS S3 + CloudFront**
- **Any web server** (Apache, Nginx, etc.)

### **Embedding in Iframe**

To embed in another application:

```html
<iframe
  src="https://your-domain.com/path-to-app/index.html"
  width="100%"
  height="800px"
  style="border: none;"
  allow="vibrate; autoplay"
  sandbox="allow-scripts allow-same-origin allow-forms"
>
</iframe>
```

**Sandbox Permissions Needed**:
- `allow-scripts` - JavaScript execution
- `allow-same-origin` - localStorage access
- `allow-forms` - Form interactions

### **Offline Support**

For Progressive Web App (PWA) conversion:

1. Add `manifest.json`
2. Implement Service Worker for caching
3. Cache all static assets
4. Make fully offline-capable

## 🔐 **Security Considerations**

1. **No External Dependencies** - Reduces attack surface
2. **Content Security Policy** - Can add CSP headers
3. **Input Validation** - All user input validated
4. **localStorage Only** - No cookies, no tracking
5. **No Eval** - No dynamic code execution
6. **HTTPS Required** - For Web Speech API in production

## 📈 **Performance Optimization**

### **Implemented Optimizations**

1. **Lazy Loading** - Exercises loaded only when accessed
2. **Event Delegation** - Reduces event listener count
3. **CSS Transforms** - GPU-accelerated animations
4. **Debouncing** - Rate-limit rapid inputs
5. **Minimal DOM Updates** - Batch DOM changes

### **Performance Targets**

- **First Paint**: < 1 second
- **Interactive**: < 2 seconds
- **Stimulus Timing**: ±10ms accuracy
- **Memory Usage**: < 50MB
- **localStorage**: < 5MB total

## 🔮 **Future Enhancements**

Possible extensions:

1. **Multi-User Support** - User profiles
2. **Cloud Sync** - Optional backend for multi-device
3. **More Exercises** - Additional cognitive tasks
4. **Progress Graphs** - Visual performance tracking
5. **Gamification** - Achievements, streaks
6. **Social Features** - Compare with others (anonymously)
7. **Customization** - User-adjustable parameters
8. **Accessibility** - Voice control, switch access

---

This architecture provides a solid foundation for a maintainable, scalable cognitive training application optimized for older adults.
