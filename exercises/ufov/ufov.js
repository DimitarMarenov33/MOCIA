/**
 * UFOV (USEFUL FIELD OF VIEW) EXERCISE
 * Processing speed and visual attention training
 */

class UFOVExercise {
  constructor() {
    this.config = null;
    this.isPractice = false;

    // Exercise state
    this.currentTrial = 0;
    this.totalTrials = 0;

    // Stimulus sets - randomly alternates between these
    this.stimulusSets = [
      {
        name: 'vehicles',
        targets: [
          { id: 'car', emoji: '🚗', label: 'Auto' },
          { id: 'bicycle', emoji: '🚲', label: 'Fiets' }
        ],
        peripheralEmoji: '🚗', // The one to find in periphery
        peripheralLabel: 'auto-icoontje'
      },
      {
        name: 'traffic',
        targets: [
          { id: 'stop', emoji: '🛑', label: 'Stop' },
          { id: 'warning', emoji: '⚠️', label: 'Waarschuwing' }
        ],
        peripheralEmoji: '🛑', // The one to find in periphery
        peripheralLabel: 'stopbord'
      }
    ];
    this.currentStimulusSet = null;

    // Current trial data
    this.currentCentralTarget = null;
    this.currentPeripheralPosition = null;
    this.currentDistractorPositions = [];

    // User responses
    this.centralResponse = null;
    this.peripheralResponse = null;

    // Difficulty adapter (manages presentation duration)
    this.difficultyAdapter = null;
    this.currentDuration = 500;

    // Timing
    this.trialStartTime = null;

    // Trial tracking
    this.trials = [];
    this.score = 0;

    // DOM elements
    this.screens = {};
    this.elements = {};

    this.init();
  }

  async init() {
    try {
      await this.loadConfig();
      this.cacheElements();
      this.setupEventListeners();
      this.loadSettings();
      this.createPeripheralZones();

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
      exerciseId: CONSTANTS.EXERCISE_TYPES.UFOV_BASIC,
      exerciseName: 'Snelle Herkenning (UFOV)',
      difficulty: 'medium',
      parameters: {
        variant: 'basic',
        startDuration: 500,
        minDuration: 100,
        maxDuration: 500,
        totalTrials: 15,
        fixationTime: 1000,
        practiceTrials: 3,
        numPeripheralPositions: 8,
        numDistractors: 4,
      },
      stimuli: {
        centralTargets: ['car', 'truck'],
        peripheralTarget: 'car',
        distractors: ['triangle', 'square', 'circle'],
      },
      scoring: {
        pointsForBothCorrect: 20,
        pointsForCentralCorrect: 10,
        pointsForPeripheralCorrect: 10,
      },
      feedback: {
        bothCorrect: ['Perfect! Beide correct!', 'Uitstekend!', 'Geweldig gedaan!'],
        centralCorrect: ['Goed! Midden juist, maar rand gemist'],
        peripheralCorrect: ['Bijna! Rand juist, maar midden gemist'],
        bothIncorrect: ['Probeer het nog eens', 'Blijf oefenen!'],
      },
    };
  }

  cacheElements() {
    this.screens = {
      exercise: document.getElementById('exercise-screen'),
    };

    this.elements = {
      // Trial info
      trialCounter: document.getElementById('trial-counter'),
      currentTrial: document.getElementById('current-trial'),
      totalTrials: document.getElementById('total-trials'),
      currentDuration: document.getElementById('current-duration'),
      progressContainer: document.getElementById('progress-container'),
      currentStats: document.getElementById('current-stats'),
      phaseIndicator: document.getElementById('phase-indicator'),
      // Display area
      displayArea: document.getElementById('display-area'),
      fixationCross: document.getElementById('fixation-cross'),
      centralStimulus: document.getElementById('central-stimulus'),
      centralIcon: document.getElementById('central-icon'),
      peripheralContainer: document.getElementById('peripheral-container'),
      peripheralResponseZones: document.getElementById('peripheral-response-zones'),
      // Response areas
      centralResponse: document.getElementById('central-response'),
      peripheralResponseInstruction: document.getElementById('peripheral-response-instruction'),
      // Response buttons
      firstButton: document.getElementById('car-button'),
      secondButton: document.getElementById('truck-button'),
      firstButtonIcon: document.querySelector('#car-button .response-icon'),
      firstButtonLabel: document.querySelector('#car-button .response-label'),
      secondButtonIcon: document.querySelector('#truck-button .response-icon'),
      secondButtonLabel: document.querySelector('#truck-button .response-label'),
    };
  }

  setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
      this.confirmExit();
    });

    // Central response buttons - use dynamic target IDs
    this.elements.firstButton.addEventListener('click', () => {
      if (this.currentStimulusSet) {
        this.handleCentralResponse(this.currentStimulusSet.targets[0].id);
      }
    });

    this.elements.secondButton.addEventListener('click', () => {
      if (this.currentStimulusSet) {
        this.handleCentralResponse(this.currentStimulusSet.targets[1].id);
      }
    });

    // Keyboard support for central response
    document.addEventListener('keydown', (e) => {
      if (!this.elements.centralResponse.classList.contains('hidden') && this.currentStimulusSet) {
        if (e.key === '1' || e.key === 'a' || e.key === 'A') {
          this.handleCentralResponse(this.currentStimulusSet.targets[0].id);
        } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
          this.handleCentralResponse(this.currentStimulusSet.targets[1].id);
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

  createPeripheralZones() {
    UIComponents.clearElement(this.elements.peripheralResponseZones);

    const numPositions = this.config.parameters.numPeripheralPositions || 8;

    for (let i = 0; i < numPositions; i++) {
      const zone = document.createElement('div');
      zone.className = 'response-zone';
      zone.setAttribute('data-position', i);
      zone.textContent = i + 1;
      zone.setAttribute('aria-label', `Position ${i + 1}`);

      zone.addEventListener('click', () => {
        this.handlePeripheralResponse(i);
      });

      this.elements.peripheralResponseZones.appendChild(zone);
    }
  }

  async startExercise() {
    // Prime audio system for iOS (user just navigated here)
    if (window.AudioManager) {
      window.AudioManager.prime();
    }

    // Show exercise screen
    this.screens.exercise.classList.remove('hidden');

    // Initialize state
    if (!this.isPractice) {
      this.totalTrials = this.config.parameters.totalTrials || 15;
    }

    this.currentTrial = 0;
    this.trials = [];
    this.score = 0;

    // Initialize difficulty adapter
    const variant = this.config.parameters.variant || 'basic';
    this.difficultyAdapter = new UFOVAdapter(variant);
    this.currentDuration = this.difficultyAdapter.getCurrentDifficulty();

    // Start data tracking
    if (!this.isPractice) {
      window.DataTracker.startSession(this.config.exerciseId, {
        initialDifficulty: this.currentDuration,
      });
    }

    // Update UI
    this.elements.totalTrials.textContent = this.totalTrials;
    this.updateDurationDisplay();
    this.updateProgressBar();
    this.updateCurrentStats();

    // Show practice indicator if needed
    if (this.isPractice) {
      const indicator = document.createElement('div');
      indicator.className = 'practice-indicator';
      indicator.textContent = '📝 Oefenmodus - Deze pogingen tellen niet mee';
      this.elements.progressContainer.parentNode.insertBefore(
        indicator,
        this.elements.progressContainer
      );
    }

    // Start first trial
    setTimeout(() => {
      this.startTrial();
    }, 2000);
  }

  async startTrial() {
    this.currentTrial++;
    this.trialStartTime = Date.now();

    // Update trial counter
    if (this.elements.trialCounter) {
      this.elements.trialCounter.textContent = `${this.currentTrial}/${this.totalTrials}`;
    }

    // Reset responses
    this.centralResponse = null;
    this.peripheralResponse = null;

    // Clear previous trial's highlighted peripheral zone to prevent cognitive load
    const zones = this.elements.peripheralResponseZones.querySelectorAll('.response-zone');
    zones.forEach(z => z.classList.remove('selected'));

    // Update UI
    this.elements.currentTrial.textContent = this.currentTrial;
    this.updateProgressBar();
    this.updateDurationDisplay();

    // Hide response areas
    this.elements.centralResponse.classList.add('hidden');
    this.elements.peripheralResponseInstruction.classList.add('hidden');
    this.elements.peripheralResponseZones.classList.remove('active');

    // Generate stimulus
    this.generateStimulus();

    // Phase 1: Show fixation cross
    this.elements.phaseIndicator.textContent = 'Kijk naar het kruisje...';
    await this.showFixation();

    // Phase 2: Show stimulus (brief)
    this.elements.phaseIndicator.textContent = '';
    await this.showStimulus();

    // Phase 3: Central response
    this.elements.phaseIndicator.textContent = 'Wat zag je in het midden?';
    this.showCentralResponse();
  }

  generateStimulus() {
    // Randomly select a stimulus set for this trial
    this.currentStimulusSet = this.stimulusSets[Math.floor(Math.random() * this.stimulusSets.length)];

    // Update response buttons with current set's options
    this.updateResponseButtons();

    // Central target - randomly pick one of the two targets in the set
    const targetIndex = Math.floor(Math.random() * this.currentStimulusSet.targets.length);
    this.currentCentralTarget = this.currentStimulusSet.targets[targetIndex].id;

    // Peripheral position
    const numPositions = this.config.parameters.numPeripheralPositions || 8;
    this.currentPeripheralPosition = Math.floor(Math.random() * numPositions);

    // Distractor positions (avoid peripheral target position)
    const numDistractors = this.config.parameters.numDistractors || 4;
    const availablePositions = Array.from({ length: numPositions }, (_, i) => i)
      .filter(p => p !== this.currentPeripheralPosition);

    this.currentDistractorPositions = [];
    for (let i = 0; i < numDistractors; i++) {
      if (availablePositions.length === 0) break;
      const index = Math.floor(Math.random() * availablePositions.length);
      this.currentDistractorPositions.push(availablePositions[index]);
      availablePositions.splice(index, 1);
    }
  }

  updateResponseButtons() {
    // Update first button
    this.elements.firstButtonIcon.textContent = this.currentStimulusSet.targets[0].emoji;
    this.elements.firstButtonLabel.textContent = this.currentStimulusSet.targets[0].label;

    // Update second button
    this.elements.secondButtonIcon.textContent = this.currentStimulusSet.targets[1].emoji;
    this.elements.secondButtonLabel.textContent = this.currentStimulusSet.targets[1].label;
  }

  async showFixation() {
    // Show fixation cross
    this.elements.fixationCross.style.display = 'block';
    this.elements.fixationCross.style.opacity = '1';

    await this.sleep(this.config.parameters.fixationTime || 1000);

    // Hide fixation cross
    this.elements.fixationCross.style.opacity = '0';
    await this.sleep(100);
    this.elements.fixationCross.style.display = 'none';
  }

  async showStimulus() {
    // Prepare central stimulus - find the target object for the current target ID
    const centralTargetObj = this.currentStimulusSet.targets.find(t => t.id === this.currentCentralTarget);
    this.elements.centralIcon.className = 'central-stimulus-icon';
    this.elements.centralIcon.textContent = centralTargetObj.emoji;

    // Prepare peripheral items
    UIComponents.clearElement(this.elements.peripheralContainer);

    // Add target - use the current set's peripheral emoji
    const target = document.createElement('div');
    target.className = 'peripheral-item peripheral-target';
    target.setAttribute('data-position', this.currentPeripheralPosition);
    target.textContent = this.currentStimulusSet.peripheralEmoji;
    this.elements.peripheralContainer.appendChild(target);

    // Add distractors
    const distractors = this.config.stimuli.distractors || ['triangle', 'square', 'circle'];
    this.currentDistractorPositions.forEach(pos => {
      const distractor = document.createElement('div');
      distractor.className = 'peripheral-item peripheral-distractor icon-' +
        distractors[Math.floor(Math.random() * distractors.length)];
      distractor.setAttribute('data-position', pos);
      this.elements.peripheralContainer.appendChild(distractor);
    });

    // Show stimuli (opacity 1)
    this.elements.centralStimulus.style.display = 'block';
    this.elements.centralStimulus.style.opacity = '1';
    this.elements.peripheralContainer.style.display = 'block';
    this.elements.peripheralContainer.style.opacity = '1';

    // Show for current duration
    await this.sleep(this.currentDuration);

    // Hide stimuli immediately (opacity 0)
    this.elements.centralStimulus.style.opacity = '0';
    this.elements.peripheralContainer.style.opacity = '0';

    // Wait a moment then hide display completely
    await this.sleep(100);
    this.elements.centralStimulus.style.display = 'none';
    this.elements.peripheralContainer.style.display = 'none';
  }

  showCentralResponse() {
    this.elements.centralResponse.classList.remove('hidden');
  }

  handleCentralResponse(response) {
    this.centralResponse = response;

    if (window.AudioManager) {
      window.AudioManager.hapticPress();
    }

    // Hide central response, show peripheral instruction with dynamic label
    this.elements.centralResponse.classList.add('hidden');
    this.elements.phaseIndicator.textContent = `Waar was het ${this.currentStimulusSet.peripheralLabel}?`;
    this.elements.peripheralResponseInstruction.classList.remove('hidden');
    this.elements.peripheralResponseZones.classList.add('active');
  }

  async handlePeripheralResponse(position) {
    this.peripheralResponse = position;

    if (window.AudioManager) {
      window.AudioManager.hapticPress();
    }

    // Mark selected zone
    const zones = this.elements.peripheralResponseZones.querySelectorAll('.response-zone');
    zones.forEach(z => z.classList.remove('selected'));
    zones[position].classList.add('selected');

    // Disable further clicking
    this.elements.peripheralResponseZones.classList.remove('active');

    // Process trial
    await this.sleep(500);
    await this.processTrial();
  }

  async processTrial() {
    const responseTime = Date.now() - this.trialStartTime;

    // Check correctness
    const centralCorrect = this.centralResponse === this.currentCentralTarget;
    const peripheralCorrect = this.peripheralResponse === this.currentPeripheralPosition;
    const bothCorrect = centralCorrect && peripheralCorrect;

    // Calculate score
    let trialScore = 0;
    if (bothCorrect) {
      trialScore = this.config.scoring.pointsForBothCorrect || 20;
    } else if (centralCorrect) {
      trialScore = this.config.scoring.pointsForCentralCorrect || 10;
    } else if (peripheralCorrect) {
      trialScore = this.config.scoring.pointsForPeripheralCorrect || 10;
    }

    this.score += trialScore;

    // Record trial
    const trialData = {
      difficulty: this.currentDuration,
      centralTarget: this.currentCentralTarget,
      peripheralPosition: this.currentPeripheralPosition,
      centralResponse: this.centralResponse,
      peripheralResponse: this.peripheralResponse,
      centralCorrect: centralCorrect,
      peripheralCorrect: peripheralCorrect,
      correct: bothCorrect,
      responseTime: responseTime,
      score: trialScore,
    };

    this.trials.push(trialData);

    if (!this.isPractice) {
      window.DataTracker.recordTrial(trialData);
    }

    // Update difficulty (based on combined accuracy)
    const difficultyResult = this.difficultyAdapter.processResult(bothCorrect);
    this.currentDuration = difficultyResult.currentDifficulty;

    // Show feedback
    await this.showFeedback(centralCorrect, peripheralCorrect, difficultyResult.adjusted);

    // Update stats
    this.updateCurrentStats();

    // Check if exercise complete
    if (this.currentTrial >= this.totalTrials) {
      await this.sleep(600);
      this.endExercise();
    } else {
      // Continue to next trial
      this.elements.peripheralResponseInstruction.classList.add('hidden');
      await this.sleep(600);
      this.startTrial();
    }
  }

  showCenteredFeedback(message, detail, type) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease;
    `;

    // Create feedback content
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-lg);
      text-align: center;
      max-width: 500px;
      box-shadow: var(--shadow-lg);
    `;

    // Determine color based on type
    let iconColor = 'var(--color-success)';
    let icon = '✓';
    if (type === 'error') {
      iconColor = 'var(--color-error)';
      icon = '✗';
    } else if (type === 'info') {
      iconColor = 'var(--color-info)';
      icon = 'ℹ';
    }

    content.innerHTML = `
      <div style="font-size: 64px; color: ${iconColor}; margin-bottom: var(--spacing-md);">${icon}</div>
      <div style="font-size: var(--font-size-xl); font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--color-text-primary);">
        ${message}
      </div>
      ${detail ? `<div style="font-size: var(--font-size-lg); color: var(--color-text-secondary);">${detail}</div>` : ''}
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Auto-remove after 600ms
    setTimeout(() => {
      overlay.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => overlay.remove(), 200);
    }, 600);
  }

  async showFeedback(centralCorrect, peripheralCorrect, difficultyAdjusted) {
    this.elements.phaseIndicator.textContent = '';

    // Get the label for the current central target
    const centralTargetObj = this.currentStimulusSet.targets.find(t => t.id === this.currentCentralTarget);
    const centralTargetLabel = centralTargetObj ? centralTargetObj.label.toLowerCase() : this.currentCentralTarget;

    let message, type, detail;

    if (centralCorrect && peripheralCorrect) {
      const messages = this.config.feedback?.bothCorrect || ['Perfect! Beide correct!'];
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'success';
      detail = null;
    } else if (centralCorrect) {
      const messages = this.config.feedback?.centralCorrect || ['Midden juist, maar rand gemist'];
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'info';
      detail = `Positie ${this.currentPeripheralPosition + 1}`;
    } else if (peripheralCorrect) {
      const messages = this.config.feedback?.peripheralCorrect || ['Rand juist, maar midden gemist'];
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'info';
      detail = `Was: ${centralTargetLabel}`;
    } else {
      const messages = this.config.feedback?.bothIncorrect || ['Probeer het nog eens'];
      message = messages[Math.floor(Math.random() * messages.length)];
      type = 'error';
      detail = `${centralTargetLabel}, positie ${this.currentPeripheralPosition + 1}`;
    }

    // Show overlay feedback on display area
    UIComponents.showOverlayFeedback(this.elements.displayArea, message, type, { detail });

    // Audio feedback
    if (window.AudioManager) {
      if (centralCorrect && peripheralCorrect) {
        window.AudioManager.hapticSuccess();
      } else {
        window.AudioManager.hapticError();
      }
    }
  }

  updateDurationDisplay() {
    this.elements.currentDuration.textContent = this.currentDuration;
  }

  updateProgressBar() {
    UIComponents.clearElement(this.elements.progressContainer);

    const progressBar = UIComponents.createProgressBar(
      this.currentTrial,
      this.totalTrials,
      { label: 'Voortgang' }
    );

    this.elements.progressContainer.appendChild(progressBar);
  }

  updateCurrentStats() {
    if (this.trials.length === 0) {
      UIComponents.clearElement(this.elements.currentStats);
      return;
    }

    const centralAccuracy = this.trials.filter(t => t.centralCorrect).length / this.trials.length;
    const peripheralAccuracy = this.trials.filter(t => t.peripheralCorrect).length / this.trials.length;
    const fastestTime = this.difficultyAdapter.getFastestTime();

    const stats = [
      { label: 'Score', value: this.score },
      { label: 'Centrale Taak', value: Statistics.formatPercentage(centralAccuracy) },
      { label: 'Perifere Taak', value: Statistics.formatPercentage(peripheralAccuracy) },
      { label: 'Snelste Tijd', value: `${fastestTime}ms` },
    ];

    const statsPanel = UIComponents.createStatsPanel(stats);

    UIComponents.clearElement(this.elements.currentStats);
    this.elements.currentStats.appendChild(statsPanel);
  }

  endExercise() {
    // Calculate final statistics
    const threshold = this.difficultyAdapter.getThreshold();
    const centralAccuracy = this.trials.filter(t => t.centralCorrect).length / this.trials.length;
    const peripheralAccuracy = this.trials.filter(t => t.peripheralCorrect).length / this.trials.length;
    const overallAccuracy = this.trials.filter(t => t.correct).length / this.trials.length;

    const finalStats = {
      threshold: threshold,
      fastestTime: this.difficultyAdapter.getFastestTime(),
      centralAccuracy: centralAccuracy,
      peripheralAccuracy: peripheralAccuracy,
      overallAccuracy: overallAccuracy,
      score: this.score,
      totalTrials: this.trials.length,
    };

    // End session and save
    if (!this.isPractice) {
      window.DataTracker.endSession(finalStats);
    }

    // Show results
    this.showResults(finalStats);
  }

  showResults(stats) {
    // Navigate to results page with stats as URL parameters
    const params = new URLSearchParams({
      exercise: 'exercises/ufov/index.html',
      name: this.config.exerciseName,
      score: this.score,
      stats: JSON.stringify({
        totalTrials: stats.totalTrials,
        accuracy: stats.overallAccuracy,
        centralAccuracy: stats.centralAccuracy,
        peripheralAccuracy: stats.peripheralAccuracy,
        finalDuration: stats.threshold,
        averageReactionTime: stats.fastestTime,
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
    const inProgress = !this.screens.exercise.classList.contains('hidden') && this.currentTrial > 0;

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
        currentDuration: this.currentDuration,
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
    exerciseInstance = new UFOVExercise();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExercise);
} else {
  initializeExercise();
}
