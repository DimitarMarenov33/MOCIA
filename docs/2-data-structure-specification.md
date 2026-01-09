# Data Structure Specification

## Overview

This document specifies all data points logged by the MOCIA Cognitive Training Module. Data is persisted using localStorage with a hierarchical structure organized by user, exercise type, session, and trial.

---

## Top-Level User Data Structure

```javascript
{
  version: "1.0.0",              // App version
  userId: "default_user",        // User identifier
  createdAt: "ISO8601",          // First app usage timestamp
  lastAccessedAt: "ISO8601",     // Last app access timestamp
  exercises: {                   // Per-exercise data
    [exerciseType]: ExerciseData
  }
}
```

---

## Exercise Data Structure

```javascript
{
  sessions: [Session],           // Array of session objects (max 50)
  totalSessions: number,         // Total sessions completed
  bestPerformance: {             // Best performance record
    score: number,
    date: "ISO8601",
    ...exerciseSpecificStats
  } | null,
  averageAccuracy: number,       // Running average (0-1)
  lastPlayed: "ISO8601" | null,  // Last session timestamp
  performanceTrend: "improving" | "stable" | "declining"
}
```

---

## Session Data Structure

```javascript
{
  id: "session_<timestamp>_<random>",  // Unique session ID
  exerciseType: string,                 // Exercise type constant
  startTime: "ISO8601",                 // Session start
  endTime: "ISO8601",                   // Session end
  status: "completed" | "abandoned",    // Completion status
  duration: number,                     // Duration in milliseconds
  initialDifficulty: number | null,     // Starting difficulty
  finalDifficulty: number | null,       // Ending difficulty
  trials: [Trial],                      // Array of trial objects
  statistics: FinalStats,               // Session statistics
  config: object                        // Initial configuration
}
```

---

## Trial Data Structures by Exercise

### 1. Digit Span Trial

```javascript
{
  trialNumber: number,           // Trial index (1-based)
  timestamp: "ISO8601",          // Trial completion time
  difficulty: number,            // Sequence length
  correctSequence: string[],     // Array of correct characters
  userResponse: string[],        // Array of user input
  correct: boolean,              // Overall correctness
  responseTime: number,          // Time in milliseconds
  score: number                  // Points earned this trial
}
```

### 2. Dual N-Back Trial

```javascript
{
  trialNumber: number,           // Trial index
  timestamp: "ISO8601",          // Trial completion time
  difficulty: number,            // N-level
  position: number,              // Grid position (0-8)
  letter: string,                // Spoken letter
  positionMatch: boolean,        // Was position an N-back match?
  soundMatch: boolean,           // Was letter an N-back match?
  positionPressed: boolean,      // Did user press position button?
  soundPressed: boolean,         // Did user press sound button?
  positionCorrect: boolean,      // Position response correct?
  soundCorrect: boolean,         // Sound response correct?
  correct: boolean,              // Both responses correct?
  responseTime: number           // Time in milliseconds
}
```

### 3. UFOV Basic Trial

```javascript
{
  trialNumber: number,           // Trial index
  timestamp: "ISO8601",          // Trial completion time
  difficulty: number,            // Presentation duration (ms)
  centralTarget: string,         // Central target ID
  peripheralPosition: number,    // Peripheral target position (0-7)
  centralResponse: string,       // User's central response
  peripheralResponse: number,    // User's peripheral response
  centralCorrect: boolean,       // Central task correct?
  peripheralCorrect: boolean,    // Peripheral task correct?
  correct: boolean,              // Both tasks correct?
  responseTime: number,          // Total response time (ms)
  score: number                  // Points earned
}
```

### 4. UFOV Complex Trial

```javascript
{
  trialNumber: number,           // Trial index
  timestamp: "ISO8601",          // Trial completion time
  difficulty: number,            // Presentation duration (ms)
  centralTarget: string,         // Central target ID
  peripheralPosition: number,    // Peripheral target position
  numDistractors: number,        // Number of distractors shown
  centralResponse: string,       // User's central response
  peripheralResponse: number,    // User's peripheral response
  centralCorrect: boolean,       // Central task correct?
  peripheralCorrect: boolean,    // Peripheral task correct?
  correct: boolean,              // Both tasks correct?
  responseTime: number,          // Total response time (ms)
  score: number                  // Points earned
}
```

