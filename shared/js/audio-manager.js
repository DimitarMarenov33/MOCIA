/**
 * AUDIO MANAGER
 * Handles text-to-speech and haptic feedback
 * Singleton pattern - only one instance exists
 */

class AudioManager {
  constructor() {
    if (AudioManager.instance) {
      return AudioManager.instance;
    }

    // Check if Web Speech API is available
    this.speechSynthesis = window.speechSynthesis;
    this.speechSupported = 'speechSynthesis' in window;

    // Audio settings
    this.enabled = CONSTANTS.AUDIO.ENABLED_BY_DEFAULT;
    this.rate = CONSTANTS.AUDIO.SPEECH_RATE;
    this.pitch = CONSTANTS.AUDIO.SPEECH_PITCH;
    this.volume = CONSTANTS.AUDIO.SPEECH_VOLUME;

    // Current utterance tracking
    this.currentUtterance = null;
    this.speaking = false;

    // Queue for managing multiple speech requests
    this.speechQueue = [];

    // Dutch voice selection
    this.dutchVoice = null;
    this.voicesLoaded = false;

    // Load saved settings
    this.loadSettings();

    // Initialize Dutch voice
    this.initializeDutchVoice();

    AudioManager.instance = this;
  }

  /**
   * Initialize Dutch voice for speech synthesis
   */
  initializeDutchVoice() {
    if (!this.speechSupported) return;

    const loadVoices = () => {
      const voices = this.speechSynthesis.getVoices();

      // Prefer higher quality Google/Microsoft voices, then system voices
      // Priority order: Google > Microsoft > Apple (system)
      this.dutchVoice =
        // Try Google voices first (best quality)
        voices.find(voice => voice.name.includes('Google') && voice.lang === 'nl-NL') ||
        voices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('nl')) ||
        // Try Microsoft voices (good quality)
        voices.find(voice => voice.name.includes('Microsoft') && voice.lang === 'nl-NL') ||
        voices.find(voice => voice.name.includes('Laura') && voice.lang.startsWith('nl')) ||
        // Try enhanced voices
        voices.find(voice => voice.name.includes('Enhanced') && voice.lang.startsWith('nl')) ||
        voices.find(voice => voice.name.includes('Premium') && voice.lang.startsWith('nl')) ||
        // Fall back to any Dutch voice
        voices.find(voice => voice.lang === 'nl-NL') ||
        voices.find(voice => voice.lang.startsWith('nl')) ||
        voices.find(voice => voice.lang === 'nl-BE');

      if (this.dutchVoice) {
        console.log('Dutch voice selected:', this.dutchVoice.name, this.dutchVoice.lang);
        console.log('Available Dutch voices:', voices.filter(v => v.lang.startsWith('nl')).map(v => v.name));
        this.voicesLoaded = true;
      } else {
        console.warn('No Dutch voice found, will use default voice');
        this.voicesLoaded = true;
      }
    };

