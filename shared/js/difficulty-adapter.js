/**
 * DIFFICULTY ADAPTER
 * Manages adaptive difficulty algorithms for all exercises
 * Keeps performance in target range (75-85% accuracy)
 */

class DifficultyAdapter {
  constructor() {
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;
    this.currentDifficulty = null;
    this.minDifficulty = null;
    this.maxDifficulty = null;
    this.history = [];
  }

  /**
   * Initialize difficulty adapter with configuration
   * @param {Object} config - Configuration object
   * @param {number} config.initial - Initial difficulty level
   * @param {number} config.min - Minimum difficulty level
   * @param {number} config.max - Maximum difficulty level
   */
  initialize(config) {
    this.currentDifficulty = config.initial;
    this.minDifficulty = config.min;
    this.maxDifficulty = config.max;
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;
    this.history = [];

    return this.currentDifficulty;
  }

  /**
   * Process trial result and adjust difficulty
   * @param {boolean} correct - Whether the trial was correct
   * @param {Object} options - Additional options
   * @param {number} options.correctThreshold - Number of correct answers to increase difficulty
   * @param {number} options.incorrectThreshold - Number of incorrect answers to decrease difficulty
   * @param {number} options.step - How much to adjust difficulty
   * @returns {Object} Adjustment result
   */
  processResult(correct, options = {}) {
    const correctThreshold = options.correctThreshold || CONSTANTS.ADAPTIVE.CONSECUTIVE_CORRECT_TO_INCREASE;
    const incorrectThreshold = options.incorrectThreshold || CONSTANTS.ADAPTIVE.CONSECUTIVE_INCORRECT_TO_DECREASE;
    const step = options.step || 1;

    let adjusted = false;
    let previousDifficulty = this.currentDifficulty;

    // Update consecutive counters
    if (correct) {
      this.consecutiveCorrect++;
      this.consecutiveIncorrect = 0;

      // Check if should increase difficulty
      if (this.consecutiveCorrect >= correctThreshold) {
        if (this.currentDifficulty < this.maxDifficulty) {
          this.currentDifficulty = Math.min(
            this.maxDifficulty,
            this.currentDifficulty + step
          );
          adjusted = true;
        }
        this.consecutiveCorrect = 0; // Reset counter
      }
    } else {
      this.consecutiveIncorrect++;
      this.consecutiveCorrect = 0;

      // Check if should decrease difficulty
      if (this.consecutiveIncorrect >= incorrectThreshold) {
        if (this.currentDifficulty > this.minDifficulty) {
          this.currentDifficulty = Math.max(
            this.minDifficulty,
            this.currentDifficulty - step
          );
          adjusted = true;
        }
        this.consecutiveIncorrect = 0; // Reset counter
      }
    }

    // Record in history
    this.history.push({
      correct,
      difficulty: previousDifficulty,
      adjustedTo: adjusted ? this.currentDifficulty : null,
    });

    return {
      currentDifficulty: this.currentDifficulty,
      adjusted,
      previousDifficulty,
      consecutiveCorrect: this.consecutiveCorrect,
      consecutiveIncorrect: this.consecutiveIncorrect,
    };
  }

  /**
   * Get current difficulty level
   * @returns {number}
   */
  getCurrentDifficulty() {
    return this.currentDifficulty;
  }

  /**
   * Set difficulty level manually
   * @param {number} difficulty - New difficulty level
   */
  setDifficulty(difficulty) {
    this.currentDifficulty = Math.max(
      this.minDifficulty,
      Math.min(this.maxDifficulty, difficulty)
    );
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;
  }

  /**
   * Calculate overall accuracy from history
   * @param {number} recentTrials - Number of recent trials to consider (0 = all)
   * @returns {number} Accuracy as decimal (0-1)
   */
  getAccuracy(recentTrials = 0) {
    if (this.history.length === 0) return 0;

    const trials = recentTrials > 0
      ? this.history.slice(-recentTrials)
      : this.history;

    const correct = trials.filter(t => t.correct).length;
    return correct / trials.length;
  }

  /**
   * Check if performance is in target range
   * @returns {Object} Performance status
   */
  checkPerformance() {
    const accuracy = this.getAccuracy();

    return {
      accuracy,
      inTargetRange: accuracy >= CONSTANTS.PERFORMANCE.TARGET_MIN &&
                     accuracy <= CONSTANTS.PERFORMANCE.TARGET_MAX,
      tooHigh: accuracy > CONSTANTS.PERFORMANCE.TARGET_MAX,
      tooLow: accuracy < CONSTANTS.PERFORMANCE.TARGET_MIN,
    };
  }

