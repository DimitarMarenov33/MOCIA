# Algorithm Specifications for Cognitive Training Exercises

## Overview

This document details the algorithm specifications for each cognitive training exercise in the MOCIA Cognitive Training Module. All exercises are designed for Dutch older adults (60+) and implement adaptive difficulty algorithms.

---

## 1. Digit Span (Reeks Onthouden)

**Cognitive Domain:** Working Memory
**Difficulty Level:** Easy

### Core Algorithm
- User memorizes and recalls sequences of digits, phone numbers, postcodes, or dates
- Sequences are displayed one character at a time with audio

### Timing Parameters
| Parameter | Starting Value | Minimum | Maximum |
|-----------|---------------|---------|---------|
| Sequence Length | 3 characters | 3 | 9 |
| Digit Display Time | 1000ms | - | - |
| Inter-Digit Interval | 800ms | - | - |
| Feedback Duration | 2000ms | - | - |

### Adaptive Difficulty
- **Increase difficulty:** After 2 consecutive correct answers, sequence length +1
- **Decrease difficulty:** After 2 consecutive incorrect answers, sequence length -1
- **Step size:** 1 character per adjustment

### Sequence Types
1. **Phone Numbers:** Dutch prefixes (06, +31, +32, +49, +33, +44, +359)
2. **Postcodes:** Dutch format (4 digits + 2 letters, e.g., 1234 AB)
3. **Dates:** DD-MM-YY format, optionally with HH:MM time

### Scoring
- Points per digit: 10
- Bonus for perfect: 50

### Trial Structure
- Total trials: 10
- Each trial: Show sequence -> User types response -> Check correctness -> Feedback

---

## 2. Dual N-Back

**Cognitive Domain:** Working Memory
**Difficulty Level:** Hard

### Core Algorithm
- Simultaneous visual-spatial and auditory working memory task
- User identifies if current position/letter matches N steps back

### Timing Parameters
| Parameter | Starting Value | Minimum | Maximum |
|-----------|---------------|---------|---------|
| N-Level | 2 | 1 | 9 |
| Stimulus Duration | 1000ms | - | - |
| Inter-Stimulus Interval | 4000ms | - | - |
| Match Probability | 30% | - | - |

### Block Structure
- Trials per block: 25
- Blocks per session: 3
- First N trials in each block are "warmup" (not scored)

### Adaptive Difficulty
- **Increase N:** When block accuracy >= 90%
- **Decrease N:** When block accuracy < 70%
- Adjustment happens after each block completes

### Letter Set
Available letters: A, B, C, D, E, F, G, H, K, L, M, N, P, R, S, T

### Position Grid
- 3x3 grid (9 positions)
- Position highlighted with blue square

### Scoring
- Points per correct response: 10
- Points per block: 50
- Bonus for high N: 100

---

## 3. UFOV Basic (Snelle Herkenning)

**Cognitive Domain:** Processing Speed
**Difficulty Level:** Medium

### Core Algorithm
- Brief stimulus presentation with central and peripheral targets
- User identifies: (1) What was in the center, (2) Where was the peripheral target

### Timing Parameters
| Parameter | Starting Value | Minimum | Maximum |
|-----------|---------------|---------|---------|
| Presentation Duration | 500ms | 100ms | 500ms |
| Fixation Time | 1000ms | - | - |
| Duration Step Size | 50ms | - | - |

### Adaptive Difficulty (INVERTED)
- **Make harder (decrease duration):** After 2 consecutive BOTH correct
- **Make easier (increase duration):** After 2 consecutive ANY incorrect
- Lower duration = faster presentation = harder

### Stimulus Sets
1. **Vehicles:** Car vs Bicycle (central), Car (peripheral)
2. **Traffic:** Stop vs Warning (central), Stop sign (peripheral)

### Peripheral Layout
- 8 positions arranged in circle around center
- 4 distractors (geometric shapes)

### Scoring
- Both correct: 20 points
- Central only correct: 10 points
- Peripheral only correct: 10 points

