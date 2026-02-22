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
    this.currentSequence = []; // Array of characters (digits, +, -)
    this.userSequence = [];
    this.score = 0;
    this.isShowingSequence = false; // Flag to block input during sequence display

    // Real-world sequence types
    this.sequenceTypes = ['phone', 'date'];
    this.currentSequenceType = null;
    this.currentSequenceFormatted = ''; // For display purposes
    this.currentContentMode = 'generic'; // 'generic' or 'personalized'

    // Phone number prefixes (Dutch and common country codes)
    this.phonePrefixes = [
      { prefix: '06', name: 'NL Mobile' },
      { prefix: '+31', name: 'Netherlands' },
      { prefix: '+32', name: 'Belgium' },
      { prefix: '+49', name: 'Germany' },
      { prefix: '+359', name: 'Bulgaria' },
      { prefix: '+33', name: 'France' },
      { prefix: '+44', name: 'UK' },
    ];

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
      exerciseName: 'Reeks Onthouden',
      difficulty: 'easy',
      parameters: {
        startLength: 3,
        minLength: 3,
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
      trialCounter: document.getElementById('trial-counter'),
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

    // Keyboard support for global shortcuts only
    document.addEventListener('keydown', (e) => {
      if (this.screens.exercise.classList.contains('hidden')) return;
      if (this.isShowingSequence) return;

      // Escape to clear
      if (e.key === 'Escape') {
        this.clearInput();
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
    this.createInputField();

    // Show "Ready" button for first trial (iOS requires user gesture for speech)
    this.showReadyButton();
  }

  /**
   * Show a "Klaar?" button that user must tap to start first trial
   * This provides the user gesture needed for iOS speech
   */
  showReadyButton() {
    UIComponents.clearElement(this.elements.sequenceDisplay);

    const container = document.createElement('div');
    container.className = 'ready-button-container';
    container.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: var(--spacing-lg);';

    const readyBtn = document.createElement('button');
    readyBtn.className = 'btn btn-primary btn-large';
    readyBtn.textContent = 'Klaar? Tik om te beginnen';
    readyBtn.style.cssText = 'font-size: var(--font-size-xl); padding: var(--spacing-lg) var(--spacing-xl);';

    readyBtn.addEventListener('click', () => {
      // This tap provides gesture context for speech
      this.startFirstTrial();
    });

    container.appendChild(readyBtn);
    this.elements.sequenceDisplay.appendChild(container);
  }

  /**
   * Start the first trial - called from Ready button tap (has gesture context)
   */
  async startFirstTrial() {
    this.currentTrial++;
    this.trialStartTime = Date.now();

    // Update trial counter
    if (this.elements.trialCounter) {
      this.elements.trialCounter.textContent = `${this.currentTrial}/${this.totalTrials}`;
    }

    // Generate sequence
    const sequenceLength = this.difficultyAdapter.getCurrentDifficulty();
    this.currentSequence = this.generateSequence(sequenceLength);
    this.userSequence = [];

    // Speak the sequence NOW (we have gesture context from the tap)
    this.speakSequence(this.currentSequence);

    // Clear and show visual presentation
    UIComponents.clearElement(this.elements.sequenceDisplay);
    await this.presentSequence();

    // Show input area
    this.showInputArea();
  }

  /**
   * Speak a sequence as a single utterance (for iOS gesture context)
   * Uses lead-in phrase and very slow speech rate to match visual presentation timing
   */
  speakSequence(sequence) {
    if (!window.AudioManager || !window.AudioManager.isEnabled()) return;

    // Build speech text from sequence
    // Visual timing: 1000ms display + 800ms gap = ~1.8s per character
    const spokenParts = sequence.map(char => {
      if (char === '+') return 'plus';
      if (char === '-') return 'streepje';
      return char.toString();
    });

    // Add longer lead-in phrase to fill the visual delay between trials
    // Similar to stroop which uses "Klaar? Volgende:"
    // Very slow rate (0.15) with semicolons to match visual timing of ~1.8s per digit
    const speechText = 'Klaar? Volgende reeks:;   ' + spokenParts.join(';   ');
    window.AudioManager.speak(speechText, { rate: 0.15 });
  }

  async startTrial() {
    this.currentTrial++;
    this.trialStartTime = Date.now();

    // Update trial counter
    if (this.elements.trialCounter) {
      this.elements.trialCounter.textContent = `${this.currentTrial}/${this.totalTrials}`;
    }

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
    // Get current content mode from PersonalizationCounter
    this.currentContentMode = window.PersonalizationCounter?.getContentMode() || 'generic';

    // Randomly select a sequence type
    this.currentSequenceType = this.sequenceTypes[Math.floor(Math.random() * this.sequenceTypes.length)];

    let sequence;

    // Try personalized data if in personalized mode
    if (this.currentContentMode === 'personalized') {
      sequence = this.generatePersonalizedSequence(length);
      if (sequence) {
        return sequence;
      }
      // Fall back to generic if no personalized data available for this type
    }

    // Generate generic/random sequence
    switch (this.currentSequenceType) {
      case 'phone':
        sequence = this.generatePhoneSequence(length);
        break;
      case 'date':
        sequence = this.generateDateSequence(length);
        break;
      default:
        sequence = this.generateRandomDigits(length);
    }

    return sequence;
  }

  // Generate personalized sequence based on user's stored data
  generatePersonalizedSequence(length) {
    const service = window.PersonalizationService;
    if (!service) return null;

    switch (this.currentSequenceType) {
      case 'phone': {
        const phones = service.getPhoneNumbers();
        if (phones.length > 0) {
          const phone = service.getRandomItem(phones);
          if (phone?.number) {
            const parsed = service.parsePhoneToSequence(phone.number);
            // Adjust to requested length
            if (parsed.length >= length) {
              return parsed.slice(0, length);
            }
            // If too short, pad with random digits
            while (parsed.length < length) {
              parsed.push(Math.floor(Math.random() * 10).toString());
            }
            return parsed;
          }
        }
        return null;
      }

      case 'date': {
        const dates = service.getImportantDates();
        if (dates.length > 0) {
          const date = service.getRandomItem(dates);
          if (date?.date) {
            const parsed = service.parseDateToSequence(date.date);
            // Adjust to requested length
            if (parsed.length >= length) {
              return parsed.slice(0, length);
            }
            // If too short, pad with random digits
            while (parsed.length < length) {
              parsed.push(Math.floor(Math.random() * 10).toString());
            }
            return parsed;
          }
        }
        return null;
      }

      default:
        return null;
    }
  }

  // Generate random digits (fallback)
  generateRandomDigits(length) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(Math.random() * 10).toString());
    }
    return sequence;
  }

  // Generate phone number sequence with country code prefix
  generatePhoneSequence(length) {
    const sequence = [];

    // Select a prefix that fits within the length
    const validPrefixes = this.phonePrefixes.filter(p => p.prefix.length <= length);
    if (validPrefixes.length === 0) {
      // If no prefix fits, just use digits
      return this.generateRandomDigits(length);
    }

    const selectedPrefix = validPrefixes[Math.floor(Math.random() * validPrefixes.length)];

    // Add prefix digits
    for (const digit of selectedPrefix.prefix) {
      sequence.push(digit);
    }

    // Fill remaining with random digits
    while (sequence.length < length) {
      sequence.push(Math.floor(Math.random() * 10).toString());
    }

    return sequence;
  }

  // Generate date sequence (DD-MM-YY format with dashes included)
  generateDateSequence(length) {
    const sequence = [];

    // Generate a realistic date
    const day = Math.floor(Math.random() * 28) + 1; // 1-28 to be safe
    const month = Math.floor(Math.random() * 12) + 1; // 1-12
    const year = Math.floor(Math.random() * 30) + 95; // 95-124 (1995-2024, showing as 95-24)

    // Format as DD-MM-YY with dashes included in sequence
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = (year % 100).toString().padStart(2, '0');

    // Build full date with dashes: DD-MM-YY = 8 characters
    const fullDate = dayStr + '-' + monthStr + '-' + yearStr;

    for (let i = 0; i < Math.min(length, fullDate.length); i++) {
      sequence.push(fullDate[i]);
    }

    // If length > 8, pad with random digits
    while (sequence.length < length) {
      sequence.push(Math.floor(Math.random() * 10).toString());
    }

    return sequence;
  }

  // Format sequence for display
  formatSequenceForDisplay(sequence, type) {
    const chars = sequence.join('');

    switch (type) {
      case 'phone':
        // Phone numbers already include + in sequence, just add spacing for readability
        if (chars.startsWith('+')) {
          // Find where the country code ends (after +XX or +XXX)
          const countryCodeEnd = chars.startsWith('+3') && chars.length > 3 && chars[2] === '5' ? 4 : 3;
          if (chars.length <= countryCodeEnd) return chars;
          return chars.slice(0, countryCodeEnd) + ' ' + chars.slice(countryCodeEnd);
        }
        // Regular 06 format - add space after 06
        if (chars.length <= 2) return chars;
        return chars.slice(0, 2) + ' ' + chars.slice(2);

      case 'date':
        // Dates already include dashes in sequence, display as-is
        return chars;

      default:
        return chars;
    }
  }

  // Get type label for display
  getSequenceTypeLabel() {
    switch (this.currentSequenceType) {
      case 'phone':
        return 'Telefoonnummer';
      case 'date':
        return 'Datum';
      default:
        return 'Reeks';
    }
  }

  async showReadyMessage() {
    UIComponents.clearElement(this.elements.sequenceDisplay);

    // Show sequence type before "Ready"
    const container = document.createElement('div');
    container.className = 'ready-container';

    const typeLabel = document.createElement('div');
    typeLabel.className = 'sequence-type-label';
    typeLabel.textContent = this.getSequenceTypeLabel();
    container.appendChild(typeLabel);

    const message = document.createElement('div');
    message.className = 'ready-message';
    message.textContent = 'Klaar?';
    container.appendChild(message);

    this.elements.sequenceDisplay.appendChild(container);

    await this.sleep(1000);
  }

  async presentSequence() {
    // Visual-only presentation (speech was already triggered by user tap)
    await this.presentSequenceVisualOnly();
  }

  async presentSequenceVisualOnly() {
    // Block input while showing sequence
    this.isShowingSequence = true;

    UIComponents.clearElement(this.elements.sequenceDisplay);

    const displayTime = this.config.parameters.digitDisplayTime || CONSTANTS.DIGIT_SPAN.DIGIT_DISPLAY_TIME;
    const interDigitInterval = this.config.parameters.interDigitInterval || CONSTANTS.DIGIT_SPAN.INTER_DIGIT_INTERVAL;

    for (let i = 0; i < this.currentSequence.length; i++) {
      const char = this.currentSequence[i];

      // Create character display
      const charEl = document.createElement('div');
      charEl.className = 'digit-display';
      charEl.textContent = char;

      UIComponents.clearElement(this.elements.sequenceDisplay);
      this.elements.sequenceDisplay.appendChild(charEl);

      // Display character for specified time
      await this.sleep(displayTime);

      // Clear character
      UIComponents.clearElement(this.elements.sequenceDisplay);

      // Inter-character interval (except after last character)
      if (i < this.currentSequence.length - 1) {
        await this.sleep(interDigitInterval);
      }
    }
  }

  showInputArea() {
    // Allow input now that sequence is done
    this.isShowingSequence = false;

    // Show "Your Turn" message with sequence type hint
    UIComponents.clearElement(this.elements.sequenceDisplay);

    const messageContainer = document.createElement('div');
    messageContainer.className = 'your-turn-container';

    const typeLabel = document.createElement('div');
    typeLabel.className = 'sequence-type-label';
    typeLabel.textContent = this.getSequenceTypeLabel();
    messageContainer.appendChild(typeLabel);

    const message = document.createElement('div');
    message.className = 'your-turn-message';
    message.textContent = 'Uw beurt!';
    messageContainer.appendChild(message);

    this.elements.sequenceDisplay.appendChild(messageContainer);

    // Show input area
    this.elements.inputArea.classList.remove('hidden');

    // Clear user sequence display
    UIComponents.clearElement(this.elements.userSequence);

    // Enable submit button (initially disabled until sequence entered)
    this.elements.submitBtn.disabled = true;
  }

  createInputField() {
    UIComponents.clearElement(this.elements.numberPadContainer);

    // Create number pad grid
    const grid = document.createElement('div');
    grid.className = 'number-pad-grid';

    // Button layout: 0-9, +, -, backspace
    const rows = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['+', '0', '-'],
    ];

    rows.forEach(row => {
      row.forEach(char => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'number-pad-btn';
        btn.textContent = char;
        btn.dataset.char = char;

        btn.addEventListener('click', () => {
          if (this.isShowingSequence) return;
          this.userSequence.push(char);
          this.updateUserSequenceDisplay();
          this.elements.submitBtn.disabled = this.userSequence.length !== this.currentSequence.length;

          if (window.AudioManager) {
            window.AudioManager.hapticPress();
          }
        });

        grid.appendChild(btn);
      });
    });

    // Backspace button (full width)
    const backspaceBtn = document.createElement('button');
    backspaceBtn.type = 'button';
    backspaceBtn.className = 'number-pad-btn number-pad-backspace';
    backspaceBtn.innerHTML = '&#9003;'; // ⌫
    backspaceBtn.setAttribute('aria-label', 'Wissen');

    backspaceBtn.addEventListener('click', () => {
      if (this.isShowingSequence) return;
      if (this.userSequence.length > 0) {
        this.userSequence.pop();
        this.updateUserSequenceDisplay();
        this.elements.submitBtn.disabled = this.userSequence.length !== this.currentSequence.length;

        if (window.AudioManager) {
          window.AudioManager.hapticPress();
        }
      }
    });

    grid.appendChild(backspaceBtn);
    this.elements.numberPadContainer.appendChild(grid);
  }

  clearInput() {
    this.userSequence = [];
    this.updateUserSequenceDisplay();
    this.elements.submitBtn.disabled = true;

    if (window.AudioManager) {
      window.AudioManager.hapticPress();
    }
  }

  updateUserSequenceDisplay() {
    UIComponents.clearElement(this.elements.userSequence);

    if (this.userSequence.length === 0) {
      this.elements.userSequence.textContent = '_';
      return;
    }

    // Display with formatting based on sequence type
    const formatted = this.formatSequenceForDisplay(this.userSequence, this.currentSequenceType);
    this.elements.userSequence.textContent = formatted;
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
        contentMode: this.currentContentMode,
        sequenceType: this.currentSequenceType,
      });
    }

    // Update difficulty
    const difficultyResult = this.difficultyAdapter.processResult(correct);

    // Check if there are more trials - if so, generate and speak NEXT sequence NOW
    // (we have gesture context from the submit button tap)
    let nextSequence = null;
    if (this.currentTrial < this.totalTrials) {
      const nextLength = this.difficultyAdapter.getCurrentDifficulty();
      nextSequence = this.generateSequence(nextLength);
      // Speak next sequence immediately (iOS gesture context)
      this.speakSequence(nextSequence);
    }

    // Show feedback
    await this.showFeedback(correct, difficultyResult.adjusted);

    // Check if exercise is complete
    if (this.currentTrial >= this.totalTrials) {
      await this.sleep(500);
      this.endExercise();
    } else {
      // Continue to next trial with pre-generated sequence
      this.elements.inputArea.classList.add('hidden');
      this.elements.clearBtn.disabled = false;
      this.elements.inputArea.classList.remove('input-disabled');

      await this.sleep(1000);
      this.startNextTrial(nextSequence);
    }
  }

  /**
   * Start next trial with a pre-generated sequence (already spoken)
   */
  async startNextTrial(sequence) {
    this.currentTrial++;
    this.trialStartTime = Date.now();

    // Update trial counter
    if (this.elements.trialCounter) {
      this.elements.trialCounter.textContent = `${this.currentTrial}/${this.totalTrials}`;
    }

    // Hide input area
    this.elements.inputArea.classList.add('hidden');

    // Clear previous user input display
    UIComponents.clearElement(this.elements.userSequence);

    // Use the pre-generated sequence (already spoken)
    this.currentSequence = sequence;
    this.userSequence = [];

    // Clear previous feedback
    UIComponents.clearElement(this.elements.feedbackArea);

    // Present sequence visually (already spoken)
    await this.presentSequenceVisualOnly();

    // Show input area
    this.showInputArea();
  }

  checkResponse() {
    if (this.userSequence.length !== this.currentSequence.length) {
      return false;
    }

    for (let i = 0; i < this.currentSequence.length; i++) {
      // Compare as uppercase strings to handle case differences
      const userChar = String(this.userSequence[i]).toUpperCase();
      const correctChar = String(this.currentSequence[i]).toUpperCase();
      if (userChar !== correctChar) {
        return false;
      }
    }

    return true;
  }

  async showFeedback(correct, difficultyAdjusted) {
    UIComponents.clearElement(this.elements.sequenceDisplay);

    const feedbackMessages = correct ? this.config.feedback?.correct : this.config.feedback?.incorrect;
    const message = feedbackMessages
      ? feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
      : (correct ? 'Correct!' : 'Niet helemaal');

    let detailMessage = '';
    if (!correct) {
      // Show formatted sequence in feedback
      const formattedSequence = this.formatSequenceForDisplay(this.currentSequence, this.currentSequenceType);
      detailMessage = `Juist: ${formattedSequence}`;
    }

    // Show overlay feedback on sequence display
    UIComponents.showOverlayFeedback(
      this.elements.sequenceDisplay,
      message,
      correct ? 'success' : 'error',
      { detail: detailMessage, duration: 1500 }
    );

    // Audio feedback
    if (window.AudioManager) {
      if (correct) {
        window.AudioManager.hapticSuccess();
      } else {
        window.AudioManager.hapticError();
      }
    }

    await this.sleep(1800);
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
    // Build results page URL
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

    const resultsUrl = `../../results.html?${params.toString()}`;

    // Show feedback modal before navigating to results
    if (window.FeedbackModal && !this.isPractice) {
      const sessionId = window.DataTracker?.getLastSessionId(CONSTANTS.EXERCISE_TYPES.DIGIT_SPAN);

      window.FeedbackModal.show({
        exerciseType: CONSTANTS.EXERCISE_TYPES.DIGIT_SPAN,
        sessionId: sessionId,
        onComplete: () => {
          window.location.href = resultsUrl;
        }
      });
    } else {
      // No feedback modal or practice mode - navigate directly
      window.location.href = resultsUrl;
    }
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
      const confirmed = confirm('Je bent nog bezig met de oefening. Wil je echt stoppen?');
      if (!confirmed) return;

      // Save abandoned session with exit info
      window.DataTracker.abandonSession({
        reason: 'user_exit',
        currentTrial: this.currentTrial,
        totalTrials: this.totalTrials,
        currentSpan: this.currentSpan,
        score: this.score
      });
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