    // Voices may load asynchronously
    if (this.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      this.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Load audio settings from localStorage
   */
  loadSettings() {
    try {
      const settings = localStorage.getItem(CONSTANTS.STORAGE_KEYS.APP_SETTINGS);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.audio !== undefined) {
          this.enabled = parsed.audio.enabled !== undefined
            ? parsed.audio.enabled
            : this.enabled;
          this.rate = parsed.audio.rate || this.rate;
          this.pitch = parsed.audio.pitch || this.pitch;
          this.volume = parsed.audio.volume || this.volume;
        }
      }
    } catch (error) {
      console.error('Error loading audio settings:', error);
    }
  }

  /**
   * Save audio settings to localStorage
   */
  saveSettings() {
    try {
      let settings = {};
      const existing = localStorage.getItem(CONSTANTS.STORAGE_KEYS.APP_SETTINGS);
      if (existing) {
        settings = JSON.parse(existing);
      }

      settings.audio = {
        enabled: this.enabled,
        rate: this.rate,
        pitch: this.pitch,
        volume: this.volume,
      };

      localStorage.setItem(CONSTANTS.STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving audio settings:', error);
    }
  }

  /**
   * Speak text using text-to-speech
   * @param {string} text - Text to speak
   * @param {Object} options - Optional settings
   * @param {boolean} options.priority - If true, interrupt current speech
   * @param {number} options.rate - Speech rate override
   * @param {Function} options.onEnd - Callback when speech ends
   * @param {number} options.timeout - Max time to wait in ms (default: 5000)
   * @returns {Promise} Resolves when speech completes or times out
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      // If audio is disabled or not supported, resolve immediately
      if (!this.enabled || !this.speechSupported) {
        console.log('Audio disabled or not supported:', text);
        resolve();
        return;
      }

      // Stop current speech if priority is set
      if (options.priority && this.speaking) {
        this.stop();
      }

      // Timeout to prevent hanging on iOS (Safari/Opera often don't fire events)
      // Use short default (2s) to prevent blocking app startup
      const timeoutMs = options.timeout || 2000;
      let resolved = false;
      let timeoutId = null;

      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          resolve();
        }
      };

      // Set timeout to prevent infinite hang on iOS
      timeoutId = setTimeout(() => {
        if (!resolved) {
          console.log('[AudioManager] Speech timed out after', timeoutMs, 'ms:', text);
          this.speaking = false;
          this.currentUtterance = null;
          safeResolve();
        }
      }, timeoutMs);

      try {
        const utterance = new SpeechSynthesisUtterance(text);

        // Set speech parameters
        utterance.rate = options.rate !== undefined ? options.rate : this.rate;
        utterance.pitch = this.pitch;
        utterance.volume = this.volume;
        utterance.lang = 'nl-NL'; // Set language to Dutch

        // Use Dutch voice if available
        if (this.dutchVoice) {
          utterance.voice = this.dutchVoice;
        }

        // Set up event handlers
        utterance.onstart = () => {
          this.speaking = true;
          this.currentUtterance = utterance;
        };

        utterance.onend = () => {
          this.speaking = false;
          this.currentUtterance = null;

          if (options.onEnd) {
            options.onEnd();
          }

          // Process next in queue
          this.processQueue();

          safeResolve();
        };

        utterance.onerror = (event) => {
          // Log error for debugging
          console.warn('Speech synthesis error:', event.error);
          this.speaking = false;
          this.currentUtterance = null;

          // Continue with queue even on error
          this.processQueue();

          // Always resolve (don't reject) to prevent blocking app
          safeResolve();
        };

        // Add to queue or speak immediately
        if (this.speaking && !options.priority) {
          this.speechQueue.push(utterance);
        } else {
          this.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error('Error creating speech utterance:', error);
        safeResolve(); // Resolve anyway to prevent blocking
      }
    });
  }

  /**
   * Process next item in speech queue
   */
  processQueue() {
    if (this.speechQueue.length > 0 && !this.speaking) {
      const nextUtterance = this.speechQueue.shift();
      this.speechSynthesis.speak(nextUtterance);
    }
  }

  /**
   * Stop current speech immediately
   */
  stop() {
    if (this.speechSupported && this.speaking) {
      this.speechSynthesis.cancel();
      this.speaking = false;
      this.currentUtterance = null;
      this.speechQueue = []; // Clear queue
    }
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.speechSupported && this.speaking) {
      this.speechSynthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.speechSupported) {
      this.speechSynthesis.resume();
    }
  }

  /**
   * Toggle audio on/off
   * @returns {boolean} New enabled state
   */
  toggle() {
    this.enabled = !this.enabled;
    this.saveSettings();

    // Stop any current speech if disabling
    if (!this.enabled) {
      this.stop();
    }

    return this.enabled;
  }

  /**
   * Enable audio
   */
  enable() {
    this.enabled = true;
    this.saveSettings();
  }

  /**
   * Disable audio
   */
  disable() {
    this.enabled = false;
    this.stop();
    this.saveSettings();
  }

  /**
   * Check if audio is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Set speech rate
   * @param {number} rate - Speech rate (0.1 to 10)
   */
  setRate(rate) {
    this.rate = Math.max(0.1, Math.min(10, rate));
    this.saveSettings();
  }

  /**
   * Get current speech rate
   * @returns {number}
   */
  getRate() {
    return this.rate;
  }

  /**
   * Provide haptic feedback (vibration on mobile devices)
   * @param {number|Array} pattern - Vibration pattern in milliseconds
   */
  haptic(pattern = 50) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.error('Haptic feedback error:', error);
      }
    }
  }

  /**
   * Provide success haptic feedback
   */
  hapticSuccess() {
    this.haptic([50, 50, 50]); // Three short vibrations
  }

  /**
   * Provide error haptic feedback
   */
  hapticError() {
    this.haptic([100]); // One longer vibration
  }

  /**
   * Provide button press haptic feedback
   */
  hapticPress() {
    this.haptic(30); // Very short vibration
  }

  /**
   * Speak and wait for completion (async/await friendly)
   * @param {string} text - Text to speak
   * @param {Object} options - Optional settings
   * @returns {Promise}
   */
  async speakAsync(text, options = {}) {
    return await this.speak(text, options);
  }

  /**
   * Speak multiple texts in sequence
   * @param {Array<string>} texts - Array of texts to speak
   * @param {Object} options - Optional settings
   * @returns {Promise}
   */
  async speakSequence(texts, options = {}) {
    for (const text of texts) {
      await this.speak(text, options);
    }
  }

  /**
   * Get available voices
   * @returns {Array} Array of available speech synthesis voices
   */
  getVoices() {
    if (this.speechSupported) {
      return this.speechSynthesis.getVoices();
    }
    return [];
  }

  /**
   * Check if speech synthesis is supported
   * @returns {boolean}
   */
  isSupported() {
    return this.speechSupported;
  }
}

// Create and export singleton instance
const audioManager = new AudioManager();

// Make available globally
if (typeof window !== 'undefined') {
  window.AudioManager = audioManager;
}
