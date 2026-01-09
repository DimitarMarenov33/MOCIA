/**
 * POST-EXERCISE FEEDBACK MODAL
 * Collects user feedback after exercise completion.
 *
 * Collects:
 * - Enjoyment rating (1-5 Likert scale)
 * - Perceived relevance rating (1-5 Likert scale)
 * - Perceived ease rating (1-5 Likert scale)
 * - Optional open text comments
 *
 * Data is tagged with content mode (generic/personalized) for phase comparison.
 */

const FeedbackModal = {
  // Callback to execute after feedback is submitted
  onComplete: null,

  // Current session data for tagging
  sessionData: null,

  /**
   * Show the feedback modal after exercise completion
   * @param {Object} options - Configuration options
   * @param {string} options.exerciseType - Type of exercise completed
   * @param {string} options.sessionId - Session ID to attach feedback to
   * @param {Function} options.onComplete - Callback when feedback is submitted
   */
  show(options = {}) {
    this.sessionData = {
      exerciseType: options.exerciseType || 'unknown',
      sessionId: options.sessionId || null,
      contentMode: window.PersonalizationCounter?.getContentMode() || 'generic'
    };
    this.onComplete = options.onComplete || null;

    this.createModal();
  },

  /**
   * Create and display the feedback modal
   */
  createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay feedback-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'feedback-title');

    const modal = document.createElement('div');
    modal.className = 'modal-content feedback-modal';
    modal.style.maxWidth = '500px';
    modal.style.maxHeight = '90vh';
    modal.style.overflow = 'auto';

    modal.innerHTML = `
      <div class="modal-header">
        <h2 id="feedback-title" style="margin: 0; font-size: var(--font-size-xl);">Hoe was de oefening?</h2>
      </div>
      <div class="modal-body">
        <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-xl); font-size: var(--font-size-md);">
          Help ons de oefeningen te verbeteren door uw ervaring te delen.
        </p>

        <form id="feedback-form" class="feedback-form">
          <!-- Enjoyment Rating -->
          <div class="feedback-question">
            <label class="feedback-label">Hoe leuk vond u deze oefening?</label>
            <div class="likert-scale" data-question="enjoyment">
              <div class="likert-labels">
                <span>Niet leuk</span>
                <span>Zeer leuk</span>
              </div>
              <div class="likert-options">
                ${this.renderLikertOptions('enjoyment')}
              </div>
            </div>
          </div>

          <!-- Relevance Rating -->
          <div class="feedback-question">
            <label class="feedback-label">Hoe relevant voelde de inhoud voor u?</label>
            <div class="likert-scale" data-question="relevance">
              <div class="likert-labels">
                <span>Niet relevant</span>
                <span>Zeer relevant</span>
              </div>
              <div class="likert-options">
                ${this.renderLikertOptions('relevance')}
              </div>
            </div>
          </div>

          <!-- Ease Rating -->
          <div class="feedback-question">
            <label class="feedback-label">Hoe makkelijk was de oefening?</label>
            <div class="likert-scale" data-question="ease">
              <div class="likert-labels">
                <span>Zeer moeilijk</span>
                <span>Zeer makkelijk</span>
              </div>
              <div class="likert-options">
                ${this.renderLikertOptions('ease')}
              </div>
            </div>
          </div>

          <!-- Open Text Comments -->
          <div class="feedback-question">
            <label class="feedback-label" for="feedback-comments">
              Heeft u nog opmerkingen? <span style="color: var(--color-text-secondary); font-weight: normal;">(optioneel)</span>
            </label>
            <textarea
              id="feedback-comments"
              class="feedback-textarea"
              rows="3"
              placeholder="Deel uw gedachten over de oefening..."
            ></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer" style="display: flex; gap: var(--spacing-md); justify-content: flex-end; padding: var(--spacing-lg); border-top: 1px solid var(--color-border-light);">
        <button type="button" id="skip-feedback-btn" class="btn btn-secondary">
          Overslaan
        </button>
        <button type="button" id="submit-feedback-btn" class="btn btn-success">
          Versturen
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Set up event listeners
    this.setupEventListeners(overlay, modal);

    // Speak instruction
    if (window.AudioManager?.isEnabled()) {
      window.AudioManager.speak('Geef alstublieft feedback over de oefening.');
    }
  },

  /**
   * Render Likert scale options (1-5)
   * @param {string} questionName - Name of the question for radio group
   * @returns {string} HTML string of radio options
   */
  renderLikertOptions(questionName) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `
        <label class="likert-option">
          <input type="radio" name="${questionName}" value="${i}">
          <span class="likert-button">${i}</span>
        </label>
      `;
    }
    return html;
  },

  /**
   * Set up event listeners for the modal
   */
  setupEventListeners(overlay, modal) {
    // Submit button
    modal.querySelector('#submit-feedback-btn').addEventListener('click', () => {
      this.submitFeedback(overlay);
    });

    // Skip button
    modal.querySelector('#skip-feedback-btn').addEventListener('click', () => {
      this.skipFeedback(overlay);
    });

    // Likert option click feedback
    modal.querySelectorAll('.likert-option input').forEach(input => {
      input.addEventListener('change', () => {
        // Visual feedback - highlight selected
        const scale = input.closest('.likert-scale');
        scale.querySelectorAll('.likert-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        input.closest('.likert-option').classList.add('selected');

        // Haptic feedback
        if (window.AudioManager) {
          window.AudioManager.hapticPress();
        }
      });
    });

    // Prevent closing by clicking overlay (must submit or skip)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        // Gentle reminder
        modal.style.animation = 'shake 0.3s ease';
        setTimeout(() => {
          modal.style.animation = '';
        }, 300);
      }
    });
  },

  /**
   * Collect and submit feedback data
   */
  submitFeedback(overlay) {
    const form = overlay.querySelector('#feedback-form');

    // Collect ratings
    const enjoyment = form.querySelector('input[name="enjoyment"]:checked')?.value || null;
    const relevance = form.querySelector('input[name="relevance"]:checked')?.value || null;
    const ease = form.querySelector('input[name="ease"]:checked')?.value || null;
    const comments = form.querySelector('#feedback-comments').value.trim();

    // Validate at least one rating is provided
    if (!enjoyment && !relevance && !ease && !comments) {
      // If nothing filled, treat as skip
      this.skipFeedback(overlay);
      return;
    }

    const feedbackData = {
      timestamp: new Date().toISOString(),
      exerciseType: this.sessionData.exerciseType,
      sessionId: this.sessionData.sessionId,
      contentMode: this.sessionData.contentMode,
      ratings: {
        enjoyment: enjoyment ? parseInt(enjoyment) : null,
        relevance: relevance ? parseInt(relevance) : null,
        ease: ease ? parseInt(ease) : null
      },
      comments: comments || null,
      skipped: false
    };

    // Save feedback via DataTracker
    this.saveFeedback(feedbackData);

    // Close modal
    this.closeModal(overlay);

    // Speak confirmation
    if (window.AudioManager?.isEnabled()) {
      window.AudioManager.speak('Bedankt voor uw feedback.');
    }
  },

  /**
   * Skip feedback collection
   */
  skipFeedback(overlay) {
    const feedbackData = {
      timestamp: new Date().toISOString(),
      exerciseType: this.sessionData.exerciseType,
      sessionId: this.sessionData.sessionId,
      contentMode: this.sessionData.contentMode,
      ratings: {
        enjoyment: null,
        relevance: null,
        ease: null
      },
      comments: null,
      skipped: true
    };

    // Save skipped feedback record
    this.saveFeedback(feedbackData);

    // Close modal
    this.closeModal(overlay);
  },

  /**
   * Save feedback data via DataTracker
   */
  saveFeedback(feedbackData) {
    // Use DataTracker to save feedback
    if (window.DataTracker) {
      window.DataTracker.recordFeedback(feedbackData);
    }

    // Also store in dedicated feedback storage for easy access
    this.storeFeedbackLocally(feedbackData);
  },

  /**
   * Store feedback in dedicated localStorage key
   */
  storeFeedbackLocally(feedbackData) {
    try {
      const storageKey = 'mocia_feedback_history';
      let feedbackHistory = [];

      const existing = localStorage.getItem(storageKey);
      if (existing) {
        feedbackHistory = JSON.parse(existing);
      }

      feedbackHistory.push(feedbackData);

      // Keep last 100 feedback entries
      if (feedbackHistory.length > 100) {
        feedbackHistory = feedbackHistory.slice(-100);
      }

      localStorage.setItem(storageKey, JSON.stringify(feedbackHistory));
    } catch (error) {
      console.error('Error storing feedback:', error);
    }
  },

  /**
   * Close the modal and execute callback
   */
  closeModal(overlay) {
    overlay.remove();

    // Execute completion callback
    if (this.onComplete && typeof this.onComplete === 'function') {
      this.onComplete();
    }
  },

  /**
   * Get all stored feedback for export
   * @returns {Array} Array of feedback records
   */
  getAllFeedback() {
    try {
      const storageKey = 'mocia_feedback_history';
      const existing = localStorage.getItem(storageKey);
      return existing ? JSON.parse(existing) : [];
    } catch (error) {
      console.error('Error reading feedback:', error);
      return [];
    }
  },

  /**
   * Clear all stored feedback
   */
  clearFeedback() {
    try {
      localStorage.removeItem('mocia_feedback_history');
    } catch (error) {
      console.error('Error clearing feedback:', error);
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.FeedbackModal = FeedbackModal;
}
