/**
 * DATA TRACKER
 * Manages all data persistence using localStorage
 * Tracks sessions, user progress, and performance metrics
 */

class DataTracker {
  constructor() {
    if (DataTracker.instance) {
      return DataTracker.instance;
    }

    this.currentSession = null;
    this.storageAvailable = this.checkStorageAvailable();

    // Initialize user data if not exists
    this.initializeUserData();

    DataTracker.instance = this;
  }

  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  checkStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.error('localStorage is not available:', error);
      return false;
    }
  }

  /**
   * Initialize user data structure if it doesn't exist
   */
  initializeUserData() {
    if (!this.storageAvailable) {
      console.warn('Storage not available, data will not be persisted');
      return;
    }

    try {
      const userData = localStorage.getItem(CONSTANTS.STORAGE_KEYS.USER_DATA);

      if (!userData) {
        const initialData = {
          version: CONSTANTS.APP_VERSION,
          userId: 'default_user',
          createdAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          exercises: {},
        };

        // Initialize each exercise type
        Object.values(CONSTANTS.EXERCISE_TYPES).forEach(exerciseType => {
          initialData.exercises[exerciseType] = {
            sessions: [],
            totalSessions: 0,
            bestPerformance: null,
            averageAccuracy: 0,
            lastPlayed: null,
            performanceTrend: 'stable', // 'improving', 'stable', 'declining'
          };
        });

        localStorage.setItem(CONSTANTS.STORAGE_KEYS.USER_DATA, JSON.stringify(initialData));
      } else {
        // Update last accessed time
        const data = JSON.parse(userData);
        data.lastAccessedAt = new Date().toISOString();
        localStorage.setItem(CONSTANTS.STORAGE_KEYS.USER_DATA, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  }

  /**
   * Get all user data
   * @returns {Object|null}
   */
  getUserData() {
    if (!this.storageAvailable) return null;

    try {
      const data = localStorage.getItem(CONSTANTS.STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Save user data
   * @param {Object} data - User data to save
   */
  saveUserData(data) {
    if (!this.storageAvailable) return;

    try {
      data.lastAccessedAt = new Date().toISOString();
      localStorage.setItem(CONSTANTS.STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data:', error);

      // Check if quota exceeded
      if (error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, attempting cleanup');
        this.cleanupOldSessions();

        // Try again after cleanup
        try {
          localStorage.setItem(CONSTANTS.STORAGE_KEYS.USER_DATA, JSON.stringify(data));
        } catch (retryError) {
          console.error('Failed to save even after cleanup:', retryError);
        }
      }
    }
  }

  /**
   * Start a new exercise session
   * @param {string} exerciseType - Type of exercise
   * @param {Object} config - Initial configuration
   * @returns {Object} Session object
   */
  startSession(exerciseType, config = {}) {
    const session = {
      id: this.generateSessionId(),
      exerciseType: exerciseType,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'in_progress', // 'in_progress', 'completed', 'abandoned'
      initialDifficulty: config.initialDifficulty || null,
      finalDifficulty: null,
      trials: [],
      statistics: {},
      config: config,
    };

    this.currentSession = session;
    return session;
  }

  /**
   * Record a trial result
   * @param {Object} trialData - Data for the current trial
   */
  recordTrial(trialData) {
    if (!this.currentSession) {
      console.error('No active session to record trial');
      return;
    }

    const trial = {
      trialNumber: this.currentSession.trials.length + 1,
      timestamp: new Date().toISOString(),
      ...trialData,
    };

    this.currentSession.trials.push(trial);
  }

  /**
   * Record post-exercise feedback
   * Attaches feedback to the most recent session for the exercise type
   * @param {Object} feedbackData - Feedback data including ratings and comments
   */
  recordFeedback(feedbackData) {
    if (!this.storageAvailable) return;

    const userData = this.getUserData();
    if (!userData) return;

    const exerciseType = feedbackData.exerciseType;
    const sessionId = feedbackData.sessionId;

    // Find the exercise data
    if (!userData.exercises[exerciseType]) {
      console.warn(`Exercise type '${exerciseType}' not found for feedback`);
      return;
    }

    const exerciseData = userData.exercises[exerciseType];

    // Find the session to attach feedback to
    let targetSession = null;

    if (sessionId) {
      // Find by session ID
      targetSession = exerciseData.sessions.find(s => s.id === sessionId);
    }

    if (!targetSession && exerciseData.sessions.length > 0) {
      // Fall back to most recent session
      targetSession = exerciseData.sessions[exerciseData.sessions.length - 1];
    }

    if (targetSession) {
      // Attach feedback to session
      targetSession.feedback = {
        timestamp: feedbackData.timestamp,
        contentMode: feedbackData.contentMode,
        ratings: feedbackData.ratings,
        comments: feedbackData.comments,
        skipped: feedbackData.skipped
      };

      // Save updated data
      this.saveUserData(userData);
    } else {
      console.warn('No session found to attach feedback to');
    }
  }

  /**
   * Get the last completed session ID for an exercise type
   * @param {string} exerciseType - Type of exercise
   * @returns {string|null} Session ID or null
   */
  getLastSessionId(exerciseType) {
    const userData = this.getUserData();
    if (!userData || !userData.exercises[exerciseType]) return null;

    const sessions = userData.exercises[exerciseType].sessions;
    if (sessions.length === 0) return null;

    return sessions[sessions.length - 1].id;
  }

  /**
   * End current session and save to history
   * @param {Object} finalStats - Final session statistics
   * @param {string} status - Session end status ('completed' or 'abandoned')
   */
  endSession(finalStats = {}, status = 'completed') {
    if (!this.currentSession) {
      console.error('No active session to end');
      return;
    }

    // Update session
    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.status = status;
    this.currentSession.statistics = finalStats;

    // For abandoned sessions, record the exit point
    if (status === 'abandoned') {
      this.currentSession.exitInfo = {
        trialsCompleted: this.currentSession.trials.length,
        lastTrialNumber: this.currentSession.trials.length > 0
          ? this.currentSession.trials[this.currentSession.trials.length - 1].trialNumber
          : 0,
        exitTime: new Date().toISOString(),
        reason: finalStats.exitReason || 'user_exit'
      };
    }

    // Calculate session duration
    const startTime = new Date(this.currentSession.startTime);
    const endTime = new Date(this.currentSession.endTime);
    this.currentSession.duration = endTime - startTime;

    // Save to user data - save ALL sessions (completed AND abandoned)
    const userData = this.getUserData();
    if (userData) {
      const exerciseType = this.currentSession.exerciseType;

      // Ensure exercise type exists in userData (defensive check for new exercise types)
      if (!userData.exercises[exerciseType]) {
        console.warn(`Exercise type '${exerciseType}' not found in userData, initializing...`);
        userData.exercises[exerciseType] = {
          sessions: [],
          totalSessions: 0,
          completedSessions: 0,
          abandonedSessions: 0,
          bestPerformance: null,
          averageAccuracy: 0,
          lastPlayed: null,
          performanceTrend: 'stable',
        };
      }

      const exerciseData = userData.exercises[exerciseType];

      // Add session to history
      exerciseData.sessions.push(this.currentSession);
      exerciseData.totalSessions++;
      exerciseData.lastPlayed = this.currentSession.endTime;

      // Track completed vs abandoned sessions separately
      if (status === 'completed') {
        exerciseData.completedSessions = (exerciseData.completedSessions || 0) + 1;
      } else if (status === 'abandoned') {
        exerciseData.abandonedSessions = (exerciseData.abandonedSessions || 0) + 1;
      }

      // Limit number of stored sessions
      if (exerciseData.sessions.length > CONSTANTS.DATA.MAX_SESSIONS_STORED) {
        exerciseData.sessions = exerciseData.sessions.slice(-CONSTANTS.DATA.MAX_SESSIONS_STORED);
      }

      // Update statistics (only for completed sessions)
      if (status === 'completed') {
        this.updateExerciseStats(exerciseData, this.currentSession);
      }

      // Save updated data
      this.saveUserData(userData);
    }

    const completedSession = this.currentSession;
    this.currentSession = null;

    return completedSession;
  }

  /**
   * Abandon current session (convenience method for premature exit)
   * @param {Object} exitInfo - Additional exit information
   */
  abandonSession(exitInfo = {}) {
    if (!this.currentSession) {
      return;
    }

    const stats = {
      ...exitInfo,
      exitReason: exitInfo.reason || 'user_exit',
      trialsAtExit: this.currentSession.trials.length,
      partialAccuracy: this.calculatePartialAccuracy()
    };

    return this.endSession(stats, 'abandoned');
  }

  /**
   * Calculate accuracy from trials completed so far
   * @returns {number} Partial accuracy (0-1)
   */
  calculatePartialAccuracy() {
    if (!this.currentSession || this.currentSession.trials.length === 0) {
      return 0;
    }

    const correctTrials = this.currentSession.trials.filter(t => t.correct).length;
    return correctTrials / this.currentSession.trials.length;
  }

  /**
   * Save current session state without ending it (for recovery)
   * Called periodically or before potential page unload
   */
  saveSessionSnapshot() {
    if (!this.currentSession) return;

    try {
      const snapshot = {
        ...this.currentSession,
        snapshotTime: new Date().toISOString(),
        trialsCompleted: this.currentSession.trials.length
      };

      localStorage.setItem('mocia_session_snapshot', JSON.stringify(snapshot));
    } catch (error) {
      console.error('Error saving session snapshot:', error);
    }
  }

  /**
   * Clear session snapshot
   */
  clearSessionSnapshot() {
    try {
      localStorage.removeItem('mocia_session_snapshot');
    } catch (error) {
      console.error('Error clearing session snapshot:', error);
    }
  }

  /**
   * Recover abandoned session from snapshot (if exists)
   * @returns {Object|null} Recovered session or null
   */
  recoverAbandonedSession() {
    try {
      const snapshot = localStorage.getItem('mocia_session_snapshot');
      if (!snapshot) return null;

      const session = JSON.parse(snapshot);

      // Save recovered session as abandoned
      this.currentSession = session;
      this.abandonSession({ reason: 'page_unload_recovery' });

      // Clear the snapshot
      this.clearSessionSnapshot();

      return session;
    } catch (error) {
      console.error('Error recovering session:', error);
      return null;
    }
  }

  /**
   * Update exercise statistics based on new session
   * @param {Object} exerciseData - Exercise data object
   * @param {Object} session - Completed session
   */
  updateExerciseStats(exerciseData, session) {
    const stats = session.statistics;

    // Update best performance (exercise-specific)
    if (stats.score !== undefined) {
      if (!exerciseData.bestPerformance || stats.score > exerciseData.bestPerformance.score) {
        exerciseData.bestPerformance = {
          score: stats.score,
          date: session.endTime,
          ...stats,
        };
      }
    }

    // Calculate average accuracy
    if (exerciseData.sessions.length > 0) {
      const totalAccuracy = exerciseData.sessions.reduce((sum, s) => {
        return sum + (s.statistics.accuracy || 0);
      }, 0);
      exerciseData.averageAccuracy = totalAccuracy / exerciseData.sessions.length;
    }

    // Determine performance trend
    exerciseData.performanceTrend = this.calculatePerformanceTrend(exerciseData.sessions);
  }

  /**
   * Calculate performance trend from recent sessions
   * @param {Array} sessions - Array of session objects
   * @returns {string} 'improving', 'stable', or 'declining'
   */
  calculatePerformanceTrend(sessions) {
    if (sessions.length < 3) {
      return 'stable';
    }

    // Compare recent 3 sessions with previous 3 sessions
    const recentSessions = sessions.slice(-3);
    const previousSessions = sessions.slice(-6, -3);

    if (previousSessions.length === 0) {
      return 'stable';
    }

    const recentAvg = recentSessions.reduce((sum, s) =>
      sum + (s.statistics.accuracy || 0), 0) / recentSessions.length;

    const previousAvg = previousSessions.reduce((sum, s) =>
      sum + (s.statistics.accuracy || 0), 0) / previousSessions.length;

    const difference = recentAvg - previousAvg;

    if (difference > 0.05) { // 5% improvement
      return 'improving';
    } else if (difference < -0.05) { // 5% decline
      return 'declining';
    } else {
      return 'stable';
    }
  }

  /**
   * Get exercise history
   * @param {string} exerciseType - Type of exercise
   * @returns {Object} Exercise data with history
   */
  getExerciseHistory(exerciseType) {
    const userData = this.getUserData();
    if (!userData || !userData.exercises[exerciseType]) {
      return null;
    }

    return userData.exercises[exerciseType];
  }

  /**
   * Get all exercise histories
   * @returns {Object} All exercise data
   */
  getAllHistory() {
    const userData = this.getUserData();
    return userData ? userData.exercises : {};
  }

  /**
   * Get aggregate statistics across all exercises
   * @returns {Object} Aggregate statistics
   */
  getAggregateStats() {
    const userData = this.getUserData();
    if (!userData) return null;

    let totalSessions = 0;
    let totalTime = 0;
    let favoriteExercise = null;
    let maxSessions = 0;

    Object.entries(userData.exercises).forEach(([exerciseType, data]) => {
      totalSessions += data.totalSessions;

      // Calculate total time for this exercise
      const exerciseTime = data.sessions.reduce((sum, session) =>
        sum + (session.duration || 0), 0);
      totalTime += exerciseTime;

      // Find favorite exercise
      if (data.totalSessions > maxSessions) {
        maxSessions = data.totalSessions;
        favoriteExercise = exerciseType;
      }
    });

    return {
      totalSessions,
      totalTime,
      totalTimeHours: (totalTime / (1000 * 60 * 60)).toFixed(1),
      favoriteExercise,
      createdAt: userData.createdAt,
      daysSinceStart: this.getDaysSince(userData.createdAt),
    };
  }

  /**
   * Get recommended exercise based on history
   * @returns {string|null} Recommended exercise type
   */
  getRecommendedExercise() {
    const userData = this.getUserData();
    if (!userData) return null;

    let leastRecentExercise = null;
    let oldestDate = new Date();

    Object.entries(userData.exercises).forEach(([exerciseType, data]) => {
      if (!data.lastPlayed) {
        return exerciseType; // Never played - highly recommended
      }

      const lastPlayedDate = new Date(data.lastPlayed);
      if (lastPlayedDate < oldestDate) {
        oldestDate = lastPlayedDate;
        leastRecentExercise = exerciseType;
      }
    });

    return leastRecentExercise;
  }

  /**
   * Export all user data as JSON
   * Includes:
   * - Session timestamps (start/end)
   * - Exercise type per session
   * - Per-trial accuracy (%)
   * - Per-trial response time (ms)
   * - Difficulty level per trial
   * - Content mode (generic/personalized)
   * - Quit points (abandoned sessions)
   * - Phase C choices (personalization preference)
   * @returns {string} JSON string of all data
   */
  exportData() {
    const userData = this.getUserData();
    if (!userData) return null;

    // Get personalization preference data (Phase C choice)
    let personalizationData = null;
    if (window.PersonalizationCounter) {
      personalizationData = window.PersonalizationCounter.getExportData();
    }

    // Get feedback history
    let feedbackHistory = [];
    if (window.FeedbackModal) {
      feedbackHistory = window.FeedbackModal.getAllFeedback();
    }

    // Deep clone exercise data for redaction
    const redactedExercises = this.redactPersonalData(JSON.parse(JSON.stringify(userData.exercises)));

    // Build export object with all required data points
    const exportObject = {
      version: userData.version,
      exportedAt: new Date().toISOString(),
      userId: userData.userId,
      createdAt: userData.createdAt,
      lastAccessedAt: userData.lastAccessedAt,

      // Phase C choices (personalization preference - generic vs personalized)
      personalizationPreference: personalizationData,

      // All exercise data with sessions, trials, feedback, and content modes
      // IMPORTANT: Personal data has been REDACTED
      exercises: redactedExercises,

      // Dedicated feedback history for easy analysis
      feedbackHistory: feedbackHistory,

      // Notice about redacted data
      _dataNotice: 'Personal data from personalization settings has been redacted for privacy.'
    };

    return JSON.stringify(exportObject, null, 2);
  }

  /**
   * Redact personal data from exercise data
   * Replaces actual personal content with redaction notice
   * @param {Object} exercises - Exercise data to redact
   * @returns {Object} Redacted exercise data
   */
  redactPersonalData(exercises) {
    const REDACTED = 'REDACTED BY SYSTEM/PERSONAL DATA';

    // Get personal data values to redact
    const personalValues = this.getPersonalDataValues();

    // Recursively redact personal values from the data
    const redactValue = (value) => {
      if (typeof value === 'string') {
        // Check if this string matches any personal data
        for (const personalValue of personalValues) {
          if (value === personalValue || value.includes(personalValue)) {
            return REDACTED;
          }
        }
        return value;
      }
      if (Array.isArray(value)) {
        return value.map(item => redactValue(item));
      }
      if (typeof value === 'object' && value !== null) {
        const redactedObj = {};
        for (const [key, val] of Object.entries(value)) {
          // Always redact these specific keys that contain personal data
          if (this.isPersonalDataKey(key)) {
            redactedObj[key] = REDACTED;
          } else {
            redactedObj[key] = redactValue(val);
          }
        }
        return redactedObj;
      }
      return value;
    };

    return redactValue(exercises);
  }

  /**
   * Get all personal data values for redaction matching
   * @returns {Array} Array of personal data strings to redact
   */
  getPersonalDataValues() {
    const values = [];

    if (!window.PersonalizationService) return values;

    const data = window.PersonalizationService.getData();
    if (!data) return values;

    // Collect phone numbers
    if (data.phoneNumbers) {
      data.phoneNumbers.forEach(item => {
        if (item.label) values.push(item.label);
        if (item.number) values.push(item.number);
      });
    }

    // Collect postcodes
    if (data.postcodes) {
      data.postcodes.forEach(item => {
        if (item.label) values.push(item.label);
        if (item.code) values.push(item.code);
      });
    }

    // Collect important dates
    if (data.importantDates) {
      data.importantDates.forEach(item => {
        if (item.label) values.push(item.label);
        if (item.date) values.push(item.date);
      });
    }

    // Collect family members
    if (data.familyMembers) {
      data.familyMembers.forEach(item => {
        if (item.name) values.push(item.name);
        if (item.relation) values.push(item.relation);
        if (item.city) values.push(item.city);
      });
    }

    // Collect weekly activities
    if (data.weeklyActivities) {
      data.weeklyActivities.forEach(item => {
        if (item.activity) values.push(item.activity);
      });
    }

    // Collect appointments
    if (data.regularAppointments) {
      data.regularAppointments.forEach(item => {
        if (item.location) values.push(item.location);
        if (item.time) values.push(item.time);
      });
    }

    return values.filter(v => v && v.length > 0);
  }

  /**
   * Check if a key name typically contains personal data
   * @param {string} key - Key name to check
   * @returns {boolean} True if key typically contains personal data
   */
  isPersonalDataKey(key) {
    const personalKeys = [
      'targetSequence',      // Contains actual phone/postcode sequences
      'userSequence',        // User's input of personal data
      'sequenceFormatted',   // Formatted personal sequence
      'currentSequence',     // Current sequence being shown
      'currentWord',         // May contain personal names
      'currentPair',         // May contain personal word pairs
      'familyMember',        // Family member data
      'personName',          // Person's name
      'phoneNumber',         // Phone number
      'postcode',            // Postal code
      'importantDate',       // Important date
      'appointmentLocation', // Appointment location
      'activityName',        // Activity name
    ];

    return personalKeys.some(pk =>
      key.toLowerCase().includes(pk.toLowerCase())
    );
  }

  /**
   * Import user data from JSON
   * @param {string} jsonData - JSON string of user data
   * @returns {boolean} Success status
   */
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      // Validate data structure
      if (!data.version || !data.exercises) {
        throw new Error('Invalid data format');
      }

      // Save imported data
      this.saveUserData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Clear all user data
   * WARNING: This cannot be undone
   */
  clearAllData() {
    if (!this.storageAvailable) return;

    try {
      localStorage.removeItem(CONSTANTS.STORAGE_KEYS.USER_DATA);
      this.currentSession = null;
      this.initializeUserData();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  /**
   * Cleanup old sessions to free up storage
   */
  cleanupOldSessions() {
    const userData = this.getUserData();
    if (!userData) return;

    Object.keys(userData.exercises).forEach(exerciseType => {
      const exerciseData = userData.exercises[exerciseType];
      if (exerciseData.sessions.length > CONSTANTS.DATA.MAX_SESSIONS_STORED / 2) {
        // Keep only half the max sessions
        exerciseData.sessions = exerciseData.sessions.slice(-Math.floor(CONSTANTS.DATA.MAX_SESSIONS_STORED / 2));
      }
    });

    this.saveUserData(userData);
  }

  /**
   * Generate unique session ID
   * @returns {string}
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate days since a given date
   * @param {string} dateString - ISO date string
   * @returns {number}
   */
  getDaysSince(dateString) {
    const startDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get current active session
   * @returns {Object|null}
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * Check if there's an active session
   * @returns {boolean}
   */
  hasActiveSession() {
    return this.currentSession !== null;
  }
}

// Create and export singleton instance
const dataTracker = new DataTracker();

// Make available globally
if (typeof window !== 'undefined') {
  window.DataTracker = dataTracker;

  // Handle page unload - save any active session as abandoned
  window.addEventListener('beforeunload', () => {
    if (dataTracker.hasActiveSession()) {
      // Save session snapshot for potential recovery
      dataTracker.saveSessionSnapshot();
    }
  });

  // Handle visibility change (tab hidden/closed on mobile)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && dataTracker.hasActiveSession()) {
      dataTracker.saveSessionSnapshot();
    }
  });

  // On page load, recover any abandoned sessions from previous visits
  window.addEventListener('load', () => {
    dataTracker.recoverAbandonedSession();
  });
}
