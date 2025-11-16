/**
 * STROOP COLOR-WORD TASK EXERCISE
 * Executive function training through inhibition control
 */

class StroopExercise {
  constructor() {
    this.config = null;
    this.isPractice = false;

    // Exercise state
    this.currentTrial = 0;
    this.totalTrials = 0;

    // Current trial data
    this.currentWord = null;
    this.currentInkColor = null;
    this.currentCondition = null; // 'congruent', 'neutral', 'incongruent'
    this.correctColor = null;
    this.buttonColors = [];

    // Colors
    this.colors = [
      { name: 'ROOD', value: 'red', cssClass: 'color-red' },
      { name: 'BLAUW', value: 'blue', cssClass: 'color-blue' },
      { name: 'GROEN', value: 'green', cssClass: 'color-green' },
      { name: 'GEEL', value: 'yellow', cssClass: 'color-yellow' },
      { name: 'ZWART', value: 'black', cssClass: 'color-black' },
      { name: 'WIT', value: 'white', cssClass: 'color-white' },
      { name: 'PAARS', value: 'purple', cssClass: 'color-purple' },
      { name: 'ORANJE', value: 'orange', cssClass: 'color-orange' },
    ];


    // Adaptive timing
    this.timeLimit = 3000; // Start at 3 seconds
    this.minTimeLimit = 1000; // Minimum 1 second
    this.maxTimeLimit = 5000; // Maximum 5 seconds
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
      exerciseName: 'Stroop Kleur-Woord Taak',
      difficulty: 'easy',
      parameters: {
        totalTrials: 30,
        startTimeLimit: 3000,
        minTimeLimit: 1000,
        maxTimeLimit: 5000,
        timeAdjustment: 200, // Adjust time by 200ms
        congruentProbability: 0.30, // 30% congruent (easier)
        incongruentProbability: 0.70, // 70% incongruent (harder - the main challenge)
      },
      scoring: {
        pointsForCorrect: 10,
        bonusForSpeed: 5,
        speedThreshold: 1500, // milliseconds
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
      colorWord: document.getElementById('color-word'),
      button1: document.getElementById('button-1'),
      button2: document.getElementById('button-2'),
      button3: document.getElementById('button-3'),
      feedbackArea: document.getElementById('feedback-area'),
    };
  }

  setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
      this.confirmExit();
    });

    // Response buttons
    this.elements.button1.addEventListener('click', () => {
      this.handleResponse(0);
    });

    this.elements.button2.addEventListener('click', () => {
      this.handleResponse(1);
    });

    this.elements.button3.addEventListener('click', () => {
      this.handleResponse(2);
    });

    // Keyboard support (1, 2, 3)
    document.addEventListener('keydown', (e) => {
      if (this.timerInterval && !this.elements.button1.classList.contains('disabled')) {
        if (e.key === '1') {
          this.handleResponse(0);
        } else if (e.key === '2') {
          this.handleResponse(1);
        } else if (e.key === '3') {
          this.handleResponse(2);
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

    // Speak instructions
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      try {
        await window.AudioManager.speak('Stroop taak. Kies de kleur van het woord, niet wat het woord zegt.');
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
    // Determine condition: only congruent or incongruent
    const rand = Math.random();
    const congruentProb = this.config.parameters.congruentProbability;

    if (rand < congruentProb) {
      // Congruent: word and ink color match
      this.currentCondition = 'congruent';
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.currentWord = color.name;
      this.currentInkColor = color.value;
      this.correctColor = color.value;
    } else {
      // Incongruent: word and ink color differ
      this.currentCondition = 'incongruent';
      const wordColor = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.currentWord = wordColor.name;

      // Pick different ink color
      const availableColors = this.colors.filter(c => c.value !== wordColor.value);
      const inkColor = availableColors[Math.floor(Math.random() * availableColors.length)];
      this.currentInkColor = inkColor.value;
      this.correctColor = inkColor.value;
    }

    // Generate 3 button colors based on condition
    const correctColorObj = this.colors.find(c => c.value === this.correctColor);

    if (this.currentCondition === 'incongruent') {
      // Incongruent: Include word color, ink color (correct), and 1 random
      const wordColorObj = this.colors.find(c => c.name === this.currentWord);
      const otherColors = this.colors.filter(c => c.value !== this.correctColor && c.value !== wordColorObj.value);
      const randomDistractor = otherColors[Math.floor(Math.random() * otherColors.length)];

      // Randomly position the 3 colors
      this.buttonColors = [correctColorObj, wordColorObj, randomDistractor].sort(() => Math.random() - 0.5);
    } else {
      // Congruent: word and ink match, so add 2 random distractors
      const otherColors = this.colors.filter(c => c.value !== this.correctColor);
      const shuffled = [...otherColors].sort(() => Math.random() - 0.5);
      const distractor1 = shuffled[0];
      const distractor2 = shuffled[1];

      // Randomly position the correct answer
      this.buttonColors = [correctColorObj, distractor1, distractor2].sort(() => Math.random() - 0.5);
    }
  }

  async displayStimulus() {
    // Set word text
    this.elements.colorWord.textContent = this.currentWord;

    // Set ink color
    const colorObj = this.colors.find(c => c.value === this.currentInkColor);
    if (colorObj) {
      this.elements.colorWord.style.color = colorObj.value;
    }

    // Speak the word aloud
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      try {
        await window.AudioManager.speak(this.currentWord);
      } catch (error) {
        console.log('Speech unavailable:', error);
      }
    }
  }

  displayResponseButtons() {
    const buttons = [this.elements.button1, this.elements.button2, this.elements.button3];

    buttons.forEach((btn, index) => {
      const color = this.buttonColors[index];

      // Reset classes
      btn.className = 'response-button';
      btn.classList.add(color.cssClass);
      btn.setAttribute('data-color', color.value);

      // Enable button
      btn.classList.remove('disabled');
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

    // Get selected color
    const selectedColor = this.buttonColors[buttonIndex].value;

    // Check if correct
    const correct = selectedColor === this.correctColor;

    // Disable all buttons
    const buttons = [this.elements.button1, this.elements.button2, this.elements.button3];
    buttons.forEach(btn => btn.classList.add('disabled'));

    // Visual feedback
    if (correct) {
      buttons[buttonIndex].classList.add('correct');
    } else {
      buttons[buttonIndex].classList.add('incorrect');
      // Highlight correct answer
      const correctIndex = this.buttonColors.findIndex(c => c.value === this.correctColor);
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
      condition: this.currentCondition,
      word: this.currentWord,
      inkColor: this.currentInkColor,
      selectedColor: selectedColor,
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

    // Show feedback
    await this.showFeedback(correct, responseTime);

    // Check if exercise complete
    if (this.currentTrial >= this.totalTrials) {
      await this.sleep(1000);
      this.endExercise();
    } else {
      // Continue to next trial
      await this.sleep(800);
      this.startTrial();
    }
  }

  async handleTimeout() {
    // Stop timer
    this.stopTimer();

    // Disable all buttons
    const buttons = [this.elements.button1, this.elements.button2, this.elements.button3];
    buttons.forEach(btn => btn.classList.add('disabled'));

    // Highlight correct answer
    const correctIndex = this.buttonColors.findIndex(c => c.value === this.correctColor);
    buttons[correctIndex].classList.add('correct');

    // Record trial
    const trialData = {
      condition: this.currentCondition,
      word: this.currentWord,
      inkColor: this.currentInkColor,
      selectedColor: null,
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

    // Show timeout feedback
    await this.showTimeoutFeedback();

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
    // Just audio feedback, no visual feedback panel
    if (window.AudioManager) {
      if (correct) {
        window.AudioManager.hapticSuccess();
      } else {
        window.AudioManager.hapticError();
      }
    }

    // Show time adjustment indicator next to timer
    if (this.timeAdjusted) {
      this.showTimeAdjustmentIndicator(correct);
    }

    await this.sleep(400);
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
    // Just audio feedback for timeout
    if (window.AudioManager) {
      window.AudioManager.hapticError();
    }

    // Show time adjustment indicator if applicable
    if (this.timeAdjusted) {
      this.showTimeAdjustmentIndicator(false);
    }

    await this.sleep(800);
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
    exerciseInstance = new StroopExercise();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExercise);
} else {
  initializeExercise();
}
