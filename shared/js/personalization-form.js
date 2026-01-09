/**
 * PERSONALIZATION FORM WIZARD
 * Multi-step form for collecting personal data for exercise personalization.
 */

const PersonalizationForm = {
  currentStep: 0,
  totalSteps: 6,
  formData: null,
  modalElement: null,

  // Days of the week for dropdowns
  DAYS: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'],

  // Relation types for family members
  RELATIONS: ['Partner', 'Zoon', 'Dochter', 'Kleinkind', 'Broer', 'Zus', 'Vriend(in)', 'Buurman/vrouw', 'Anders'],

  /**
   * Open the personalization form wizard
   */
  open() {
    // Initialize form data from existing data or defaults
    const existing = window.PersonalizationService.getData();
    this.formData = existing || window.PersonalizationService.getDefaultData();
    this.currentStep = 0;

    this.createModal();
    this.renderStep();
  },

  /**
   * Create the modal container
   */
  createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wizard-title');

    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.style.maxWidth = '500px';
    modal.style.maxHeight = '90vh';
    modal.style.overflow = 'auto';

    modal.innerHTML = `
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
        <span id="wizard-title">Personalisatie Instellen</span>
        <button class="modal-close-btn" aria-label="Sluiten" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 8px;">&times;</button>
      </div>
      <div class="modal-body">
        <div class="personalization-wizard">
          <div class="wizard-progress"></div>
          <div class="wizard-content"></div>
          <div class="wizard-navigation"></div>
        </div>
      </div>
    `;

    // Close button handler
    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
      this.close();
    });

    overlay.appendChild(modal);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    document.body.appendChild(overlay);
    this.modalElement = overlay;
  },

  /**
   * Close the modal
   */
  close() {
    if (this.modalElement) {
      this.modalElement.remove();
      this.modalElement = null;
    }
  },

  /**
   * Render the progress dots
   */
  renderProgress() {
    const progressContainer = this.modalElement.querySelector('.wizard-progress');
    progressContainer.innerHTML = '';

    for (let i = 0; i < this.totalSteps; i++) {
      const dot = document.createElement('div');
      dot.className = 'wizard-dot';
      if (i === this.currentStep) {
        dot.classList.add('active');
      } else if (i < this.currentStep) {
        dot.classList.add('completed');
      }
      progressContainer.appendChild(dot);
    }
  },

  /**
   * Render the current step
   */
  renderStep() {
    this.renderProgress();

    const contentContainer = this.modalElement.querySelector('.wizard-content');
    const navContainer = this.modalElement.querySelector('.wizard-navigation');

    switch (this.currentStep) {
      case 0:
        this.renderPhonePostcodeStep(contentContainer);
        break;
      case 1:
        this.renderDatesStep(contentContainer);
        break;
      case 2:
        this.renderFamilyStep(contentContainer);
        break;
      case 3:
        this.renderActivitiesStep(contentContainer);
        break;
      case 4:
        this.renderAppointmentsStep(contentContainer);
        break;
      case 5:
        this.renderConfirmationStep(contentContainer);
        break;
    }

    this.renderNavigation(navContainer);
  },

  /**
   * Render navigation buttons
   */
  renderNavigation(container) {
    container.innerHTML = '';

    const isFirstStep = this.currentStep === 0;
    const isLastStep = this.currentStep === this.totalSteps - 1;

    // Previous button
    if (!isFirstStep) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'btn btn-secondary';
      prevBtn.textContent = 'Vorige';
      prevBtn.addEventListener('click', () => this.previousStep());
      container.appendChild(prevBtn);
    } else {
      // Placeholder for layout
      const placeholder = document.createElement('div');
      container.appendChild(placeholder);
    }

    // Next/Save button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';

    if (isLastStep) {
      nextBtn.textContent = 'Opslaan';
      nextBtn.classList.remove('btn-primary');
      nextBtn.classList.add('btn-success');
      nextBtn.addEventListener('click', () => this.save());
    } else {
      nextBtn.textContent = 'Volgende';
      nextBtn.addEventListener('click', () => this.nextStep());
    }

    container.appendChild(nextBtn);
  },

  /**
   * Go to next step
   */
  nextStep() {
    this.collectCurrentStepData();
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.renderStep();
    }
  },

  /**
   * Go to previous step
   */
  previousStep() {
    this.collectCurrentStepData();
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep();
    }
  },

  /**
   * Collect data from current step inputs
   */
  collectCurrentStepData() {
    const contentContainer = this.modalElement.querySelector('.wizard-content');

    switch (this.currentStep) {
      case 0:
        this.formData.phoneNumbers = this.collectEntryCards(contentContainer, 'phone', ['label', 'number']);
        this.formData.postcodes = this.collectEntryCards(contentContainer, 'postcode', ['label', 'code']);
        break;
      case 1:
        this.formData.importantDates = this.collectEntryCards(contentContainer, 'date', ['label', 'date']);
        break;
      case 2:
        this.formData.familyMembers = this.collectEntryCards(contentContainer, 'family', ['name', 'relation', 'city']);
        break;
      case 3:
        this.formData.weeklyActivities = this.collectEntryCards(contentContainer, 'activity', ['activity', 'day']);
        break;
      case 4:
        this.formData.regularAppointments = this.collectEntryCards(contentContainer, 'appointment', ['location', 'time']);
        break;
    }
  },

  /**
   * Collect data from entry cards
   */
  collectEntryCards(container, prefix, fields) {
    const cards = container.querySelectorAll(`[data-entry-type="${prefix}"]`);
    const entries = [];

    cards.forEach(card => {
      const entry = {};
      let hasData = false;

      fields.forEach(field => {
        const input = card.querySelector(`[data-field="${field}"]`);
        if (input) {
          entry[field] = input.value.trim();
          if (entry[field]) hasData = true;
        }
      });

      // Only add if at least one field has data
      if (hasData) {
        entries.push(entry);
      }
    });

    return entries;
  },

  /**
   * Save all data
   */
  save() {
    this.collectCurrentStepData();

    // Save to PersonalizationService
    const success = window.PersonalizationService.saveData(this.formData);

    if (success) {
      // Start the day counter if this is first time configuring
      window.PersonalizationCounter.startCounter();

      // Show success message
      if (window.AudioManager) {
        window.AudioManager.speak('Uw persoonlijke gegevens zijn opgeslagen.');
      }

      this.close();

      // Refresh the settings modal status if it exists
      this.updateSettingsStatus();
    } else {
      alert('Er is een fout opgetreden bij het opslaan.');
    }
  },

  /**
   * Update the status display in settings
   */
  updateSettingsStatus() {
    const statusBadge = document.querySelector('.personalization-status .status-badge');
    if (statusBadge) {
      const summary = window.PersonalizationService.getSummary();
      if (summary.isConfigured) {
        statusBadge.className = 'status-badge status-configured';
        statusBadge.textContent = 'Geconfigureerd';
      } else {
        statusBadge.className = 'status-badge status-not-configured';
        statusBadge.textContent = 'Niet geconfigureerd';
      }
    }
  },

  // ===== STEP RENDERERS =====

  /**
   * Step 1: Phone Numbers & Postcodes
   */
  renderPhonePostcodeStep(container) {
    container.innerHTML = `
      <h3 class="wizard-step-title">Telefoonnummers & Postcodes</h3>
      <p class="wizard-step-description">
        Voeg telefoonnummers en postcodes toe die u vaak gebruikt.
        Deze worden gebruikt in geheugenoefeningen.
      </p>

      <div class="form-section">
        <div class="form-label" style="margin-bottom: var(--spacing-sm);">Telefoonnummers (max. 3)</div>
        <div id="phone-entries"></div>
        <button type="button" class="add-entry-btn" id="add-phone-btn">
          + Telefoonnummer toevoegen
        </button>
      </div>

      <div class="form-section" style="margin-top: var(--spacing-xl);">
        <div class="form-label" style="margin-bottom: var(--spacing-sm);">Postcodes (max. 3)</div>
        <div id="postcode-entries"></div>
        <button type="button" class="add-entry-btn" id="add-postcode-btn">
          + Postcode toevoegen
        </button>
      </div>

      <p class="skip-step" onclick="PersonalizationForm.nextStep()">Deze stap overslaan</p>
    `;

    // Render existing entries
    const phoneContainer = container.querySelector('#phone-entries');
    const postcodeContainer = container.querySelector('#postcode-entries');

    (this.formData.phoneNumbers || []).forEach((phone, index) => {
      phoneContainer.appendChild(this.createPhoneEntry(index, phone));
    });

    (this.formData.postcodes || []).forEach((postcode, index) => {
      postcodeContainer.appendChild(this.createPostcodeEntry(index, postcode));
    });

    // Add entry buttons
    container.querySelector('#add-phone-btn').addEventListener('click', () => {
      const count = phoneContainer.querySelectorAll('.entry-card').length;
      if (count < 3) {
        phoneContainer.appendChild(this.createPhoneEntry(count));
        this.updateAddButtonState(phoneContainer, container.querySelector('#add-phone-btn'), 3);
      }
    });

    container.querySelector('#add-postcode-btn').addEventListener('click', () => {
      const count = postcodeContainer.querySelectorAll('.entry-card').length;
      if (count < 3) {
        postcodeContainer.appendChild(this.createPostcodeEntry(count));
        this.updateAddButtonState(postcodeContainer, container.querySelector('#add-postcode-btn'), 3);
      }
    });

    // Update button states
    this.updateAddButtonState(phoneContainer, container.querySelector('#add-phone-btn'), 3);
    this.updateAddButtonState(postcodeContainer, container.querySelector('#add-postcode-btn'), 3);
  },

  createPhoneEntry(index, data = {}) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.setAttribute('data-entry-type', 'phone');

    card.innerHTML = `
      <div class="entry-card-header">
        <span class="entry-card-number">Telefoon ${index + 1}</span>
        <button type="button" class="entry-card-remove" aria-label="Verwijderen">&times;</button>
      </div>
      <div class="entry-card-fields">
        <input type="text" class="form-input" data-field="label" placeholder="Label (bijv. Partner, Huisarts)" value="${data.label || ''}">
        <input type="tel" class="form-input" data-field="number" placeholder="Telefoonnummer (bijv. 0612345678)" value="${data.number || ''}">
      </div>
    `;

    card.querySelector('.entry-card-remove').addEventListener('click', () => {
      card.remove();
      this.renumberEntries(card.parentElement, 'Telefoon');
      this.updateAddButtonState(card.parentElement, document.querySelector('#add-phone-btn'), 3);
    });

    return card;
  },

  createPostcodeEntry(index, data = {}) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.setAttribute('data-entry-type', 'postcode');

    card.innerHTML = `
      <div class="entry-card-header">
        <span class="entry-card-number">Postcode ${index + 1}</span>
        <button type="button" class="entry-card-remove" aria-label="Verwijderen">&times;</button>
      </div>
      <div class="entry-card-fields">
        <input type="text" class="form-input" data-field="label" placeholder="Label (bijv. Thuis, Werk)" value="${data.label || ''}">
        <input type="text" class="form-input" data-field="code" placeholder="Postcode (bijv. 1234 AB)" value="${data.code || ''}" style="text-transform: uppercase;">
      </div>
    `;

    card.querySelector('.entry-card-remove').addEventListener('click', () => {
      card.remove();
      this.renumberEntries(card.parentElement, 'Postcode');
      this.updateAddButtonState(card.parentElement, document.querySelector('#add-postcode-btn'), 3);
    });

    return card;
  },

  /**
   * Step 2: Important Dates
   */
  renderDatesStep(container) {
    container.innerHTML = `
      <h3 class="wizard-step-title">Belangrijke Datums</h3>
      <p class="wizard-step-description">
        Voeg verjaardagen, jubilea of andere belangrijke datums toe.
      </p>

      <div class="form-section">
        <div id="date-entries"></div>
        <button type="button" class="add-entry-btn" id="add-date-btn">
          + Datum toevoegen
        </button>
      </div>

      <p class="skip-step" onclick="PersonalizationForm.nextStep()">Deze stap overslaan</p>
    `;

    const dateContainer = container.querySelector('#date-entries');

    (this.formData.importantDates || []).forEach((date, index) => {
      dateContainer.appendChild(this.createDateEntry(index, date));
    });

    container.querySelector('#add-date-btn').addEventListener('click', () => {
      const count = dateContainer.querySelectorAll('.entry-card').length;
      if (count < 5) {
        dateContainer.appendChild(this.createDateEntry(count));
        this.updateAddButtonState(dateContainer, container.querySelector('#add-date-btn'), 5);
      }
    });

    this.updateAddButtonState(dateContainer, container.querySelector('#add-date-btn'), 5);
  },

  createDateEntry(index, data = {}) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.setAttribute('data-entry-type', 'date');

    card.innerHTML = `
      <div class="entry-card-header">
        <span class="entry-card-number">Datum ${index + 1}</span>
        <button type="button" class="entry-card-remove" aria-label="Verwijderen">&times;</button>
      </div>
      <div class="entry-card-fields">
        <input type="text" class="form-input" data-field="label" placeholder="Label (bijv. Verjaardag partner)" value="${data.label || ''}">
        <input type="text" class="form-input" data-field="date" placeholder="Datum (DD-MM-JJJJ)" value="${data.date || ''}">
      </div>
    `;

    card.querySelector('.entry-card-remove').addEventListener('click', () => {
      card.remove();
      this.renumberEntries(card.parentElement, 'Datum');
      this.updateAddButtonState(card.parentElement, document.querySelector('#add-date-btn'), 5);
    });

    return card;
  },

  /**
   * Step 3: Family Members
   */
  renderFamilyStep(container) {
    container.innerHTML = `
      <h3 class="wizard-step-title">Familie & Vrienden</h3>
      <p class="wizard-step-description">
        Voeg namen toe van familie en vrienden met hun woonplaats.
      </p>

      <div class="form-section">
        <div id="family-entries"></div>
        <button type="button" class="add-entry-btn" id="add-family-btn">
          + Persoon toevoegen
        </button>
      </div>

      <p class="skip-step" onclick="PersonalizationForm.nextStep()">Deze stap overslaan</p>
    `;

    const familyContainer = container.querySelector('#family-entries');

    (this.formData.familyMembers || []).forEach((member, index) => {
      familyContainer.appendChild(this.createFamilyEntry(index, member));
    });

    container.querySelector('#add-family-btn').addEventListener('click', () => {
      const count = familyContainer.querySelectorAll('.entry-card').length;
      if (count < 6) {
        familyContainer.appendChild(this.createFamilyEntry(count));
        this.updateAddButtonState(familyContainer, container.querySelector('#add-family-btn'), 6);
      }
    });

    this.updateAddButtonState(familyContainer, container.querySelector('#add-family-btn'), 6);
  },

  createFamilyEntry(index, data = {}) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.setAttribute('data-entry-type', 'family');

    const relationOptions = this.RELATIONS.map(r =>
      `<option value="${r}" ${data.relation === r ? 'selected' : ''}>${r}</option>`
    ).join('');

    card.innerHTML = `
      <div class="entry-card-header">
        <span class="entry-card-number">Persoon ${index + 1}</span>
        <button type="button" class="entry-card-remove" aria-label="Verwijderen">&times;</button>
      </div>
      <div class="entry-card-fields">
        <input type="text" class="form-input" data-field="name" placeholder="Naam (bijv. Jan)" value="${data.name || ''}">
        <div class="entry-row">
          <select class="form-select" data-field="relation">
            <option value="">Relatie...</option>
            ${relationOptions}
          </select>
          <input type="text" class="form-input" data-field="city" placeholder="Woonplaats" value="${data.city || ''}">
        </div>
      </div>
    `;

    card.querySelector('.entry-card-remove').addEventListener('click', () => {
      card.remove();
      this.renumberEntries(card.parentElement, 'Persoon');
      this.updateAddButtonState(card.parentElement, document.querySelector('#add-family-btn'), 6);
    });

    return card;
  },

  /**
   * Step 4: Weekly Activities
   */
  renderActivitiesStep(container) {
    container.innerHTML = `
      <h3 class="wizard-step-title">Wekelijkse Activiteiten</h3>
      <p class="wizard-step-description">
        Voeg uw vaste wekelijkse activiteiten toe met de dag.
      </p>

      <div class="form-section">
        <div id="activity-entries"></div>
        <button type="button" class="add-entry-btn" id="add-activity-btn">
          + Activiteit toevoegen
        </button>
      </div>

      <p class="skip-step" onclick="PersonalizationForm.nextStep()">Deze stap overslaan</p>
    `;

    const activityContainer = container.querySelector('#activity-entries');

    (this.formData.weeklyActivities || []).forEach((activity, index) => {
      activityContainer.appendChild(this.createActivityEntry(index, activity));
    });

    container.querySelector('#add-activity-btn').addEventListener('click', () => {
      const count = activityContainer.querySelectorAll('.entry-card').length;
      if (count < 5) {
        activityContainer.appendChild(this.createActivityEntry(count));
        this.updateAddButtonState(activityContainer, container.querySelector('#add-activity-btn'), 5);
      }
    });

    this.updateAddButtonState(activityContainer, container.querySelector('#add-activity-btn'), 5);
  },

  createActivityEntry(index, data = {}) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.setAttribute('data-entry-type', 'activity');

    const dayOptions = this.DAYS.map(d =>
      `<option value="${d}" ${data.day === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    card.innerHTML = `
      <div class="entry-card-header">
        <span class="entry-card-number">Activiteit ${index + 1}</span>
        <button type="button" class="entry-card-remove" aria-label="Verwijderen">&times;</button>
      </div>
      <div class="entry-card-fields">
        <input type="text" class="form-input" data-field="activity" placeholder="Activiteit (bijv. Zwemmen)" value="${data.activity || ''}">
        <select class="form-select" data-field="day">
          <option value="">Dag kiezen...</option>
          ${dayOptions}
        </select>
      </div>
    `;

    card.querySelector('.entry-card-remove').addEventListener('click', () => {
      card.remove();
      this.renumberEntries(card.parentElement, 'Activiteit');
      this.updateAddButtonState(card.parentElement, document.querySelector('#add-activity-btn'), 5);
    });

    return card;
  },

  /**
   * Step 5: Regular Appointments
   */
  renderAppointmentsStep(container) {
    container.innerHTML = `
      <h3 class="wizard-step-title">Vaste Afspraken</h3>
      <p class="wizard-step-description">
        Voeg locaties toe waar u regelmatig afspraken heeft met de gebruikelijke tijd.
      </p>

      <div class="form-section">
        <div id="appointment-entries"></div>
        <button type="button" class="add-entry-btn" id="add-appointment-btn">
          + Afspraak toevoegen
        </button>
      </div>

      <p class="skip-step" onclick="PersonalizationForm.nextStep()">Deze stap overslaan</p>
    `;

    const appointmentContainer = container.querySelector('#appointment-entries');

    (this.formData.regularAppointments || []).forEach((appointment, index) => {
      appointmentContainer.appendChild(this.createAppointmentEntry(index, appointment));
    });

    container.querySelector('#add-appointment-btn').addEventListener('click', () => {
      const count = appointmentContainer.querySelectorAll('.entry-card').length;
      if (count < 5) {
        appointmentContainer.appendChild(this.createAppointmentEntry(count));
        this.updateAddButtonState(appointmentContainer, container.querySelector('#add-appointment-btn'), 5);
      }
    });

    this.updateAddButtonState(appointmentContainer, container.querySelector('#add-appointment-btn'), 5);
  },

  createAppointmentEntry(index, data = {}) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.setAttribute('data-entry-type', 'appointment');

    card.innerHTML = `
      <div class="entry-card-header">
        <span class="entry-card-number">Afspraak ${index + 1}</span>
        <button type="button" class="entry-card-remove" aria-label="Verwijderen">&times;</button>
      </div>
      <div class="entry-card-fields">
        <input type="text" class="form-input" data-field="location" placeholder="Locatie (bijv. Huisarts, Kapper)" value="${data.location || ''}">
        <input type="time" class="form-input" data-field="time" value="${data.time || ''}">
      </div>
    `;

    card.querySelector('.entry-card-remove').addEventListener('click', () => {
      card.remove();
      this.renumberEntries(card.parentElement, 'Afspraak');
      this.updateAddButtonState(card.parentElement, document.querySelector('#add-appointment-btn'), 5);
    });

    return card;
  },

  /**
   * Step 6: Confirmation
   */
  renderConfirmationStep(container) {
    const summary = this.getSummaryForConfirmation();

    container.innerHTML = `
      <h3 class="wizard-step-title">Bevestiging</h3>
      <p class="wizard-step-description">
        Controleer uw ingevoerde gegevens. Klik op "Opslaan" om te bevestigen.
      </p>

      <div class="confirmation-summary">
        ${this.renderConfirmationSection('Telefoonnummers', this.formData.phoneNumbers, p => `${p.label}: ${p.number}`)}
        ${this.renderConfirmationSection('Postcodes', this.formData.postcodes, p => `${p.label}: ${p.code}`)}
        ${this.renderConfirmationSection('Belangrijke Datums', this.formData.importantDates, d => `${d.label}: ${d.date}`)}
        ${this.renderConfirmationSection('Familie & Vrienden', this.formData.familyMembers, f => `${f.name} (${f.relation}) - ${f.city}`)}
        ${this.renderConfirmationSection('Activiteiten', this.formData.weeklyActivities, a => `${a.activity} op ${a.day}`)}
        ${this.renderConfirmationSection('Afspraken', this.formData.regularAppointments, a => `${a.location} om ${a.time}`)}
      </div>

      <p style="margin-top: var(--spacing-lg); color: var(--color-text-secondary); font-size: var(--font-size-sm); text-align: center;">
        Al uw gegevens worden alleen op dit apparaat opgeslagen en worden niet gedeeld.
      </p>
    `;
  },

  renderConfirmationSection(title, items, formatter) {
    const validItems = (items || []).filter(item => {
      return Object.values(item).some(v => v && v.trim && v.trim() !== '');
    });

    if (validItems.length === 0) {
      return `
        <div class="confirmation-section">
          <div class="confirmation-section-title">${title}</div>
          <div class="confirmation-items">
            <div class="confirmation-empty">Geen gegevens ingevoerd</div>
          </div>
        </div>
      `;
    }

    const itemsHtml = validItems.map(item => `
      <div class="confirmation-item">
        <span class="confirmation-item-value">${formatter(item)}</span>
      </div>
    `).join('');

    return `
      <div class="confirmation-section">
        <div class="confirmation-section-title">${title}</div>
        <div class="confirmation-items">${itemsHtml}</div>
      </div>
    `;
  },

  // ===== UTILITY METHODS =====

  /**
   * Renumber entry cards after removal
   */
  renumberEntries(container, label) {
    if (!container) return;
    const cards = container.querySelectorAll('.entry-card');
    cards.forEach((card, index) => {
      const numberEl = card.querySelector('.entry-card-number');
      if (numberEl) {
        numberEl.textContent = `${label} ${index + 1}`;
      }
    });
  },

  /**
   * Update add button disabled state based on count
   */
  updateAddButtonState(container, button, max) {
    if (!container || !button) return;
    const count = container.querySelectorAll('.entry-card').length;
    button.disabled = count >= max;
  },

  /**
   * Get summary data for confirmation display
   */
  getSummaryForConfirmation() {
    return {
      phones: this.formData.phoneNumbers?.length || 0,
      postcodes: this.formData.postcodes?.length || 0,
      dates: this.formData.importantDates?.length || 0,
      family: this.formData.familyMembers?.length || 0,
      activities: this.formData.weeklyActivities?.length || 0,
      appointments: this.formData.regularAppointments?.length || 0
    };
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.PersonalizationForm = PersonalizationForm;
}
