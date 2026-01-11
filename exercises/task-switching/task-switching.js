/**
 * TASK-SWITCHING PARADIGM EXERCISE
 * Executive function training through cognitive flexibility
 * Uses day + time stimuli with TIME (before/after 12:00) and DAY (weekday/weekend) tasks
 */

class TaskSwitchingExercise {
  constructor() {
    this.config = null;
    this.isPractice = false;

    // Exercise state
    this.currentTrial = 0;
    this.totalTrials = 0;
    this.currentBlock = 0;

    // Task types
    this.TASKS = {
      TIME: 'time',       // Is the time before or after 12:00?
      DAY_TYPE: 'day_type', // Is it a weekday or weekend?
    };

    // Current trial data
    this.currentTask = null;
    this.previousTask = null;
    this.currentDay = null;
    this.currentHour = null;
    this.currentMinute = null;
    this.isSwitch = false;

    // Days of the week (Dutch)
    this.days = [
      { name: 'Maandag', isWeekend: false },
      { name: 'Dinsdag', isWeekend: false },
      { name: 'Woensdag', isWeekend: false },
      { name: 'Donderdag', isWeekend: false },
      { name: 'Vrijdag', isWeekend: false },
      { name: 'Zaterdag', isWeekend: true },
      { name: 'Zondag', isWeekend: true },
    ];

    // Track last stimulus to avoid repetition
    this.lastDayIndex = null;
    this.lastTimeCategory = null; // 'before' or 'after'

    // Adaptive CTI (Cue-Target Interval)
    this.cti = 800; // Start at 800ms
    this.minCTI = 150;
    this.maxCTI = 1000;
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;

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
      exerciseId: CONSTANTS.EXERCISE_TYPES.TASK_SWITCHING,
      exerciseName: 'Taak-Wissel Oefening',
      difficulty: 'hard',
      parameters: {
        singleTaskBlockSize: 10, // 10 trials per single-task block
        mixedTaskTrials: 30, // 30 mixed-task trials
        startCTI: 800,
        minCTI: 150,
        maxCTI: 1000,
        ctiAdjustment: 100,
        responseTimeLimit: 3000,
      },
      scoring: {
        pointsForCorrect: 10,
        bonusForSwitch: 5,
        bonusForSpeed: 3,
        speedThreshold: 800,
      },
      feedback: {
        correct: ['Correct!', 'Goed!', 'Prima!'],
        incorrect: ['Fout', 'Niet juist', 'Probeer opnieuw'],
      },
    };
  }

  cacheElements() {
    this.elements = {
      blockLabel: document.getElementById('block-label'),
      trialCounter: document.getElementById('trial-counter'),
      cueDisplay: document.getElementById('cue-display'),
      cueText: document.getElementById('cue-text'),
      stimulusDisplay: document.getElementById('stimulus-display'),
      numberDisplay: document.getElementById('number-display'),
      buttonLeft: document.getElementById('button-left'),
      buttonRight: document.getElementById('button-right'),
      feedbackArea: document.getElementById('feedback-area'),
    };
  }

  setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
      this.confirmExit();
    });

    // Response buttons
    this.elements.buttonLeft.addEventListener('click', () => {
      this.handleResponse('left');
    });

    this.elements.buttonRight.addEventListener('click', () => {
      this.handleResponse('right');
    });

    // Keyboard support (Z for left, M for right)
    document.addEventListener('keydown', (e) => {
      if (!this.elements.buttonLeft.classList.contains('disabled')) {
        if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowLeft') {
          this.handleResponse('left');
        } else if (e.key === 'm' || e.key === 'M' || e.key === 'ArrowRight') {
          this.handleResponse('right');
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
    // Calculate total trials
    const singleTaskSize = this.config.parameters.singleTaskBlockSize;
    const mixedTaskSize = this.config.parameters.mixedTaskTrials;
    this.totalTrials = (singleTaskSize * 2) + mixedTaskSize; // 10 + 10 + 30 = 50 trials

    this.currentTrial = 0;
    this.currentBlock = 0;
    this.trials = [];
    this.score = 0;

    // Initialize adaptive CTI
    this.cti = this.config.parameters.startCTI || 800;
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;

    // Start data tracking
    if (!this.isPractice) {
      window.DataTracker.startSession(this.config.exerciseId, {
        initialCTI: this.cti,
      });
    }

    // Speak instructions
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      try {
        await window.AudioManager.speak('Taak-wissel oefening. Let op de dag en tijd. Wissel tussen taken.');
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

    // Determine block type and task
    this.determineBlockAndTask();

    // Update block label
    this.updateBlockLabel();

    // Generate day + time stimulus
    this.generateStimulus();

    // Hide number and buttons initially
    this.elements.numberDisplay.classList.remove('visible');
    this.elements.buttonLeft.classList.add('hidden');
    this.elements.buttonRight.classList.add('hidden');

    // Show cue
    await this.showCue();

    // Wait for CTI
    await this.sleep(this.cti);

    // Show number and buttons
    this.showStimulus();

    // Record trial start time
    this.trialStartTime = Date.now();
  }

  determineBlockAndTask() {
    const singleTaskSize = this.config.parameters.singleTaskBlockSize;

    if (this.currentTrial <= singleTaskSize) {
      // Block 1: TIME task only (before/after 12:00)
      this.currentBlock = 1;
      this.currentTask = this.TASKS.TIME;
      this.isSwitch = false;
    } else if (this.currentTrial <= singleTaskSize * 2) {
      // Block 2: DAY_TYPE task only (weekday/weekend)
      this.currentBlock = 2;
      this.currentTask = this.TASKS.DAY_TYPE;
      this.isSwitch = false;
    } else {
      // Block 3: Mixed tasks
      this.currentBlock = 3;

      // Randomly select task
      this.currentTask = Math.random() < 0.5 ? this.TASKS.TIME : this.TASKS.DAY_TYPE;

      // Determine if this is a switch trial
      this.isSwitch = this.previousTask !== null && this.currentTask !== this.previousTask;
    }

    // Store previous task for next trial
    this.previousTask = this.currentTask;
  }

  updateBlockLabel() {
    if (this.currentBlock === 1) {
      this.elements.blockLabel.textContent = 'Blok: TIJD';
      this.elements.blockLabel.classList.remove('mixed');
    } else if (this.currentBlock === 2) {
      this.elements.blockLabel.textContent = 'Blok: DAG';
      this.elements.blockLabel.classList.remove('mixed');
    } else {
      this.elements.blockLabel.textContent = 'Blok: GEMENGD';
      this.elements.blockLabel.classList.add('mixed');
    }
  }

  generateStimulus() {
    // Generate a random day, avoiding immediate repetition
    let availableDays = this.days.map((d, i) => i);
    if (this.lastDayIndex !== null) {
      availableDays = availableDays.filter(i => i !== this.lastDayIndex);
    }
    const dayIndex = availableDays[Math.floor(Math.random() * availableDays.length)];
    this.currentDay = this.days[dayIndex];
    this.lastDayIndex = dayIndex;

    // Generate a random time, avoiding same category (before/after 12)
    // Hours: 0-23, but we'll use 6-22 for realistic times
    let hour;
    const targetCategory = this.lastTimeCategory === 'before' ? 'after' :
                          this.lastTimeCategory === 'after' ? 'before' :
                          (Math.random() < 0.5 ? 'before' : 'after');

    if (targetCategory === 'before') {
      // 6:00 - 11:59
      hour = Math.floor(Math.random() * 6) + 6; // 6-11
    } else {
      // 12:00 - 22:59
      hour = Math.floor(Math.random() * 11) + 12; // 12-22
    }

    this.currentHour = hour;
    this.currentMinute = Math.floor(Math.random() * 60);
    this.lastTimeCategory = hour < 12 ? 'before' : 'after';
  }

  async showCue() {
    // Set cue text based on task
    if (this.currentTask === this.TASKS.TIME) {
      this.elements.cueText.textContent = 'VOOR of NA 12:00?';
    } else {
      this.elements.cueText.textContent = 'WEEKDAG of WEEKEND?';
    }

    // Show cue with animation
    this.elements.cueText.classList.add('visible');
  }

  showStimulus() {
    // Format the time as HH:MM
    const timeStr = `${this.currentHour.toString().padStart(2, '0')}:${this.currentMinute.toString().padStart(2, '0')}`;

    // Show day + time
    this.elements.numberDisplay.textContent = `${this.currentDay.name} ${timeStr}`;
    this.elements.numberDisplay.classList.add('visible');

    // Set button labels based on task
    if (this.currentTask === this.TASKS.TIME) {
      this.elements.buttonLeft.querySelector('.button-text').textContent = '< 12:00';
      this.elements.buttonRight.querySelector('.button-text').textContent = '> 12:00';
    } else {
      this.elements.buttonLeft.querySelector('.button-text').textContent = 'Weekdag';
      this.elements.buttonRight.querySelector('.button-text').textContent = 'Weekend';
    }

    // Show buttons
    this.elements.buttonLeft.classList.remove('hidden', 'disabled');
    this.elements.buttonRight.classList.remove('hidden', 'disabled');
  }

  async handleResponse(side) {
    // Disable buttons
    this.elements.buttonLeft.classList.add('disabled');
    this.elements.buttonRight.classList.add('disabled');

    // Calculate response time
    const responseTime = Date.now() - this.trialStartTime;

    // Determine if correct
    const correct = this.isResponseCorrect(side);

    // Visual feedback on button
    const clickedButton = side === 'left' ? this.elements.buttonLeft : this.elements.buttonRight;
    if (correct) {
      clickedButton.classList.add('correct');
    } else {
      clickedButton.classList.add('incorrect');
    }

    // Show overlay feedback on stimulus display
    const message = correct
      ? (this.config.feedback?.correct?.[Math.floor(Math.random() * this.config.feedback.correct.length)] || 'Correct!')
      : (this.config.feedback?.incorrect?.[Math.floor(Math.random() * this.config.feedback.incorrect.length)] || 'Niet juist');
    UIComponents.showOverlayFeedback(this.elements.stimulusDisplay, message, correct ? 'success' : 'error');

    // Calculate score
    let trialScore = 0;
    if (correct) {
      trialScore = this.config.scoring.pointsForCorrect || 10;

      // Bonus for switch trial
      if (this.isSwitch) {
        trialScore += this.config.scoring.bonusForSwitch || 5;
      }

      // Speed bonus
      if (responseTime < this.config.scoring.speedThreshold) {
        trialScore += this.config.scoring.bonusForSpeed || 3;
      }
    }
    this.score += trialScore;

    // Record trial
    const trialData = {
      block: this.currentBlock,
      task: this.currentTask,
      day: this.currentDay.name,
      time: `${this.currentHour.toString().padStart(2, '0')}:${this.currentMinute.toString().padStart(2, '0')}`,
      isWeekend: this.currentDay.isWeekend,
      isBefore12: this.currentHour < 12,
      isSwitch: this.isSwitch,
      response: side,
      correct: correct,
      responseTime: responseTime,
      cti: this.cti,
      score: trialScore,
    };

    this.trials.push(trialData);

    if (!this.isPractice) {
      window.DataTracker.recordTrial(trialData);
    }

    // Update adaptive CTI (only in mixed block)
    if (this.currentBlock === 3) {
      this.updateAdaptiveCTI(correct);
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

    // Reset display
    this.resetDisplay();

    // Check if exercise complete
    if (this.currentTrial >= this.totalTrials) {
      await this.sleep(500);
      this.endExercise();
    } else {
      // Continue to next trial
      await this.sleep(300);
      this.startTrial();
    }
  }

  isResponseCorrect(side) {
    if (this.currentTask === this.TASKS.TIME) {
      // TIME task: Is the time before 12:00?
      const isBefore12 = this.currentHour < 12;
      // Left = < 12:00 (before), Right = > 12:00 (after)
      return (side === 'left' && isBefore12) || (side === 'right' && !isBefore12);
    } else {
      // DAY_TYPE task: Is it a weekday?
      const isWeekday = !this.currentDay.isWeekend;
      // Left = Weekdag, Right = Weekend
      return (side === 'left' && isWeekday) || (side === 'right' && !isWeekday);
    }
  }

  updateAdaptiveCTI(correct) {
    const adjustment = this.config.parameters.ctiAdjustment || 100;

    if (correct) {
      this.consecutiveCorrect++;
      this.consecutiveIncorrect = 0;

      // After 2 consecutive correct, decrease CTI (make harder - less prep time)
      if (this.consecutiveCorrect >= 2) {
        this.cti = Math.max(this.minCTI, this.cti - adjustment);
        this.consecutiveCorrect = 0;
      }
    } else {
      this.consecutiveIncorrect++;
      this.consecutiveCorrect = 0;

      // After 2 consecutive incorrect, increase CTI (make easier - more prep time)
      if (this.consecutiveIncorrect >= 2) {
        this.cti = Math.min(this.maxCTI, this.cti + adjustment);
        this.consecutiveIncorrect = 0;
      }
    }
  }

  resetDisplay() {
    // Hide cue
    this.elements.cueText.classList.remove('visible');

    // Hide number
    this.elements.numberDisplay.classList.remove('visible');

    // Reset buttons
    this.elements.buttonLeft.classList.remove('correct', 'incorrect');
    this.elements.buttonRight.classList.remove('correct', 'incorrect');
  }

  endExercise() {
    // Calculate final statistics
    const totalTrials = this.trials.length;
    const correctTrials = this.trials.filter(t => t.correct).length;
    const accuracy = correctTrials / totalTrials;

    // Switch vs repeat performance
    const switchTrials = this.trials.filter(t => t.isSwitch);
    const repeatTrials = this.trials.filter(t => !t.isSwitch && t.block === 3); // Only from mixed block

    const switchAccuracy = switchTrials.length > 0
      ? switchTrials.filter(t => t.correct).length / switchTrials.length
      : 0;
    const repeatAccuracy = repeatTrials.length > 0
      ? repeatTrials.filter(t => t.correct).length / repeatTrials.length
      : 0;

    // Calculate switch cost
    const switchCorrectRT = switchTrials.filter(t => t.correct).map(t => t.responseTime);
    const repeatCorrectRT = repeatTrials.filter(t => t.correct).map(t => t.responseTime);

    const avgSwitchRT = switchCorrectRT.length > 0
      ? switchCorrectRT.reduce((sum, t) => sum + t, 0) / switchCorrectRT.length
      : 0;
    const avgRepeatRT = repeatCorrectRT.length > 0
      ? repeatCorrectRT.reduce((sum, t) => sum + t, 0) / repeatCorrectRT.length
      : 0;

    const switchCost = avgSwitchRT - avgRepeatRT; // Positive = slower on switches

    const responseTimes = this.trials.filter(t => t.correct).map(t => t.responseTime);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0;

    const finalStats = {
      totalTrials: totalTrials,
      correctTrials: correctTrials,
      accuracy: accuracy,
      switchAccuracy: switchAccuracy,
      repeatAccuracy: repeatAccuracy,
      switchCost: switchCost,
      averageResponseTime: averageResponseTime,
      finalCTI: this.cti,
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
      exercise: 'exercises/task-switching/index.html',
      name: this.config.exerciseName,
      score: this.score,
      stats: JSON.stringify({
        totalTrials: stats.totalTrials,
        correctTrials: stats.correctTrials,
        accuracy: stats.accuracy,
        switchAccuracy: stats.switchAccuracy,
        repeatAccuracy: stats.repeatAccuracy,
        switchCost: Math.round(stats.switchCost),
        averageReactionTime: Math.round(stats.averageResponseTime),
        finalCTI: stats.finalCTI,
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
        currentBlock: this.currentBlock,
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
    exerciseInstance = new TaskSwitchingExercise();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExercise);
} else {
  initializeExercise();
}