### 5. Stroop Task Trial

```javascript
{
  trialNumber: number,           // Trial index
  timestamp: "ISO8601",          // Trial completion time
  stimulusSet: "buildings" | "days",  // Which stimulus set
  condition: "congruent" | "incongruent",  // Trial condition
  visualItem: string,            // What was displayed (ID)
  spokenItem: string,            // What was spoken (ID)
  selectedItem: string | null,   // User's selection (null if timeout)
  correct: boolean,              // Was response correct?
  responseTime: number,          // Time in milliseconds
  timeLimit: number,             // Current time limit (ms)
  timedOut: boolean,             // Did trial timeout?
  score: number                  // Points earned
}
```

### 6. Task Switching Trial

```javascript
{
  trialNumber: number,           // Trial index
  timestamp: "ISO8601",          // Trial completion time
  block: 1 | 2 | 3,              // Block number
  task: "time" | "day_type",     // Current task type
  day: string,                   // Day name shown
  time: "HH:MM",                 // Time shown
  isWeekend: boolean,            // Is the day a weekend?
  isBefore12: boolean,           // Is time before 12:00?
  isSwitch: boolean,             // Was this a switch trial?
  response: "left" | "right",    // User's response
  correct: boolean,              // Was response correct?
  responseTime: number,          // Time in milliseconds
  cti: number,                   // Cue-Target Interval (ms)
  score: number                  // Points earned
}
```

### 7. Visual Search Trial

```javascript
{
  trialNumber: number,           // Trial index
  timestamp: "ISO8601",          // Trial completion time
  difficulty: number,            // Grid size dimension
  gridSize: number,              // Grid size (e.g., 3 for 3x3)
  totalItems: number,            // Total items in grid
  targetAnimal: string,          // Target emoji
  correct: boolean,              // Did user find target?
  responseTime: number,          // Time in milliseconds
  timedOut: boolean,             // Did trial timeout?
  score: number                  // Points earned
}
```

### 8. Word Pair Association Trial

```javascript
{
  trialNumber: number,           // Trial/round number
  timestamp: "ISO8601",          // Trial completion time
  numPairs: number,              // Number of pair sets
  delayMinutes: number,          // Delay duration
  correctPairs: number,          // Pairs recalled correctly
  totalPairs: number,            // Total pairs to recall
  accuracy: number,              // Accuracy (0-1)
  isPerfect: boolean,            // All pairs correct?
  wordPairs: [{                  // Actual word pairs
    word1: string,
    word2: string
  }],
  userAnswers: [{                // User's responses
    word1: string,
    word2: string,
    correct: boolean
  }]
}
```

### 9. Complex Dual Task Trial

```javascript
{
  trialNumber: number,           // Trial index
  timestamp: "ISO8601",          // Trial completion time
  difficulty: number,            // Grid size dimension
  gridSize: number,              // Current grid size
  totalItems: number,            // Items in grid
  sequenceLength: number,        // Always 2
  targetSequence: string[],      // 2 target emojis
  correct: boolean,              // Full sequence correct?
  stepsFailed: number,           // Which step failed (0 or 1)
  responseTime: number,          // Final step response time (ms)
  timedOut: boolean,             // Did any step timeout?
  score: number                  // Points earned
}
```

---

## Final Statistics by Exercise

### Digit Span Final Stats

```javascript
{
  totalTrials: number,
  correctTrials: number,
  accuracy: number,              // 0-1
  score: number,
  maxSpan: number,               // Maximum sequence length achieved
  adjustments: number            // Number of difficulty changes
}
```

### Dual N-Back Final Stats

```javascript
{
  maxNBack: number,              // Maximum N-level achieved
  blocksCompleted: number,
  overallAccuracy: number,       // 0-1
  blockResults: [{               // Per-block results
    blockNumber: number,
    nLevel: number,
    overallAccuracy: number,
    positionAccuracy: number,
    soundAccuracy: number,
    totalTrials: number
  }]
}
```

### UFOV (Basic & Complex) Final Stats

