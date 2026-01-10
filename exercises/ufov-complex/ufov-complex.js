/**
 * UFOV COMPLEX EXERCISE
 * Advanced processing speed training with complex distractors
 */

class UFOVComplexExercise {
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
        peripheralEmoji: '🚗',
        peripheralLabel: 'auto-icoontje'
      },
      {
        name: 'traffic',
        targets: [
          { id: 'stop', emoji: '🛑', label: 'Stop' },
          { id: 'warning', emoji: '⚠️', label: 'Waarschuwing' }
        ],
        peripheralEmoji: '🛑',
        peripheralLabel: 'stopbord'
      }
    ];
    this.currentStimulusSet = null;

    // Current trial data
    this.currentCentralTarget = null;
    this.currentPeripheralPosition = null;
    this.currentDistractorPositions = [];
    this.currentDistractorTypes = [];

    // User responses
    this.centralResponse = null;
    this.peripheralResponse = null;

    // Difficulty adapter (manages presentation duration)
    this.difficultyAdapter = null;
    this.currentDuration = 100;

    // Timing
    this.trialStartTime = null;

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
      this.createPeripheralZones();

      // Auto-start exercise immediately (no welcome screen)
      this.startExercise();
    } catch (error) {
      console.error('Initialization error:', error);
      alert('Er is een fout opgetreden bij het laden van de oefening.');
    }
  }

  async loadConfig() {
    // Embedded configuration for complex level
    this.config = {
      exerciseId: CONSTANTS.EXERCISE_TYPES.UFOV_COMPLEX,
      exerciseName: 'UFOV Complex Niveau',
      difficulty: 'hard',
      parameters: {
        variant: 'complex',
        startDuration: 100,
        minDuration: 16,
        maxDuration: 100,
        totalTrials: 20,
        fixationTime: 800,
        numPeripheralPositions: 8,
        minDistractors: 8,
        maxDistractors: 12,
      },
      stimuli: {
        centralTargets: ['🚗', '🚚'],
        peripheralTarget: '🚗',
        distractors: ['🔺', '🔶', '⬛', '⭕', '🔻', '🔸', '⬜', '⚪'],
      },
      scoring: {
        pointsForBothCorrect: 30,
        pointsForCentralCorrect: 15,
        pointsForPeripheralCorrect: 15,
        bonusForFast: 10,
      },
      feedback: {
        bothCorrect: ['Perfect! Beide correct!', 'Uitstekend!', 'Geweldig gedaan!', 'Fantastisch!'],
        centralCorrect: ['Goed! Midden juist, maar rand gemist'],
        peripheralCorrect: ['Bijna! Rand juist, maar midden gemist'],
        bothIncorrect: ['Probeer het nog eens', 'Blijf oefenen!', 'Focus op beide taken'],
      },
    };
  }

  cacheElements() {
    this.elements = {
      // Duration display
      currentDuration: document.getElementById('current-duration'),
      // Phase indicator
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
      // Response buttons
      firstButton: document.getElementById('response-car'),
      secondButton: document.getElementById('response-truck'),
      firstButtonIcon: document.querySelector('#response-car .response-icon'),
      firstButtonLabel: document.querySelector('#response-car .response-label'),
      secondButtonIcon: document.querySelector('#response-truck .response-icon'),
      secondButtonLabel: document.querySelector('#response-truck .response-label'),
    };
  }

  updateDurationDisplay() {
    if (this.elements.currentDuration) {
      this.elements.currentDuration.textContent = this.currentDuration;
    }
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
    const displayArea = this.elements.displayArea;
    const centerX = displayArea.offsetWidth / 2;
    const centerY = displayArea.offsetHeight / 2;
    const radius = Math.min(centerX, centerY) * 0.75;

    for (let i = 0; i < numPositions; i++) {
      const zone = document.createElement('div');
      zone.className = 'response-zone';
      zone.setAttribute('data-position', i);
      zone.textContent = i + 1;
      zone.setAttribute('aria-label', `Position ${i + 1}`);

      // Calculate position in circle
      const angle = (i / numPositions) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      zone.style.left = `${x}px`;
      zone.style.top = `${y}px`;
      zone.style.transform = 'translate(-50%, -50%)';

      zone.addEventListener('click', () => {
        this.handlePeripheralResponse(i);
      });

      this.elements.peripheralResponseZones.appendChild(zone);
    }
  }

  async startExercise() {
    // Initialize state
    this.totalTrials = this.config.parameters.totalTrials || 20;
    this.currentTrial = 0;
    this.trials = [];
    this.score = 0;

    // Initialize difficulty adapter for complex variant
    this.difficultyAdapter = new UFOVAdapter('complex');
    this.currentDuration = this.difficultyAdapter.getCurrentDifficulty();
    this.updateDurationDisplay();

    // Start data tracking
    if (!this.isPractice) {
      window.DataTracker.startSession(this.config.exerciseId, {
        initialDifficulty: this.currentDuration,
        variant: 'complex',
      });
    }

    // Speak instructions
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      try {
        await window.AudioManager.speak('Complex niveau. Let goed op het midden en de randen. De oefening begint.');
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
    this.trialStartTime = Date.now();

    // Reset responses
    this.centralResponse = null;
    this.peripheralResponse = null;

    // Clear previous trial's highlighted peripheral zones to prevent cognitive load
    const zones = this.elements.peripheralResponseZones.querySelectorAll('.response-zone');
    zones.forEach(z => z.classList.remove('selected', 'correct', 'incorrect'));

    // Hide response areas
    this.elements.centralResponse.classList.add('hidden');
    this.elements.peripheralResponseZones.classList.remove('active');

    // Generate stimulus
    this.generateStimulus();

    // Phase 1: Show fixation cross
    this.elements.phaseIndicator.textContent = `Poging ${this.currentTrial}/${this.totalTrials} - Kijk naar het kruisje...`;
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

    // Number of distractors (8-12)
    const minDistractors = this.config.parameters.minDistractors || 8;
    const maxDistractors = this.config.parameters.maxDistractors || 12;
    const numDistractors = Math.floor(Math.random() * (maxDistractors - minDistractors + 1)) + minDistractors;

    // Distractor positions (avoid peripheral target position)
    const availablePositions = Array.from({ length: numPositions }, (_, i) => i)
      .filter(p => p !== this.currentPeripheralPosition);

    this.currentDistractorPositions = [];
    this.currentDistractorTypes = [];

    const distractors = this.config.stimuli.distractors || ['🔺', '🔶', '⬛', '⭕'];

    for (let i = 0; i < Math.min(numDistractors, availablePositions.length); i++) {
      const index = Math.floor(Math.random() * availablePositions.length);
      this.currentDistractorPositions.push(availablePositions[index]);
      this.currentDistractorTypes.push(distractors[Math.floor(Math.random() * distractors.length)]);
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

    await this.sleep(this.config.parameters.fixationTime || 800);

    // Hide fixation cross
    this.elements.fixationCross.style.display = 'none';
  }

  async showStimulus() {
    const displayArea = this.elements.displayArea;
    const centerX = displayArea.offsetWidth / 2;
    const centerY = displayArea.offsetHeight / 2;
    const radius = Math.min(centerX, centerY) * 0.75;

    // Prepare central stimulus - find the target object for the current target ID
    const centralTargetObj = this.currentStimulusSet.targets.find(t => t.id === this.currentCentralTarget);
    this.elements.centralIcon.textContent = centralTargetObj.emoji;
    this.elements.centralStimulus.classList.add('active');

    // Prepare peripheral items
    UIComponents.clearElement(this.elements.peripheralContainer);

    // Add target - use the current set's peripheral emoji
    const target = document.createElement('div');
    target.className = 'peripheral-item target visible';
    target.setAttribute('data-position', this.currentPeripheralPosition);
    target.textContent = this.currentStimulusSet.peripheralEmoji;

    const targetAngle = (this.currentPeripheralPosition / this.config.parameters.numPeripheralPositions) * 2 * Math.PI - Math.PI / 2;
    const targetX = centerX + radius * Math.cos(targetAngle);
    const targetY = centerY + radius * Math.sin(targetAngle);
    target.style.left = `${targetX}px`;
    target.style.top = `${targetY}px`;

    this.elements.peripheralContainer.appendChild(target);

    // Add distractors
    this.currentDistractorPositions.forEach((pos, idx) => {
      const distractor = document.createElement('div');
      distractor.className = 'peripheral-item distractor visible';
      distractor.setAttribute('data-position', pos);
      distractor.textContent = this.currentDistractorTypes[idx];

      const angle = (pos / this.config.parameters.numPeripheralPositions) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      distractor.style.left = `${x}px`;
      distractor.style.top = `${y}px`;

      this.elements.peripheralContainer.appendChild(distractor);
    });

    // Show for current duration
    await this.sleep(this.currentDuration);

    // Hide stimuli immediately
    this.elements.centralStimulus.classList.remove('active');

    // Clear peripheral items completely so only response zones remain
    UIComponents.clearElement(this.elements.peripheralContainer);

    await this.sleep(100);
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
    this.elements.peripheralResponseZones.classList.add('active');
  }

  async handlePeripheralResponse(position) {
    this.peripheralResponse = position;

    if (window.AudioManager) {
      window.AudioManager.hapticPress();
    }

    // Mark selected zone
    const zones = this.elements.peripheralResponseZones.querySelectorAll('.response-zone');
    zones.forEach(z => z.classList.remove('selected', 'correct', 'incorrect'));

    const selectedZone = zones[position];
    selectedZone.classList.add('selected');

    // Disable further clicking
    this.elements.peripheralResponseZones.classList.remove('active');

    // Process trial
    await this.sleep(300);
    await this.processTrial();
  }

  async processTrial() {
    const responseTime = Date.now() - this.trialStartTime;

    // Check correctness - compare response ID with target ID
    const centralCorrect = this.centralResponse === this.currentCentralTarget;
    const peripheralCorrect = this.peripheralResponse === this.currentPeripheralPosition;
    const bothCorrect = centralCorrect && peripheralCorrect;

    // Visual feedback on zones
    const zones = this.elements.peripheralResponseZones.querySelectorAll('.response-zone');
    if (peripheralCorrect) {
      zones[this.peripheralResponse].classList.add('correct');
    } else {
      zones[this.peripheralResponse].classList.add('incorrect');
      zones[this.currentPeripheralPosition].classList.add('correct');
    }

    // Calculate score
    let trialScore = 0;
    if (bothCorrect) {
      trialScore = this.config.scoring.pointsForBothCorrect || 30;
      // Bonus for fast responses (under 1 second)
      if (responseTime < 1000) {
        trialScore += this.config.scoring.bonusForFast || 10;
      }
    } else if (centralCorrect) {
      trialScore = this.config.scoring.pointsForCentralCorrect || 15;
    } else if (peripheralCorrect) {
      trialScore = this.config.scoring.pointsForPeripheralCorrect || 15;
    }

    this.score += trialScore;

    // Record trial
    const trialData = {
      difficulty: this.currentDuration,
      centralTarget: this.currentCentralTarget,
      peripheralPosition: this.currentPeripheralPosition,
      numDistractors: this.currentDistractorPositions.length,
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
    this.updateDurationDisplay();

    // Show feedback
    await this.showFeedback(centralCorrect, peripheralCorrect, difficultyResult.adjusted, trialScore);

    // Check if exercise complete
    if (this.currentTrial >= this.totalTrials) {
      await this.sleep(600);
      this.endExercise();
    } else {
      // Continue to next trial
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

  async showFeedback(centralCorrect, peripheralCorrect, difficultyAdjusted, trialScore) {
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

  endExercise() {
    // Calculate final statistics
    const threshold = this.difficultyAdapter.getThreshold();
    const centralAccuracy = this.trials.filter(t => t.centralCorrect).length / this.trials.length;
    const peripheralAccuracy = this.trials.filter(t => t.peripheralCorrect).length / this.trials.length;
    const overallAccuracy = this.trials.filter(t => t.correct).length / this.trials.length;
    const averageResponseTime = this.trials.reduce((sum, t) => sum + t.responseTime, 0) / this.trials.length;

    const finalStats = {
      threshold: threshold,
      fastestTime: this.difficultyAdapter.getFastestTime(),
      centralAccuracy: centralAccuracy,
      peripheralAccuracy: peripheralAccuracy,
      overallAccuracy: overallAccuracy,
      averageResponseTime: averageResponseTime,
      score: this.score,
      totalTrials: this.trials.length,
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
      exercise: 'exercises/ufov-complex/index.html',
      name: this.config.exerciseName,
      score: this.score,
      stats: JSON.stringify({
        totalTrials: stats.totalTrials,
        overallAccuracy: stats.overallAccuracy,
        centralAccuracy: stats.centralAccuracy,
        peripheralAccuracy: stats.peripheralAccuracy,
        averageReactionTime: Math.round(stats.averageResponseTime),
        threshold: stats.threshold,
        fastestTime: stats.fastestTime,
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
    exerciseInstance = new UFOVComplexExercise();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExercise);
} else {
  initializeExercise();
}
