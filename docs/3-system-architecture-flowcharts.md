# System Architecture and Algorithm Flowcharts

## Overview

This document describes the system architecture and algorithm flowcharts for the MOCIA Cognitive Training Module. All diagrams are described textually for implementation reference.

---

## 1. System Architecture Layers

```
+--------------------------------------------------+
|                   UI LAYER                        |
|  - HTML (exercise screens, results, settings)    |
|  - CSS (design-system, components, animations)   |
|  - DOM manipulation                              |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|              EXERCISE LOGIC LAYER                |
|  - 9 Exercise Classes (one per exercise)         |
|  - Trial generation and presentation             |
|  - Response handling and validation              |
|  - Feedback display                              |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|             SHARED SERVICES LAYER                |
|  - AudioManager (TTS, haptics)                   |
|  - DataTracker (session, trial, persistence)     |
|  - DifficultyAdapter (adaptive algorithms)       |
|  - UIComponents (dynamic UI generation)          |
|  - ScreenManager (navigation)                    |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|               UTILITIES LAYER                    |
|  - Statistics (accuracy, trends, percentiles)    |
|  - Validation (input, type checking)             |
|  - Constants (configuration values)              |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|              BROWSER APIs LAYER                  |
|  - localStorage (data persistence)               |
|  - Web Speech API (text-to-speech)               |
|  - Vibration API (haptic feedback)               |
|  - Service Workers (offline capability)          |
+--------------------------------------------------+
```

---

## 2. Exercise Lifecycle Flowchart

All exercises follow a standard lifecycle pattern:

```
[Page Load]
     |
     v
+----------------+
| constructor()  |  Initialize class variables
+----------------+
     |
     v
+----------------+
|    init()      |  Async initialization
+----------------+
     |
     +---> loadConfig()         Load exercise configuration
     +---> cacheElements()      Cache DOM references
     +---> setupEventListeners() Bind event handlers
     +---> loadSettings()       Load user preferences
     |
     v
+------------------+
| startExercise()  |  Begin exercise session
+------------------+
     |
     +---> Initialize state variables
     +---> Initialize DifficultyAdapter
     +---> DataTracker.startSession()
     +---> Speak instructions (if audio enabled)
     |
     v
+----------------+
| startTrial()   |  <----------------------------------+
+----------------+                                      |
     |                                                  |
     +---> Increment trial counter                      |
     +---> Clear previous feedback                      |
     +---> Generate stimulus                            |
     +---> Display stimulus                             |
     +---> Start response timer                         |
     |                                                  |
     v                                                  |
+-------------------+                                   |
| [User Response]   |  User clicks/taps response        |
+-------------------+                                   |
     |                                                  |
     v                                                  |
+------------------+                                    |
| processResult()  |                                    |
+------------------+                                    |
     |                                                  |
     +---> Stop timer                                   |
     +---> Calculate correctness                        |
     +---> Calculate score                              |
     +---> DataTracker.recordTrial()                    |
     +---> DifficultyAdapter.processResult()            |
     +---> Show feedback                                |
     |                                                  |
     v                                                  |
+--------------------+                                  |
| More trials left?  |                                  |
+--------------------+                                  |
     |           |                                      |
    YES          NO                                     |
     |           |                                      |
     +-----------+-----> endExercise()                  |
     |                        |                         |
     +------------------------+                         |
     |                                                  |
     v                                                  |
[Continue to next trial] ----------------------------->+
```

---

## 3. Adaptive Difficulty Algorithm Flowchart

### Standard Algorithm (Digit Span, Visual Search, Complex Dual Task)

```
+-------------------+
| processResult()   |
| Input: correct    |
+-------------------+
         |
         v
+-------------------+
| correct == true?  |
+-------------------+
    |           |
   YES          NO
    |           |
    v           v
+------------+ +----------------+
| consec++   | | incorrectCons++|
| incorrect=0| | correct = 0    |
+------------+ +----------------+
    |           |
    v           v
+---------------+ +----------------+
| consec >= 2?  | | incorrect >= 2?|
+---------------+ +----------------+
    |       |         |        |
   YES      NO       YES       NO
    |       |         |        |
    v       |         v        |
+--------+  |    +---------+   |
|diff++  |  |    | diff--  |   |
|max=cap |  |    | min=cap |   |
|reset=0 |  |    | reset=0 |   |
+--------+  |    +---------+   |
    |       |         |        |
    +-------+---------+--------+
            |
            v
    +---------------+
    | Return result |
    | adjusted: T/F |
    +---------------+
```

### Inverted Algorithm (UFOV - Duration-based)