### Trial Structure
- Total trials: 15
- Phase 1: Fixation cross
- Phase 2: Brief stimulus display
- Phase 3: Central response
- Phase 4: Peripheral response

---

## 4. UFOV Complex

**Cognitive Domain:** Processing Speed
**Difficulty Level:** Hard

### Core Algorithm
- Same as UFOV Basic but with more distractors and faster presentation

### Timing Parameters
| Parameter | Starting Value | Minimum | Maximum |
|-----------|---------------|---------|---------|
| Presentation Duration | 100ms | 16ms | 100ms |
| Fixation Time | 800ms | - | - |
| Duration Step Size | 50ms | - | - |

### Distractors
- Minimum distractors: 8
- Maximum distractors: 12
- Distractor types: Geometric shapes

### Scoring
- Both correct: 30 points
- Central only correct: 15 points
- Peripheral only correct: 15 points
- Speed bonus (< 1 second): 10 points

### Trial Structure
- Total trials: 20

---

## 5. Stroop Task (Stroop Taak)

**Cognitive Domain:** Executive Function / Inhibition Control
**Difficulty Level:** Easy

### Core Algorithm
- User sees visual stimulus (emoji/text) while hearing spoken word
- Must respond to what they SEE, not what they HEAR

### Timing Parameters
| Parameter | Starting Value | Minimum | Maximum |
|-----------|---------------|---------|---------|
| Time Limit | 3000ms | 1000ms | 5000ms |
| Time Adjustment | 200ms | - | - |

### Stimulus Sets
1. **Buildings (emoji):** School, Ziekenhuis, Hotel, Kerk, Bank, Fabriek, Kantoor
2. **Days (text):** Maandag through Zondag

### Condition Distribution
- Congruent trials: 30% (visual = spoken)
- Incongruent trials: 70% (visual != spoken)

### Adaptive Timing
- **Decrease time limit:** After 2 consecutive correct (-200ms)
- **Increase time limit:** After 2 consecutive incorrect (+200ms)

### Scoring
- Correct: 10 points
- Speed bonus (< 1500ms): 5 points

### Trial Structure
- Total trials: 30

---

## 6. Task Switching (Taak-Wissel)

**Cognitive Domain:** Executive Function / Cognitive Flexibility
**Difficulty Level:** Hard

### Core Algorithm
- User switches between two tasks based on cue
- TIME task: Is time before/after 12:00?
- DAY task: Is it a weekday/weekend?

### Timing Parameters
| Parameter | Starting Value | Minimum | Maximum |
|-----------|---------------|---------|---------|
| Cue-Target Interval (CTI) | 800ms | 150ms | 1000ms |
| CTI Adjustment | 100ms | - | - |
| Response Time Limit | 3000ms | - | - |

### Block Structure
- Block 1: TIME task only (10 trials)
- Block 2: DAY_TYPE task only (10 trials)
- Block 3: Mixed tasks (30 trials, random)
- Total trials: 50

### Adaptive CTI (Mixed Block Only)
- **Decrease CTI:** After 2 consecutive correct (-100ms, less prep time)
- **Increase CTI:** After 2 consecutive incorrect (+100ms, more prep time)

### Switch Cost Calculation
- Switch cost = Average RT on switch trials - Average RT on repeat trials
- Positive value = slower on switches (expected)

### Scoring
- Correct: 10 points
- Switch trial bonus: 5 points
- Speed bonus (< 800ms): 3 points

---

## 7. Visual Search (Visuele Zoektaak)

**Cognitive Domain:** Attention
**Difficulty Level:** Medium

### Core Algorithm
- Target animal emoji is shown, then user finds it in a grid of distractors

### Timing Parameters
| Parameter | Starting Value | Minimum | Maximum |
|-----------|---------------|---------|---------|
| Grid Size | 3x3 | 3x3 | 7x7 |
| Time Limit | 3000ms | 2000ms | 4000ms |
| Target Preview | 2000ms | - | - |

