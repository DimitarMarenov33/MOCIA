/**
 * VISUAL SEARCH TASK EXERCISE
 * Attention training through target identification
 */

class VisualSearchExercise {
  constructor() {
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
    // Initialize state
    this.totalTrials = this.config.parameters.totalTrials || 20;
    this.currentTrial = 0;
    this.trials = [];
    this.score = 0;

    // Initialize adaptive difficulty
    this.gridSize = 3;
    this.consecutiveCorrect = 0;
    this.timeLimit = this.config.parameters.startTimeLimit || 3000;

    // Start data tracking
    if (!this.isPractice) {
      window.DataTracker.startSession(this.config.exerciseId, {
        initialDifficulty: this.gridSize,
        initialGridSize: this.gridSize,
      });
    }

    // Speak instructions
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      try {
        await window.AudioManager.speak('Zoek het juiste object. De oefening begint.');
      } catch (error) {
        console.log('Speech unavailable:', error);
      }
    }

    // Start first trial
    setTimeout(() => {
      this.startTrial();
    }, 1500);
  }

  async startTrial() {
    this.currentTrial++;

    // Update trial counter
    this.elements.trialCounter.textContent = `Poging ${this.currentTrial}/${this.totalTrials}`;

    // Clear previous trial's search matrix to prevent cognitive load
    UIComponents.clearElement(this.elements.searchDisplay);

    // Hide instruction prompt from previous trial
    this.elements.instructionPrompt.classList.add('hidden');

    // Clear feedback
    UIComponents.clearElement(this.elements.feedbackArea);

    // Generate trial
    this.generateTrial();

    // Show target preview
    await this.showTargetPreview();

    // Hide target preview, show search items
    this.elements.targetPreview.classList.add('hidden');
    this.elements.instructionPrompt.classList.remove('hidden');

    // Display search items
    this.displaySearchItems();

    // Start timer and trial timing
    this.trialStartTime = Date.now();
    this.startTimer();
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
    // Show target preview
    this.elements.targetPreview.classList.remove('hidden');
    this.elements.targetPreviewIcon.textContent = this.targetAnimal;
    this.elements.instructionPrompt.classList.add('hidden');

    // Speak target animal
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      try {
        await window.AudioManager.speak('Onthoud dit dier');
      } catch (error) {
        console.log('Speech unavailable:', error);
      }
    }

    // Wait for preview duration
    await this.sleep(this.config.parameters.targetPreviewDuration || 2000);
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
      itemEl.textContent = item.animal;
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
    UIComponents.clearElement(this.elements.feedbackArea);

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

    const feedbackPanel = UIComponents.createFeedbackPanel(message, type);
    this.elements.feedbackArea.appendChild(feedbackPanel);

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

    await this.sleep(2000);
  }

  async showTimeoutFeedback(difficultyAdjusted) {
    UIComponents.clearElement(this.elements.feedbackArea);

    const messages = this.config.feedback?.timeout || ['Te langzaam!'];
    const message = messages[Math.floor(Math.random() * messages.length)];

    const feedbackPanel = UIComponents.createFeedbackPanel(message, 'error');
    this.elements.feedbackArea.appendChild(feedbackPanel);

    // Audio feedback
    if (window.AudioManager) {
      window.AudioManager.hapticError();
      try {
        await window.AudioManager.speak(message);
      } catch (error) {
        console.log('Speech unavailable:', error);
      }
    }

    await this.sleep(2000);
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

    window.location.href = `../../results.html?${params.toString()}`;
  }

  confirmExit() {
    const inProgress = this.currentTrial > 0 && this.currentTrial < this.totalTrials;

    if (inProgress && !this.isPractice) {
      const confirmed = confirm(
        'Je bent nog bezig met de oefening. Wil je echt stoppen? Je voortgang gaat verloren.'
      );
      if (!confirmed) return;
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
    exerciseInstance = new VisualSearchExercise();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExercise);
} else {
  initializeExercise();
}