  /**
   * Get performance classification
   * @param {number} accuracy - Accuracy value (0-1)
   * @returns {string} Performance level
   */
  static classifyPerformance(accuracy) {
    if (accuracy >= CONSTANTS.PERFORMANCE.EXCELLENT) {
      return 'excellent';
    } else if (accuracy >= CONSTANTS.PERFORMANCE.GOOD) {
      return 'good';
    } else if (accuracy >= CONSTANTS.PERFORMANCE.NEEDS_IMPROVEMENT) {
      return 'needs_improvement';
    } else {
      return 'poor';
    }
  }

  /**
   * Get performance message based on accuracy
   * @param {number} accuracy - Accuracy value (0-1)
   * @returns {string} Encouraging message
   */
  static getPerformanceMessage(accuracy) {
    const level = DifficultyAdapter.classifyPerformance(accuracy);

    const messages = {
      excellent: [
        'Outstanding performance!',
        'You\'re doing exceptionally well!',
        'Excellent work!',
        'You\'re mastering this!',
      ],
      good: [
        'Great job!',
        'You\'re doing well!',
        'Good work!',
        'Keep it up!',
      ],
      needs_improvement: [
        'Keep practicing!',
        'You\'re getting there!',
        'Good effort!',
        'Keep trying!',
      ],
      poor: [
        'Don\'t give up!',
        'Every attempt helps you improve!',
        'Keep working at it!',
        'Practice makes progress!',
      ],
    };

    const messageList = messages[level];
    return messageList[Math.floor(Math.random() * messageList.length)];
  }

  /**
   * Reset adapter state
   */
  reset() {
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;
    this.history = [];
  }

  /**
   * Get difficulty history
   * @returns {Array} History of difficulty adjustments
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Get statistics about difficulty progression
   * @returns {Object} Statistics
   */
  getStats() {
    if (this.history.length === 0) {
      return {
        totalTrials: 0,
        accuracy: 0,
        adjustments: 0,
        currentDifficulty: this.currentDifficulty,
      };
    }

    const adjustments = this.history.filter(h => h.adjustedTo !== null).length;
    const accuracy = this.getAccuracy();

    return {
      totalTrials: this.history.length,
      accuracy,
      adjustments,
      currentDifficulty: this.currentDifficulty,
      initialDifficulty: this.history[0].difficulty,
      maxDifficultyReached: Math.max(...this.history.map(h => h.difficulty)),
    };
  }
}

/**
 * SPECIFIC ADAPTERS FOR EACH EXERCISE TYPE
 */

/**
 * Digit Span Difficulty Adapter
 */
class DigitSpanAdapter extends DifficultyAdapter {
  constructor() {
    super();
    this.initialize({
      initial: CONSTANTS.DIGIT_SPAN.START_LENGTH,
      min: CONSTANTS.DIGIT_SPAN.MIN_LENGTH,
      max: CONSTANTS.DIGIT_SPAN.MAX_LENGTH,
    });
  }

  /**
   * Get maximum span achieved
   * @returns {number}
   */
  getMaxSpan() {
    if (this.history.length === 0) return this.currentDifficulty;
    return Math.max(...this.history.map(h => h.difficulty));
  }
}

/**
 * Dual N-Back Difficulty Adapter
 */
class DualNBackAdapter extends DifficultyAdapter {
  constructor() {
    super();
    this.initialize({
      initial: CONSTANTS.DUAL_N_BACK.START_N,
      min: CONSTANTS.DUAL_N_BACK.MIN_N,
      max: CONSTANTS.DUAL_N_BACK.MAX_N,
    });
  }

  /**
   * Process block results for N-back
   * @param {number} accuracy - Block accuracy (0-1)
   * @returns {Object} Adjustment result
   */
  processBlock(accuracy) {
    let adjusted = false;
    const previousDifficulty = this.currentDifficulty;

    // Adjust based on block accuracy
    if (accuracy >= 0.90 && this.currentDifficulty < this.maxDifficulty) {
      this.currentDifficulty++;
      adjusted = true;
    } else if (accuracy < 0.70 && this.currentDifficulty > this.minDifficulty) {
      this.currentDifficulty--;
      adjusted = true;
    }

    return {
      currentDifficulty: this.currentDifficulty,
      adjusted,
      previousDifficulty,
    };
  }