### Animal Set
Available animals: Dog, Cat, Mouse, Hamster, Rabbit, Fox, Bear, Panda, Koala, Tiger, Lion, Cow

### Adaptive Grid Size
- **Increase grid:** After 2 consecutive correct (+1 row/col)
- Maximum: 7x7 (49 items)

### Scoring
- Correct: 10 points
- Speed bonus (< 1500ms): 5 points

### Trial Structure
- Total trials: 20
- Phase 1: Show target for 2 seconds
- Phase 2: Display grid with timer
- Phase 3: User taps target

---

## 8. Word Pair Association (Woord Paar Associatie)

**Cognitive Domain:** Episodic Memory
**Difficulty Level:** Medium

### Core Algorithm
- User memorizes word pairs, waits a delay, then recalls them from memory
- Unique delayed recall paradigm with real-time locking

### Timing Parameters
| Parameter | Starting Value | Minimum | Maximum |
|-----------|---------------|---------|---------|
| Number of Pair Sets | 1 (3 pairs) | 1 | 10 |
| Delay Time | 20 minutes | 10 minutes | 480 minutes (8 hours) |

### Word Pair Types
Each "set" contains 3 pairs of different types:
1. **Name-City:** Personal name + Dutch city
2. **Building-Time:** Building type + time (e.g., "Bibliotheek - 14:30")
3. **Activity-Day:** Activity + day of week

### Exercise Flow
1. **ENCODING:** Show N word pairs, user clicks "I've remembered"
2. **LOCKED:** Exercise locked for X minutes (countdown timer)
3. **RECALL:** User types in word pairs from memory
4. **RESULTS:** Check accuracy, adjust difficulty

### Adaptive Difficulty
- **Perfect recall:** +1 pair set, +30 minutes delay
- **Any mistake:** -1 pair set (min 1), -20 minutes delay (min 10)

### State Persistence
- State saved to localStorage
- Survives page refresh and browser close
- Lock timer continues even when app is closed

---

## 9. Complex Dual Task (Complexe Dubbeltaak)

**Cognitive Domain:** Divided Attention / Working Memory
**Difficulty Level:** Hard

### Core Algorithm
- Combined 2-sequence memory + visual search task
- User memorizes 2 emojis, then finds them in order in a grid

### Timing Parameters
| Parameter | Starting Value | Minimum | Maximum |
|-----------|---------------|---------|---------|
| Grid Size | 3x3 | 3x3 | 7x7 |
| Sequence Preview | 3000ms | - | - |
| Time Per Search Step | 2000ms | - | - |

### Emoji Set
13 face emojis used for targets and distractors

### Trial Structure
1. Show 2-emoji sequence for 3 seconds
2. User searches for emoji #1 in grid (2 sec limit)
3. User searches for emoji #2 in new grid (2 sec limit)
4. Both must be correct for trial success

### Adaptive Grid Size
- **Increase grid:** After 2 consecutive fully correct trials (+1 row/col)

### Scoring
- Points per correct step: 15
- Full sequence bonus: 20
- Speed bonus (< 1000ms): 5

### Trial Structure
- Total trials: 20

---

## Global Adaptive Algorithm Constants

```
ADAPTIVE:
  CONSECUTIVE_CORRECT_TO_INCREASE: 2
  CONSECUTIVE_INCORRECT_TO_DECREASE: 2

PERFORMANCE:
  TARGET_MIN: 0.75 (75%)
  TARGET_MAX: 0.85 (85%)
  EXCELLENT: 0.90 (90%)
  GOOD: 0.75 (75%)
  NEEDS_IMPROVEMENT: 0.50 (50%)
```

---

## Accessibility Considerations

All exercises implement:
- WCAG AAA compliance (7:1 contrast ratio)
- 48px+ touch targets
- Large text mode support
- High contrast mode support
- Dutch text-to-speech with 0.9x rate (slower for seniors)
- Haptic feedback for non-visual confirmation
- Keyboard navigation support
