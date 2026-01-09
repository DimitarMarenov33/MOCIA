/**
 * SETTINGS MODAL
 * Shared settings modal component used across all pages.
 * Handles audio, display, personalization, and data management settings.
 */

const SettingsModal = {
  /**
   * Show the settings modal
   */
  show() {
    const audioEnabled = window.AudioManager?.isEnabled() || false;
    const personalizationSummary = window.PersonalizationService?.getSummary() || { isConfigured: false };
    const personalizationConfigured = personalizationSummary.isConfigured;

    const content = document.createElement('div');
    content.innerHTML = `
      <div style="margin-bottom: var(--spacing-lg);">
        <label style="display: flex; align-items: center; font-size: var(--font-size-lg); cursor: pointer;">
          <input type="checkbox" id="audio-toggle" ${audioEnabled ? 'checked' : ''}
                 style="width: 30px; height: 30px; margin-right: var(--spacing-md); cursor: pointer;">
          <span>Voice-over (gesproken instructies)</span>
        </label>
        <p style="margin: var(--spacing-sm) 0 0 calc(30px + var(--spacing-md)); font-size: var(--font-size-md); color: var(--color-text-secondary);">
          Laat de app instructies en feedback hardop voorlezen
        </p>
      </div>

      <div style="margin-bottom: var(--spacing-lg);">
        <label style="display: flex; align-items: center; font-size: var(--font-size-lg); cursor: pointer;">
          <input type="checkbox" id="large-text-toggle" ${document.body.classList.contains('large-text') ? 'checked' : ''}
                 style="width: 30px; height: 30px; margin-right: var(--spacing-md); cursor: pointer;">
          <span>Grote tekst modus</span>
        </label>
      </div>

      <div style="margin-bottom: var(--spacing-lg);">
        <label style="display: flex; align-items: center; font-size: var(--font-size-lg); cursor: pointer;">
          <input type="checkbox" id="high-contrast-toggle" ${document.body.classList.contains('high-contrast') ? 'checked' : ''}
                 style="width: 30px; height: 30px; margin-right: var(--spacing-md); cursor: pointer;">
          <span>Hoog contrast modus</span>
        </label>
      </div>

      <hr style="margin: var(--spacing-lg) 0; border: none; border-top: 1px solid var(--color-border-light);">

      <div class="personalization-section" style="margin-bottom: var(--spacing-lg);">
        <h3 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-sm);">Personalisatie</h3>
        <p class="personalization-description" style="font-size: var(--font-size-md); color: var(--color-text-secondary); margin-bottom: var(--spacing-md);">
          Voeg persoonlijke gegevens toe om oefeningen relevanter te maken. Alle gegevens blijven op dit apparaat.
        </p>
        <div class="personalization-status" style="margin-bottom: var(--spacing-md);">
          <span class="status-badge ${personalizationConfigured ? 'status-configured' : 'status-not-configured'}">
            ${personalizationConfigured ? 'Geconfigureerd' : 'Niet geconfigureerd'}
          </span>
        </div>
        <button id="open-personalization-btn" class="btn btn-secondary" style="width: 100%;">
          ${personalizationConfigured ? 'Personalisatie Bewerken' : 'Personalisatie Instellen'}
        </button>
      </div>

      <hr style="margin: var(--spacing-lg) 0; border: none; border-top: 1px solid var(--color-border-light);">

      <div style="text-align: center;">
        <p style="margin-bottom: var(--spacing-md);">Gegevensbeheer</p>
        <button id="export-data-btn" class="btn btn-secondary" style="margin-bottom: var(--spacing-sm); width: 100%;">
          Exporteer Gegevens
        </button>
        <button id="clear-data-btn" class="btn btn-error" style="width: 100%;">
          Wis Alle Gegevens
        </button>
      </div>
    `;

    const modal = UIComponents.createModal(
      'Instellingen',
      content,
      [
        {
          text: 'Sluiten',
          onClick: (e, modalEl) => modalEl.remove(),
          options: { variant: 'primary' },
        },
      ]
    );

    // Set up event listeners
    this.setupEventListeners(modal);

    UIComponents.showModal(modal);
  },

  /**
   * Set up all event listeners for the modal
   */
  setupEventListeners(modal) {
    // Audio toggle
    modal.querySelector('#audio-toggle').addEventListener('change', (e) => {
      if (e.target.checked) {
        window.AudioManager?.enable();
        window.AudioManager?.speak('Voice-over ingeschakeld. Instructies worden nu hardop voorgelezen.');
      } else {
        window.AudioManager?.speak('Voice-over uitgeschakeld');
        setTimeout(() => {
          window.AudioManager?.disable();
        }, 2000);
      }
    });

    // Large text toggle
    modal.querySelector('#large-text-toggle').addEventListener('change', (e) => {
      document.body.classList.toggle('large-text', e.target.checked);
      this.saveSetting('largeText', e.target.checked);
    });

    // High contrast toggle
    modal.querySelector('#high-contrast-toggle').addEventListener('change', (e) => {
      document.body.classList.toggle('high-contrast', e.target.checked);
      this.saveSetting('highContrast', e.target.checked);
    });

    // Export data button
    modal.querySelector('#export-data-btn').addEventListener('click', () => {
      this.exportData();
    });

    // Clear data button
    modal.querySelector('#clear-data-btn').addEventListener('click', () => {
      this.confirmClearData(modal);
    });

    // Personalization button
    modal.querySelector('#open-personalization-btn').addEventListener('click', () => {
      modal.remove();
      if (window.PersonalizationForm) {
        window.PersonalizationForm.open();
      } else {
        alert('Personalisatie module niet beschikbaar op deze pagina.');
      }
    });
  },

  /**
   * Save a setting to localStorage
   */
  saveSetting(key, value) {
    try {
      let settings = {};
      const existing = localStorage.getItem(CONSTANTS.STORAGE_KEYS.APP_SETTINGS);
      if (existing) {
        settings = JSON.parse(existing);
      }
      settings[key] = value;
      localStorage.setItem(CONSTANTS.STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  },

  /**
   * Load settings and apply them to the page
   */
  loadSettings() {
    try {
      const settings = localStorage.getItem(CONSTANTS.STORAGE_KEYS.APP_SETTINGS);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.largeText) {
          document.body.classList.add('large-text');
        }
        if (parsed.highContrast) {
          document.body.classList.add('high-contrast');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },

  /**
   * Export user data as JSON file
   */
  exportData() {
    const data = window.DataTracker?.exportData();
    if (!data) {
      alert('Geen gegevens om te exporteren.');
      return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mocia-cognitive-training-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.AudioManager) {
      window.AudioManager.speak('Gegevens geëxporteerd');
    }
  },

  /**
   * Show confirmation dialog for clearing all data
   */
  confirmClearData(parentModal) {
    const confirmModal = UIComponents.createModal(
      'Wis Alle Gegevens',
      '<p style="font-size: var(--font-size-lg);">Weet u zeker dat u alle gegevens wilt wissen? Dit kan niet ongedaan worden gemaakt.</p>',
      [
        {
          text: 'Annuleren',
          onClick: (e, modalEl) => modalEl.remove(),
          options: { variant: 'secondary' },
        },
        {
          text: 'Ja, Wis Alles',
          onClick: (e, modalEl) => {
            window.DataTracker?.clearAllData();
            window.PersonalizationService?.clearData();
            window.PersonalizationCounter?.clearData();
            window.FeedbackModal?.clearFeedback();
            modalEl.remove();
            parentModal.remove();

            if (window.AudioManager) {
              window.AudioManager.speak('Alle gegevens gewist');
            }

            alert('Alle gegevens zijn gewist.');
            window.location.reload();
          },
          options: { variant: 'error' },
        },
      ]
    );

    UIComponents.showModal(confirmModal);
  },

  /**
   * Check if personalization preference popup should be shown
   * Call this on page load
   */
  checkPersonalizationPopup() {
    if (window.PersonalizationCounter?.shouldShowPreferencePopup()) {
      this.showPersonalizationPreferencePopup();
    }
  },

  /**
   * Show the personalization preference popup (Day 4)
   */
  showPersonalizationPreferencePopup() {
    // Mark popup as shown immediately to prevent showing again
    window.PersonalizationCounter?.markPopupShown();

    const content = document.createElement('div');
    content.className = 'preference-popup';
    content.innerHTML = `
      <p class="preference-intro">
        U heeft nu enkele dagen de oefeningen gedaan met willekeurige gegevens.
        Vanaf nu kunt u kiezen of u uw eigen persoonlijke gegevens wilt gebruiken
        (zoals namen van familieleden, uw postcode, etc.) of dat u liever
        willekeurige gegevens blijft gebruiken.
      </p>
      <p style="margin-bottom: var(--spacing-lg); color: var(--color-text-secondary); font-size: var(--font-size-md);">
        <strong>Let op:</strong> Deze keuze is definitief en kan niet worden gewijzigd.
      </p>
      <div class="preference-options">
        <div class="preference-option" data-choice="personalized">
          <div class="option-icon">&#128100;</div>
          <div class="option-title">Persoonlijke gegevens</div>
          <div class="option-description">
            Gebruik mijn eigen namen, adressen en afspraken in de oefeningen
          </div>
        </div>
        <div class="preference-option" data-choice="generic">
          <div class="option-icon">&#127922;</div>
          <div class="option-title">Willekeurige gegevens</div>
          <div class="option-description">
            Blijf willekeurige gegevens gebruiken in de oefeningen
          </div>
        </div>
      </div>
    `;

    const modal = UIComponents.createModal(
      'Kies uw voorkeur',
      content,
      []
    );

    // Prevent closing by clicking overlay
    modal.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Handle option selection
    content.querySelectorAll('.preference-option').forEach(option => {
      option.addEventListener('click', () => {
        const choice = option.dataset.choice;

        // Visual feedback
        content.querySelectorAll('.preference-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        option.classList.add('selected');

        // Save preference (permanent)
        window.PersonalizationCounter?.setUserPreference(choice);

        // Show confirmation
        const confirmMessage = choice === 'personalized'
          ? 'Vanaf nu gebruiken we uw persoonlijke gegevens in de oefeningen.'
          : 'We blijven willekeurige gegevens gebruiken in de oefeningen.';

        if (window.AudioManager?.isEnabled()) {
          window.AudioManager.speak(confirmMessage);
        }

        // Close modal after short delay
        setTimeout(() => {
          modal.remove();
        }, 1500);
      });
    });

    UIComponents.showModal(modal);
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.SettingsModal = SettingsModal;
}
