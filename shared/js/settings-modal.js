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
        <button id="open-developer-btn" class="btn btn-secondary" style="width: 100%;">
          Developer Instellingen
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
   * Show the developer settings modal
   */
  showDeveloperSettings() {
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="text-align: center; margin-bottom: var(--spacing-lg);">
        <h3 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-md);">Gegevens Exporteren</h3>
        <p style="font-size: var(--font-size-md); color: var(--color-text-secondary); margin-bottom: var(--spacing-md);">
          Download alle trainingsgegevens als JSON bestand
        </p>
        <button id="export-data-btn" class="btn btn-primary" style="width: 100%;">
          Exporteer Gegevens
        </button>
      </div>

      <hr style="margin: var(--spacing-lg) 0; border: none; border-top: 1px solid var(--color-border-light);">

      <div style="text-align: center; margin-bottom: var(--spacing-lg);">
        <h3 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-md);">App Versie</h3>
        <p style="font-size: var(--font-size-md); color: var(--color-text-secondary); margin-bottom: var(--spacing-md);">
          Vernieuw de app om de nieuwste versie te laden
        </p>
        <button id="update-app-btn" class="btn btn-secondary" style="width: 100%;">
          Controleer op Updates
        </button>
      </div>

      <hr style="margin: var(--spacing-lg) 0; border: none; border-top: 1px solid var(--color-border-light);">

      <div style="margin-bottom: var(--spacing-lg);">
        <label style="display: flex; align-items: center; font-size: var(--font-size-lg); cursor: pointer;">
          <input type="checkbox" id="debug-mode-toggle" ${localStorage.getItem('mocia_debug_mode') === 'true' ? 'checked' : ''}
                 style="width: 30px; height: 30px; margin-right: var(--spacing-md); cursor: pointer;">
          <span>Debug Modus</span>
        </label>
        <p style="margin: var(--spacing-sm) 0 0 calc(30px + var(--spacing-md)); font-size: var(--font-size-md); color: var(--color-text-secondary);">
          Toon console logs op het scherm (voor probleemoplossing)
        </p>
      </div>

      <hr style="margin: var(--spacing-lg) 0; border: none; border-top: 1px solid var(--color-border-light);">

      <div style="text-align: center;">
        <h3 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-md);">Compatibiliteit</h3>
        <button id="show-compat-btn" class="btn btn-secondary" style="width: 100%;">
          Toon Compatibiliteitsinfo
        </button>
      </div>
    `;

    const modal = UIComponents.createModal(
      'Developer Instellingen',
      content,
      [
        {
          text: 'Terug',
          onClick: (e, modalEl) => {
            modalEl.remove();
            this.show(); // Return to main settings
          },
          options: { variant: 'secondary' },
        },
        {
          text: 'Sluiten',
          onClick: (e, modalEl) => modalEl.remove(),
          options: { variant: 'primary' },
        },
      ]
    );

    // Set up developer settings event listeners
    this.setupDeveloperEventListeners(modal);

    UIComponents.showModal(modal);
  },

  /**
   * Set up event listeners for developer settings modal
   */
  setupDeveloperEventListeners(modal) {
    // Export data button
    modal.querySelector('#export-data-btn').addEventListener('click', () => {
      this.exportData();
    });

    // Update app button
    modal.querySelector('#update-app-btn').addEventListener('click', () => {
      this.updateApp(modal);
    });

    // Debug mode toggle
    modal.querySelector('#debug-mode-toggle').addEventListener('change', (e) => {
      if (e.target.checked) {
        if (window.MobileDebug) {
          window.MobileDebug.enable();
        } else {
          localStorage.setItem('mocia_debug_mode', 'true');
          alert('Debug modus ingeschakeld. Herlaad de pagina om te activeren.');
        }
      } else {
        if (window.MobileDebug) {
          window.MobileDebug.disable();
        } else {
          localStorage.setItem('mocia_debug_mode', 'false');
        }
      }
    });

    // Show compatibility info button
    modal.querySelector('#show-compat-btn').addEventListener('click', () => {
      modal.remove();
      if (window.CompatibilityCheck) {
        window.CompatibilityCheck.run();
        window.CompatibilityCheck.showResults();
      } else {
        alert('Compatibiliteitscheck niet beschikbaar. Herlaad de pagina.');
      }
    });
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

    // Personalization button
    modal.querySelector('#open-personalization-btn').addEventListener('click', () => {
      modal.remove();
      if (window.PersonalizationForm) {
        window.PersonalizationForm.open();
      } else {
        alert('Personalisatie module niet beschikbaar op deze pagina.');
      }
    });

    // Developer settings button
    modal.querySelector('#open-developer-btn').addEventListener('click', () => {
      modal.remove();
      this.showDeveloperSettings();
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
   * Update the app by clearing caches and reloading
   */
  async updateApp(modal) {
    const btn = modal.querySelector('#update-app-btn');
    btn.disabled = true;
    btn.textContent = 'Bezig met updaten...';

    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('[Settings] All caches cleared');
      }

      // Unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
        console.log('[Settings] Service worker unregistered');
      }

      // Show success message
      btn.textContent = 'Update voltooid!';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-success');

      if (window.AudioManager?.isEnabled()) {
        await window.AudioManager.speak('App wordt bijgewerkt');
      }

      // Reload after short delay
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);

    } catch (error) {
      console.error('[Settings] Update failed:', error);
      btn.textContent = 'Update mislukt';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-error');

      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Controleer op Updates';
        btn.classList.remove('btn-error');
        btn.classList.add('btn-primary');
      }, 2000);
    }
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
