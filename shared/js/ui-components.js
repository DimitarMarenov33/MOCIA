/**
 * UI COMPONENTS GENERATOR
 * Creates consistent, reusable UI components dynamically
 */

const UIComponents = {
  /**
   * Create a button element
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler
   * @param {Object} options - Additional options
   * @returns {HTMLElement}
   */
  createButton(text, onClick, options = {}) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'btn';

    // Add variant class
    const variant = options.variant || 'primary';
    button.classList.add(`btn-${variant}`);

    // Add size class
    if (options.size) {
      button.classList.add(`btn-${options.size}`);
    }

    // Add block class
    if (options.block) {
      button.classList.add('btn-block');
    }

    // Add additional classes
    if (options.className) {
      // Split by spaces and add each class separately
      const classes = options.className.split(' ').filter(c => c.trim());
      classes.forEach(cls => button.classList.add(cls));
    }

    // Add ARIA label
    if (options.ariaLabel) {
      button.setAttribute('aria-label', options.ariaLabel);
    }

    // Set disabled state
    if (options.disabled) {
      button.disabled = true;
    }

    // Add click handler with haptic feedback
    button.addEventListener('click', (e) => {
      if (window.AudioManager) {
        window.AudioManager.hapticPress();
      }
      onClick(e);
    });

    // Add ID if provided
    if (options.id) {
      button.id = options.id;
    }

    return button;
  },

  /**
   * Create a button group
   * @param {Array} buttons - Array of button configs
   * @returns {HTMLElement}
   */
  createButtonGroup(buttons) {
    const group = document.createElement('div');
    group.className = 'btn-group';

    buttons.forEach(config => {
      const button = this.createButton(
        config.text,
        config.onClick,
        config.options || {}
      );
      group.appendChild(button);
    });

    return group;
  },

  /**
   * Create a statistics display panel
   * @param {Array} stats - Array of stat objects [{label, value}]
   * @returns {HTMLElement}
   */
  createStatsPanel(stats) {
    const container = document.createElement('div');
    container.className = 'stats-container';

    stats.forEach(stat => {
      const item = document.createElement('div');
      item.className = 'stat-item';

      const value = document.createElement('span');
      value.className = 'stat-value';
      value.textContent = stat.value;

      const label = document.createElement('span');
      label.className = 'stat-label';
      label.textContent = stat.label;

      item.appendChild(value);
      item.appendChild(label);
      container.appendChild(item);
    });

    return container;
  },

  /**
   * Create a progress bar
   * @param {number} current - Current progress value
   * @param {number} max - Maximum progress value
   * @param {Object} options - Additional options
   * @returns {HTMLElement}
   */
  createProgressBar(current, max, options = {}) {
    const container = document.createElement('div');
    container.className = 'progress-container';

    if (options.label) {
      const label = document.createElement('div');
      label.className = 'progress-label';
      label.textContent = options.label;
      container.appendChild(label);
    }

    const bar = document.createElement('div');
    bar.className = 'progress-bar';

    const fill = document.createElement('div');
    fill.className = 'progress-fill';

    const percentage = Math.round((current / max) * 100);
    fill.style.width = `${percentage}%`;

    // Add percentage text
    if (options.showPercentage !== false) {
      const text = document.createElement('div');
      text.className = 'progress-text';
      text.textContent = `${percentage}%`;
      bar.appendChild(text);
    }

    bar.appendChild(fill);
    container.appendChild(bar);

    return container;
  },

  /**
   * Update an existing progress bar
   * @param {HTMLElement} progressBar - Progress bar container element
   * @param {number} current - New current value
   * @param {number} max - Maximum value
   */
  updateProgressBar(progressBar, current, max) {
    const fill = progressBar.querySelector('.progress-fill');
    const text = progressBar.querySelector('.progress-text');

    const percentage = Math.round((current / max) * 100);
    fill.style.width = `${percentage}%`;

    if (text) {
      text.textContent = `${percentage}%`;
    }
  },

  /**
   * Create a feedback panel
   * @param {string} message - Feedback message
   * @param {string} type - Feedback type ('success', 'error', 'info')
   * @param {Object} options - Additional options
   * @returns {HTMLElement}
   */
  createFeedbackPanel(message, type, options = {}) {
    const panel = document.createElement('div');
    panel.className = `feedback-panel feedback-${type} animate-slide-up`;
    panel.setAttribute('role', 'alert');

    // Add icon
    if (options.showIcon !== false) {
      const icon = document.createElement('div');
      icon.className = 'feedback-icon';

      const icons = {
        success: CONSTANTS.ICONS.SUCCESS,
        error: CONSTANTS.ICONS.ERROR,
        info: CONSTANTS.ICONS.INFO,
      };

      icon.textContent = icons[type] || icons.info;
      panel.appendChild(icon);
    }

    // Add message
    const messageEl = document.createElement('div');
    messageEl.className = 'feedback-message';
    messageEl.textContent = message;
    panel.appendChild(messageEl);

    // Add detail text if provided
    if (options.detail) {
      const detail = document.createElement('div');
      detail.className = 'feedback-detail';
      detail.textContent = options.detail;
      panel.appendChild(detail);
    }

    return panel;
  },

  /**
   * Create an instruction panel
   * @param {string} title - Instruction title
   * @param {Array<string>} instructions - Array of instruction strings
   * @returns {HTMLElement}
   */
  createInstructionPanel(title, instructions) {
    const panel = document.createElement('div');
    panel.className = 'instructions';

    const heading = document.createElement('h3');
    heading.textContent = title;
    panel.appendChild(heading);

    const list = document.createElement('ul');

    instructions.forEach(instruction => {
      const item = document.createElement('li');
      item.textContent = instruction;
      list.appendChild(item);
    });

    panel.appendChild(list);

    return panel;
  },

  /**
   * Create a card element
   * @param {Object} config - Card configuration
   * @returns {HTMLElement}
   */
  createCard(config) {
    const card = document.createElement('div');
    card.className = 'card';

    if (config.className) {
      card.classList.add(config.className);
    }

    if (config.header) {
      const header = document.createElement('div');
      header.className = 'card-header';
      header.textContent = config.header;
      card.appendChild(header);
    }

    if (config.body) {
      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = config.body;
      card.appendChild(body);
    }

    if (config.footer) {
      const footer = document.createElement('div');
      footer.className = 'card-footer';
      if (typeof config.footer === 'string') {
        footer.innerHTML = config.footer;
      } else {
        footer.appendChild(config.footer);
      }
      card.appendChild(footer);
    }

    return card;
  },

  /**
   * Create a modal overlay
   * @param {string} title - Modal title
   * @param {string|HTMLElement} content - Modal content
   * @param {Array} buttons - Array of button configs
   * @returns {HTMLElement}
   */
  createModal(title, content, buttons = []) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-title');

    const modal = document.createElement('div');
    modal.className = 'modal-content';

    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.id = 'modal-title';
    header.textContent = title;
    modal.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';

    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }

    modal.appendChild(body);

    // Footer with buttons
    if (buttons.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer';

      buttons.forEach(config => {
        const button = this.createButton(
          config.text,
          (e) => {
            config.onClick(e, overlay);
          },
          config.options || {}
        );
        footer.appendChild(button);
      });

      modal.appendChild(footer);
    }

    overlay.appendChild(modal);

    // Close on overlay click (optional)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    return overlay;
  },

  /**
   * Show a modal (append to body)
   * @param {HTMLElement} modal - Modal element
   */
  showModal(modal) {
    document.body.appendChild(modal);
    // Focus first button or modal
    const firstButton = modal.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }
  },

  /**
   * Create a countdown display
   * @param {number} count - Starting count
   * @returns {HTMLElement}
   */
  createCountdown(count) {
    const countdown = document.createElement('div');
    countdown.className = 'countdown animate-pulse';
    countdown.textContent = count;
    countdown.setAttribute('aria-live', 'polite');
    countdown.setAttribute('aria-atomic', 'true');

    return countdown;
  },

  /**
   * Create a number pad (0-9)
   * @param {Function} onNumberClick - Handler for number clicks
   * @returns {HTMLElement}
   */
  createNumberPad(onNumberClick) {
    const pad = document.createElement('div');
    pad.className = 'number-pad';

    // Create buttons 1-9
    for (let i = 1; i <= 9; i++) {
      const button = document.createElement('button');
      button.className = 'number-pad-button';
      button.textContent = i;
      button.setAttribute('aria-label', `Number ${i}`);

      button.addEventListener('click', () => {
        if (window.AudioManager) {
          window.AudioManager.hapticPress();
        }
        onNumberClick(i);
      });

      pad.appendChild(button);
    }

    // Create 0 button (centered in bottom row)
    const zeroButton = document.createElement('button');
    zeroButton.className = 'number-pad-button number-pad-zero';
    zeroButton.textContent = '0';
    zeroButton.setAttribute('aria-label', 'Number 0');

    zeroButton.addEventListener('click', () => {
      if (window.AudioManager) {
        window.AudioManager.hapticPress();
      }
      onNumberClick(0);
    });

    pad.appendChild(zeroButton);

    return pad;
  },

  /**
   * Create a stimulus display
   * @param {string} stimulus - Stimulus to display
   * @returns {HTMLElement}
   */
  createStimulus(stimulus) {
    const container = document.createElement('div');
    container.className = 'stimulus-container';

    const stimulusEl = document.createElement('div');
    stimulusEl.className = 'stimulus animate-fade-in';
    stimulusEl.textContent = stimulus;
    stimulusEl.setAttribute('aria-live', 'polite');

    container.appendChild(stimulusEl);

    return container;
  },

  /**
   * Create a loading spinner
   * @param {string} text - Optional loading text
   * @returns {HTMLElement}
   */
  createLoadingSpinner(text) {
    const container = document.createElement('div');
    container.style.textAlign = 'center';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-live', 'polite');

    container.appendChild(spinner);

    if (text) {
      const textEl = document.createElement('p');
      textEl.textContent = text;
      container.appendChild(textEl);
    }

    return container;
  },

  /**
   * Create a badge element
   * @param {string} text - Badge text
   * @param {string} type - Badge type ('success', 'info', 'warning', 'error')
   * @returns {HTMLElement}
   */
  createBadge(text, type = 'info') {
    const badge = document.createElement('span');
    badge.className = `badge badge-${type}`;
    badge.textContent = text;

    return badge;
  },

  /**
   * Create an exercise card for the main menu
   * @param {Object} config - Exercise configuration
   * @returns {HTMLElement}
   */
  createExerciseCard(config) {
    const card = document.createElement('div');
    card.className = 'card exercise-card card-entrance';

    // Icon
    if (config.icon) {
      const icon = document.createElement('div');
      icon.className = 'exercise-card-icon';
      icon.textContent = config.icon;
      card.appendChild(icon);
    }

    // Title
    const title = document.createElement('h3');
    title.className = 'exercise-card-title';
    title.textContent = config.title;
    card.appendChild(title);

    // Difficulty badge
    if (config.difficulty) {
      const difficultyBadge = document.createElement('div');
      difficultyBadge.className = `exercise-card-difficulty difficulty-${config.difficulty}`;
      difficultyBadge.textContent = config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1);
      card.appendChild(difficultyBadge);
    }

    // Description
    const description = document.createElement('p');
    description.className = 'exercise-card-description';
    description.textContent = config.description;
    card.appendChild(description);

    // Stats (if provided)
    if (config.stats) {
      const stats = document.createElement('div');
      stats.className = 'exercise-card-stats';
      stats.innerHTML = config.stats;
      card.appendChild(stats);
    }

    // Start button
    const buttonContainer = document.createElement('div');
    const startButton = this.createButton(
      'Start Exercise',
      config.onStart,
      { variant: 'success', block: true }
    );
    buttonContainer.appendChild(startButton);
    card.appendChild(buttonContainer);

    return card;
  },

  /**
   * Show overlay feedback on a container element
   * @param {HTMLElement} container - Container element to show feedback on
   * @param {string} message - Feedback message
   * @param {string} type - Feedback type ('success', 'error', 'info')
   * @param {Object} options - Additional options
   * @param {string} options.detail - Additional detail text
   * @param {number} options.duration - How long to show (default 1200ms)
   */
  showOverlayFeedback(container, message, type, options = {}) {
    // Remove any existing overlay
    const existingOverlay = container.querySelector('.overlay-feedback');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'overlay-feedback';

    // Set colors and icon based on type
    let bgColor, iconColor, icon;
    if (type === 'success') {
      bgColor = 'rgba(76, 175, 80, 0.95)';
      iconColor = 'white';
      icon = '\u2713'; // checkmark
    } else if (type === 'error') {
      bgColor = 'rgba(244, 67, 54, 0.95)';
      iconColor = 'white';
      icon = '\u2717'; // X mark
    } else {
      bgColor = 'rgba(25, 118, 210, 0.95)';
      iconColor = 'white';
      icon = 'i';
    }

    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${bgColor};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      border-radius: inherit;
      animation: overlayFeedbackFadeIn 0.2s ease;
      pointer-events: none;
    `;

    let detailHtml = '';
    if (options.detail) {
      detailHtml = `<div style="font-size: 16px; color: ${iconColor}; opacity: 0.9; text-align: center; padding: 0 16px; margin-top: 8px;">${options.detail}</div>`;
    }

    overlay.innerHTML = `
      <div style="font-size: 64px; color: ${iconColor}; margin-bottom: 8px; line-height: 1;">${icon}</div>
      <div style="font-size: 24px; font-weight: 600; color: ${iconColor}; text-align: center; padding: 0 16px;">
        ${message}
      </div>
      ${detailHtml}
    `;

    // Ensure container has position relative for absolute positioning
    const originalPosition = container.style.position;
    if (!originalPosition || originalPosition === 'static') {
      container.style.position = 'relative';
    }

    container.appendChild(overlay);

    // Auto-remove after delay
    const duration = options.duration || 1200;
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.style.animation = 'overlayFeedbackFadeOut 0.2s ease forwards';
        setTimeout(() => overlay.remove(), 200);
      }
    }, duration);

    return overlay;
  },

  /**
   * Clear all children from an element
   * @param {HTMLElement} element - Element to clear
   */
  clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  /**
   * Show/hide an element with animation
   * @param {HTMLElement} element - Element to show/hide
   * @param {boolean} show - Whether to show or hide
   */
  toggleElement(element, show) {
    if (show) {
      element.style.display = 'block';
      element.classList.add('animate-fade-in');
    } else {
      element.classList.add('animate-fade-out');
      setTimeout(() => {
        element.style.display = 'none';
        element.classList.remove('animate-fade-out');
      }, 300);
    }
  },

  /**
   * Create a carousel component for mobile
   * @param {Object} config - Carousel configuration
   * @returns {Object} {element, next, prev, goTo}
   */
  createCarousel(config) {
    const { items, renderItem, onSelect } = config;

    const carousel = document.createElement('div');
    carousel.className = 'carousel';

    const container = document.createElement('div');
    container.className = 'carousel__container';

    // Render all items
    items.forEach((item, index) => {
      const itemWrapper = document.createElement('div');
      itemWrapper.className = 'carousel__item';
      itemWrapper.setAttribute('data-index', index);

      const renderedItem = renderItem(item, index);

      // Make the card clickable
      renderedItem.style.cursor = 'pointer';
      renderedItem.addEventListener('click', (e) => {
        // Don't trigger card click if clicking on the select button (it has its own handler)
        if (e.target.classList.contains('card-select-btn')) return;
        if (onSelect) {
          onSelect(item, index);
        }
      });

      // Also handle select button click
      const selectBtn = renderedItem.querySelector('.card-select-btn');
      if (selectBtn) {
        selectBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onSelect) {
            onSelect(item, index);
          }
        });
      }

      itemWrapper.appendChild(renderedItem);
      container.appendChild(itemWrapper);
    });

    carousel.appendChild(container);

    // Swipe indicator arrows (subtle hints for navigation)
    const leftIndicator = document.createElement('div');
    leftIndicator.className = 'carousel__swipe-indicator carousel__swipe-indicator--left';
    leftIndicator.innerHTML = '‹';
    leftIndicator.setAttribute('aria-hidden', 'true');
    carousel.appendChild(leftIndicator);

    const rightIndicator = document.createElement('div');
    rightIndicator.className = 'carousel__swipe-indicator carousel__swipe-indicator--right';
    rightIndicator.innerHTML = '›';
    rightIndicator.setAttribute('aria-hidden', 'true');
    carousel.appendChild(rightIndicator);

    // Dots indicator
    const dots = document.createElement('div');
    dots.className = 'carousel__dots';

    items.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Go to item ${index + 1}`);
      dot.addEventListener('click', () => goTo(index));
      dots.appendChild(dot);
    });

    carousel.appendChild(dots);

    // State
    let currentIndex = 0;

    const updateCarousel = () => {
      container.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Update dots
      dots.querySelectorAll('.carousel__dot').forEach((dot, index) => {
        dot.classList.toggle('carousel__dot--active', index === currentIndex);
      });

      // Update swipe indicators
      leftIndicator.classList.toggle('carousel__swipe-indicator--visible', currentIndex > 0);
      rightIndicator.classList.toggle('carousel__swipe-indicator--visible', currentIndex < items.length - 1);
    };

    const next = () => {
      if (currentIndex < items.length - 1) {
        currentIndex++;
        updateCarousel();
      }
    };

    const prev = () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    };

    const goTo = (index) => {
      if (index >= 0 && index < items.length) {
        currentIndex = index;
        updateCarousel();
      }
    };

    // Touch gestures
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    const handleSwipe = () => {
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        next(); // Swipe left = next
      } else if (touchEndX - touchStartX > swipeThreshold) {
        prev(); // Swipe right = prev
      }
    };

    // Initialize
    updateCarousel();

    return {
      element: carousel,
      next,
      prev,
      goTo,
      getCurrentIndex: () => currentIndex,
    };
  },

  /**
   * Create a tutorial stepper component
   * @param {Object} config - Tutorial configuration
   * @returns {Object} {element, next, prev, finish}
   */
  createTutorialStepper(config) {
    const { steps, onComplete } = config;

    const tutorial = document.createElement('div');
    tutorial.className = 'tutorial';

    // Header
    const header = document.createElement('div');
    header.className = 'tutorial__header';

    const title = document.createElement('h2');
    title.className = 'tutorial__title';
    title.textContent = '📚 Tutorial';
    header.appendChild(title);

    tutorial.appendChild(header);

    // Content area
    const content = document.createElement('div');
    content.className = 'tutorial__content';
    tutorial.appendChild(content);

    // Navigation
    const navigation = document.createElement('div');
    navigation.className = 'tutorial__navigation';

    const nextButton = this.createButton(
      'Volgende →',
      () => next(),
      { variant: 'primary', className: 'btn-large btn-mobile-full' }
    );

    const prevButton = this.createButton(
      '← Vorige',
      () => prev(),
      { variant: 'secondary', className: 'btn-large btn-mobile-full' }
    );

    const finishButton = this.createButton(
      'Begrepen - Start Oefening',
      () => {
        if (onComplete) {
          onComplete();
        }
      },
      { variant: 'success', className: 'btn-large btn-mobile-full' }
    );

    navigation.appendChild(prevButton);
    navigation.appendChild(nextButton);
    navigation.appendChild(finishButton);

    tutorial.appendChild(navigation);

    // Dots indicator
    const dots = document.createElement('div');
    dots.className = 'tutorial__dots';

    steps.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = 'tutorial__dot';
      dots.appendChild(dot);
    });

    tutorial.appendChild(dots);

    // State
    let currentStep = 0;

    const renderStep = () => {
      const step = steps[currentStep];

      content.innerHTML = '';

      // Visual
      if (step.visual) {
        const visual = document.createElement('div');
        visual.className = 'tutorial__visual';
        visual.innerHTML = step.visual;
        content.appendChild(visual);
      }

      // Text
      const text = document.createElement('div');
      text.className = 'tutorial__text';
      text.innerHTML = step.content || step.text;
      content.appendChild(text);

      // Update dots
      dots.querySelectorAll('.tutorial__dot').forEach((dot, index) => {
        dot.classList.toggle('tutorial__dot--active', index === currentStep);
      });

      // Update buttons
      prevButton.style.display = currentStep === 0 ? 'none' : 'block';
      nextButton.style.display = currentStep === steps.length - 1 ? 'none' : 'block';
      finishButton.style.display = currentStep === steps.length - 1 ? 'block' : 'none';

      // Announce to screen readers
      if (window.AudioManager && window.AudioManager.isEnabled()) {
        const stepText = step.content || step.text;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = stepText;
        window.AudioManager.speak(tempDiv.textContent);
      }
    };

    const next = () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep();
      }
    };

    const prev = () => {
      if (currentStep > 0) {
        currentStep--;
        renderStep();
      }
    };

    const finish = () => {
      if (onComplete) {
        onComplete();
      }
    };

    // Initialize
    renderStep();

    return {
      element: tutorial,
      next,
      prev,
      finish,
      getCurrentStep: () => currentStep,
    };
  },

  /**
   * Create a simple screen layout
   * @param {Object} config - Screen configuration
   * @returns {HTMLElement}
   */
  createSimpleScreen(config) {
    const {
      icon,
      title,
      description,
      primaryAction,
      secondaryAction,
      showBackButton = true,
    } = config;

    const screen = document.createElement('div');
    screen.className = 'simple-screen';

    // Back button
    if (showBackButton) {
      const backArea = document.createElement('div');
      backArea.className = 'simple-screen__back';

      const backButton = this.createButton(
        '← Terug',
        () => {
          if (window.ScreenManager) {
            window.ScreenManager.back();
          }
        },
        { variant: 'secondary', className: 'simple-screen__back-button' }
      );
      backButton.setAttribute('data-back-button', 'true');

      backArea.appendChild(backButton);
      screen.appendChild(backArea);
    }

    // Content area
    const content = document.createElement('div');
    content.className = 'simple-screen__content';

    // Icon
    if (icon) {
      const iconEl = document.createElement('div');
      iconEl.className = 'simple-screen__icon';
      iconEl.textContent = icon;
      content.appendChild(iconEl);
    }

    // Title
    if (title) {
      const titleEl = document.createElement('h1');
      titleEl.className = 'simple-screen__title';
      titleEl.textContent = title;
      content.appendChild(titleEl);
    }

    // Description
    if (description) {
      const descEl = document.createElement('p');
      descEl.className = 'simple-screen__description';
      descEl.textContent = description;
      content.appendChild(descEl);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'simple-screen__actions';

    if (primaryAction) {
      const primaryBtn = this.createButton(
        primaryAction.text,
        primaryAction.onClick,
        { variant: 'success', className: 'btn-large simple-screen__primary' }
      );
      actions.appendChild(primaryBtn);
    }

    if (secondaryAction) {
      const secondaryBtn = this.createButton(
        secondaryAction.text,
        secondaryAction.onClick,
        { variant: 'secondary', className: 'simple-screen__secondary' }
      );
      actions.appendChild(secondaryBtn);
    }

    content.appendChild(actions);
    screen.appendChild(content);

    return screen;
  },
};

// Make available globally
if (typeof window !== 'undefined') {
  window.UIComponents = UIComponents;
}
