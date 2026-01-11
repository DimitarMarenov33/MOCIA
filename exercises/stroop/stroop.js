/**
 * STROOP TASK EXERCISE
 * Executive function training through inhibition control
 * Uses buildings (emoji + spoken name) and days of the week (written + spoken)
 */

class StroopExercise {
  constructor() {
    this.config = null;
    this.isPractice = false;

    // Exercise state
    this.currentTrial = 0;
    this.totalTrials = 0;

    // Stimulus sets
    this.stimulusSets = [
      {
        name: 'buildings',
        type: 'emoji', // Display emoji, speak name
        items: [
          { id: 'school', emoji: '🏫', label: 'School' },
          { id: 'ziekenhuis', emoji: '🏥', label: 'Ziekenhuis' },
          { id: 'hotel', emoji: '🏨', label: 'Hotel' },
          { id: 'kerk', emoji: '⛪', label: 'Kerk' },
          { id: 'bank', emoji: '🏦', label: 'Bank' },
          { id: 'fabriek', emoji: '🏭', label: 'Fabriek' },
          { id: 'kantoor', emoji: '🏢', label: 'Kantoor' },
        ],
        instruction: 'Welk gebouw ZIE je?'
      },
      {
        name: 'days',
        type: 'text', // Display text, speak name
        items: [
          { id: 'maandag', label: 'Maandag' },
          { id: 'dinsdag', label: 'Dinsdag' },
          { id: 'woensdag', label: 'Woensdag' },
          { id: 'donderdag', label: 'Donderdag' },
          { id: 'vrijdag', label: 'Vrijdag' },
          { id: 'zaterdag', label: 'Zaterdag' },
          { id: 'zondag', label: 'Zondag' },
        ],
        instruction: 'Welke dag LEES je?'
      }
    ];
    this.currentStimulusSet = null;

    // Current trial data
    this.currentVisual = null; // What is shown (emoji or text)
    this.currentSpoken = null; // What is spoken
    this.currentCondition = null; // 'congruent' or 'incongruent'
    this.correctAnswer = null; // The correct item ID
    this.buttonOptions = []; // Available response options

    // Track last items to avoid repetition
    this.lastStimulusSetName = null;
    this.lastVisualId = null;

    // Adaptive timing
    this.timeLimit = 3000;
    this.minTimeLimit = 1000;
    this.maxTimeLimit = 5000;
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;

    // Timer
    this.timerInterval = null;
    this.trialStartTime = null;
    this.timeRemaining = 0;

    // Trial tracking
    this.trials = [];
    this.score = 0;

    // DOM elements
    this.elements = {};

    this.init();
  }

  async init() {
    try {
      await this.loadConfig();
      this.cacheElements();
      this.setupEventListeners();
      this.loadSettings();

      // Auto-start exercise immediately (no welcome screen)
      this.startExercise();
    } catch (error) {
      console.error('Initialization error:', error);
      alert('Er is een fout opgetreden bij het laden van de oefening.');
    }
  }

  async loadConfig() {
    // Embedded configuration
    this.config = {
      exerciseId: CONSTANTS.EXERCISE_TYPES.STROOP,
      exerciseName: 'Stroop Taak',
      difficulty: 'easy',
      parameters: {
        totalTrials: 30,
        startTimeLimit: 3000,
        minTimeLimit: 1000,
        maxTimeLimit: 5000,
        timeAdjustment: 200,
        congruentProbability: 0.30, // 30% congruent (easier)
        incongruentProbability: 0.70, // 70% incongruent (harder)
      },
      scoring: {
        pointsForCorrect: 10,
        bonusForSpeed: 5,
        speedThreshold: 1500,
      },
      feedback: {
        correct: ['Correct!', 'Goed gedaan!', 'Perfect!', 'Uitstekend!'],
        incorrect: ['Niet juist', 'Probeer opnieuw!', 'Bijna!'],
        timeout: ['Te langzaam!', 'Tijd is op!', 'Sneller reageren!'],
      },
    };
  }

