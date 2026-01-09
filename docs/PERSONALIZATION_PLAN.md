# Personalization Module Implementation Plan

## Overview

This module allows users to input personal information (phone numbers, names, postcodes, etc.) that will be used in cognitive exercises to make them more meaningful and relevant. The system implements an A/B testing approach where personalized data is introduced gradually.

---

## 1. Personal Data Schema

### Data to Collect (stored in localStorage)

```javascript
const PERSONALIZATION_DATA = {
  // Contact Information (for Digit Span)
  phoneNumbers: [
    { label: 'Mijn mobiel', number: '0612345678' },
    { label: 'Partner', number: '0698765432' },
    { label: 'Huisarts', number: '0201234567' }
  ],
  postcodes: [
    { label: 'Thuis', code: '1234 AB' },
    { label: 'Werk', code: '5678 CD' },
    { label: 'Familie', code: '9012 EF' }
  ],
  importantDates: [
    { label: 'Verjaardag', date: '15-03-1955' },
    { label: 'Trouwdag', date: '22-06-1980' },
    { label: 'Verjaardag partner', date: '08-11-1957' }
  ],

  // People (for Word Pair - Name/City associations)
  familyMembers: [
    { name: 'Jan', relation: 'Partner', city: 'Amsterdam' },
    { name: 'Sophie', relation: 'Dochter', city: 'Utrecht' },
    { name: 'Pieter', relation: 'Zoon', city: 'Rotterdam' },
    { name: 'Emma', relation: 'Kleinkind', city: 'Leiden' }
  ],

  // Activities (for Word Pair - Activity/Day associations)
  weeklyActivities: [
    { activity: 'Zwemmen', day: 'Maandag' },
    { activity: 'Bridgen', day: 'Woensdag' },
    { activity: 'Fysiotherapie', day: 'Vrijdag' }
  ],

  // Appointments (for Word Pair - Building/Time associations)
  regularAppointments: [
    { location: 'Huisarts', time: '10:30' },
    { location: 'Kapper', time: '14:00' },
    { location: 'Apotheek', time: '9:00' }
  ],

  // Metadata
  _meta: {
    createdAt: null,           // Timestamp when personalization was first entered
    lastModifiedAt: null,      // Last modification timestamp
    dayCounterStart: null,     // Date when A/B testing period started
    userPreference: null,      // 'personalized' | 'random' | null (not yet chosen)
    preferenceSetAt: null      // When user made their choice
  }
};
```

### Storage Key
```javascript
STORAGE_KEYS: {
  // ... existing keys
  PERSONALIZATION_DATA: 'mocia_personalization',
  PERSONALIZATION_COUNTER: 'mocia_personalization_counter'
}
```

---

## 2. A/B Testing Flow

### Timeline
```
Day 0: User enters personal data
Days 1-2: System uses RANDOM data (baseline)
Day 3: System switches to PERSONALIZED data
Day 4: Popup asks user preference
Day 5+: Uses user's chosen preference
```

### Day Counter Logic
```javascript
class PersonalizationDayCounter {
  constructor() {
    this.storageKey = 'mocia_personalization_counter';
  }

  // Initialize counter when personalization data is first entered
  startCounter() {
    const data = {
      startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      currentDay: 0,
      hasShownPreferencePopup: false,
      userPreference: null // 'random' | 'personalized'
    };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Calculate days elapsed since start
  getDaysElapsed() {
    const data = this.getData();
    if (!data?.startDate) return 0;

    const start = new Date(data.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    return Math.floor((today - start) / (1000 * 60 * 60 * 24));
  }

  // Determine which data mode to use
  getDataMode() {
    const data = this.getData();
    const days = this.getDaysElapsed();

    // If user has made a choice, use their preference
    if (data?.userPreference) {
      return data.userPreference;
    }

    // Days 1-2: Random data
    if (days < 3) {
      return 'random';
    }

    // Day 3+: Personalized data (until user chooses)
    return 'personalized';
  }

  // Check if we should show the preference popup
  shouldShowPreferencePopup() {
    const data = this.getData();
    const days = this.getDaysElapsed();

    return days >= 3 && !data?.hasShownPreferencePopup && !data?.userPreference;
  }
}
```

---

## 3. Settings Form Design

### Location
Add new section in the existing Settings modal (index.html line ~205-293).

### Form Structure

