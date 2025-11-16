/**
 * VALIDATION UTILITIES
 * Input validation and data integrity checks
 */

const Validation = {
  /**
   * Validate that a value is a number within a range
   * @param {*} value - Value to validate
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {boolean}
   */
  isNumberInRange(value, min, max) {
    return typeof value === 'number' &&
           !isNaN(value) &&
           value >= min &&
           value <= max;
  },

  /**
   * Validate that a value is a positive integer
   * @param {*} value - Value to validate
   * @returns {boolean}
   */
  isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
  },

  /**
   * Validate that a value is a non-negative integer
   * @param {*} value - Value to validate
   * @returns {boolean}
   */
  isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
  },

  /**
   * Validate accuracy value (0-1)
   * @param {*} value - Value to validate
   * @returns {boolean}
   */
  isValidAccuracy(value) {
    return this.isNumberInRange(value, 0, 1);
  },

  /**
   * Validate percentage value (0-100)
   * @param {*} value - Value to validate
   * @returns {boolean}
   */
  isValidPercentage(value) {
    return this.isNumberInRange(value, 0, 100);
  },

  /**
   * Validate exercise type
   * @param {string} exerciseType - Exercise type to validate
   * @returns {boolean}
   */
  isValidExerciseType(exerciseType) {
    return Object.values(CONSTANTS.EXERCISE_TYPES).includes(exerciseType);
  },

  /**
   * Validate difficulty level
   * @param {string} difficulty - Difficulty to validate
   * @returns {boolean}
   */
  isValidDifficulty(difficulty) {
    return Object.values(CONSTANTS.DIFFICULTY).includes(difficulty);
  },

  /**
   * Validate session status
   * @param {string} status - Status to validate
   * @returns {boolean}
   */
  isValidSessionStatus(status) {
    return ['in_progress', 'completed', 'abandoned'].includes(status);
  },

  /**
   * Validate ISO date string
   * @param {string} dateString - Date string to validate
   * @returns {boolean}
   */
  isValidISODate(dateString) {
    if (typeof dateString !== 'string') return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  },

  /**
   * Validate session object structure
   * @param {Object} session - Session object to validate
   * @returns {Object} Validation result {valid: boolean, errors: Array}
   */
  validateSession(session) {
    const errors = [];

    if (!session) {
      return { valid: false, errors: ['Session is null or undefined'] };
    }

    // Required fields
    if (!session.id || typeof session.id !== 'string') {
      errors.push('Invalid or missing session ID');
    }

    if (!this.isValidExerciseType(session.exerciseType)) {
      errors.push('Invalid exercise type');
    }

    if (!this.isValidISODate(session.startTime)) {
      errors.push('Invalid start time');
    }

    if (session.endTime && !this.isValidISODate(session.endTime)) {
      errors.push('Invalid end time');
    }

    if (!this.isValidSessionStatus(session.status)) {
      errors.push('Invalid session status');
    }

    if (!Array.isArray(session.trials)) {
      errors.push('Trials must be an array');
    }

    if (typeof session.statistics !== 'object') {
      errors.push('Statistics must be an object');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate trial object structure
   * @param {Object} trial - Trial object to validate
   * @returns {Object} Validation result {valid: boolean, errors: Array}
   */
  validateTrial(trial) {
    const errors = [];

    if (!trial) {
      return { valid: false, errors: ['Trial is null or undefined'] };
    }

    if (!this.isPositiveInteger(trial.trialNumber)) {
      errors.push('Invalid trial number');
    }

    if (!this.isValidISODate(trial.timestamp)) {
      errors.push('Invalid timestamp');
    }

    if (typeof trial.correct !== 'boolean') {
      errors.push('Correct field must be boolean');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate user data structure
   * @param {Object} userData - User data object to validate
   * @returns {Object} Validation result {valid: boolean, errors: Array}
   */
  validateUserData(userData) {
    const errors = [];

    if (!userData) {
      return { valid: false, errors: ['User data is null or undefined'] };
    }

    if (!userData.version || typeof userData.version !== 'string') {
      errors.push('Invalid or missing version');
    }

    if (!userData.userId || typeof userData.userId !== 'string') {
      errors.push('Invalid or missing user ID');
    }

    if (!this.isValidISODate(userData.createdAt)) {
      errors.push('Invalid createdAt date');
    }

    if (!userData.exercises || typeof userData.exercises !== 'object') {
      errors.push('Invalid exercises object');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Sanitize string input
   * @param {string} input - Input string to sanitize
   * @param {number} maxLength - Maximum length (optional)
   * @returns {string} Sanitized string
   */
  sanitizeString(input, maxLength = null) {
    if (typeof input !== 'string') {
      return '';
    }

    let sanitized = input.trim();

    // Remove any potentially harmful characters
    sanitized = sanitized.replace(/[<>]/g, '');

    // Limit length if specified
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  },

  /**
   * Validate and clamp a number to a range
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  clamp(value, min, max) {
    if (typeof value !== 'number' || isNaN(value)) {
      return min;
    }

    return Math.max(min, Math.min(max, value));
  },

  /**
   * Validate response time (reasonable human response)
   * @param {number} responseTime - Response time in milliseconds
   * @returns {boolean}
   */
  isValidResponseTime(responseTime) {
    // Response time should be between 100ms and 60 seconds
    return this.isNumberInRange(responseTime, 100, 60000);
  },

  /**
   * Validate digit for digit span exercise
   * @param {*} digit - Digit to validate
   * @returns {boolean}
   */
  isValidDigit(digit) {
    return this.isNumberInRange(digit, 0, 9);
  },

  /**
   * Validate letter for n-back exercise
   * @param {string} letter - Letter to validate
   * @returns {boolean}
   */
  isValidNBackLetter(letter) {
    return typeof letter === 'string' &&
           letter.length === 1 &&
           CONSTANTS.DUAL_N_BACK.LETTERS.includes(letter.toUpperCase());
  },

  /**
   * Validate grid position for n-back exercise
   * @param {number} position - Position (0-8 for 3x3 grid)
   * @returns {boolean}
   */
  isValidGridPosition(position) {
    const maxPosition = CONSTANTS.DUAL_N_BACK.GRID_SIZE * CONSTANTS.DUAL_N_BACK.GRID_SIZE - 1;
    return this.isNumberInRange(position, 0, maxPosition);
  },

  /**
   * Validate UFOV stimulus duration
   * @param {number} duration - Duration in milliseconds
   * @param {string} variant - 'basic' or 'complex'
   * @returns {boolean}
   */
  isValidUFOVDuration(duration, variant = 'basic') {
    const config = variant === 'basic'
      ? CONSTANTS.UFOV.BASIC
      : CONSTANTS.UFOV.COMPLEX;

    return this.isNumberInRange(duration, config.MIN_DURATION, config.MAX_DURATION);
  },

  /**
   * Validate storage availability and quota
   * @returns {Object} Storage status
   */
  async checkStorageStatus() {
    const status = {
      available: false,
      quota: 0,
      usage: 0,
      percentUsed: 0,
    };

    try {
      // Check if localStorage is available
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      status.available = true;

      // Check quota if available (not supported in all browsers)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        status.quota = estimate.quota || 0;
        status.usage = estimate.usage || 0;
        status.percentUsed = (status.usage / status.quota) * 100;
      }
    } catch (error) {
      console.error('Storage check error:', error);
      status.available = false;
    }

    return status;
  },

  /**
   * Validate that storage has enough space
   * @param {number} requiredBytes - Required bytes
   * @returns {boolean}
   */
  async hasEnoughStorage(requiredBytes = 1048576) { // Default 1MB
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const available = estimate.quota - estimate.usage;
        return available >= requiredBytes;
      }

      // If we can't check, assume there's enough
      return true;
    } catch (error) {
      console.error('Storage check error:', error);
      return true; // Assume OK if we can't check
    }
  },

  /**
   * Validate config object for an exercise
   * @param {Object} config - Configuration object
   * @param {Array<string>} requiredFields - Required field names
   * @returns {Object} Validation result
   */
  validateConfig(config, requiredFields = []) {
    const errors = [];

    if (!config || typeof config !== 'object') {
      return { valid: false, errors: ['Config must be an object'] };
    }

    requiredFields.forEach(field => {
      if (!(field in config)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// Make available globally
if (typeof window !== 'undefined') {
  window.Validation = Validation;
}
