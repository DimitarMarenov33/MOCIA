/**
 * SCREEN MANAGER
 * Utility for managing single-screen navigation flows
 * Supports minimal cognitive load principle: one screen at a time
 */

class ScreenManager {
  constructor() {
    this.screens = new Map();
    this.currentScreen = null;
    this.history = [];
    this.transitions = {
      duration: 300,
      easing: 'ease-in-out'
    };
  }

  /**
   * Register a screen with the manager
   * @param {string} id - Unique screen identifier
   * @param {HTMLElement} element - The screen element
   */
  register(id, element) {
    this.screens.set(id, element);
    element.classList.add('screen-managed');
    element.setAttribute('data-screen-id', id);

    // Hide by default
    if (!element.classList.contains('screen-active')) {
      element.classList.add('screen-hidden');
    }
  }

  /**
   * Register all screens with a specific class
   * @param {string} className - Class name to look for (default: 'screen')
   */
  registerAll(className = 'screen') {
    const screenElements = document.querySelectorAll(`.${className}`);
    screenElements.forEach(element => {
      const id = element.id || element.getAttribute('data-screen');
      if (id) {
        this.register(id, element);
      }
    });
  }

  /**
   * Show a screen (with optional transition)
   * @param {string} id - Screen ID to show
   * @param {Object} options - Options {transition: boolean, addToHistory: boolean}
   */
  show(id, options = {}) {
    const {
      transition = true,
      addToHistory = true,
    } = options;

    const screen = this.screens.get(id);
    if (!screen) {
      console.error(`Screen "${id}" not found`);
      return false;
    }

    // Hide current screen
    if (this.currentScreen) {
      const currentElement = this.screens.get(this.currentScreen);
      if (currentElement) {
        this.hideScreen(currentElement, transition);
      }
    }

    // Add to history
    if (addToHistory && this.currentScreen !== id) {
      this.history.push(this.currentScreen);
    }

    // Show new screen
    this.currentScreen = id;
    this.showScreen(screen, transition);

    // Announce to screen readers
    this.announceScreenChange(id);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return true;
  }

  /**
   * Navigate to a screen (adds to history)
   */
  navigate(id, options = {}) {
    return this.show(id, { ...options, addToHistory: true });
  }

  /**
   * Replace current screen (doesn't add to history)
   */
  replace(id, options = {}) {
    return this.show(id, { ...options, addToHistory: false });
  }

  /**
   * Go back to previous screen
   */
  back() {
    if (this.history.length === 0) {
      console.warn('No screen history to go back to');
      return false;
    }

    const previousScreen = this.history.pop();
    if (previousScreen) {
      return this.show(previousScreen, { addToHistory: false });
    }

    return false;
  }

  /**
   * Clear navigation history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Get current screen ID
   */
  getCurrentScreen() {
    return this.currentScreen;
  }

  /**
   * Check if can go back
   */
  canGoBack() {
    return this.history.length > 0;
  }

  /**
   * Show screen with animation
   */
  showScreen(element, transition = true) {
    element.classList.remove('screen-hidden');

    if (transition) {
      element.classList.add('screen-entering');

      setTimeout(() => {
        element.classList.remove('screen-entering');
        element.classList.add('screen-active');

        // Focus first interactive element
        this.focusFirstElement(element);
      }, this.transitions.duration);
    } else {
      element.classList.add('screen-active');
      this.focusFirstElement(element);
    }
  }

  /**
   * Hide screen with animation
   */
  hideScreen(element, transition = true) {
    element.classList.remove('screen-active');

    if (transition) {
      element.classList.add('screen-exiting');

      setTimeout(() => {
        element.classList.remove('screen-exiting');
        element.classList.add('screen-hidden');
      }, this.transitions.duration);
    } else {
      element.classList.add('screen-hidden');
    }
  }

  /**
   * Focus first interactive element in screen
   */
  focusFirstElement(element) {
    const focusable = element.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusable) {
      // Delay to allow screen to fully render
      setTimeout(() => focusable.focus(), 100);
    }
  }

  /**
   * Announce screen change to screen readers
   */
  announceScreenChange(screenId) {
    const screen = this.screens.get(screenId);
    if (!screen) return;

    // Create or update live region
    let liveRegion = document.getElementById('screen-announcer');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'screen-announcer';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }

    // Get screen title
    const title = screen.querySelector('h1, h2')?.textContent || screenId;
    liveRegion.textContent = `Navigated to ${title}`;
  }

  /**
   * Hide all screens
   */
  hideAll() {
    this.screens.forEach((element) => {
      element.classList.remove('screen-active', 'screen-entering', 'screen-exiting');
      element.classList.add('screen-hidden');
    });
    this.currentScreen = null;
  }

  /**
   * Setup back button handlers
   * @param {string} selector - CSS selector for back buttons (default: '[data-back-button]')
   */
  setupBackButtons(selector = '[data-back-button]') {
    document.addEventListener('click', (e) => {
      const backButton = e.target.closest(selector);
      if (backButton) {
        e.preventDefault();
        this.back();
      }
    });
  }
}

// Create global instance
window.ScreenManager = new ScreenManager();
