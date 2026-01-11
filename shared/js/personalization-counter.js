/**
 * PERSONALIZATION DAY COUNTER
 * Manages the A/B testing timeline for personalized vs generic content.
 *
 * Timeline:
 * - Days 0-1: Generic/random data (Phase A - baseline)
 * - Day 2: Personalized data (Phase B - exposure)
 * - Day 3+: User makes ONE permanent choice (Phase C - preference)
 *
 * The Phase C choice is made once and stored permanently.
 */

const PersonalizationCounter = {
  STORAGE_KEY: 'mocia_personalization_counter',

  // Content modes
  MODE_GENERIC: 'generic',
  MODE_PERSONALIZED: 'personalized',

  /**
   * Get default counter data structure
   * @returns {Object} Default counter data
   */
  getDefaultData() {
    return {
      startDate: null,              // Date when personalization was first configured
      hasShownPreferencePopup: false,
      userPreference: null,         // 'generic' | 'personalized' | null (permanent choice)
      preferenceSetAt: null         // Timestamp when choice was made
    };
  },

  /**
   * Get counter data from localStorage
   * @returns {Object} Counter data
   */
  getData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.getDefaultData();
    } catch (error) {
      console.error('Error reading personalization counter:', error);
      return this.getDefaultData();
    }
  },

  /**
   * Save counter data to localStorage
   * @param {Object} data - Counter data to save
   * @returns {boolean} Success status
   */
  saveData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving personalization counter:', error);
      return false;
    }
  },

  /**
   * Start the counter when personalization is first configured
   * Only starts if not already started
   */
  startCounter() {
    const data = this.getData();
    if (!data.startDate) {
      data.startDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      this.saveData(data);
    }
  },

  /**
   * Check if counter has been started
   * @returns {boolean} True if counter is active
   */
  isCounterStarted() {
    const data = this.getData();
    return data.startDate !== null;
  },

  /**
   * Calculate days elapsed since personalization was configured
   * @returns {number} Number of days elapsed (0 if not started)
   */
  getDaysElapsed() {
    const data = this.getData();
    if (!data.startDate) return 0;

    const start = new Date(data.startDate);
    const today = new Date();

    // Reset to midnight for accurate day calculation
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffMs = today - start;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  },

  /**
   * Determine which content mode to use for exercises
   * @returns {string} 'generic' or 'personalized'
   */
  getContentMode() {
    // If personalization is not configured, always use generic
    if (!window.PersonalizationService?.isConfigured()) {
      return this.MODE_GENERIC;
    }

    const data = this.getData();

    // If user has made a permanent choice (Day 3+), use that
    if (data.userPreference) {
      return data.userPreference;
    }

    // Check days elapsed
    const days = this.getDaysElapsed();

    // Days 0-1: Generic data (Phase A - baseline)
    if (days < 2) {
      return this.MODE_GENERIC;
    }

    // Day 2: Personalized data (Phase B - exposure)
    if (days === 2) {
      return this.MODE_PERSONALIZED;
    }

    // Day 3+: No choice made yet - default to personalized until popup shown
    return this.MODE_PERSONALIZED;
  },

  /**
   * Check if the preference popup should be shown
   * Conditions:
   * - Personalization is configured
   * - At least 3 days have passed (Phase C)
   * - User hasn't made their permanent choice yet
   * @returns {boolean} True if popup should show
   */
  shouldShowPreferencePopup() {
    // Must have personalization configured
    if (!window.PersonalizationService?.isConfigured()) {
      return false;
    }

    const data = this.getData();

    // Already made permanent choice
    if (data.userPreference) {
      return false;
    }

    // Must be at least day 3 (Phase C)
    const days = this.getDaysElapsed();
    return days >= 3;
  },

  /**
   * Mark that the preference popup has been shown
   */
  markPopupShown() {
    const data = this.getData();
    data.hasShownPreferencePopup = true;
    this.saveData(data);
  },

  /**
   * Set the user's permanent preference
   * This is a one-time choice that persists forever
   * @param {string} preference - 'generic' or 'personalized'
   * @returns {boolean} Success status
   */
  setUserPreference(preference) {
    const data = this.getData();

    // Cannot change if already set
    if (data.userPreference) {
      console.warn('User preference already set, cannot be changed');
      return false;
    }

    // Validate preference
    if (preference !== this.MODE_GENERIC && preference !== this.MODE_PERSONALIZED) {
      console.error('Invalid preference:', preference);
      return false;
    }

    data.userPreference = preference;
    data.preferenceSetAt = new Date().toISOString();
    data.hasShownPreferencePopup = true;

    return this.saveData(data);
  },

  /**
   * Get the user's preference (if set)
   * @returns {string|null} User preference or null
   */
  getUserPreference() {
    const data = this.getData();
    return data.userPreference;
  },

  /**
   * Check if user has made their permanent preference choice
   * @returns {boolean} True if preference is set
   */
  hasUserChosen() {
    const data = this.getData();
    return data.userPreference !== null;
  },

  /**
   * Get current phase information for display/debugging
   * @returns {Object} Phase information
   */
  getPhaseInfo() {
    const data = this.getData();
    const days = this.getDaysElapsed();
    const mode = this.getContentMode();

    let phase;
    if (!window.PersonalizationService?.isConfigured()) {
      phase = 'not_configured';
    } else if (data.userPreference) {
      phase = 'preference_set';    // User has made their permanent choice
    } else if (days < 2) {
      phase = 'phase_a_baseline';  // Days 0-1: Generic
    } else if (days === 2) {
      phase = 'phase_b_exposure';  // Day 2: Personalized
    } else {
      phase = 'phase_c_choice';    // Day 3+: Awaiting user choice
    }

    return {
      phase,
      daysElapsed: days,
      contentMode: mode,
      userPreference: data.userPreference,
      preferenceSetAt: data.preferenceSetAt,
      canShowPopup: this.shouldShowPreferencePopup()
    };
  },

  /**
   * Get data for export (only non-personal data)
   * This is what gets included in the research data export
   * @returns {Object} Export-safe data
   */
  getExportData() {
    const data = this.getData();
    return {
      personalizationStartDate: data.startDate,
      daysElapsed: this.getDaysElapsed(),
      currentPhase: this.getPhaseInfo().phase,
      userPreference: data.userPreference,        // 'generic' | 'personalized' | null
      preferenceSetAt: data.preferenceSetAt       // When the choice was made
    };
  },

  /**
   * Clear all counter data
   * Called when user clears all app data
   */
  clearData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing personalization counter:', error);
      return false;
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.PersonalizationCounter = PersonalizationCounter;
}