```
+-------------------+
| processResult()   |
| Input: correct    |
+-------------------+
         |
         v
+-------------------+
| correct == true?  |
+-------------------+
    |           |
   YES          NO
    |           |
    v           v
+---------------+ +-----------------+
| consec++      | | incorrectCons++ |
| incorrect = 0 | | correct = 0     |
+---------------+ +-----------------+
    |           |
    v           v
+--------------+ +----------------+
| consec >= 2? | | incorrect >= 2?|
+--------------+ +----------------+
    |       |         |        |
   YES      NO       YES       NO
    |       |         |        |
    v       |         v        |
+----------+ |    +----------+ |
| duration | |    | duration | |
| -= 50ms  | |    | += 50ms  | |
| (HARDER) | |    | (EASIER) | |
| min cap  | |    | max cap  | |
+----------+ |    +----------+ |
    |       |         |        |
    +-------+---------+--------+
            |
            v
    +---------------+
    | Return result |
    +---------------+
```

### Block-Based Algorithm (Dual N-Back)

```
+------------------+
| processBlock()   |
| Input: accuracy  |
+------------------+
         |
         v
+-------------------+
| accuracy >= 0.90? |
+-------------------+
    |           |
   YES          NO
    |           |
    v           v
+------------+ +-------------------+
| N++        | | accuracy < 0.70?  |
| max cap    | +-------------------+
+------------+     |           |
    |             YES          NO
    |              |           |
    |              v           |
    |         +--------+       |
    |         | N--    |       |
    |         | min cap|       |
    |         +--------+       |
    |              |           |
    +--------------+-----------+
            |
            v
    +---------------+
    | Return result |
    +---------------+
```

---

## 4. Data Tracking Flowchart

```
[Exercise Start]
       |
       v
+------------------------+
| DataTracker.           |
| startSession(type,cfg) |
+------------------------+
       |
       +---> Create session object
       +---> Set id, startTime, status
       +---> Store initialDifficulty
       +---> Set currentSession
       |
       v
[Each Trial Completes]
       |
       v
+------------------------+
| DataTracker.           |
| recordTrial(data)      |
+------------------------+
       |
       +---> Add trialNumber
       +---> Add timestamp
       +---> Push to session.trials[]
       |
       v
[Exercise End]
       |
       v
+------------------------+
| DataTracker.           |
| endSession(stats)      |
+------------------------+
       |
       +---> Set endTime
       +---> Set status = "completed"
       +---> Store finalStats
       +---> Calculate duration
       |
       v
+------------------------+
| Update Exercise Data   |
+------------------------+
       |
       +---> Add session to sessions[]
       +---> Increment totalSessions
       +---> Update lastPlayed
       +---> Trim to MAX_SESSIONS
       +---> Update bestPerformance
       +---> Calculate averageAccuracy
       +---> Calculate performanceTrend
       |
       v
+------------------------+
| Save to localStorage   |
+------------------------+
       |
       +---> Check quota
       +---> If exceeded: cleanup
       +---> Write JSON
```

---

## 5. Screen Navigation Flowchart

```
                    +------------+
                    | index.html |
                    | (Main Hub) |
                    +------------+
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
   +------------+  +------------+  +------------+
   | exercises. |  | results.   |  | domains.   |
   | html       |  | html       |  | html       |
   +------------+  +------------+  +------------+
          |
          v
   +--------------------+
   | Exercise Selection |
   +--------------------+
          |
   +------+------+------+------+------+------+------+------+------+
   |      |      |      |      |      |      |      |      |      |
   v      v      v      v      v      v      v      v      v      v
[digit][dual-n][ufov][ufov-c][stroop][task][visual][word][complex]
[span ][back  ][    ][omplex][      ][swch][search][pair][dual   ]
          |
          v
   +--------------------+
   | Exercise Screen    |
   | (auto-start)       |
   +--------------------+
          |
          v
   +--------------------+
   | Results Screen     |
   | (via URL params)   |
   +--------------------+
          |
          v
   +--------------------+
   | Back to exercises  |
   | or Main Hub        |
   +--------------------+
```

---

## 6. UFOV Trial Flowchart (Complex Example)

```
[startTrial()]
     |
     v
+-------------------+
| Reset responses   |
| Clear zones       |
+-------------------+
     |
     v
+-------------------+
| generateStimulus()|
+-------------------+
     |
     +---> Select random stimulus set
     +---> Select central target
     +---> Select peripheral position
     +---> Generate distractor positions
     |
     v
+-------------------+
| showFixation()    |
| (800-1000ms)      |
+-------------------+
     |
     v
+-------------------+
| showStimulus()    |
| (duration = adapt)|
+-------------------+
     |
     +---> Show central emoji
     +---> Show peripheral target
     +---> Show distractors
     +---> Wait [currentDuration]ms
     +---> Hide all stimuli
     |
     v
+-------------------+
| showCentral       |
| Response()        |
+-------------------+
     |
     v
[User selects central target]
     |
     v
+-------------------+
| handleCentral     |
| Response()        |
+-------------------+
     |
     +---> Store response
     +---> Show peripheral zones
     |
     v
[User selects peripheral position]
     |
     v
+-------------------+
| handlePeripheral  |
| Response()        |
+-------------------+
     |
     v
+-------------------+
| processTrial()    |
+-------------------+
     |
     +---> Check centralCorrect
     +---> Check peripheralCorrect
     +---> Calculate score
     +---> Record trial
     +---> Update difficulty
     +---> Show feedback
     |
     v
+-------------------+
| More trials?      |
+-------------------+
    |         |
   YES        NO
    |         |
    v         v
[next]   [endExercise]
```

