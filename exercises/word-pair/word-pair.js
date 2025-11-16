/**
 * WORD PAIR ASSOCIATION EXERCISE
 * Episodic memory training through word pair learning with delayed recall
 *
 * Exercise Flow:
 * 1. ENCODING: Show N word pairs → user memorizes → clicks "I've remembered"
 * 2. LOCKED: Exercise locked for X minutes (starts at 20 min)
 * 3. RECALL: User types in the word pairs from memory
 * 4. ADAPTIVE: Correct = +1 pair, +30 min delay; Incorrect = retry same level
 */

class WordPairExercise {
  constructor() {
    this.container = document.getElementById('exercise-container');

    // Exercise state
    this.phase = null; // 'encoding', 'locked', 'recall', 'results'
    this.currentPairs = [];
    this.numPairs = 3; // Starting number of pairs
    this.delayMinutes = 20; // Starting delay in minutes
    this.lockedUntil = null; // Timestamp when exercise unlocks
    this.trialNumber = 0;
    this.consecutiveSuccesses = 0;

    // Storage key for persistent state
    this.storageKey = 'word_pair_state';

    // Timer interval
    this.timerInterval = null;

    this.init();
  }

  async init() {
    try {
      // Load saved state
      this.loadState();

      // Determine current phase
      this.determinePhase();

      // Render appropriate UI
      this.render();

      // Speak welcome
      if (window.AudioManager && window.AudioManager.isEnabled()) {
        await window.AudioManager.speak('Woord Paar Associatie');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Er is een fout opgetreden bij het laden van de oefening.');
    }
  }

  /**
   * Load saved state from localStorage
   */
  loadState() {
    try {
      const savedState = localStorage.getItem(this.storageKey);

      if (savedState) {
        const state = JSON.parse(savedState);

        // Validate and sanitize loaded values
        this.numPairs = Math.max(1, Math.min(state.numPairs || 3, 30)); // Clamp between 1-30
        this.delayMinutes = Math.max(10, Math.min(state.delayMinutes || 20, 480)); // Clamp between 10-480 (8 hours max)
        this.lockedUntil = state.lockedUntil || null;
        this.currentPairs = state.currentPairs || [];
        this.trialNumber = state.trialNumber || 0;
        this.consecutiveSuccesses = state.consecutiveSuccesses || 0;

        console.log('Loaded state:', {
          numPairs: this.numPairs,
          delayMinutes: this.delayMinutes,
          trialNumber: this.trialNumber
        });
      }
    } catch (error) {
      console.error('Error loading state:', error);
      // Reset to defaults on error
      this.numPairs = 3;
      this.delayMinutes = 20;
      this.lockedUntil = null;
      this.currentPairs = [];
      this.trialNumber = 0;
      this.consecutiveSuccesses = 0;
    }
  }

  /**
   * Save current state to localStorage
   */
  saveState() {
    try {
      const state = {
        numPairs: this.numPairs,
        delayMinutes: this.delayMinutes,
        lockedUntil: this.lockedUntil,
        currentPairs: this.currentPairs,
        trialNumber: this.trialNumber,
        consecutiveSuccesses: this.consecutiveSuccesses,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  /**
   * Determine current phase based on state
   */
  determinePhase() {
    // Check if exercise is locked
    if (this.lockedUntil) {
      const now = new Date().getTime();
      const unlockTime = new Date(this.lockedUntil).getTime();

      if (now < unlockTime) {
        this.phase = 'locked';
        return;
      } else {
        // Lock expired, move to recall phase
        this.phase = 'recall';
        return;
      }
    }

    // Check if we have current pairs (encoding already done)
    if (this.currentPairs.length > 0) {
      this.phase = 'recall';
      return;
    }

    // Default to encoding phase
    this.phase = 'encoding';
  }

  /**
   * Render the appropriate UI based on current phase
   */
  render() {
    switch (this.phase) {
      case 'encoding':
        this.renderEncodingPhase();
        break;
      case 'locked':
        this.renderLockedPhase();
        break;
      case 'recall':
        this.renderRecallPhase();
        break;
      case 'results':
        this.renderResultsPhase();
        break;
      default:
        this.renderEncodingPhase();
    }
  }

  /**
   * ENCODING PHASE: Show word pairs for memorization
   */
  renderEncodingPhase() {
    // Generate new word pairs
    this.currentPairs = generateWordPairs(this.numPairs);
    this.saveState();

    this.container.innerHTML = `
      <div class="phase-container">
        <div style="background: var(--color-info-light); padding: var(--spacing-lg); border-radius: var(--border-radius-lg); margin-bottom: var(--spacing-xl);">
          <h2 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-md);">
            📚 Onthoud deze woordparen
          </h2>
          <p style="font-size: var(--font-size-lg); line-height: 1.6;">
            Bestudeer de ${this.numPairs} woordparen hieronder. Als je ze onthouden hebt, klik dan op de knop.
            Je krijgt dan ${this.delayMinutes} minuten de tijd voordat je ze moet herinneren.
          </p>
        </div>

        <div style="background: white; padding: var(--spacing-xl); border-radius: var(--border-radius-lg); margin-bottom: var(--spacing-xl); box-shadow: var(--shadow-md);">
          <div id="word-pairs-display" style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
            ${this.renderWordPairsDisplay()}
          </div>
        </div>

        <div class="simple-screen__actions">
          <button id="remembered-btn" class="btn btn-success btn-large">
            ✓ Ik heb ze onthouden
          </button>
        </div>

        <div style="margin-top: var(--spacing-lg); padding: var(--spacing-md); background: var(--color-background-alt); border-radius: var(--border-radius-md); font-size: var(--font-size-md); color: var(--color-text-secondary);">
          <strong>Huidige niveau:</strong> ${this.numPairs} woordparen |
          <strong>Wachttijd:</strong> ${this.delayMinutes} minuten
        </div>
      </div>
    `;

    // Event listener for remembered button
    document.getElementById('remembered-btn').addEventListener('click', () => {
      this.startLockPhase();
    });

    // Speak the pairs
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      this.speakWordPairs();
    }
  }

  /**
   * Render word pairs as cards
   */
  renderWordPairsDisplay() {
    return this.currentPairs.map((pair, index) => `
      <div style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-lg); background: var(--color-background-alt); border-radius: var(--border-radius-md); border-left: 4px solid var(--color-info);">
        <div style="flex-shrink: 0; width: 40px; height: 40px; background: var(--color-info); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: var(--font-size-xl);">
          ${index + 1}
        </div>
        <div style="flex: 1; display: flex; gap: var(--spacing-md); align-items: center;">
          <div style="flex: 1; padding: var(--spacing-md); background: white; border-radius: var(--border-radius-md); font-size: var(--font-size-xxl); font-weight: bold; text-align: center;">
            ${pair.word1}
          </div>
          <div style="font-size: var(--font-size-xl); color: var(--color-info);">
            ↔️
          </div>
          <div style="flex: 1; padding: var(--spacing-md); background: white; border-radius: var(--border-radius-md); font-size: var(--font-size-xxl); font-weight: bold; text-align: center;">
            ${pair.word2}
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Speak word pairs using audio manager
   */
  async speakWordPairs() {
    for (let i = 0; i < this.currentPairs.length; i++) {
      const pair = this.currentPairs[i];
      await window.AudioManager.speak(`Paar ${i + 1}: ${pair.word1} en ${pair.word2}`);

      // Small delay between pairs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Start the lock phase
   */
  startLockPhase() {
    // Calculate lock until time
    const now = new Date();
    this.lockedUntil = new Date(now.getTime() + this.delayMinutes * 60 * 1000).toISOString();

    // Save state
    this.saveState();

    // Update phase
    this.phase = 'locked';
    this.render();

    // Speak feedback
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      window.AudioManager.speak(`Goed! Kom over ${this.delayMinutes} minuten terug om de woordparen te herinneren.`);
    }
  }

  /**
   * LOCKED PHASE: Show countdown timer
   */
  renderLockedPhase() {
    this.container.innerHTML = `
      <div class="phase-container">
        <div style="text-align: center; padding: var(--spacing-xl);">
          <div style="font-size: 80px; margin-bottom: var(--spacing-lg);">⏳</div>
          <h2 style="font-size: var(--font-size-xxl); margin-bottom: var(--spacing-md);">
            Oefening Vergrendeld
          </h2>
          <p style="font-size: var(--font-size-xl); color: var(--color-text-secondary); margin-bottom: var(--spacing-xl); line-height: 1.6;">
            Je hebt de woordparen onthouden! <br>
            Kom terug wanneer de tijd voorbij is om ze te herinneren.
          </p>

          <div id="countdown-display" style="background: var(--color-info-light); padding: var(--spacing-xl); border-radius: var(--border-radius-lg); margin-bottom: var(--spacing-xl);">
            <div style="font-size: var(--font-size-lg); color: var(--color-text-secondary); margin-bottom: var(--spacing-sm);">
              Tijd tot ontgrendeling:
            </div>
            <div id="countdown-timer" style="font-size: 48px; font-weight: bold; color: var(--color-info); font-family: monospace;">
              --:--:--
            </div>
          </div>

          <div style="padding: var(--spacing-lg); background: var(--color-background-alt); border-radius: var(--border-radius-md); font-size: var(--font-size-lg);">
            <strong>💡 Tip:</strong> Probeer de woordparen in gedachten te herhalen terwijl je wacht. Dit helpt bij het onthouden!
          </div>
        </div>
      </div>
    `;

    // Start countdown timer
    this.startCountdown();
  }

  /**
   * Start countdown timer that updates every second
   */
  startCountdown() {
    // Clear any existing interval
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const unlockTime = new Date(this.lockedUntil).getTime();
      const timeLeft = unlockTime - now;

      if (timeLeft <= 0) {
        // Time's up! Move to recall phase
        clearInterval(this.timerInterval);
        this.phase = 'recall';
        this.render();

        if (window.AudioManager && window.AudioManager.isEnabled()) {
          window.AudioManager.speak('De tijd is voorbij! Je kunt nu de woordparen herinneren.');
        }
      } else {
        // Update countdown display
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const timerEl = document.getElementById('countdown-timer');
        if (timerEl) {
          timerEl.textContent = display;
        }
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    this.timerInterval = setInterval(updateCountdown, 1000);
  }

  /**
   * RECALL PHASE: User inputs the word pairs from memory
   */
  renderRecallPhase() {
    // Defensive check: ensure we have pairs to recall
    if (!this.currentPairs || this.currentPairs.length === 0) {
      console.error('Cannot render recall phase: no word pairs found');
      this.container.innerHTML = `
        <div class="phase-container">
          <div style="text-align: center; padding: var(--spacing-xl);">
            <div style="font-size: 80px; margin-bottom: var(--spacing-lg);">⚠️</div>
            <h2 style="font-size: var(--font-size-xxl); margin-bottom: var(--spacing-md);">
              Er is een fout opgetreden
            </h2>
            <p style="font-size: var(--font-size-lg); color: var(--color-text-secondary); margin-bottom: var(--spacing-xl); line-height: 1.6;">
              Er zijn geen woordparen gevonden om te herinneren. Dit kan gebeuren als de oefening niet correct is opgeslagen.
            </p>
            <button onclick="localStorage.removeItem('word_pair_state'); location.reload();" class="btn btn-primary btn-large">
              Oefening opnieuw starten
            </button>
          </div>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="phase-container">
        <div style="background: var(--color-success-light); padding: var(--spacing-lg); border-radius: var(--border-radius-lg); margin-bottom: var(--spacing-xl);">
          <h2 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-md);">
            ✏️ Herinner de woordparen
          </h2>
          <p style="font-size: var(--font-size-lg); line-height: 1.6;">
            Vul de ${this.numPairs} woordparen in die je eerder hebt onthouden.
            De volgorde maakt niet uit.
          </p>
        </div>

        <form id="recall-form" style="background: white; padding: var(--spacing-xl); border-radius: var(--border-radius-lg); margin-bottom: var(--spacing-xl); box-shadow: var(--shadow-md);">
          ${this.renderRecallInputs()}
        </form>

        <div class="simple-screen__actions">
          <button id="submit-recall-btn" class="btn btn-success btn-large">
            ✓ Controleer Antwoorden
          </button>
        </div>
      </div>
    `;

    // Event listener for submit
    document.getElementById('submit-recall-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.checkRecall();
    });

    // Speak instruction
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      window.AudioManager.speak('Vul de woordparen in die je hebt onthouden.');
    }
  }

  /**
   * Render input fields for recall
   */
  renderRecallInputs() {
    return this.currentPairs.map((pair, index) => `
      <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-lg); background: var(--color-background-alt); border-radius: var(--border-radius-md);">
        <div style="display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
          <div style="flex-shrink: 0; width: 40px; height: 40px; background: var(--color-success); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: var(--font-size-xl);">
            ${index + 1}
          </div>
          <div style="font-size: var(--font-size-lg); font-weight: bold; color: var(--color-text-secondary);">
            Woordpaar ${index + 1}
          </div>
        </div>

        <div style="display: flex; gap: var(--spacing-md); align-items: center;">
          <input
            type="text"
            id="word1-${index}"
            placeholder="Eerste woord"
            class="input-field"
            style="flex: 1; padding: var(--spacing-md); font-size: var(--font-size-xl); border: 2px solid var(--color-border); border-radius: var(--border-radius-md); text-align: center;"
            autocomplete="off"
          >
          <div style="font-size: var(--font-size-xl); color: var(--color-text-secondary);">
            ↔️
          </div>
          <input
            type="text"
            id="word2-${index}"
            placeholder="Tweede woord"
            class="input-field"
            style="flex: 1; padding: var(--spacing-md); font-size: var(--font-size-xl); border: 2px solid var(--color-border); border-radius: var(--border-radius-md); text-align: center;"
            autocomplete="off"
          >
        </div>
      </div>
    `).join('');
  }

  /**
   * Check recall answers
   */
  checkRecall() {
    // Defensive check: ensure we have pairs to check against
    if (!this.currentPairs || this.currentPairs.length === 0) {
      console.error('No word pairs found! currentPairs is empty.');
      alert('Er is een fout opgetreden: er zijn geen woordparen om te controleren. Probeer de oefening opnieuw te starten.');
      return;
    }

    // Collect user answers
    const userAnswers = [];

    for (let i = 0; i < this.currentPairs.length; i++) {
      const word1Input = document.getElementById(`word1-${i}`);
      const word2Input = document.getElementById(`word2-${i}`);

      if (!word1Input || !word2Input) {
        console.error(`Input fields not found for pair ${i}`);
        continue;
      }

      const word1 = word1Input.value.trim().toLowerCase();
      const word2 = word2Input.value.trim().toLowerCase();

      if (word1 === '' || word2 === '') {
        alert('Vul alle velden in alstublieft.');
        return;
      }

      userAnswers.push({ word1, word2 });
    }

    // Ensure we collected all answers
    if (userAnswers.length !== this.currentPairs.length) {
      console.error(`Expected ${this.currentPairs.length} answers but got ${userAnswers.length}`);
      alert('Niet alle antwoorden zijn ingevuld. Probeer opnieuw.');
      return;
    }

    // Check answers
    const results = this.evaluateAnswers(userAnswers);

    // Show results
    this.showResults(results);
  }

  /**
   * Evaluate user answers against correct pairs
   * @param {Array} userAnswers - User's input
   * @returns {Object} Results with correct count and details
   */
  evaluateAnswers(userAnswers) {
    // Defensive check
    if (!this.currentPairs || this.currentPairs.length === 0) {
      console.error('Cannot evaluate: currentPairs is empty');
      return {
        correctPairs: 0,
        totalPairs: 0,
        accuracy: 0,
        isPerfect: false,
        pairResults: []
      };
    }

    let correctPairs = 0;
    const pairResults = [];

    // Create a list of correct pairs (not yet matched)
    const remainingCorrectPairs = this.currentPairs.map(p => ({
      word1: p.word1.toLowerCase(),
      word2: p.word2.toLowerCase()
    }));

    // Check each user answer
    userAnswers.forEach((userPair, index) => {
      const userWord1 = userPair.word1.toLowerCase();
      const userWord2 = userPair.word2.toLowerCase();

      // Find if this pair matches any remaining correct pair (in either direction)
      const matchIndex = remainingCorrectPairs.findIndex(correctPair => {
        return (correctPair.word1 === userWord1 && correctPair.word2 === userWord2) ||
               (correctPair.word1 === userWord2 && correctPair.word2 === userWord1);
      });

      const isCorrect = matchIndex !== -1;

      if (isCorrect) {
        correctPairs++;
        // Remove this pair so it can't be matched again
        remainingCorrectPairs.splice(matchIndex, 1);
      }

      pairResults.push({
        index: index,
        userAnswer: {
          word1: userPair.word1,
          word2: userPair.word2
        },
        correct: isCorrect,
        correctPair: this.currentPairs[index]
      });
    });

    const totalPairs = this.currentPairs.length;
    const accuracy = totalPairs > 0 ? (correctPairs / totalPairs) : 0;
    const isPerfect = correctPairs === totalPairs;

    return {
      correctPairs,
      totalPairs,
      accuracy,
      isPerfect,
      pairResults
    };
  }

  /**
   * Show results and update difficulty
   */
  showResults(results) {
    this.trialNumber++;

    // Track session
    if (!window.DataTracker.hasActiveSession()) {
      window.DataTracker.startSession(CONSTANTS.EXERCISE_TYPES.WORD_PAIR, {
        initialNumPairs: this.numPairs,
        initialDelay: this.delayMinutes
      });
    }

    // Save the actual pairs in trial data for later review
    window.DataTracker.recordTrial({
      trialNumber: this.trialNumber,
      numPairs: this.numPairs,
      delayMinutes: this.delayMinutes,
      correctPairs: results.correctPairs,
      totalPairs: results.totalPairs,
      accuracy: results.accuracy,
      isPerfect: results.isPerfect,
      // Save actual word pairs for review
      wordPairs: this.currentPairs.map(p => ({
        word1: p.word1,
        word2: p.word2
      })),
      // Save user answers
      userAnswers: results.pairResults.map(r => ({
        word1: r.userAnswer.word1,
        word2: r.userAnswer.word2,
        correct: r.correct
      }))
    });

    // Update difficulty based on performance
    if (results.isPerfect) {
      this.consecutiveSuccesses++;
      // Increase difficulty: +1 pair, +30 minutes
      this.numPairs++;
      this.delayMinutes += 30;
    } else {
      this.consecutiveSuccesses = 0;
      // Decrease difficulty: -1 pair, -20 minutes
      this.numPairs = Math.max(1, this.numPairs - 1); // Minimum 1 pair
      this.delayMinutes = Math.max(10, this.delayMinutes - 20); // Minimum 10 minutes
    }

    // Reset for next round
    this.currentPairs = [];
    this.lockedUntil = null;
    this.saveState();

    // End session
    window.DataTracker.endSession({
      totalTrials: this.trialNumber,
      finalNumPairs: this.numPairs,
      finalDelay: this.delayMinutes,
      accuracy: results.accuracy,
      consecutiveSuccesses: this.consecutiveSuccesses
    });

    // Render results
    this.renderResultsPhase(results);
  }

  /**
   * RESULTS PHASE: Show performance feedback
   */
  renderResultsPhase(results) {
    const isSuccess = results.isPerfect;
    const percentage = Math.round(results.accuracy * 100);

    this.container.innerHTML = `
      <div class="phase-container">
        <div style="text-align: center; padding: var(--spacing-xl);">
          <div style="font-size: 100px; margin-bottom: var(--spacing-md);">
            ${isSuccess ? '🎉' : '📊'}
          </div>
          <h2 style="font-size: var(--font-size-xxl); margin-bottom: var(--spacing-md); color: ${isSuccess ? 'var(--color-success)' : 'var(--color-warning)'};">
            ${isSuccess ? 'Perfect!' : 'Goed Geprobeerd!'}
          </h2>
          <p style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-xl);">
            Je hebt <strong>${results.correctPairs} van de ${results.totalPairs}</strong> woordparen correct (${percentage}%)
          </p>
        </div>

        <div style="background: white; padding: var(--spacing-xl); border-radius: var(--border-radius-lg); margin-bottom: var(--spacing-xl); box-shadow: var(--shadow-md);">
          <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-lg);">Details:</h3>
          ${this.renderResultsDetails(results.pairResults)}
        </div>

        ${this.renderDifficultyUpdate(isSuccess)}

        <div class="simple-screen__actions">
          <button id="continue-btn" class="btn btn-success btn-large">
            ${isSuccess ? '✓ Volgende Niveau' : '↻ Probeer Opnieuw'}
          </button>
        </div>
      </div>
    `;

    // Event listener
    document.getElementById('continue-btn').addEventListener('click', () => {
      this.phase = 'encoding';
      this.render();
    });

    // Speak result
    if (window.AudioManager && window.AudioManager.isEnabled()) {
      const message = isSuccess
        ? `Perfect! Je gaat naar het volgende niveau met ${this.numPairs} woordparen en ${this.delayMinutes} minuten wachttijd.`
        : `Je hebt ${results.correctPairs} van de ${results.totalPairs} woordparen correct. Probeer het opnieuw!`;
      window.AudioManager.speak(message);
    }
  }

  /**
   * Render detailed results for each pair
   */
  renderResultsDetails(pairResults) {
    return pairResults.map(result => {
      const icon = result.correct ? '✅' : '❌';
      const color = result.correct ? 'var(--color-success)' : 'var(--color-error)';

      return `
        <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-md); background: var(--color-background-alt); border-radius: var(--border-radius-md); border-left: 4px solid ${color};">
          <div style="display: flex; align-items: center; gap: var(--spacing-md);">
            <div style="font-size: var(--font-size-xxl);">${icon}</div>
            <div style="flex: 1;">
              <div style="margin-bottom: var(--spacing-xs);">
                <strong>Jouw antwoord:</strong> ${result.userAnswer.word1} ↔️ ${result.userAnswer.word2}
              </div>
              ${!result.correct ? `
                <div style="color: var(--color-text-secondary); font-size: var(--font-size-md);">
                  <strong>Correct was:</strong> ${result.correctPair.word1} ↔️ ${result.correctPair.word2}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render difficulty update message
   */
  renderDifficultyUpdate(isSuccess) {
    if (isSuccess) {
      return `
        <div style="background: var(--color-success-light); padding: var(--spacing-lg); border-radius: var(--border-radius-lg); margin-bottom: var(--spacing-xl);">
          <div style="font-size: var(--font-size-xl); font-weight: bold; margin-bottom: var(--spacing-sm); color: var(--color-success);">
            📈 Niveau Verhoogd!
          </div>
          <p style="font-size: var(--font-size-lg);">
            <strong>Nieuw niveau:</strong> ${this.numPairs} woordparen<br>
            <strong>Nieuwe wachttijd:</strong> ${this.delayMinutes} minuten
          </p>
        </div>
      `;
    } else {
      return `
        <div style="background: var(--color-warning-light); padding: var(--spacing-lg); border-radius: var(--border-radius-lg); margin-bottom: var(--spacing-xl);">
          <div style="font-size: var(--font-size-xl); font-weight: bold; margin-bottom: var(--spacing-sm); color: var(--color-warning);">
            💪 Blijf Oefenen!
          </div>
          <p style="font-size: var(--font-size-lg);">
            <strong>Nieuw niveau:</strong> ${this.numPairs} woordparen<br>
            <strong>Nieuwe wachttijd:</strong> ${this.delayMinutes} minuten<br><br>
            Het niveau is verlaagd om je te helpen succesvol te zijn. Probeer de woordparen te onthouden door ze te herhalen of een verhaal te maken.
          </p>
        </div>
      `;
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div style="text-align: center; padding: var(--spacing-xl);">
        <div style="font-size: 80px; margin-bottom: var(--spacing-md);">⚠️</div>
        <h2 style="font-size: var(--font-size-xxl); margin-bottom: var(--spacing-md); color: var(--color-error);">
          Fout
        </h2>
        <p style="font-size: var(--font-size-lg); color: var(--color-text-secondary);">
          ${message}
        </p>
      </div>
    `;
  }

  /**
   * Cleanup on exit
   */
  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}

// Back button handler
function handleBack() {
  if (window.exerciseInstance) {
    window.exerciseInstance.destroy();
  }
  window.location.href = '../../exercises.html?domain=' + CONSTANTS.COGNITIVE_DOMAINS.EPISODIC_MEMORY;
}

// Initialize exercise when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.exerciseInstance = new WordPairExercise();
  });
} else {
  window.exerciseInstance = new WordPairExercise();
}
