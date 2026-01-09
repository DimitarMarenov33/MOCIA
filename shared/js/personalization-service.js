/**
 * PERSONALIZATION SERVICE
 * Manages personal data storage and retrieval for cognitive exercises.
 * All data is stored locally on the device only.
 */

const PersonalizationService = {
  STORAGE_KEY: 'mocia_personalization',

  /**
   * Get default empty data structure
   * @returns {Object} Empty personalization data structure
   */
  getDefaultData() {
    return {
      // Contact Information (for Digit Span)
      phoneNumbers: [],    // [{label, number}]
      postcodes: [],       // [{label, code}]
      importantDates: [],  // [{label, date}]

      // People (for Word Pair - Name/City associations)
      familyMembers: [],   // [{name, relation, city}]

      // Activities (for Word Pair - Activity/Day associations)
      weeklyActivities: [], // [{activity, day}]

      // Appointments (for Word Pair - Building/Time associations)
      regularAppointments: [], // [{location, time}]

      // Metadata
      _meta: {
        createdAt: null,
        lastModifiedAt: null,
        isConfigured: false
      }
    };
  },

  /**
   * Get personalization data from localStorage
   * @returns {Object|null} Personalization data or null if not set
   */
  getData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error reading personalization data:', error);
      return null;
    }
  },

  /**
   * Save personalization data to localStorage
   * @param {Object} data - Personalization data to save
   * @returns {boolean} Success status
   */
  saveData(data) {
    try {
      // Update metadata
      const now = new Date().toISOString();
      if (!data._meta) {
        data._meta = {};
      }
      if (!data._meta.createdAt) {
        data._meta.createdAt = now;
      }
      data._meta.lastModifiedAt = now;
      data._meta.isConfigured = this.hasAnyData(data);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving personalization data:', error);
      return false;
    }
  },

  /**
   * Check if any personal data has been entered
   * @param {Object} data - Data to check (optional, will fetch if not provided)
   * @returns {boolean} True if any personal data exists
   */
  hasAnyData(data = null) {
    const checkData = data || this.getData();
    if (!checkData) return false;

    return (
      (checkData.phoneNumbers?.length > 0) ||
      (checkData.postcodes?.length > 0) ||
      (checkData.importantDates?.length > 0) ||
      (checkData.familyMembers?.length > 0) ||
      (checkData.weeklyActivities?.length > 0) ||
      (checkData.regularAppointments?.length > 0)
    );
  },

  /**
   * Check if personalization is configured
   * @returns {boolean} True if configured
   */
  isConfigured() {
    const data = this.getData();
    return data?._meta?.isConfigured === true;
  },

  /**
   * Get phone numbers for Digit Span
   * @returns {Array} Array of phone number objects or empty array
   */
  getPhoneNumbers() {
    const data = this.getData();
    return data?.phoneNumbers || [];
  },

  /**
   * Get postcodes for Digit Span
   * @returns {Array} Array of postcode objects or empty array
   */
  getPostcodes() {
    const data = this.getData();
    return data?.postcodes || [];
  },

  /**
   * Get important dates for Digit Span
   * @returns {Array} Array of date objects or empty array
   */
  getImportantDates() {
    const data = this.getData();
    return data?.importantDates || [];
  },

  /**
   * Get family members for Word Pair (name-city pairs)
   * @returns {Array} Array of family member objects or empty array
   */
  getFamilyMembers() {
    const data = this.getData();
    return data?.familyMembers || [];
  },

  /**
   * Get weekly activities for Word Pair (activity-day pairs)
   * @returns {Array} Array of activity objects or empty array
   */
  getWeeklyActivities() {
    const data = this.getData();
    return data?.weeklyActivities || [];
  },

  /**
   * Get regular appointments for Word Pair (building-time pairs)
   * @returns {Array} Array of appointment objects or empty array
   */
  getRegularAppointments() {
    const data = this.getData();
    return data?.regularAppointments || [];
  },

  /**
   * Clear all personalization data
   * Note: This should be called when user clears all app data
   */
  clearData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing personalization data:', error);
      return false;
    }
  },

  /**
   * Get a random item from an array
   * @param {Array} array - Array to pick from
   * @returns {*} Random item or null if empty
   */
  getRandomItem(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * Parse phone number to array of characters (digits and +)
   * @param {string} phoneNumber - Phone number string
   * @returns {Array} Array of characters
   */
  parsePhoneToSequence(phoneNumber) {
    // Remove spaces and dashes, keep + and digits
    const cleaned = phoneNumber.replace(/[\s\-]/g, '');
    return cleaned.split('');
  },

  /**
   * Parse postcode to array of characters
   * @param {string} postcode - Postcode string (e.g., "1234 AB")
   * @returns {Array} Array of characters (digits and letters)
   */
  parsePostcodeToSequence(postcode) {
    // Remove spaces, keep digits and letters
    const cleaned = postcode.replace(/\s/g, '').toUpperCase();
    return cleaned.split('');
  },

  /**
   * Parse date to array of characters
   * @param {string} date - Date string (e.g., "15-03-1955")
   * @returns {Array} Array of characters including dashes
   */
  parseDateToSequence(date) {
    return date.split('');
  },

  /**
   * Get summary statistics for display
   * @returns {Object} Summary of configured data
   */
  getSummary() {
    const data = this.getData();
    if (!data) {
      return {
        isConfigured: false,
        phoneCount: 0,
        postcodeCount: 0,
        dateCount: 0,
        familyCount: 0,
        activityCount: 0,
        appointmentCount: 0
      };
    }

    return {
      isConfigured: data._meta?.isConfigured || false,
      phoneCount: data.phoneNumbers?.length || 0,
      postcodeCount: data.postcodes?.length || 0,
      dateCount: data.importantDates?.length || 0,
      familyCount: data.familyMembers?.length || 0,
      activityCount: data.weeklyActivities?.length || 0,
      appointmentCount: data.regularAppointments?.length || 0
    };
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.PersonalizationService = PersonalizationService;
}