```javascript
{
  threshold: number,             // Best presentation duration (ms)
  fastestTime: number,           // Fastest achieved (ms)
  centralAccuracy: number,       // Central task accuracy (0-1)
  peripheralAccuracy: number,    // Peripheral task accuracy (0-1)
  overallAccuracy: number,       // Both correct accuracy (0-1)
  averageResponseTime: number,   // Mean response time (ms)
  score: number,
  totalTrials: number
}
```

### Stroop Task Final Stats

```javascript
{
  totalTrials: number,
  correctTrials: number,
  accuracy: number,              // 0-1
  congruentAccuracy: number,     // Accuracy on congruent trials
  incongruentAccuracy: number,   // Accuracy on incongruent trials
  buildingsAccuracy: number,     // Accuracy on building trials
  daysAccuracy: number,          // Accuracy on day trials
  averageResponseTime: number,   // Mean RT for correct trials (ms)
  timeoutTrials: number,         // Number of timeouts
  finalTimeLimit: number,        // Final time limit (ms)
  score: number
}
```

### Task Switching Final Stats

```javascript
{
  totalTrials: number,
  correctTrials: number,
  accuracy: number,              // 0-1
  switchAccuracy: number,        // Accuracy on switch trials
  repeatAccuracy: number,        // Accuracy on repeat trials
  switchCost: number,            // RT difference (switch - repeat) in ms
  averageResponseTime: number,   // Mean RT for correct trials (ms)
  finalCTI: number,              // Final cue-target interval (ms)
  score: number
}
```

### Visual Search Final Stats

```javascript
{
  totalTrials: number,
  correctTrials: number,
  accuracy: number,              // 0-1
  averageResponseTime: number,   // Mean RT for correct trials (ms)
  timeoutTrials: number,         // Number of timeouts
  maxGridSize: number,           // Maximum grid dimension achieved
  score: number
}
```

### Word Pair Association Final Stats

```javascript
{
  totalTrials: number,           // Rounds completed
  finalNumPairs: number,         // Current pair count
  finalDelay: number,            // Current delay (minutes)
  accuracy: number,              // Last round accuracy (0-1)
  consecutiveSuccesses: number   // Streak of perfect recalls
}
```

### Complex Dual Task Final Stats

```javascript
{
  totalTrials: number,
  correctTrials: number,
  accuracy: number,              // 0-1
  averageResponseTime: number,   // Mean RT for correct trials (ms)
  timeoutTrials: number,         // Number of timeouts
  maxGridSize: number,           // Maximum grid dimension achieved
  score: number
}
```

---

## Storage Keys

```javascript
STORAGE_KEYS: {
  USER_DATA: "mocia_user_data",
  APP_SETTINGS: "mocia_settings"
}
```

---

## Storage Limits

```javascript
DATA: {
  MAX_SESSIONS_STORED: 50        // Maximum sessions per exercise
}
```

---

## Data Persistence Notes

1. **Storage Technology:** localStorage (5MB limit)
2. **Persistence:** Data survives page refresh and browser close
3. **Cleanup:** Automatic cleanup when quota exceeded (keeps 25 most recent)
4. **Export:** Full JSON export available via `DataTracker.exportData()`
5. **Import:** JSON import via `DataTracker.importData(jsonString)`
6. **Clear:** Full reset via `DataTracker.clearAllData()`

---

## Performance Trend Calculation

Trend is calculated by comparing recent 3 sessions with previous 3 sessions:
- **Improving:** Recent average > Previous average + 5%
- **Declining:** Recent average < Previous average - 5%
- **Stable:** Within 5% of previous average

---

## Exercise Type Constants

```javascript
EXERCISE_TYPES: {
  DIGIT_SPAN: "digit_span",
  DUAL_N_BACK: "dual_n_back",
  UFOV_BASIC: "ufov_basic",
  UFOV_COMPLEX: "ufov_complex",
  STROOP: "stroop",
  TASK_SWITCHING: "task_switching",
  VISUAL_SEARCH: "visual_search",
  WORD_PAIR: "word_pair",
  COMPLEX_DUAL_TASK: "complex_dual_task"
}
```

---

## Cognitive Domain Constants

```javascript
COGNITIVE_DOMAINS: {
  WORKING_MEMORY: "working_memory",
  PROCESSING_SPEED: "processing_speed",
  ATTENTION: "attention",
  EXECUTIVE_FUNCTION: "executive_function",
  EPISODIC_MEMORY: "episodic_memory"
}
```
