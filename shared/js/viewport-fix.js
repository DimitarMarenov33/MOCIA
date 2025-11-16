/**
 * VIEWPORT FIX
 * Handles dynamic viewport height for mobile browsers with collapsing toolbars
 */

class ViewportFix {
  constructor() {
    this.init();
  }

  init() {
    // Set CSS custom property for real viewport height
    this.setViewportHeight();

    // Update on resize and orientation change
    window.addEventListener('resize', () => this.setViewportHeight());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.setViewportHeight(), 100);
    });

    // Initial set with a slight delay to ensure proper calculation
    setTimeout(() => this.setViewportHeight(), 100);
  }

  setViewportHeight() {
    // Get the actual viewport height
    const vh = window.innerHeight * 0.01;

    // Set CSS custom property
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // Also set full viewport height
    document.documentElement.style.setProperty('--real-vh', `${window.innerHeight}px`);
    document.documentElement.style.setProperty('--real-vw', `${window.innerWidth}px`);

    console.log('[Viewport] Set --vh to', vh, 'px (full height:', window.innerHeight, 'px)');
  }
}

// Initialize immediately
new ViewportFix();