  /**
   * Get maximum N-back level achieved
   * @returns {number}
   */
  getMaxNBack() {
    return Math.max(this.currentDifficulty, ...this.history.map(h => h.difficulty));
  }
}

/**
 * UFOV Difficulty Adapter
 * Adjusts stimulus presentation duration
 * INVERTED LOGIC: Lower duration = harder (faster presentation)
 */
class UFOVAdapter extends DifficultyAdapter {
  constructor(variant = 'basic') {
    super();

    const config = variant === 'basic'
      ? CONSTANTS.UFOV.BASIC
      : CONSTANTS.UFOV.COMPLEX;

    this.initialize({
      initial: config.START_DURATION,
      min: config.MIN_DURATION,
      max: config.MAX_DURATION,
    });

    this.stepSize = 50; // Always 50ms steps as per requirement
  }

  /**
   * Process result for UFOV (INVERTED: decrease duration = harder)
   * @param {boolean} correct - Whether trial was correct
   * @returns {Object} Adjustment result
   */
  processResult(correct) {
    const correctThreshold = 2; // 2 correct to make harder (decrease duration)
    const incorrectThreshold = 2; // 2 incorrect to make easier (increase duration)
    const step = this.stepSize;

    let adjusted = false;
    let previousDifficulty = this.currentDifficulty;

    // Update consecutive counters
    if (correct) {
      this.consecutiveCorrect++;
      this.consecutiveIncorrect = 0;

      // Check if should DECREASE duration (make harder)
      if (this.consecutiveCorrect >= correctThreshold) {
        // For UFOV: decrease towards minimum (harder)
        if (this.currentDifficulty > this.minDifficulty) {
          this.currentDifficulty = Math.max(
            this.minDifficulty,
            this.currentDifficulty - step  // SUBTRACT to make harder
          );
          adjusted = true;
        }
        this.consecutiveCorrect = 0; // Reset counter
      }
    } else {
      this.consecutiveIncorrect++;
      this.consecutiveCorrect = 0;

      // Check if should INCREASE duration (make easier)
      if (this.consecutiveIncorrect >= incorrectThreshold) {
        // For UFOV: increase towards maximum (easier)
        if (this.currentDifficulty < this.maxDifficulty) {
          this.currentDifficulty = Math.min(
            this.maxDifficulty,
            this.currentDifficulty + step  // ADD to make easier
          );
          adjusted = true;
        }
        this.consecutiveIncorrect = 0; // Reset counter
      }
    }

    // Record in history
    this.history.push({
      correct,
      difficulty: previousDifficulty,
      adjustedTo: adjusted ? this.currentDifficulty : null,
    });

    return {
      currentDifficulty: this.currentDifficulty,
      adjusted,
      previousDifficulty,
      consecutiveCorrect: this.consecutiveCorrect,
      consecutiveIncorrect: this.consecutiveIncorrect,
    };
  }

  /**
   * Get fastest (best) presentation time achieved
   * @returns {number} Fastest time in milliseconds
   */
  getFastestTime() {
    if (this.history.length === 0) return this.currentDifficulty;
    return Math.min(...this.history.map(h => h.difficulty));
  }

  /**
   * Get current threshold (where user maintains ~75% accuracy)
   * @returns {number} Threshold in milliseconds
   */
  getThreshold() {
    // Find the fastest time where accuracy was >= 75%
    const window = 10; // Look at 10-trial windows

    for (let i = this.history.length - window; i >= 0; i--) {
      const trials = this.history.slice(i, i + window);
      const accuracy = trials.filter(t => t.correct).length / window;

      if (accuracy >= 0.75) {
        return Math.min(...trials.map(t => t.difficulty));
      }
    }

    return this.currentDifficulty;
  }
}

/**
 * VISUAL SEARCH ADAPTER
 * Manages number of distractors (4-8) for visual search task
 */
class VisualSearchAdapter extends DifficultyAdapter {
  constructor() {
    super();

    // Number of distractors (not total items)
    this.initialize({
      initial: 4,  // Start with 4 distractors
      min: 4,      // Minimum 4 distractors
      max: 8,      // Maximum 8 distractors
    });
  }
}

// Make adapters available globally
if (typeof window !== 'undefined') {
  window.DifficultyAdapter = DifficultyAdapter;
  window.DigitSpanAdapter = DigitSpanAdapter;
  window.DualNBackAdapter = DualNBackAdapter;
  window.UFOVAdapter = UFOVAdapter;
  window.VisualSearchAdapter = VisualSearchAdapter;
}