  cacheElements() {
    this.elements = {
      trialCounter: document.getElementById('trial-counter'),
      timerDisplay: document.getElementById('timer-display'),
      stimulusContainer: document.getElementById('stimulus-display'),
      stimulusDisplay: document.getElementById('color-word'),
      responseButtons: document.getElementById('response-buttons'),
      feedbackArea: document.getElementById('feedback-area'),
    };
  }

  setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
      this.confirmExit();
    });

    // Keyboard support (1-7)
    document.addEventListener('keydown', (e) => {
      if (this.timerInterval) {
        const buttons = this.elements.responseButtons.querySelectorAll('.response-button');
        if (buttons.length > 0 && !buttons[0].classList.contains('disabled')) {
          const keyNum = parseInt(e.key);
          if (keyNum >= 1 && keyNum <= 7 && keyNum <= buttons.length) {
            this.handleResponse(keyNum - 1);
          }
        }
      }
    });
  }

  loadSettings() {
    try {
      const settings = localStorage.getItem(CONSTANTS.STORAGE_KEYS.APP_SETTINGS);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.largeText) document.body.classList.add('large-text');
        if (parsed.highContrast) document.body.classList.add('high-contrast');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async startExercise() {
    // Initialize state
    this.totalTrials = this.config.parameters.totalTrials || 30;
    this.currentTrial = 0;
    this.trials = [];
    this.score = 0;

    // Initialize adaptive timing
    this.timeLimit = this.config.parameters.startTimeLimit || 3000;
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;

    // Start data tracking
    if (!this.isPractice) {
      window.DataTracker.startSession(this.config.exerciseId, {
        initialTimeLimit: this.timeLimit,
      });
    }

    // Show "Ready" button for first trial (iOS requires user gesture for speech)
    this.showReadyButton();
  }

  /**
   * Show a "Klaar?" button that user must tap to start first trial
   * This provides the user gesture needed for iOS speech
   */
  showReadyButton() {
    // Hide timer and trial counter initially
    this.elements.timerDisplay.style.visibility = 'hidden';

    // Clear stimulus display and show ready button
    UIComponents.clearElement(this.elements.stimulusDisplay);
    UIComponents.clearElement(this.elements.responseButtons);

    const container = document.createElement('div');
    container.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: var(--spacing-lg);';

    const readyBtn = document.createElement('button');
    readyBtn.className = 'btn btn-primary btn-large';
    readyBtn.textContent = 'Klaar? Tik om te beginnen';
    readyBtn.style.cssText = 'font-size: var(--font-size-xl); padding: var(--spacing-lg) var(--spacing-xl);';

    readyBtn.addEventListener('click', () => {
      // This tap provides gesture context for speech
      this.elements.timerDisplay.style.visibility = 'visible';
      this.startFirstTrial();
    });

    container.appendChild(readyBtn);
    this.elements.stimulusDisplay.appendChild(container);
  }

  /**
   * Start the first trial - called from Ready button tap (has gesture context)
   */
  async startFirstTrial() {
    this.currentTrial++;

    // Update trial counter
    this.elements.trialCounter.textContent = `Poging ${this.currentTrial}/${this.totalTrials}`;

    // Clear feedback
    UIComponents.clearElement(this.elements.feedbackArea);

    // Generate trial
    this.generateTrial();

    // Speak the word NOW (we have gesture context from the tap)
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      window.AudioManager.speak(this.currentSpoken.label);
    }

    // Display stimulus visually (without speech)
    await this.displayStimulusVisualOnly();

    // Display response buttons
    this.displayResponseButtons();

    // Start timer
    this.trialStartTime = Date.now();
    this.startTimer();
  }

  async startTrial() {
    this.currentTrial++;

    // Update trial counter
    this.elements.trialCounter.textContent = `Poging ${this.currentTrial}/${this.totalTrials}`;

    // Clear feedback
    UIComponents.clearElement(this.elements.feedbackArea);

    // Generate trial
    this.generateTrial();

    // Display stimulus (with speech)
    await this.displayStimulus();

    // Display response buttons
    this.displayResponseButtons();

    // Start timer
    this.trialStartTime = Date.now();
    this.startTimer();
  }

  generateTrial() {
    // Randomly select a stimulus set, avoiding same set twice in a row if possible
    let availableSets = this.stimulusSets;
    if (this.lastStimulusSetName && this.stimulusSets.length > 1) {
      availableSets = this.stimulusSets.filter(s => s.name !== this.lastStimulusSetName);
    }
    this.currentStimulusSet = availableSets[Math.floor(Math.random() * availableSets.length)];
    this.lastStimulusSetName = this.currentStimulusSet.name;

    // Determine condition: congruent or incongruent
    const rand = Math.random();
    const congruentProb = this.config.parameters.congruentProbability;

    // Pick the visual item, avoiding same item twice in a row within same set
    let items = this.currentStimulusSet.items;
    let availableItems = items;
    if (this.lastVisualId && items.length > 1) {
      availableItems = items.filter(item => item.id !== this.lastVisualId);
    }
    const visualItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    this.currentVisual = visualItem;
    this.correctAnswer = visualItem.id;
    this.lastVisualId = visualItem.id;

    if (rand < congruentProb) {
      // Congruent: visual and spoken match
      this.currentCondition = 'congruent';
      this.currentSpoken = visualItem;
    } else {
      // Incongruent: visual and spoken differ
      this.currentCondition = 'incongruent';
      const availableItems = items.filter(item => item.id !== visualItem.id);
      this.currentSpoken = availableItems[Math.floor(Math.random() * availableItems.length)];
    }

    // All items in the set are available as response options
    this.buttonOptions = [...items];
  }

  async displayStimulus() {
    // Display depends on stimulus set type
    if (this.currentStimulusSet.type === 'emoji') {
      // Buildings: show emoji
      this.elements.stimulusDisplay.textContent = this.currentVisual.emoji;
      this.elements.stimulusDisplay.style.fontSize = '120px';
      this.elements.stimulusDisplay.style.color = 'inherit';
    } else {
      // Days: show text
      this.elements.stimulusDisplay.textContent = this.currentVisual.label;
      this.elements.stimulusDisplay.style.fontSize = '';
      this.elements.stimulusDisplay.style.color = 'inherit';
    }

    // Speak the (possibly different) item
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      try {
        await window.AudioManager.speak(this.currentSpoken.label);
      } catch (error) {
        console.log('Speech unavailable:', error);
      }
    }
  }

  /**
   * Display stimulus visually only (without speech)
   * Used for iOS speech fix where speech is triggered separately on user tap
   */
  async displayStimulusVisualOnly() {
    // Display depends on stimulus set type
    if (this.currentStimulusSet.type === 'emoji') {
      // Buildings: show emoji
      this.elements.stimulusDisplay.textContent = this.currentVisual.emoji;
      this.elements.stimulusDisplay.style.fontSize = '120px';
      this.elements.stimulusDisplay.style.color = 'inherit';
    } else {
      // Days: show text
      this.elements.stimulusDisplay.textContent = this.currentVisual.label;
      this.elements.stimulusDisplay.style.fontSize = '';
      this.elements.stimulusDisplay.style.color = 'inherit';
    }
    // No speech here - speech is triggered separately on user gesture
  }

  displayResponseButtons() {
    // Clear existing buttons
    UIComponents.clearElement(this.elements.responseButtons);

    // Create buttons for all options in the current set
    this.buttonOptions.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.className = 'response-button';
      btn.setAttribute('data-id', item.id);

      // Create label span
      const labelSpan = document.createElement('span');
      labelSpan.className = 'button-label';
      labelSpan.textContent = item.label;
      btn.appendChild(labelSpan);

      // Add click handler
      btn.addEventListener('click', () => {
        this.handleResponse(index);
      });

      this.elements.responseButtons.appendChild(btn);
    });
  }

  startTimer() {
    this.timeRemaining = this.timeLimit;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeRemaining -= 100;
      this.updateTimerDisplay();

      if (this.timeRemaining <= 0) {
        this.handleTimeout();
      }
    }, 100);
  }

  updateTimerDisplay() {
    const seconds = (this.timeRemaining / 1000).toFixed(1);
    this.elements.timerDisplay.textContent = `${seconds}s`;

    // Warning color when time running out
    if (this.timeRemaining <= 1000) {
      this.elements.timerDisplay.classList.add('warning');
    } else {
      this.elements.timerDisplay.classList.remove('warning');
    }
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  async handleResponse(buttonIndex) {
    // Stop timer
    this.stopTimer();

    // Calculate response time
    const responseTime = Date.now() - this.trialStartTime;

    // Get selected item
    const selectedItem = this.buttonOptions[buttonIndex];

    // Check if correct (user should select what they SEE, not what they HEAR)
    const correct = selectedItem.id === this.correctAnswer;

    // Get all buttons
    const buttons = this.elements.responseButtons.querySelectorAll('.response-button');
    buttons.forEach(btn => btn.classList.add('disabled'));

    // Visual feedback
    if (correct) {
      buttons[buttonIndex].classList.add('correct');
    } else {
      buttons[buttonIndex].classList.add('incorrect');
      // Highlight correct answer
      const correctIndex = this.buttonOptions.findIndex(item => item.id === this.correctAnswer);
      buttons[correctIndex].classList.add('correct');
    }

    // Calculate score
    let trialScore = 0;
    if (correct) {
      trialScore = this.config.scoring.pointsForCorrect || 10;
      // Bonus for speed
      if (responseTime < this.config.scoring.speedThreshold) {
        trialScore += this.config.scoring.bonusForSpeed || 5;
      }
    }
    this.score += trialScore;

    // Record trial
    const trialData = {
      stimulusSet: this.currentStimulusSet.name,
      condition: this.currentCondition,
      visualItem: this.currentVisual.id,
      spokenItem: this.currentSpoken.id,
      selectedItem: selectedItem.id,
      correct: correct,
      responseTime: responseTime,
      timeLimit: this.timeLimit,
      timedOut: false,
      score: trialScore,
    };

    this.trials.push(trialData);

    if (!this.isPractice) {
      window.DataTracker.recordTrial(trialData);
    }

    // Update adaptive timing
    this.updateAdaptiveTiming(correct);

    // Audio feedback
    if (window.AudioManager) {
      if (correct) {
        window.AudioManager.hapticSuccess();
      } else {
        window.AudioManager.hapticError();
      }
    }

    // iOS speech fix: Generate and speak NEXT trial's word NOW while we have gesture context
    let nextSpokenWord = null;
    if (this.currentTrial < this.totalTrials) {
      // Pre-generate next trial
      this.generateTrial();
      nextSpokenWord = this.currentSpoken.label;

      // Speak next trial's word immediately (iOS gesture context)
      if (window.AudioManager && window.AudioManager.isEnabled()) {
        window.AudioManager.speak(nextSpokenWord);
      }
    }

    // Show feedback
    await this.showFeedback(correct, responseTime);

    // Check if exercise complete
    if (this.currentTrial >= this.totalTrials) {
      await this.sleep(1000);
      this.endExercise();
    } else {
      // Continue to next trial (stimulus already generated, just display visually)
      await this.sleep(800);
      this.startNextTrial();
    }
  }

  /**
   * Start next trial with pre-generated stimulus (visual only, speech already triggered)
   */
  async startNextTrial() {
    this.currentTrial++;

    // Update trial counter
    this.elements.trialCounter.textContent = `Poging ${this.currentTrial}/${this.totalTrials}`;

    // Clear feedback
    UIComponents.clearElement(this.elements.feedbackArea);

    // Trial already generated in handleResponse/handleTimeout, display visually only
    await this.displayStimulusVisualOnly();

    // Display response buttons
    this.displayResponseButtons();

    // Start timer
    this.trialStartTime = Date.now();
    this.startTimer();
  }

  async handleTimeout() {
    // Stop timer
    this.stopTimer();

    // Get all buttons and disable them
    const buttons = this.elements.responseButtons.querySelectorAll('.response-button');
    buttons.forEach(btn => btn.classList.add('disabled'));

    // Highlight correct answer
    const correctIndex = this.buttonOptions.findIndex(item => item.id === this.correctAnswer);
    if (correctIndex >= 0 && buttons[correctIndex]) {
      buttons[correctIndex].classList.add('correct');
    }

    // Record trial
    const trialData = {
      stimulusSet: this.currentStimulusSet.name,
      condition: this.currentCondition,
      visualItem: this.currentVisual.id,
      spokenItem: this.currentSpoken.id,
      selectedItem: null,
      correct: false,
      responseTime: this.timeLimit,
      timeLimit: this.timeLimit,
      timedOut: true,
      score: 0,
    };

    this.trials.push(trialData);

    if (!this.isPractice) {
      window.DataTracker.recordTrial(trialData);
    }

    // Update adaptive timing (timeout counts as incorrect)
    this.updateAdaptiveTiming(false);

    // Audio feedback
    if (window.AudioManager) {
      window.AudioManager.hapticError();
    }

    // Note: Timeout doesn't have user gesture context, so we can't trigger speech here.
    // The next trial will need to wait for user to tap a "Continue" button or similar.
    // For now, we'll generate the next trial but speech may not work on iOS after timeout.
    // This is acceptable as timeouts should be rare in normal gameplay.

    // Show timeout feedback
    await this.showTimeoutFeedback();

    // Check if exercise complete
    if (this.currentTrial >= this.totalTrials) {
      await this.sleep(1000);
      this.endExercise();
    } else {
      // Continue to next trial - generate and use startTrial (which has displayStimulus with speech)
      // On iOS, the speech may fail after timeout since there's no gesture context
      await this.sleep(1500);
      this.startTrial();
    }
  }

  updateAdaptiveTiming(correct) {
    const adjustment = this.config.parameters.timeAdjustment || 200;
    const previousTimeLimit = this.timeLimit;

    if (correct) {
      this.consecutiveCorrect++;
      this.consecutiveIncorrect = 0;

      // After 2 consecutive correct, decrease time (make harder)
      if (this.consecutiveCorrect >= 2) {
        this.timeLimit = Math.max(this.minTimeLimit, this.timeLimit - adjustment);
        this.consecutiveCorrect = 0;
      }
    } else {
      this.consecutiveIncorrect++;
      this.consecutiveCorrect = 0;

      // After 2 consecutive incorrect, increase time (make easier)
      if (this.consecutiveIncorrect >= 2) {
        this.timeLimit = Math.min(this.maxTimeLimit, this.timeLimit + adjustment);
        this.consecutiveIncorrect = 0;
      }
    }

    // Store whether time was adjusted
    this.timeAdjusted = previousTimeLimit !== this.timeLimit;
  }

  async showFeedback(correct, responseTime) {
    let message, type;

    if (correct) {
      const messages = this.config.feedback?.correct || ['Correct!'];
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'success';
    } else {
      const messages = this.config.feedback?.incorrect || ['Niet juist'];
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'error';
    }

    // Show overlay feedback on stimulus container
    UIComponents.showOverlayFeedback(this.elements.stimulusContainer, message, type);

    // Audio feedback
    if (window.AudioManager) {
      if (correct) {
        window.AudioManager.hapticSuccess();
      } else {
        window.AudioManager.hapticError();
      }
    }

    await this.sleep(1500);
  }

  showTimeAdjustmentIndicator(wasCorrect) {
    // Create adjustment indicator
    const indicator = document.createElement('span');
    indicator.className = wasCorrect ? 'time-adjustment-good' : 'time-adjustment-bad';
    indicator.textContent = wasCorrect ? '-0.2s' : '+0.2s';
    indicator.style.cssText = `
      display: inline-block;
      margin-left: var(--spacing-sm);
      font-size: var(--font-size-md);
      font-weight: 700;
      color: ${wasCorrect ? 'var(--color-success)' : 'var(--color-error)'};
      animation: fade-in-out 1.5s ease;
    `;

    // Add to timer display
    this.elements.timerDisplay.appendChild(indicator);

    // Remove after animation
    setTimeout(() => {
      indicator.remove();
    }, 1500);
  }

  async showTimeoutFeedback() {
    const messages = this.config.feedback?.timeout || ['Te langzaam!'];
    const message = messages[Math.floor(Math.random() * messages.length)];

    // Show overlay feedback on stimulus container
    UIComponents.showOverlayFeedback(this.elements.stimulusContainer, message, 'error');

    // Audio feedback
    if (window.AudioManager) {
      window.AudioManager.hapticError();
    }

    await this.sleep(1500);
  }

  endExercise() {
    // Calculate final statistics
    const totalTrials = this.trials.length;
    const correctTrials = this.trials.filter(t => t.correct).length;
    const accuracy = correctTrials / totalTrials;
    const timeoutTrials = this.trials.filter(t => t.timedOut).length;

    // Accuracy by condition
    const congruentTrials = this.trials.filter(t => t.condition === 'congruent');
    const incongruentTrials = this.trials.filter(t => t.condition === 'incongruent');

    const congruentAccuracy = congruentTrials.length > 0
      ? congruentTrials.filter(t => t.correct).length / congruentTrials.length
      : 0;
    const incongruentAccuracy = incongruentTrials.length > 0
      ? incongruentTrials.filter(t => t.correct).length / incongruentTrials.length
      : 0;

    // Accuracy by stimulus set
    const buildingsTrials = this.trials.filter(t => t.stimulusSet === 'buildings');
    const daysTrials = this.trials.filter(t => t.stimulusSet === 'days');

    const buildingsAccuracy = buildingsTrials.length > 0
      ? buildingsTrials.filter(t => t.correct).length / buildingsTrials.length
      : 0;
    const daysAccuracy = daysTrials.length > 0
      ? daysTrials.filter(t => t.correct).length / daysTrials.length
      : 0;

    const responseTimes = this.trials.filter(t => t.correct).map(t => t.responseTime);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0;

    const finalStats = {
      totalTrials: totalTrials,
      correctTrials: correctTrials,
      accuracy: accuracy,
      congruentAccuracy: congruentAccuracy,
      incongruentAccuracy: incongruentAccuracy,
      buildingsAccuracy: buildingsAccuracy,
      daysAccuracy: daysAccuracy,
      averageResponseTime: averageResponseTime,
      timeoutTrials: timeoutTrials,
      finalTimeLimit: this.timeLimit,
      score: this.score,
    };

    // End session and save
    if (!this.isPractice) {
      window.DataTracker.endSession(finalStats);
    }

    // Navigate to results page
    this.showResults(finalStats);
  }

  showResults(stats) {
    // Navigate to results page with stats as URL parameters
    const params = new URLSearchParams({
      exercise: 'exercises/stroop/index.html',
      name: this.config.exerciseName,
      score: this.score,
      stats: JSON.stringify({
        totalTrials: stats.totalTrials,
        correctTrials: stats.correctTrials,
        accuracy: stats.accuracy,
        congruentAccuracy: stats.congruentAccuracy,
        incongruentAccuracy: stats.incongruentAccuracy,
        averageReactionTime: Math.round(stats.averageResponseTime),
        timeoutTrials: stats.timeoutTrials,
        finalTimeLimit: stats.finalTimeLimit,
      })
    });

    const resultsUrl = `../../results.html?${params.toString()}`;

    // Show feedback modal before navigating to results
    if (window.FeedbackModal && !this.isPractice) {
      const sessionId = window.DataTracker?.getLastSessionId(this.config.exerciseId);

      window.FeedbackModal.show({
        exerciseType: this.config.exerciseId,
        sessionId: sessionId,
        onComplete: () => {
          window.location.href = resultsUrl;
        }
      });
    } else {
      window.location.href = resultsUrl;
    }
  }

  confirmExit() {
    const inProgress = this.currentTrial > 0 && this.currentTrial < this.totalTrials;

    if (inProgress && !this.isPractice) {
      const confirmed = confirm(
        'Je bent nog bezig met de oefening. Wil je echt stoppen?'
      );
      if (!confirmed) return;

      // Save abandoned session with exit info
      window.DataTracker.abandonSession({
        reason: 'user_exit',
        currentTrial: this.currentTrial,
        totalTrials: this.totalTrials,
        score: this.score
      });
    }

    history.back();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize exercise when DOM is ready (with guard against double initialization)
let exerciseInstance = null;

function initializeExercise() {
  if (exerciseInstance === null) {
    exerciseInstance = new StroopExercise();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExercise);
} else {
  initializeExercise();
}