---

## 7. Word Pair State Machine

```
+------------+
| ENCODING   | <---- [New Session / Continue]
+------------+
     |
     | User clicks "I've remembered"
     v
+------------+
| LOCKED     | ---- [Timer countdown]
+------------+
     |
     | Timer expires
     v
+------------+
| RECALL     |
+------------+
     |
     | User submits answers
     v
+------------+
| RESULTS    |
+------------+
     |
     +---> If perfect: numPairs++, delay+30min
     +---> If imperfect: numPairs--, delay-20min
     |
     | User clicks "Continue"
     v
[Return to ENCODING with new params]
```

---

## 8. Audio Manager Flowchart

```
[speak(text, options)]
         |
         v
+-------------------+
| isEnabled()?      |
+-------------------+
    |         |
   YES        NO
    |         |
    v         v
    |     [Return]
    v
+-------------------+
| Create utterance  |
+-------------------+
     |
     +---> Set text
     +---> Set lang = 'nl-NL'
     +---> Set rate = 0.9
     +---> Set pitch = 1.0
     +---> Set volume = 1.0
     |
     v
+-------------------+
| Find Dutch voice  |
+-------------------+
     |
     +---> Filter voices by lang
     +---> Prefer female voice
     +---> Fallback to default
     |
     v
+-------------------+
| Queue utterance   |
+-------------------+
     |
     v
+-------------------+
| Return Promise    |
| (resolves on end) |
+-------------------+
```

---

## 9. Service Worker Caching Strategy

```
[Install Event]
     |
     v
+-------------------+
| Open cache        |
| "mocia-v1"        |
+-------------------+
     |
     +---> Cache shell files
     |     - index.html
     |     - manifest.json
     |     - CSS files
     |     - JS files
     |     - Exercise HTML
     |
     v
[Fetch Event]
     |
     v
+-------------------+
| Request matches   |
| cached resource?  |
+-------------------+
    |         |
   YES        NO
    |         |
    v         v
+--------+ +------------------+
| Return | | Fetch from       |
| cache  | | network          |
+--------+ +------------------+
               |
               v
          +-------------+
          | Cache       |
          | response    |
          +-------------+
               |
               v
          +-------------+
          | Return      |
          | response    |
          +-------------+
```

---

## 10. Component Interaction Diagram

```
+---------------+     +----------------+     +------------------+
| Exercise      |---->| Difficulty     |---->| processResult()  |
| Class         |     | Adapter        |     | returns adjusted |
+---------------+     +----------------+     +------------------+
       |                     ^
       |                     |
       v                     |
+---------------+            |
| DataTracker   |------------+
+---------------+       recordTrial() includes
       |                difficulty level
       v
+---------------+
| localStorage  |
+---------------+

+---------------+     +----------------+
| Exercise      |---->| AudioManager   |
| Class         |     +----------------+
+---------------+            |
       |                     v
       |              [Web Speech API]
       |              [Vibration API]
       v
+---------------+
| UIComponents  |
+---------------+
       |
       v
[Dynamic DOM]
```

---

## 11. Error Handling Flow

```
[Any Operation]
       |
       v
+-------------------+
| try { ... }       |
+-------------------+
       |
       | Exception thrown
       v
+-------------------+
| catch (error)     |
+-------------------+
       |
       +---> console.error()
       +---> If critical: alert()
       +---> If quota: cleanup()
       +---> If speech: fallback
       |
       v
+-------------------+
| Graceful continue |
| or user message   |
+-------------------+
```

---

## 12. Results Page Data Flow

```
[Exercise Complete]
       |
       v
+-------------------+
| Build URL params  |
+-------------------+
       |
       +---> exercise: path
       +---> name: exercise name
       +---> score: final score
       +---> stats: JSON.stringify(stats)
       |
       v
+-------------------+
| window.location   |
| href = results    |
+-------------------+
       |
       v
[results.html loads]
       |
       v
+-------------------+
| Parse URL params  |
+-------------------+
       |
       v
+-------------------+
| Display results   |
| - Score           |
| - Accuracy        |
| - Time            |
| - Specific stats  |
+-------------------+
       |
       v
+-------------------+
| Show actions:     |
| - Try Again       |
| - Back to Menu    |
+-------------------+
```