```html
<!-- Personalization Section in Settings Modal -->
<div class="settings-section personalization-section">
  <h3>Persoonlijke Gegevens</h3>
  <p class="settings-description">
    Voeg persoonlijke informatie toe om de oefeningen relevanter te maken.
    Alle gegevens blijven lokaal op uw apparaat.
  </p>

  <!-- Status indicator -->
  <div class="personalization-status">
    <span class="status-badge status-not-configured">Niet geconfigureerd</span>
  </div>

  <button id="open-personalization-form" class="btn btn-secondary">
    Personalisatie Instellen
  </button>
</div>
```

### Multi-Step Form (Modal Wizard)

**Step 1: Phone Numbers & Postcodes**
- Up to 3 phone numbers with labels
- Up to 3 postcodes with labels

**Step 2: Important Dates**
- Up to 3 dates with labels (birthdays, anniversaries)

**Step 3: Family & Friends**
- Up to 6 names with relation and city

**Step 4: Weekly Schedule**
- Up to 5 activities with associated days

**Step 5: Regular Appointments**
- Up to 5 locations with typical times

**Step 6: Confirmation**
- Review all entered data
- Save button

---

## 4. Exercise Integration Points

### 4.1 Digit Span (`digit-span.js`)

**Current**: Generates random phone numbers, postcodes, dates
**Personalized**: Uses user's actual phone numbers, postcodes, important dates

```javascript
// Modified generateSequence method
generateSequence(length) {
  const personalizationService = new PersonalizationService();
  const mode = personalizationService.getDataMode();
  const personalData = personalizationService.getData();

  if (mode === 'personalized' && personalData) {
    // Use personal data based on sequence type
    switch (this.currentSequenceType) {
      case 'phone':
        return this.generatePersonalizedPhoneSequence(length, personalData.phoneNumbers);
      case 'postcode':
        return this.generatePersonalizedPostcodeSequence(length, personalData.postcodes);
      case 'date':
        return this.generatePersonalizedDateSequence(length, personalData.importantDates);
    }
  }

  // Fall back to random generation
  return this.generateRandomSequence(length);
}
```

### 4.2 Word Pair (`word-pair.js` / `word-list.js`)

**Current**: Uses generic Dutch names, cities, activities
**Personalized**: Uses family members, personal schedule, appointments

```javascript
// Modified generateWordPairs function
function generateWordPairs(numPairs) {
  const personalizationService = new PersonalizationService();
  const mode = personalizationService.getDataMode();
  const personalData = personalizationService.getData();

  if (mode === 'personalized' && personalData) {
    // Mix personal and generic data (50/50 for variety)
    return generateMixedWordPairs(numPairs, personalData);
  }

  // Use generic data only
  return generateGenericWordPairs(numPairs);
}
```

### 4.3 Stroop (`stroop.js`)

**Current**: Uses generic buildings and days
**Potential**: Add personal locations category (lower priority)

### 4.4 Task Switching (`task-switching.js`)

**Current**: Uses days of the week
**Potential**: Could use personal schedule items (lower priority)

---

## 5. Day 4 Preference Popup

### Trigger Condition
- User has entered personalization data
- At least 3 days have passed since data entry
- Popup hasn't been shown before
- User hasn't made a preference choice yet

### Implementation

```javascript
// Check on app start (in index.html MainMenu.init())
async init() {
  // ... existing initialization ...

  // Check if personalization preference popup should show
  const personalizationCounter = new PersonalizationDayCounter();
  if (personalizationCounter.shouldShowPreferencePopup()) {
    await this.showPersonalizationPreferencePopup();
  }
}

showPersonalizationPreferencePopup() {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="preference-popup">
      <p class="preference-intro">
        U heeft nu enkele dagen de oefeningen gedaan.
        De afgelopen dagen gebruikten we willekeurige gegevens.
        Vanaf nu kunnen we uw persoonlijke gegevens gebruiken
        (zoals namen van familieleden, uw postcode, etc.).
      </p>

      <div class="preference-options">
        <div class="preference-option" data-choice="personalized">
          <div class="option-icon">&#128100;</div>
          <div class="option-title">Persoonlijke gegevens</div>
          <div class="option-description">
            Gebruik mijn eigen namen, adressen en afspraken
          </div>
        </div>

        <div class="preference-option" data-choice="random">
          <div class="option-icon">&#127922;</div>
          <div class="option-title">Willekeurige gegevens</div>
          <div class="option-description">
            Blijf willekeurige gegevens gebruiken
          </div>
        </div>
      </div>
    </div>
  `;

  const modal = UIComponents.createModal(
    'Kies uw voorkeur',
    content,
    [] // No buttons - selection is made by clicking options
  );

  // Handle option selection
  content.querySelectorAll('.preference-option').forEach(option => {
    option.addEventListener('click', () => {
      const choice = option.dataset.choice;
      personalizationCounter.setUserPreference(choice);
      modal.remove();

      // Confirm choice
      const confirmMessage = choice === 'personalized'
        ? 'Vanaf nu gebruiken we uw persoonlijke gegevens.'
        : 'We blijven willekeurige gegevens gebruiken.';

      if (window.AudioManager) {
        window.AudioManager.speak(confirmMessage);
      }
    });
  });

  UIComponents.showModal(modal);
}
```

---

## 6. File Structure

### New Files to Create

```
shared/
  js/
    personalization-service.js    # Core personalization logic
    personalization-form.js       # Form UI components
    personalization-counter.js    # Day counter logic

