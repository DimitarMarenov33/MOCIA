/**
 * DUAL N-BACK EXERCISE (Minimal Cognitive Load Version)
 * Advanced working memory training with dual task (visual + auditory)
 * Redesigned for mobile-first with minimal UI
 */

class DualNBackExercise {
  constructor() {
    this.config = null;

    // Exercise state
    this.currentN = 2;
    this.currentBlock = 0;
    this.totalBlocks = 0;
    this.currentTrial = 0;
    this.trialsPerBlock = 25;

    // Stimulus history
    this.positionHistory = [];
    this.letterHistory = [];

    // Response tracking
    this.positionPressed = false;
    this.soundPressed = false;

    // Block tracking
    this.blockResults = [];
    this.currentBlockTrials = [];

    // Timing
    this.trialStartTime = null;
    this.stimulusTimeout = null;
    this.responseWindowTimeout = null;

    // Difficulty adapter
    this.difficultyAdapter = new DualNBackAdapter();

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
      this.createGrid();

      // Register screens
      window.ScreenManager.registerAll('screen');

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
      exerciseId: CONSTANTS.EXERCISE_TYPES.DUAL_N_BACK,

      parameters: {
        startN: 2,
        minN: 1,
        maxN: 9,
        trialsPerBlock: 25,
        blocksPerSession: 3,
        stimulusDuration: 1000,
        interStimulusInterval: 4000,
        matchProbability: 0.30, // 30% chance of creating a match
        letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T'],
      },

      adaptiveDifficulty: {
        increaseThreshold: 0.90,
        decreaseThreshold: 0.70,
        blocksBeforeAdjustment: 1,
      },

      scoring: {
        pointsPerCorrectResponse: 10,
        pointsPerBlock: 50,
        bonusForHighN: 100,
      },

      feedback: {
        blockExcellent: 'Uitstekend! Je prestaties zijn geweldig!',
        blockGood: 'Goed gedaan! Je maakt vooruitgang.',
        blockNeedsImprovement: 'Blijf oefenen! Het wordt makkelijker.',
        sessionComplete: 'Sessie voltooid! Goed gedaan!',
      },
    };
  }

  cacheElements() {
    this.elements = {
      // Exercise screen
      nLevelIndicator: document.getElementById('n-level-indicator'),
      trialCounter: document.getElementById('trial-counter'),
      progressBar: document.getElementById('progress-bar'),
      grid: document.getElementById('n-back-grid'),
      positionButton: document.getElementById('position-button'),
      soundButton: document.getElementById('sound-button'),
      // Block results
      completedBlockNumber: document.getElementById('completed-block-number'),
      blockAccuracy: document.getElementById('block-accuracy'),
      performanceFeedback: document.getElementById('performance-feedback'),
      difficultyFeedback: document.getElementById('difficulty-feedback'),
      // Break screen
      breakTimer: document.getElementById('break-timer'),
    };
  }

  setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
      this.confirmExit();
    });

    // Response buttons
    this.elements.positionButton.addEventListener('click', () => {
      this.handlePositionResponse();
    });

    this.elements.soundButton.addEventListener('click', () => {
      this.handleSoundResponse();
    });

    // Block results
    document.getElementById('continue-button').addEventListener('click', () => {
      this.continueToNextBlock();
    });

    document.getElementById('end-early-button').addEventListener('click', () => {
      this.endExerciseEarly();
    });

    // Break screen
    document.getElementById('skip-break-button').addEventListener('click', () => {
      this.skipBreak();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      const exerciseActive = !document.getElementById('exercise-screen').classList.contains('screen-hidden');
      if (!exerciseActive) return;

      // 'A' or Left Arrow for position
      if ((e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') &&
          !this.elements.positionButton.disabled) {
        this.handlePositionResponse();
      }
      // 'L' or Right Arrow for sound
      else if ((e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight') &&
               !this.elements.soundButton.disabled) {
        this.handleSoundResponse();
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

  createGrid() {
    UIComponents.clearElement(this.elements.grid);

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.setAttribute('data-position', i);
      cell.setAttribute('aria-label', `Grid position ${i + 1}`);
      this.elements.grid.appendChild(cell);
    }
  }

  showTutorial() {
    const tutorialContainer = document.getElementById('tutorial-screen');
    UIComponents.clearElement(tutorialContainer);

    const tutorialSteps = [
      {
        visual: '<div style="font-size: 64px;">🎯</div>',
        content: '<p>Let op het <strong>blauwe vierkant</strong> dat over het raster beweegt.</p>',
      },
      {
        visual: '<div style="font-size: 64px;">🔊</div>',
        content: '<p>Luister naar de <strong>letters</strong> die worden uitgesproken.</p>',
      },
      {
        visual: '<div style="font-size: 48px; font-weight: bold;">N = 2</div>',
        content: '<p>Bij <strong>2-back</strong> vergelijk je de huidige stimulus met die van <strong>2 stappen geleden</strong>.</p>',
      },
      {
        visual: '<div style="font-size: 64px;">📍</div>',
        content: '<p>Druk op <strong>"Positie Match"</strong> als het vierkant op dezelfde plek verschijnt als N stappen geleden.</p>',
      },
      {
        visual: '<div style="font-size: 64px;">🔊</div>',
        content: '<p>Druk op <strong>"Geluid Match"</strong> als je dezelfde letter hoort als N stappen geleden.</p>',
      },
      {
        visual: '<div style="font-size: 64px;">✓✓</div>',
        content: '<p><strong>Beide</strong> kunnen tegelijk matchen - druk dan op <strong>beide knoppen</strong>!</p>',
      },
    ];

    const stepper = UIComponents.createTutorialStepper({
      steps: tutorialSteps,
      onComplete: () => {
        this.startExercise();
      },
    });

    tutorialContainer.appendChild(stepper.element);
    window.ScreenManager.navigate('tutorial-screen');
  }

  async startExercise() {
    // Speak instructions (fire and forget - don't await to match iOS gesture pattern)
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      window.AudioManager.speak(`We beginnen met ${this.config.parameters.startN || 2}-back. Let goed op.`);
    }

    // Initialize state
    this.currentN = this.config.parameters.startN || CONSTANTS.DUAL_N_BACK.START_N;
    this.trialsPerBlock = this.config.parameters.trialsPerBlock || CONSTANTS.DUAL_N_BACK.TRIALS_PER_BLOCK;
    this.totalBlocks = this.config.parameters.blocksPerSession || CONSTANTS.DUAL_N_BACK.BLOCKS_PER_SESSION;
    this.currentBlock = 0;
    this.blockResults = [];

    // Initialize difficulty adapter
    this.difficultyAdapter.initialize({
      initial: this.currentN,
      min: this.config.parameters.minN || CONSTANTS.DUAL_N_BACK.MIN_N,
      max: this.config.parameters.maxN || CONSTANTS.DUAL_N_BACK.MAX_N,
    });

    // Start data tracking
    window.DataTracker.startSession(this.config.exerciseId, {
      initialDifficulty: this.currentN,
    });

    // Update UI
    this.updateNLevelDisplay();

    // Show exercise screen
    window.ScreenManager.navigate('exercise-screen');

    // Start first block
    setTimeout(() => {
      this.startBlock();
    }, 2000);
  }

  async startBlock() {
    this.currentBlock++;
    this.currentTrial = 0;
    this.currentBlockTrials = [];
    this.positionHistory = [];
    this.letterHistory = [];

    // Update UI
    this.updateProgressBar();

    if (window.AudioManager && window.AudioManager.isEnabled()) {
      await window.AudioManager.speak(`Blok ${this.currentBlock} begint`);
    }

    await this.sleep(1000);
    this.startTrial();
  }

  async startTrial() {
    this.currentTrial++;
    this.trialStartTime = Date.now();
    this.positionPressed = false;
    this.soundPressed = false;

    // Update UI
    this.elements.trialCounter.textContent = `Poging ${this.currentTrial} van ${this.trialsPerBlock}`;
    this.updateProgressBar();

    // Generate stimulus
    const position = this.generatePosition();
    const letter = this.generateLetter();

    // Add to history
    this.positionHistory.push(position);
    this.letterHistory.push(letter);

    // Determine if this is a match
    const positionMatch = this.isPositionMatch();
    const soundMatch = this.isSoundMatch();

    // Show stimulus
    await this.showStimulus(position, letter);

    // Enable response buttons (unless warmup)
    const isWarmup = this.currentTrial <= this.currentN;
    if (!isWarmup) {
      this.enableResponseButtons();
    }

    // Wait for response window
    await this.sleep(this.config.parameters.interStimulusInterval || CONSTANTS.DUAL_N_BACK.INTER_STIMULUS_INTERVAL);

    // Process responses
    this.processTrialResult(positionMatch, soundMatch, isWarmup);

    // Check if block is complete
    if (this.currentTrial >= this.trialsPerBlock) {
      await this.sleep(500);
      this.endBlock();
    } else {
      // Continue to next trial
      this.startTrial();
    }
  }

  generatePosition() {
    // Check if we can create a match (need enough history)
    const canMatch = this.positionHistory.length >= this.currentN;
    const matchProbability = this.config.parameters.matchProbability || 0.30;

    // With matchProbability chance, create a match if possible
    if (canMatch && Math.random() < matchProbability) {
      // Return the position from N trials ago to create a match
      return this.positionHistory[this.positionHistory.length - this.currentN];
    }

    // Otherwise, generate random position 0-8
    return Math.floor(Math.random() * 9);
  }

  generateLetter() {
    // Check if we can create a match (need enough history)
    const canMatch = this.letterHistory.length >= this.currentN;
    const matchProbability = this.config.parameters.matchProbability || 0.30;

    // With matchProbability chance, create a match if possible
    if (canMatch && Math.random() < matchProbability) {
      // Return the letter from N trials ago to create a match
      return this.letterHistory[this.letterHistory.length - this.currentN];
    }

    // Otherwise, generate random letter
    const letters = this.config.parameters.letters || CONSTANTS.DUAL_N_BACK.LETTERS;
    return letters[Math.floor(Math.random() * letters.length)];
  }

  isPositionMatch() {
    if (this.positionHistory.length <= this.currentN) {
      return false;
    }
    const nBack = this.positionHistory[this.positionHistory.length - this.currentN - 1];
    const current = this.positionHistory[this.positionHistory.length - 1];
    return nBack === current;
  }

  isSoundMatch() {
    if (this.letterHistory.length <= this.currentN) {
      return false;
    }
    const nBack = this.letterHistory[this.letterHistory.length - this.currentN - 1];
    const current = this.letterHistory[this.letterHistory.length - 1];
    return nBack === current;
  }

  async showStimulus(position, letter) {
    // Highlight grid cell
    const cells = this.elements.grid.querySelectorAll('.grid-cell');
    cells.forEach(cell => cell.classList.remove('active'));
    cells[position].classList.add('active');

    // Speak letter
    if (window.AudioManager) {
      window.AudioManager.speak(letter, { priority: true });
    }

    // Show for stimulus duration
    await this.sleep(this.config.parameters.stimulusDuration || CONSTANTS.DUAL_N_BACK.STIMULUS_DURATION);

    // Remove highlight
    cells[position].classList.remove('active');
  }

  enableResponseButtons() {
    this.elements.positionButton.disabled = false;
    this.elements.soundButton.disabled = false;
  }

  disableResponseButtons() {
    this.elements.positionButton.disabled = true;
    this.elements.soundButton.disabled = true;
  }

  handlePositionResponse() {
    if (!this.positionPressed) {
      this.positionPressed = true;
      this.elements.positionButton.classList.add('pressed');

      if (window.AudioManager) {
        window.AudioManager.hapticPress();
      }

      setTimeout(() => {
        this.elements.positionButton.classList.remove('pressed');
      }, 300);
    }
  }

  handleSoundResponse() {
    if (!this.soundPressed) {
      this.soundPressed = true;
      this.elements.soundButton.classList.add('pressed');

      if (window.AudioManager) {
        window.AudioManager.hapticPress();
      }

      setTimeout(() => {
        this.elements.soundButton.classList.remove('pressed');
      }, 300);
    }
  }

  processTrialResult(positionMatch, soundMatch, isWarmup) {
    this.disableResponseButtons();

    if (isWarmup) {
      // Don't record warmup trials
      return;
    }

    const responseTime = Date.now() - this.trialStartTime;

    // Determine correctness
    const positionCorrect = (positionMatch && this.positionPressed) ||
                           (!positionMatch && !this.positionPressed);
    const soundCorrect = (soundMatch && this.soundPressed) ||
                        (!soundMatch && !this.soundPressed);
    const overallCorrect = positionCorrect && soundCorrect;

    // Record trial
    const trialData = {
      difficulty: this.currentN,
      trialNumber: this.currentTrial,
      position: this.positionHistory[this.positionHistory.length - 1],
      letter: this.letterHistory[this.letterHistory.length - 1],
      positionMatch: positionMatch,
      soundMatch: soundMatch,
      positionPressed: this.positionPressed,
      soundPressed: this.soundPressed,
      positionCorrect: positionCorrect,
      soundCorrect: soundCorrect,
      correct: overallCorrect,
      responseTime: responseTime,
    };

    this.currentBlockTrials.push(trialData);
    window.DataTracker.recordTrial(trialData);

    // Update difficulty adapter
    this.difficultyAdapter.processResult(overallCorrect);
  }

  endBlock() {
    // Calculate block statistics
    const stats = this.calculateBlockStats();
    this.blockResults.push(stats);

    // Update current N based on performance
    const difficultyChange = this.updateDifficulty(stats.overallAccuracy);

    // Show block results
    this.showBlockResults(stats, difficultyChange);
  }

  calculateBlockStats() {
    const validTrials = this.currentBlockTrials.filter(t =>
      t.trialNumber > this.currentN
    );

    if (validTrials.length === 0) {
      return {
        overallAccuracy: 0,
        positionAccuracy: 0,
        soundAccuracy: 0,
        totalTrials: 0,
      };
    }

    const positionCorrect = validTrials.filter(t => t.positionCorrect).length;
    const soundCorrect = validTrials.filter(t => t.soundCorrect).length;
    const overallCorrect = validTrials.filter(t => t.correct).length;

    return {
      overallAccuracy: overallCorrect / validTrials.length,
      positionAccuracy: positionCorrect / validTrials.length,
      soundAccuracy: soundCorrect / validTrials.length,
      totalTrials: validTrials.length,
      blockNumber: this.currentBlock,
      nLevel: this.currentN,
    };
  }

  updateDifficulty(accuracy) {
    const previousN = this.currentN;
    const result = this.difficultyAdapter.processBlock(accuracy);

    this.currentN = result.currentDifficulty;
    this.updateNLevelDisplay();

    if (result.adjusted) {
      return {
        changed: true,
        increased: this.currentN > previousN,
        previousN: previousN,
        newN: this.currentN,
      };
    }

    return { changed: false };
  }

  updateNLevelDisplay() {
    this.elements.nLevelIndicator.textContent = `${this.currentN}-Back`;
  }

  updateProgressBar() {
    const percentage = (this.currentTrial / this.trialsPerBlock) * 100;
    this.elements.progressBar.style.width = `${percentage}%`;
  }

  async showBlockResults(stats, difficultyChange) {
    // Update display
    this.elements.completedBlockNumber.textContent = this.currentBlock;

    const accuracyPct = Math.round(stats.overallAccuracy * 100);
    this.elements.blockAccuracy.textContent = `${accuracyPct}%`;

    // Performance feedback
    let feedback = '';
    if (stats.overallAccuracy >= 0.90) {
      feedback = this.config.feedback?.blockExcellent || 'Uitstekend!';
    } else if (stats.overallAccuracy >= 0.70) {
      feedback = this.config.feedback?.blockGood || 'Goed gedaan!';
    } else {
      feedback = this.config.feedback?.blockNeedsImprovement || 'Blijf oefenen!';
    }
    this.elements.performanceFeedback.textContent = feedback;

    // Difficulty change feedback
    UIComponents.clearElement(this.elements.difficultyFeedback);
    if (difficultyChange.changed) {
      if (difficultyChange.increased) {
        this.elements.difficultyFeedback.textContent = `🎉 Niveau verhoogd naar ${difficultyChange.newN}-back!`;
        this.elements.difficultyFeedback.style.color = 'var(--color-success)';
      } else {
        this.elements.difficultyFeedback.textContent = `Niveau verlaagd naar ${difficultyChange.newN}-back`;
        this.elements.difficultyFeedback.style.color = 'var(--color-info)';
      }
    }

    // Show screen
    window.ScreenManager.navigate('block-results-screen');

    // Speak results
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      await window.AudioManager.speak(
        `Blok ${this.currentBlock} voltooid. Nauwkeurigheid: ${accuracyPct} procent. ${feedback}`
      );

      if (difficultyChange.changed) {
        await this.sleep(500);
        await window.AudioManager.speak(
          difficultyChange.increased
            ? `Goed gedaan! Niveau verhoogd naar ${difficultyChange.newN}-back`
            : `Niveau verlaagd naar ${difficultyChange.newN}-back`
        );
      }
    }
  }

  async continueToNextBlock() {
    // Check if session is complete
    if (this.currentBlock >= this.totalBlocks) {
      this.endExercise();
      return;
    }

    // Show break screen every 5 blocks
    if (this.currentBlock % 5 === 0 && this.currentBlock < this.totalBlocks) {
      this.showBreakScreen();
    } else {
      // Continue immediately
      window.ScreenManager.navigate('exercise-screen');
      await this.sleep(1000);
      this.startBlock();
    }
  }

  showBreakScreen() {
    window.ScreenManager.navigate('break-screen');

    let timeLeft = 30;
    this.elements.breakTimer.textContent = timeLeft;

    const breakInterval = setInterval(() => {
      timeLeft--;
      this.elements.breakTimer.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(breakInterval);
        this.skipBreak();
      }
    }, 1000);

    // Store interval so we can clear it if skipped
    this.breakInterval = breakInterval;

    if (window.AudioManager && window.AudioManager.isEnabled()) {
      window.AudioManager.speak('Pauze tijd. Neem even rust.');
    }
  }

  skipBreak() {
    if (this.breakInterval) {
      clearInterval(this.breakInterval);
      this.breakInterval = null;
    }

    window.ScreenManager.navigate('exercise-screen');

    setTimeout(() => {
      this.startBlock();
    }, 1000);
  }

  endExerciseEarly() {
    const confirmed = confirm(
      'Weet je zeker dat je wilt stoppen? Je voortgang tot nu toe wordt opgeslagen.'
    );

    if (confirmed) {
      this.endExercise();
    }
  }

  endExercise() {
    // Calculate final statistics
    const maxN = this.difficultyAdapter.getMaxNBack();
    const overallAccuracy = this.calculateOverallAccuracy();

    const finalStats = {
      maxNBack: maxN,
      blocksCompleted: this.currentBlock,
      overallAccuracy: overallAccuracy,
      blockResults: this.blockResults,
    };

    // End session and save
    window.DataTracker.endSession(finalStats);

    // Show results
    this.showResults(finalStats);
  }

  calculateOverallAccuracy() {
    if (this.blockResults.length === 0) return 0;

    const totalAccuracy = this.blockResults.reduce((sum, block) =>
      sum + block.overallAccuracy, 0
    );

    return totalAccuracy / this.blockResults.length;
  }

  showResults(stats) {
    // Navigate to results page with stats as URL parameters
    const params = new URLSearchParams({
      exercise: 'exercises/dual-n-back/index.html',
      name: this.config.exerciseName,
      score: this.score,
      stats: JSON.stringify({
        totalTrials: stats.totalTrials,
        accuracy: stats.overallAccuracy,
        visualAccuracy: stats.visualAccuracy,
        audioAccuracy: stats.audioAccuracy,
        finalNLevel: stats.maxNBack,
        averageReactionTime: Math.round(stats.averageResponseTime || 0),
      })
    });

    const resultsUrl = `../../results.html?${params.toString()}`;

    // Show feedback modal before navigating to results
    if (window.FeedbackModal) {
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
    const exerciseActive = !document.getElementById('exercise-screen').classList.contains('screen-hidden');
    const inProgress = exerciseActive && this.currentBlock > 0;

    if (inProgress) {
      const confirmed = confirm(
        'Je bent nog bezig met de oefening. Wil je echt stoppen?'
      );
      if (!confirmed) return;

      // Save abandoned session with exit info
      window.DataTracker.abandonSession({
        reason: 'user_exit',
        currentTrial: this.currentTrial,
        currentBlock: this.currentBlock,
        totalBlocks: this.totalBlocks,
        currentN: this.currentN,
        score: this.score
      });
    }

    window.location.href = '../../index.html';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize exercise when DOM is ready (with guard against double initialization)
let exerciseInstance = null;

function initializeExercise() {
  if (exerciseInstance === null) {
    exerciseInstance = new DualNBackExercise();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExercise);
} else {
  initializeExercise();
}
