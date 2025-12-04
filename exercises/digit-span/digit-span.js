/**
 * DIGIT SPAN FORWARD EXERCISE
 * Working memory training through digit sequence recall
 */

class DigitSpanExercise {
  constructor() {
    this.config = null;
    this.isPractice = false;
    this.practiceTrialsRemaining = 0;

    // Exercise state
    this.currentTrial = 0;
    this.totalTrials = 0;
    this.currentSequence = [];
    this.userSequence = [];
    this.score = 0;
    this.isShowingSequence = false; // Flag to block input during sequence display

    // Difficulty adapter
    this.difficultyAdapter = new DigitSpanAdapter();

    // Timing
    this.trialStartTime = null;

    // DOM elements
    this.screens = {
      welcome: null,
      exercise: null,
      results: null,
    };

    this.init();
  }

  async init() {
    try {
      // Load configuration
      await this.loadConfig();

      // Cache DOM elements
      this.cacheElements();

      // Set up event listeners
      this.setupEventListeners();

      // Load settings (audio, text size, etc.)
      this.loadSettings();

      // Auto-start exercise immediately (no welcome screen)
      this.startExercise();
    } catch (error) {
      console.error('Initialization error:', error);
      alert('Er is een fout opgetreden bij het laden van de oefening.');
    }
  }

  async loadConfig() {
    // Embedded configuration (no external file needed)
    this.config = {
      exerciseId: CONSTANTS.EXERCISE_TYPES.DIGIT_SPAN,
      exerciseName: 'Cijferreeks Onthouden',
      difficulty: 'easy',
      parameters: {
        startLength: 2,
        minLength: 2,
        maxLength: 9,
        totalTrials: 10,
        digitDisplayTime: 1000,
        interDigitInterval: 800,
        feedbackDuration: 2000,
      },
      scoring: {
        pointsPerDigit: 10,
        bonusForPerfect: 50,
      },
      feedback: {
        correct: ['Correct!', 'Goed gedaan!', 'Uitstekend!', 'Perfect!'],
        incorrect: ['Niet helemaal', 'Probeer het nog eens!', 'Bijna goed!', 'Blijf oefenen!'],
      },
    };
  }

  cacheElements() {
    // Screens
    this.screens.exercise = document.getElementById('exercise-screen');

    // Exercise screen elements
    this.elements = {
      sequenceDisplay: document.getElementById('sequence-display'),
      inputArea: document.getElementById('input-area'),
      userSequence: document.getElementById('user-sequence'),
      numberPadContainer: document.getElementById('number-pad-container'),
      feedbackArea: document.getElementById('feedback-area'),
      clearBtn: document.getElementById('clear-btn'),
      submitBtn: document.getElementById('submit-btn'),
    };
  }

  setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
      this.confirmExit();
    });

    // Input controls
    this.elements.clearBtn.addEventListener('click', () => {
      this.clearInput();
    });

    this.elements.submitBtn.addEventListener('click', () => {
      this.submitResponse();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (this.screens.exercise.classList.contains('hidden')) return;
      if (this.isShowingSequence) return; // Block input while sequence is being shown

      // Number keys (0-9)
      if (e.key >= '0' && e.key <= '9') {
        this.addDigit(parseInt(e.key));
      }
      // Backspace
      else if (e.key === 'Backspace') {
        e.preventDefault();
        this.removeLastDigit();
      }
      // Enter
      else if (e.key === 'Enter' && !this.elements.submitBtn.disabled) {
        this.submitResponse();
      }
    });
  }

  loadSettings() {
    try {
      const settings = localStorage.getItem(CONSTANTS.STORAGE_KEYS.APP_SETTINGS);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.largeText) {
          document.body.classList.add('large-text');
        }
        if (parsed.highContrast) {
          document.body.classList.add('high-contrast');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // ===== EXERCISE FLOW =====

  startPractice() {
    this.isPractice = true;
    this.practiceTrialsRemaining = 2;
    this.totalTrials = 2;
    this.startExercise();
  }

  async startExercise() {
    // Show exercise screen
    this.screens.exercise.classList.remove('hidden');

    // Initialize exercise state
    if (!this.isPractice) {
      this.totalTrials = this.config.parameters.totalTrials || CONSTANTS.DIGIT_SPAN.DEFAULT_TRIALS;
    }

    this.currentTrial = 0;
    this.score = 0;

    // Initialize difficulty adapter
    this.difficultyAdapter.initialize({
      initial: this.config.parameters.startLength || CONSTANTS.DIGIT_SPAN.START_LENGTH,
      min: this.config.parameters.minLength || CONSTANTS.DIGIT_SPAN.MIN_LENGTH,
      max: this.config.parameters.maxLength || CONSTANTS.DIGIT_SPAN.MAX_LENGTH,
    });

    // Start data tracking session
    if (!this.isPractice) {
      window.DataTracker.startSession(this.config.exerciseId, {
        initialDifficulty: this.difficultyAdapter.getCurrentDifficulty(),
      });
    }

    // Create number pad
    this.createNumberPad();

    // Speak instructions
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      await window.AudioManager.speak('We gaan beginnen. Let goed op de cijfers.');
    }

    // Start first trial
    setTimeout(() => {
      this.startTrial();
    }, 1000);
  }

  async startTrial() {
    this.currentTrial++;
    this.trialStartTime = Date.now();

    // Hide input area from previous trial to prevent cognitive load
    this.elements.inputArea.classList.add('hidden');

    // Clear previous user input display
    UIComponents.clearElement(this.elements.userSequence);

    // Generate sequence
    const sequenceLength = this.difficultyAdapter.getCurrentDifficulty();
    this.currentSequence = this.generateSequence(sequenceLength);
    this.userSequence = [];

    // Clear previous feedback
    UIComponents.clearElement(this.elements.feedbackArea);

    // Show "Ready" message
    await this.showReadyMessage();

    // Present sequence
    await this.presentSequence();

    // Show input area
    this.showInputArea();
  }

  generateSequence(length) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(Math.random() * 10));
    }
    return sequence;
  }

  async showReadyMessage() {
    UIComponents.clearElement(this.elements.sequenceDisplay);

    const message = document.createElement('div');
    message.className = 'ready-message';
    message.textContent = 'Klaar?';
    this.elements.sequenceDisplay.appendChild(message);

    if (window.AudioManager) {
      await window.AudioManager.speak('Klaar');
    }

    await this.sleep(1000);
  }

  async presentSequence() {
    // Block input while showing sequence
    this.isShowingSequence = true;

    UIComponents.clearElement(this.elements.sequenceDisplay);

    const displayTime = this.config.parameters.digitDisplayTime || CONSTANTS.DIGIT_SPAN.DIGIT_DISPLAY_TIME;
    const interDigitInterval = this.config.parameters.interDigitInterval || CONSTANTS.DIGIT_SPAN.INTER_DIGIT_INTERVAL;

    for (let i = 0; i < this.currentSequence.length; i++) {
      const digit = this.currentSequence[i];

      // Create digit display
      const digitEl = document.createElement('div');
      digitEl.className = 'digit-display';
      digitEl.textContent = digit;

      UIComponents.clearElement(this.elements.sequenceDisplay);
      this.elements.sequenceDisplay.appendChild(digitEl);

      // Speak digit (slower and clearer for numbers)
      if (window.AudioManager) {
        window.AudioManager.speak(digit.toString(), { rate: 0.8 });
      }

      // Display digit for specified time
      await this.sleep(displayTime);

      // Clear digit
      UIComponents.clearElement(this.elements.sequenceDisplay);

      // Inter-digit interval (except after last digit)
      if (i < this.currentSequence.length - 1) {
        await this.sleep(interDigitInterval);
      }
    }
  }

  showInputArea() {
    // Allow input now that sequence is done
    this.isShowingSequence = false;

    // Show "Your Turn" message
    UIComponents.clearElement(this.elements.sequenceDisplay);

    const message = document.createElement('div');
    message.className = 'your-turn-message';
    message.textContent = 'Uw beurt!';
    this.elements.sequenceDisplay.appendChild(message);

    if (window.AudioManager) {
      window.AudioManager.speak('Uw beurt. Tik de cijfers in');
    }

    // Show input area
    this.elements.inputArea.classList.remove('hidden');

    // Clear user sequence display
    UIComponents.clearElement(this.elements.userSequence);

    // Enable submit button (initially disabled until digits entered)
    this.elements.submitBtn.disabled = true;
  }

  createNumberPad() {
    const numberPad = UIComponents.createNumberPad((digit) => {
      this.addDigit(digit);
    });

    UIComponents.clearElement(this.elements.numberPadContainer);
    this.elements.numberPadContainer.appendChild(numberPad);
  }

  addDigit(digit) {
    // Block input while sequence is being shown
    if (this.isShowingSequence) return;

    // Don't allow more digits than the sequence length
    if (this.userSequence.length >= this.currentSequence.length) {
      if (window.AudioManager) {
        window.AudioManager.hapticError();
      }
      return;
    }

    this.userSequence.push(digit);
    this.updateUserSequenceDisplay();

    // Enable submit button when sequence is complete
    if (this.userSequence.length === this.currentSequence.length) {
      this.elements.submitBtn.disabled = false;
    }

    // Haptic feedback
    if (window.AudioManager) {
      window.AudioManager.hapticPress();
    }
  }

  removeLastDigit() {
    if (this.userSequence.length > 0) {
      this.userSequence.pop();
      this.updateUserSequenceDisplay();

      // Disable submit button if sequence incomplete
      this.elements.submitBtn.disabled = this.userSequence.length !== this.currentSequence.length;

      if (window.AudioManager) {
        window.AudioManager.hapticPress();
      }
    }
  }

  clearInput() {
    this.userSequence = [];
    this.updateUserSequenceDisplay();
    this.elements.submitBtn.disabled = true;

    if (window.AudioManager) {
      window.AudioManager.hapticPress();
      window.AudioManager.speak('Gewist');
    }
  }

  updateUserSequenceDisplay() {
    UIComponents.clearElement(this.elements.userSequence);

    if (this.userSequence.length === 0) {
      this.elements.userSequence.textContent = '_';
      return;
    }

    this.userSequence.forEach(digit => {
      const span = document.createElement('span');
      span.className = 'digit-entered';
      span.textContent = digit;
      this.elements.userSequence.appendChild(span);
    });
  }

  async submitResponse() {
    // Disable input
    this.elements.submitBtn.disabled = true;
    this.elements.clearBtn.disabled = true;
    this.elements.inputArea.classList.add('input-disabled');

    // Calculate response time
    const responseTime = Date.now() - this.trialStartTime;

    // Check correctness
    const correct = this.checkResponse();

    // Calculate score for this trial
    const trialScore = correct ? this.currentSequence.length * (this.config.scoring.pointsPerDigit || 10) : 0;
    this.score += trialScore;

    // Record trial data
    if (!this.isPractice) {
      window.DataTracker.recordTrial({
        difficulty: this.currentSequence.length,
        correctSequence: this.currentSequence,
        userResponse: this.userSequence,
        correct: correct,
        responseTime: responseTime,
        score: trialScore,
      });
    }

    // Update difficulty
    const difficultyResult = this.difficultyAdapter.processResult(correct);

    // Show feedback
    await this.showFeedback(correct, difficultyResult.adjusted);

    // Check if exercise is complete
    if (this.currentTrial >= this.totalTrials) {
      await this.sleep(500);
      this.endExercise();
    } else {
      // Continue to next trial
      this.elements.inputArea.classList.add('hidden');
      this.elements.clearBtn.disabled = false;
      this.elements.inputArea.classList.remove('input-disabled');

      await this.sleep(1000);
      this.startTrial();
    }
  }

  checkResponse() {
    if (this.userSequence.length !== this.currentSequence.length) {
      return false;
    }

    for (let i = 0; i < this.currentSequence.length; i++) {
      if (this.userSequence[i] !== this.currentSequence[i]) {
        return false;
      }
    }

    return true;
  }

  async showFeedback(correct, difficultyAdjusted) {
    UIComponents.clearElement(this.elements.sequenceDisplay);
    UIComponents.clearElement(this.elements.feedbackArea);

    const feedbackMessages = correct ? this.config.feedback?.correct : this.config.feedback?.incorrect;
    const message = feedbackMessages
      ? feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
      : (correct ? 'Correct!' : 'Niet helemaal');

    let detailMessage = '';
    if (!correct) {
      detailMessage = `De juiste reeks was: ${this.currentSequence.join(' ')}`;
    } else if (difficultyAdjusted) {
      detailMessage = 'De oefening wordt moeilijker!';
    }

    const feedbackPanel = UIComponents.createFeedbackPanel(
      message,
      correct ? 'success' : 'error',
      { detail: detailMessage }
    );

    this.elements.feedbackArea.appendChild(feedbackPanel);

    // Audio feedback
    if (window.AudioManager) {
      if (correct) {
        window.AudioManager.hapticSuccess();
      } else {
        window.AudioManager.hapticError();
      }

      await window.AudioManager.speak(message);

      if (detailMessage) {
        await this.sleep(500);
        await window.AudioManager.speak(detailMessage);
      }
    }

    await this.sleep(this.config.parameters.feedbackDuration || CONSTANTS.TIMING.FEEDBACK_DISPLAY);
  }

  // Removed - no longer showing progress bar in simplified UI
  // updateProgressBar() {
  //   ...
  // }

  // Removed - no longer showing current stats in simplified UI
  // updateCurrentStats() {
  //   ...
  // }

  async endExercise() {
    // Calculate final statistics
    const finalStats = this.difficultyAdapter.getStats();
    finalStats.score = this.score;
    finalStats.maxSpan = this.difficultyAdapter.getMaxSpan();

    // End session and save data
    if (!this.isPractice) {
      window.DataTracker.endSession(finalStats);
    }

    // Show results screen
    this.showResults(finalStats);
  }

  showResults(stats) {
    // Navigate to results page with stats as URL parameters
    const params = new URLSearchParams({
      exercise: 'exercises/digit-span/index.html',
      name: this.config.exerciseName,
      score: this.score,
      stats: JSON.stringify({
        totalTrials: stats.totalTrials,
        correctTrials: stats.correctTrials,
        accuracy: stats.accuracy,
        maxSpan: stats.maxSpan,
        adjustments: stats.adjustments
      })
    });

    window.location.href = `../../results.html?${params.toString()}`;
  }

  resetExercise() {
    // Reset state
    this.currentTrial = 0;
    this.score = 0;
    this.isPractice = false;

    // Clear any practice banners
    const practiceBanner = document.querySelector('.practice-banner');
    if (practiceBanner) {
      practiceBanner.remove();
    }

    // Restart the exercise
    this.startExercise();
  }

  confirmExit() {
    const inProgress = !this.screens.exercise.classList.contains('hidden') && this.currentTrial > 0;

    if (inProgress && !this.isPractice) {
      const confirmed = confirm('Je bent nog bezig met de oefening. Wil je echt stoppen? Je voortgang gaat verloren.');
      if (!confirmed) return;
    }

    history.back();
  }

  // ===== UTILITY METHODS =====

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize exercise when DOM is ready (with guard against double initialization)
let exerciseInstance = null;

function initializeExercise() {
  if (exerciseInstance === null) {
    exerciseInstance = new DigitSpanExercise();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExercise);
} else {
  initializeExercise();
}
