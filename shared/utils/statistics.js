/**
 * STATISTICS UTILITIES
 * Statistical calculations for performance analysis
 */

const Statistics = {
  /**
   * Calculate mean (average) of an array of numbers
   * @param {Array<number>} values - Array of numbers
   * @returns {number}
   */
  mean(values) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  },

  /**
   * Calculate median of an array of numbers
   * @param {Array<number>} values - Array of numbers
   * @returns {number}
   */
  median(values) {
    if (!values || values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  },

  /**
   * Calculate standard deviation
   * @param {Array<number>} values - Array of numbers
   * @returns {number}
   */
  standardDeviation(values) {
    if (!values || values.length === 0) return 0;

    const avg = this.mean(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = this.mean(squareDiffs);

    return Math.sqrt(avgSquareDiff);
  },

  /**
   * Calculate min value
   * @param {Array<number>} values - Array of numbers
   * @returns {number}
   */
  min(values) {
    if (!values || values.length === 0) return 0;
    return Math.min(...values);
  },

  /**
   * Calculate max value
   * @param {Array<number>} values - Array of numbers
   * @returns {number}
   */
  max(values) {
    if (!values || values.length === 0) return 0;
    return Math.max(...values);
  },

  /**
   * Calculate accuracy percentage
   * @param {number} correct - Number of correct responses
   * @param {number} total - Total number of responses
   * @returns {number} Accuracy as decimal (0-1)
   */
  accuracy(correct, total) {
    if (total === 0) return 0;
    return correct / total;
  },

  /**
   * Calculate accuracy percentage from array of boolean results
   * @param {Array<boolean>} results - Array of correct/incorrect
   * @returns {number} Accuracy as decimal (0-1)
   */
  accuracyFromResults(results) {
    if (!results || results.length === 0) return 0;
    const correct = results.filter(r => r).length;
    return this.accuracy(correct, results.length);
  },

  /**
   * Calculate percentile of a value in a dataset
   * @param {Array<number>} values - Array of numbers
   * @param {number} value - Value to find percentile for
   * @returns {number} Percentile (0-100)
   */
  percentile(values, value) {
    if (!values || values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);

    if (index === -1) return 100;
    if (index === 0) return 0;

    return (index / sorted.length) * 100;
  },

  /**
   * Calculate moving average
   * @param {Array<number>} values - Array of numbers
   * @param {number} windowSize - Size of moving window
   * @returns {Array<number>} Array of moving averages
   */
  movingAverage(values, windowSize) {
    if (!values || values.length < windowSize) return values;

    const result = [];

    for (let i = 0; i <= values.length - windowSize; i++) {
      const window = values.slice(i, i + windowSize);
      result.push(this.mean(window));
    }

    return result;
  },

  /**
   * Calculate rate of change (trend)
   * @param {Array<number>} values - Array of numbers over time
   * @returns {number} Rate of change (positive = improving, negative = declining)
   */
  trend(values) {
    if (!values || values.length < 2) return 0;

    // Simple linear regression slope
    const n = values.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const sumX = this.sum(indices);
    const sumY = this.sum(values);
    const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = indices.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return slope;
  },

  /**
   * Sum of array values
   * @param {Array<number>} values - Array of numbers
   * @returns {number}
   */
  sum(values) {
    if (!values || values.length === 0) return 0;
    return values.reduce((acc, val) => acc + val, 0);
  },

  /**
   * Format percentage for display
   * @param {number} value - Decimal value (0-1)
   * @param {number} decimals - Number of decimal places
   * @returns {string}
   */
  formatPercentage(value, decimals = 0) {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * Format time duration in milliseconds to readable string
   * @param {number} ms - Duration in milliseconds
   * @returns {string}
   */
  formatDuration(ms) {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else if (ms < 3600000) {
      return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
    } else {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      return `${hours}h ${minutes}m`;
    }
  },

  /**
   * Format large numbers with commas
   * @param {number} num - Number to format
   * @returns {string}
   */
  formatNumber(num) {
    return num.toLocaleString();
  },

  /**
   * Calculate session statistics from trial data
   * @param {Array} trials - Array of trial objects
   * @returns {Object} Statistics object
   */
  calculateSessionStats(trials) {
    if (!trials || trials.length === 0) {
      return {
        totalTrials: 0,
        correctTrials: 0,
        incorrectTrials: 0,
        accuracy: 0,
        averageResponseTime: 0,
        medianResponseTime: 0,
        totalScore: 0,
      };
    }

    const correctTrials = trials.filter(t => t.correct).length;
    const responseTimes = trials
      .filter(t => t.responseTime !== undefined)
      .map(t => t.responseTime);

    const scores = trials
      .filter(t => t.score !== undefined)
      .map(t => t.score);

    return {
      totalTrials: trials.length,
      correctTrials,
      incorrectTrials: trials.length - correctTrials,
      accuracy: this.accuracy(correctTrials, trials.length),
      averageResponseTime: this.mean(responseTimes),
      medianResponseTime: this.median(responseTimes),
      totalScore: this.sum(scores),
    };
  },

  /**
   * Compare two sessions and calculate improvement
   * @param {Object} oldSession - Previous session
   * @param {Object} newSession - New session
   * @returns {Object} Comparison results
   */
  compareSessions(oldSession, newSession) {
    if (!oldSession || !newSession) return null;

    const oldStats = oldSession.statistics;
    const newStats = newSession.statistics;

    return {
      accuracyChange: newStats.accuracy - oldStats.accuracy,
      accuracyImprovement: ((newStats.accuracy - oldStats.accuracy) / oldStats.accuracy) * 100,
      scoreChange: (newStats.score || 0) - (oldStats.score || 0),
      responseTimeChange: (newStats.averageResponseTime || 0) - (oldStats.averageResponseTime || 0),
    };
  },

  /**
   * Get performance category based on accuracy
   * @param {number} accuracy - Accuracy (0-1)
   * @returns {Object} Category info
   */
  getPerformanceCategory(accuracy) {
    if (accuracy >= 0.90) {
      return {
        level: 'excellent',
        label: 'Excellent',
        color: 'success',
        message: 'Outstanding performance!',
      };
    } else if (accuracy >= 0.75) {
      return {
        level: 'good',
        label: 'Good',
        color: 'info',
        message: 'Great job!',
      };
    } else if (accuracy >= 0.60) {
      return {
        level: 'fair',
        label: 'Fair',
        color: 'warning',
        message: 'Keep practicing!',
      };
    } else {
      return {
        level: 'needs_improvement',
        label: 'Needs Improvement',
        color: 'error',
        message: 'Don\'t give up!',
      };
    }
  },

  /**
   * Calculate streak (consecutive days with activity)
   * @param {Array<string>} dates - Array of ISO date strings
   * @returns {number} Current streak in days
   */
  calculateStreak(dates) {
    if (!dates || dates.length === 0) return 0;

    // Sort dates in descending order
    const sortedDates = dates
      .map(d => new Date(d).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a);

    const today = new Date().setHours(0, 0, 0, 0);
    const oneDayMs = 24 * 60 * 60 * 1000;

    let streak = 0;
    let expectedDate = today;

    for (const date of sortedDates) {
      if (date === expectedDate) {
        streak++;
        expectedDate -= oneDayMs;
      } else if (date < expectedDate) {
        break;
      }
    }

    return streak;
  },
};

// Make available globally
if (typeof window !== 'undefined') {
  window.Statistics = Statistics;
}