shared/
  styles/
    personalization.css           # Styling for form and popups
```

### Files to Modify

```
index.html                        # Add personalization section to settings
shared/js/constants.js            # Add new storage keys
exercises/digit-span/digit-span.js
exercises/word-pair/word-list.js
exercises/word-pair/word-pair.js
```

---

## 7. Implementation Phases

### Phase 1: Core Infrastructure
1. Create `personalization-service.js` with data schema and storage
2. Create `personalization-counter.js` with day tracking logic
3. Add storage keys to `constants.js`
4. Create basic CSS for personalization UI

### Phase 2: Settings Form
1. Create multi-step form wizard (`personalization-form.js`)
2. Integrate form into settings modal
3. Add form validation
4. Test data persistence across sessions

### Phase 3: Exercise Integration
1. Modify `digit-span.js` to use personalized data
2. Modify `word-list.js` and `word-pair.js` to use personalized data
3. Add fallback to random data when personal data insufficient

### Phase 4: A/B Testing Logic
1. Implement day counter with persistence
2. Add data mode switching logic
3. Test mode transitions across app restarts

### Phase 5: Preference Popup
1. Create preference popup UI
2. Add trigger logic to app initialization
3. Store and respect user preference
4. Add option to change preference in settings

### Phase 6: Polish & Testing
1. Add loading states and error handling
2. Test with various data combinations
3. Add accessibility features (ARIA labels, keyboard navigation)
4. Test on mobile devices

---

## 8. Data Privacy Considerations

- All data stored locally in localStorage only
- No data transmitted to servers
- Clear data option in settings should also clear personalization data
- Export data feature should include personalization data
- Add clear warning that data is stored on device

---

## 9. UI/UX Considerations

### Form Design
- Large touch targets for seniors
- Clear labels in Dutch
- Progress indicator for multi-step form
- Allow skipping sections (partial personalization OK)
- Save progress between steps

### Preference Popup
- Clear, simple language
- Visual distinction between options
- No pressure to choose (can dismiss)
- Option to change later in settings

### Status Indicators
- Show personalization status in settings
- Indicate current data mode (subtle, non-intrusive)
- Show days until preference popup (optional)

---

## 10. Questions for Review

1. **Data Fields**: Are the proposed personal data fields appropriate? Should we add/remove any?

2. **Timeline**: Is 2 days of random data sufficient before switching to personalized? Should this be configurable?

3. **Mixing Strategy**: Should personalized exercises be 100% personal data, or mix with random (e.g., 50/50)?

4. **Preference Change**: Should users be able to change their preference after the initial choice? If so, how often?

5. **Partial Data**: If a user only fills some sections, should we use personalized data for those sections and random for others?

6. **Exercise Priority**: Which exercises should be personalized first? Suggested order:
   - Priority 1: Digit Span (phone, postcode, dates)
   - Priority 1: Word Pair (names, activities, appointments)
   - Priority 2: Stroop (personal locations - optional)
   - Priority 3: Task Switching (schedule items - optional)

---

## Approval Checklist

- [ ] Data schema approved
- [ ] A/B testing timeline approved
- [ ] Form design approved
- [ ] Exercise integration approach approved
- [ ] Privacy considerations addressed
- [ ] Questions answered

Once approved, implementation can begin with Phase 1.
