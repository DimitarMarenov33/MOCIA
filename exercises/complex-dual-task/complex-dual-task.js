/**
 * COMPLEX DUAL TASK EXERCISE
 * Combined visual search + 2-back memory task
 */

class ComplexDualTaskExercise {
  constructor() {
    this.config = null;
    this.isPractice = false;

    // Exercise state
    this.currentTrial = 0;
    this.totalTrials = 0;

    // Current trial data
    this.targetSequence = []; // Array of 2 emojis to remember
    this.currentStepIndex = 0; // Which emoji are we searching for (0 or 1)
    this.items = [];
    this.emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇'];

    // Adaptive difficulty
    this.gridSize = 3; // Start at 3x3
    this.maxGridSize = 7; // Maximum 7x7 (49 items)
    this.consecutiveCorrect = 0;

    // Timer
    this.timeLimit = 2000; // 2 seconds per step
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
      exerciseId: CONSTANTS.EXERCISE_TYPES.COMPLEX_DUAL_TASK,
      exerciseName: 'Complexe Dubbeltaak',
      difficulty: 'hard',
      parameters: {
        totalTrials: 20,
        sequenceLength: 2, // Always 2-back
        sequencePreviewDuration: 3000, // Show sequence for 3 seconds
        timePerStep: 2000, // 2 seconds per search step
      },
      scoring: {
        pointsPerCorrectStep: 15,
        bonusForFullSequence: 20,
        bonusForSpeed: 5,
        speedThreshold: 1000, // milliseconds
      },
      feedback: {
        correct: ['Correct!', 'Goed gedaan!', 'Perfect!', 'Uitstekend!'],
        incorrect: ['Niet helemaal', 'Probeer opnieuw!', 'Bijna!'],
        sequenceComplete: ['Hele reeks correct!', 'Geweldig!', 'Fantastisch!'],
        timeout: ['Te langzaam!', 'Tijd is op!'],
      },
    };
  }

  cacheElements() {
    this.elements = {
      trialCounter: document.getElementById('trial-counter'),
      timerDisplay: document.getElementById('timer-display'),
      sequencePreview: document.getElementById('sequence-preview'),
      sequenceIcon1: document.getElementById('sequence-icon-1'),
      sequenceIcon2: document.getElementById('sequence-icon-2'),
      instructionPrompt: document.getElementById('instruction-prompt'),
      currentTaskLabel: document.getElementById('current-task-label'),
      searchDisplay: document.getElementById('search-display'),
      feedbackArea: document.getElementById('feedback-area'),
    };
  }

  setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
      this.confirmExit();
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
    this.totalTrials = this.config.parameters.totalTrials || 20;
    this.currentTrial = 0;
    this.trials = [];
    this.score = 0;

    // Initialize adaptive difficulty
    this.gridSize = 3;
    this.consecutiveCorrect = 0;
    this.timeLimit = this.config.parameters.timePerStep || 2000;

    // Start data tracking
    if (!this.isPractice) {
      window.DataTracker.startSession(this.config.exerciseId, {
        initialDifficulty: this.gridSize,
        initialGridSize: this.gridSize,
        sequenceLength: this.config.parameters.sequenceLength,
      });
    }

    // Start first trial
    setTimeout(() => {
      this.startTrial();
    }, 1500);
  }

  async startTrial() {
    this.currentTrial++;
    this.currentStepIndex = 0;

    // Update trial counter
    this.elements.trialCounter.textContent = `Poging ${this.currentTrial}/${this.totalTrials}`;

    // Clear previous trial's search matrix to prevent cognitive load
    UIComponents.clearElement(this.elements.searchDisplay);

    // Hide instruction prompt from previous trial
    this.elements.instructionPrompt.classList.add('hidden');

    // Clear feedback
    UIComponents.clearElement(this.elements.feedbackArea);

    // Generate sequence
    this.generateSequence();

    // Show sequence preview
    await this.showSequencePreview();

    // Start first search step
    this.startSearchStep();
  }

  generateSequence() {
    // Select 2 random emojis
    const shuffled = [...this.emojis].sort(() => Math.random() - 0.5);
    this.targetSequence = shuffled.slice(0, 2);
  }

  async showSequencePreview() {
    // Show sequence preview
    this.elements.sequencePreview.classList.remove('hidden');
    this.elements.sequenceIcon1.textContent = this.targetSequence[0];
    this.elements.sequenceIcon2.textContent = this.targetSequence[1];
    this.elements.instructionPrompt.classList.add('hidden');

    // Speak sequence
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      try {
        await window.AudioManager.speak('Onthoud deze volgorde');
      } catch (error) {
        console.log('Speech unavailable:', error);
      }
    }

    // Wait for preview duration
    await this.sleep(this.config.parameters.sequencePreviewDuration || 3000);
  }

  startSearchStep() {
    // Hide sequence preview, show instruction
    this.elements.sequencePreview.classList.add('hidden');
    this.elements.instructionPrompt.classList.remove('hidden');

    // Update instruction
    const stepNumber = this.currentStepIndex + 1;
    this.elements.currentTaskLabel.textContent = `Zoek emoji #${stepNumber}`;

    // Generate grid with current target emoji
    this.generateGrid();

    // Display search items
    this.displaySearchItems();

    // Start timer
    this.trialStartTime = Date.now();
    this.startTimer();
  }

  generateGrid() {
    // Total items = gridSize * gridSize
    const totalItems = this.gridSize * this.gridSize;

    // Current target emoji
    const targetEmoji = this.targetSequence[this.currentStepIndex];

    // Random target position
    const targetPosition = Math.floor(Math.random() * totalItems);

    // Get available emojis (excluding target)
    const availableEmojis = this.emojis.filter(e => e !== targetEmoji);

    // Generate item list
    this.items = [];
    for (let i = 0; i < totalItems; i++) {
      if (i === targetPosition) {
        // This is the target
        this.items.push({ emoji: targetEmoji, isTarget: true, index: i });
      } else {
        // Random distractor emoji (not the target)
        const randomEmoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
        this.items.push({ emoji: randomEmoji, isTarget: false, index: i });
      }
    }
  }

  displaySearchItems() {
    UIComponents.clearElement(this.elements.searchDisplay);

    // Update grid template columns dynamically based on gridSize
    this.elements.searchDisplay.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

    // Adjust font size based on grid size for better scaling
    let fontSize = 64;
    if (this.gridSize > 5) {
      fontSize = 48;
    } else if (this.gridSize > 4) {
      fontSize = 56;
    }

    // Display items in grid (CSS handles the layout)
    this.items.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'search-item animate-fade-in';
      itemEl.setAttribute('data-index', index);
      itemEl.setAttribute('data-is-target', item.isTarget);
      itemEl.textContent = item.emoji;
      itemEl.style.fontSize = `${fontSize}px`;

      // Add click handler
      itemEl.addEventListener('click', () => {
        this.handleItemClick(item, itemEl);
      });

      this.elements.searchDisplay.appendChild(itemEl);
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
    if (this.timeRemaining <= 500) {
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

  async handleItemClick(item, itemEl) {
    // Stop timer
    this.stopTimer();

    // Calculate response time
    const responseTime = Date.now() - this.trialStartTime;

    // Disable all items
    const allItems = this.elements.searchDisplay.querySelectorAll('.search-item');
    allItems.forEach(el => el.classList.add('disabled'));

    // Check if correct
    const correct = item.isTarget;

    // Visual feedback
    if (correct) {
      itemEl.classList.add('correct');
    } else {
      itemEl.classList.add('incorrect');
      // Highlight the actual target
      const targetEl = this.elements.searchDisplay.querySelector('[data-is-target="true"]');
      if (targetEl) {
        targetEl.classList.add('correct');
      }
    }

    // Audio feedback
    if (window.AudioManager) {
      if (correct) {
        window.AudioManager.hapticSuccess();
      } else {
        window.AudioManager.hapticError();
      }
    }

    await this.sleep(500);

    if (correct) {
      // Move to next step in sequence
      this.currentStepIndex++;

      if (this.currentStepIndex < this.targetSequence.length) {
        // More steps remaining
        await this.showBriefFeedback('Goed!', 'success');
        this.startSearchStep();
      } else {
        // All steps completed - trial complete
        await this.completeTrialSuccess(responseTime);
      }
    } else {
      // Incorrect - trial failed
      await this.completeTrialFailure(responseTime, false);
    }
  }

  async handleTimeout() {
    // Stop timer
    this.stopTimer();

    // Disable all items
    const allItems = this.elements.searchDisplay.querySelectorAll('.search-item');
    allItems.forEach(el => el.classList.add('disabled'));

    // Highlight the target
    const targetEl = this.elements.searchDisplay.querySelector('[data-is-target="true"]');
    if (targetEl) {
      targetEl.classList.add('correct');
    }

    // Audio feedback
    if (window.AudioManager) {
      window.AudioManager.hapticError();
    }

    await this.sleep(500);
    await this.completeTrialFailure(this.timeLimit, true);
  }

  async showBriefFeedback(message, type) {
    // Show overlay feedback on search display
    UIComponents.showOverlayFeedback(this.elements.searchDisplay, message, type, { duration: 800 });

    await this.sleep(1000);
  }

  async completeTrialSuccess(finalResponseTime) {
    // Calculate score
    let trialScore = this.targetSequence.length * (this.config.scoring.pointsPerCorrectStep || 15);
    trialScore += this.config.scoring.bonusForFullSequence || 20;

    // Speed bonus
    if (finalResponseTime < this.config.scoring.speedThreshold) {
      trialScore += this.config.scoring.bonusForSpeed || 5;
    }

    this.score += trialScore;

    // Record trial
    const trialData = {
      difficulty: this.gridSize,
      gridSize: this.gridSize,
      totalItems: this.gridSize * this.gridSize,
      sequenceLength: this.targetSequence.length,
      targetSequence: this.targetSequence,
      correct: true,
      stepsFailed: 0,
      responseTime: finalResponseTime,
      timedOut: false,
      score: trialScore,
    };

    this.trials.push(trialData);

    if (!this.isPractice) {
      window.DataTracker.recordTrial(trialData);
    }

    // Update adaptive difficulty
    let difficultyAdjusted = false;
    this.consecutiveCorrect++;

    // After 2 consecutive correct answers, increase grid size
    if (this.consecutiveCorrect >= 2) {
      if (this.gridSize < this.maxGridSize) {
        this.gridSize++;
        difficultyAdjusted = true;
      }
      this.consecutiveCorrect = 0; // Reset counter
    }

    // Show success feedback
    await this.showTrialFeedback(true, difficultyAdjusted, trialScore);

    // Check if exercise complete
    if (this.currentTrial >= this.totalTrials) {
      await this.sleep(1000);
      this.endExercise();
    } else {
      // Continue to next trial
      await this.sleep(1000);
      this.startTrial();
    }
  }

  async completeTrialFailure(responseTime, timedOut) {
    // Record trial
    const trialData = {
      difficulty: this.gridSize,
      gridSize: this.gridSize,
      totalItems: this.gridSize * this.gridSize,
      sequenceLength: this.targetSequence.length,
      targetSequence: this.targetSequence,
      correct: false,
      stepsFailed: this.currentStepIndex,
      responseTime: responseTime,
      timedOut: timedOut,
      score: 0,
    };

    this.trials.push(trialData);

    if (!this.isPractice) {
      window.DataTracker.recordTrial(trialData);
    }

    // Reset consecutive correct on failure
    this.consecutiveCorrect = 0;

    // Show failure feedback
    await this.showTrialFeedback(false, false, 0);

    // Check if exercise complete
    if (this.currentTrial >= this.totalTrials) {
      await this.sleep(1000);
      this.endExercise();
    } else {
      // Continue to next trial
      await this.sleep(1500);
      this.startTrial();
    }
  }

  async showTrialFeedback(correct, difficultyAdjusted, trialScore) {
    let message, type;

    if (correct) {
      const messages = this.config.feedback?.sequenceComplete || ['Hele reeks correct!'];
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'success';
    } else {
      const messages = this.config.feedback?.incorrect || ['Niet helemaal'];
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'error';
    }

    // Show overlay feedback on search display
    UIComponents.showOverlayFeedback(this.elements.searchDisplay, message, type);

    // Audio feedback
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      try {
        await window.AudioManager.speak(message);
      } catch (error) {
        console.log('Speech unavailable:', error);
      }
    }

    await this.sleep(1500);
  }

  endExercise() {
    // Calculate final statistics
    const totalTrials = this.trials.length;
    const correctTrials = this.trials.filter(t => t.correct).length;
    const accuracy = correctTrials / totalTrials;
    const timeoutTrials = this.trials.filter(t => t.timedOut).length;

    const responseTimes = this.trials.filter(t => t.correct).map(t => t.responseTime);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0;

    // Get max grid size achieved
    const maxGridSize = Math.max(...this.trials.map(t => t.gridSize));

    const finalStats = {
      totalTrials: totalTrials,
      correctTrials: correctTrials,
      accuracy: accuracy,
      averageResponseTime: averageResponseTime,
      timeoutTrials: timeoutTrials,
      maxGridSize: maxGridSize,
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
      exercise: 'exercises/complex-dual-task/index.html',
      name: this.config.exerciseName,
      score: this.score,
      stats: JSON.stringify({
        totalTrials: stats.totalTrials,
        correctTrials: stats.correctTrials,
        accuracy: stats.accuracy,
        averageReactionTime: Math.round(stats.averageResponseTime),
        timeoutTrials: stats.timeoutTrials,
        maxGridSize: stats.maxGridSize,
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
        gridSize: this.gridSize,
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
    exerciseInstance = new ComplexDualTaskExercise();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExercise);
} else {
  initializeExercise();
}
