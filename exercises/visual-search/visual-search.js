/**
 * VISUAL SEARCH TASK EXERCISE
 * Attention training through target identification
 */

console.log('[VS] Script loaded');

class VisualSearchExercise {
  constructor() {
    console.log('[VS] Constructor started');
    this.config = null;
    this.isPractice = false;

    // Exercise state
    this.currentTrial = 0;
    this.totalTrials = 0;

    // Current trial data
    this.targetAnimal = null;
    this.targetPosition = null;
    this.items = [];
    this.animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];

    // Adaptive difficulty
    this.gridSize = 3; // Start at 3x3
    this.maxGridSize = 7; // Maximum 7x7 (49 items)
    this.consecutiveCorrect = 0;

    // Timer
    this.timeLimit = 3000; // milliseconds
    this.timerInterval = null;
    this.trialStartTime = null;
    this.timeRemaining = 0;

    // Trial tracking
    this.trials = [];
    this.score = 0;

    // Difficulty adapter
    this.difficultyAdapter = null;

    // DOM elements
    this.elements = {};

    this.init();
  }

  async init() {
    console.log('[VS] init() started');
    try {
      console.log('[VS] Loading config...');
      await this.loadConfig();
      console.log('[VS] Config loaded:', this.config?.exerciseId);

      console.log('[VS] Caching elements...');
      this.cacheElements();
      console.log('[VS] Elements cached:', Object.keys(this.elements));

      console.log('[VS] Setting up event listeners...');
      this.setupEventListeners();
      console.log('[VS] Event listeners set up');

      console.log('[VS] Loading settings...');
      this.loadSettings();
      console.log('[VS] Settings loaded');

      // Auto-start exercise immediately (no welcome screen)
      console.log('[VS] Starting exercise...');
      this.startExercise();
      console.log('[VS] Exercise started');
    } catch (error) {
      console.error('[VS] Initialization error:', error);
      console.error('[VS] Error stack:', error.stack);
      alert('Er is een fout opgetreden bij het laden van de oefening.');
    }
  }

  async loadConfig() {
    // Embedded configuration
    this.config = {
      exerciseId: CONSTANTS.EXERCISE_TYPES.VISUAL_SEARCH,
      exerciseName: 'Visuele Zoektaak',
      difficulty: 'medium',
      parameters: {
        totalTrials: 20,
        minDistractors: 8,
        maxDistractors: 8,
        startDistractors: 8,
        minTimeLimit: 2000,
        maxTimeLimit: 4000,
        startTimeLimit: 3000,
        targetPreviewDuration: 2000, // Show target for 2 seconds
      },
      scoring: {
        pointsForCorrect: 10,
        bonusForSpeed: 5, // Extra points for fast responses
        speedThreshold: 1500, // milliseconds
      },
      feedback: {
        correct: ['Correct!', 'Goed gevonden!', 'Perfect!', 'Uitstekend!'],
        incorrect: ['Niet helemaal', 'Probeer het opnieuw!', 'Bijna!'],
        timeout: ['Te langzaam!', 'Tijd is op!', 'Sneller reageren!'],
      },
    };
  }

  cacheElements() {
    this.elements = {
      trialCounter: document.getElementById('trial-counter'),
      timerDisplay: document.getElementById('timer-display'),
      targetPreview: document.getElementById('target-preview'),
      targetPreviewIcon: document.getElementById('target-preview-icon'),
      instructionPrompt: document.getElementById('instruction-prompt'),
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
    console.log('[VS] startExercise() entered');

    // Speak instructions (fire and forget - don't await to match iOS gesture pattern)
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      window.AudioManager.speak('Zoek het juiste object. De oefening begint.');
    }

    // Initialize state
    this.totalTrials = this.config.parameters.totalTrials || 20;
    this.currentTrial = 0;
    this.trials = [];
    this.score = 0;
    console.log('[VS] State initialized, totalTrials:', this.totalTrials);

    // Initialize adaptive difficulty
    this.gridSize = 3;
    this.consecutiveCorrect = 0;
    this.timeLimit = this.config.parameters.startTimeLimit || 3000;
    console.log('[VS] Difficulty initialized, gridSize:', this.gridSize);

    // Start data tracking
    if (!this.isPractice) {
      console.log('[VS] Starting data tracking session...');
      window.DataTracker.startSession(this.config.exerciseId, {
        initialDifficulty: this.gridSize,
        initialGridSize: this.gridSize,
      });
      console.log('[VS] Data tracking session started');
    }

    // Start first trial
    console.log('[VS] Scheduling first trial in 1500ms...');
    setTimeout(() => {
      console.log('[VS] setTimeout fired, calling startTrial()');
      this.startTrial();
    }, 1500);
    console.log('[VS] startExercise() completed, waiting for setTimeout');
  }

  async startTrial() {
    console.log('[VS] startTrial() entered, currentTrial will be:', this.currentTrial + 1);
    try {
      this.currentTrial++;

      // Update trial counter
      console.log('[VS] Updating trial counter...');
      this.elements.trialCounter.textContent = `Poging ${this.currentTrial}/${this.totalTrials}`;
      console.log('[VS] Trial counter updated');

      // Clear previous trial's search matrix to prevent cognitive load
      console.log('[VS] Clearing search display...');
      UIComponents.clearElement(this.elements.searchDisplay);
      console.log('[VS] Search display cleared');

      // Hide instruction prompt from previous trial
      this.elements.instructionPrompt.classList.add('hidden');

      // Clear feedback
      UIComponents.clearElement(this.elements.feedbackArea);

      // Generate trial
      console.log('[VS] Generating trial...');
      this.generateTrial();
      console.log('[VS] Trial generated, target:', this.targetAnimal, 'gridSize:', this.gridSize);

      // Show target preview
      console.log('[VS] Showing target preview...');
      await this.showTargetPreview();
      console.log('[VS] Target preview done');

      // Hide target preview, show search items
      console.log('[VS] Hiding preview, preparing to display items...');
      this.elements.targetPreview.classList.add('hidden');
      this.elements.instructionPrompt.classList.remove('hidden');

      // Display search items
      console.log('[VS] Displaying search items...');
      this.displaySearchItems();
      console.log('[VS] Search items displayed');

      // Start timer and trial timing
      console.log('[VS] Starting timer...');
      this.trialStartTime = Date.now();
      this.startTimer();
      console.log('[VS] Timer started, trial active');
    } catch (error) {
      console.error('[VS] ERROR in startTrial:', error);
      console.error('[VS] Error stack:', error.stack);
    }
  }

  generateTrial() {
    // Select random target animal
    this.targetAnimal = this.animals[Math.floor(Math.random() * this.animals.length)];

    // Total items = gridSize * gridSize
    const totalItems = this.gridSize * this.gridSize;

    // Random target position
    this.targetPosition = Math.floor(Math.random() * totalItems);

    // Get available animals (excluding target)
    const availableAnimals = this.animals.filter(a => a !== this.targetAnimal);

    // Generate item list
    this.items = [];
    for (let i = 0; i < totalItems; i++) {
      if (i === this.targetPosition) {
        // This is the target
        this.items.push({ animal: this.targetAnimal, isTarget: true, index: i });
      } else {
        // Random distractor animal (not the target)
        const randomAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
        this.items.push({ animal: randomAnimal, isTarget: false, index: i });
      }
    }
  }

  async showTargetPreview() {
    console.log('[VS] showTargetPreview() entered');
    console.log('[VS] targetPreview element:', this.elements.targetPreview);
    console.log('[VS] targetPreviewIcon element:', this.elements.targetPreviewIcon);

    // Show target preview
    this.elements.targetPreview.classList.remove('hidden');
    console.log('[VS] targetPreview hidden class removed, classList:', this.elements.targetPreview.classList.toString());

    this.elements.targetPreviewIcon.textContent = this.targetAnimal;
    console.log('[VS] targetPreviewIcon textContent set to:', this.targetAnimal);

    this.elements.instructionPrompt.classList.add('hidden');

    // Speak target animal
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      try {
        await window.AudioManager.speak('Onthoud dit dier');
      } catch (error) {
        console.log('[VS] Speech unavailable:', error);
      }
    }

    // Wait for preview duration
    const duration = this.config.parameters.targetPreviewDuration || 2000;
    console.log('[VS] Waiting for preview duration:', duration, 'ms');
    await this.sleep(duration);
    console.log('[VS] Preview duration complete');
  }

  displaySearchItems() {
    console.log('[VS] displaySearchItems() entered');
    console.log('[VS] searchDisplay element:', this.elements.searchDisplay);
    console.log('[VS] items to display:', this.items.length);

    UIComponents.clearElement(this.elements.searchDisplay);

    // Update grid template columns dynamically based on gridSize
    this.elements.searchDisplay.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    console.log('[VS] Grid template set:', this.elements.searchDisplay.style.gridTemplateColumns);

    // Calculate font size dynamically based on container size and grid
    // Get the container's actual width
    const containerWidth = this.elements.searchDisplay.offsetWidth;
    const padding = 16; // Account for container padding
    const gap = 4 * (this.gridSize - 1); // Account for gaps between items
    const availableWidth = containerWidth - padding - gap;
    const cellSize = availableWidth / this.gridSize;

    // Font size should be roughly 70% of cell size for good fit
    let fontSize = Math.floor(cellSize * 0.65);
    // Clamp font size between 20px and 64px
    fontSize = Math.max(20, Math.min(64, fontSize));

    console.log('[VS] Container width:', containerWidth, 'Cell size:', cellSize, 'Font size:', fontSize);

    // Display items in grid (CSS handles the layout)
    this.items.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'search-item animate-fade-in';
      itemEl.setAttribute('data-index', index);
      itemEl.setAttribute('data-is-target', item.isTarget);
      itemEl.textContent = item.animal;
      itemEl.style.fontSize = `${fontSize}px`;

      // Add click handler
      itemEl.addEventListener('click', () => {
        this.handleItemClick(item, itemEl);
      });

      this.elements.searchDisplay.appendChild(itemEl);
    });

    console.log('[VS] All items appended. searchDisplay childCount:', this.elements.searchDisplay.childElementCount);
    console.log('[VS] searchDisplay visibility:', window.getComputedStyle(this.elements.searchDisplay).display);
    console.log('[VS] searchDisplay dimensions:', this.elements.searchDisplay.offsetWidth, 'x', this.elements.searchDisplay.offsetHeight);
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
      difficulty: this.gridSize,
      gridSize: this.gridSize,
      totalItems: this.gridSize * this.gridSize,
      targetAnimal: this.targetAnimal,
      correct: correct,
      responseTime: responseTime,
      timedOut: false,
      score: trialScore,
    };

    this.trials.push(trialData);

    if (!this.isPractice) {
      window.DataTracker.recordTrial(trialData);
    }

    // Update adaptive difficulty
    let difficultyAdjusted = false;
    if (correct) {
      this.consecutiveCorrect++;

      // After 2 consecutive correct answers, increase grid size
      if (this.consecutiveCorrect >= 2) {
        if (this.gridSize < this.maxGridSize) {
          this.gridSize++;
          difficultyAdjusted = true;
        }
        this.consecutiveCorrect = 0; // Reset counter
      }
    } else {
      // Reset consecutive counter on incorrect
      this.consecutiveCorrect = 0;
    }

    // Show feedback
    await this.showFeedback(correct, responseTime, difficultyAdjusted);

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

    // Record trial
    const trialData = {
      difficulty: this.gridSize,
      gridSize: this.gridSize,
      totalItems: this.gridSize * this.gridSize,
      targetAnimal: this.targetAnimal,
      correct: false,
      responseTime: this.timeLimit,
      timedOut: true,
      score: 0,
    };

    this.trials.push(trialData);

    if (!this.isPractice) {
      window.DataTracker.recordTrial(trialData);
    }

    // Reset consecutive correct on timeout
    this.consecutiveCorrect = 0;

    // Show timeout feedback
    await this.showTimeoutFeedback(false);

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

  async showFeedback(correct, responseTime, difficultyAdjusted) {
    let message, type;

    if (correct) {
      const messages = this.config.feedback?.correct || ['Correct!'];
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'success';
    } else {
      const messages = this.config.feedback?.incorrect || ['Niet helemaal'];
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'error';
    }

    // Show feedback as overlay on the grid
    this.showGridOverlayFeedback(message, type);

    // Audio feedback
    if (window.AudioManager) {
      if (correct) {
        window.AudioManager.hapticSuccess();
      } else {
        window.AudioManager.hapticError();
      }

      try {
        await window.AudioManager.speak(message);
      } catch (error) {
        console.log('Speech unavailable:', error);
      }
    }

    await this.sleep(1500);
  }

  async showTimeoutFeedback(difficultyAdjusted) {
    const messages = this.config.feedback?.timeout || ['Te langzaam!'];
    const message = messages[Math.floor(Math.random() * messages.length)];

    // Show feedback as overlay on the grid
    this.showGridOverlayFeedback(message, 'error');

    // Audio feedback
    if (window.AudioManager) {
      window.AudioManager.hapticError();
      try {
        await window.AudioManager.speak(message);
      } catch (error) {
        console.log('Speech unavailable:', error);
      }
    }

    await this.sleep(1500);
  }

  showGridOverlayFeedback(message, type) {
    // Use the shared UIComponents overlay feedback
    UIComponents.showOverlayFeedback(this.elements.searchDisplay, message, type);
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
      exercise: 'exercises/visual-search/index.html',
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
console.log('[VS] Setting up initialization, readyState:', document.readyState);
let exerciseInstance = null;

function initializeExercise() {
  console.log('[VS] initializeExercise() called');
  if (exerciseInstance === null) {
    console.log('[VS] Creating new VisualSearchExercise instance');
    exerciseInstance = new VisualSearchExercise();
    console.log('[VS] Instance created:', exerciseInstance ? 'success' : 'failed');
  } else {
    console.log('[VS] Instance already exists, skipping');
  }
}

if (document.readyState === 'loading') {
  console.log('[VS] DOM still loading, adding DOMContentLoaded listener');
  document.addEventListener('DOMContentLoaded', initializeExercise);
} else {
  console.log('[VS] DOM already loaded, initializing immediately');
  initializeExercise();
}
