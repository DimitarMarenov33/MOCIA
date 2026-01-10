/**
 * COMPATIBILITY CHECK
 * Detects browser features and potential issues on mobile devices
 * Runs early to catch problems before exercises load
 */

const CompatibilityCheck = {
  results: {},

  /**
   * Run all compatibility checks
   */
  run() {
    console.log('[Compat] Running compatibility checks...');

    this.results = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,

      // Screen info
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
      },

      // Viewport info
      viewport: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      },

      // Feature detection
      features: {
        localStorage: this.checkLocalStorage(),
        sessionStorage: this.checkSessionStorage(),
        serviceWorker: 'serviceWorker' in navigator,
        promises: typeof Promise !== 'undefined',
        asyncAwait: this.checkAsyncAwait(),
        optionalChaining: this.checkOptionalChaining(),
        nullishCoalescing: this.checkNullishCoalescing(),
        classes: this.checkClasses(),
        arrowFunctions: this.checkArrowFunctions(),
        templateLiterals: this.checkTemplateLiterals(),
        destructuring: this.checkDestructuring(),
        spreadOperator: this.checkSpreadOperator(),
        fetch: typeof fetch !== 'undefined',
        touchEvents: 'ontouchstart' in window,
        pointerEvents: 'onpointerdown' in window,
        classList: 'classList' in document.createElement('div'),
        querySelector: 'querySelector' in document,
        addEventListener: 'addEventListener' in window,
        json: typeof JSON !== 'undefined',
        webAudio: this.checkWebAudio(),
        speechSynthesis: 'speechSynthesis' in window,
        vibration: 'vibrate' in navigator,
        geolocation: 'geolocation' in navigator,
      },

      // Detected issues
      issues: [],
    };

    // Check for critical issues
    this.checkCriticalIssues();

    // Log results
    console.log('[Compat] Results:', JSON.stringify(this.results, null, 2));

    // Store results
    try {
      sessionStorage.setItem('mocia_compat_check', JSON.stringify(this.results));
    } catch (e) {
      console.warn('[Compat] Could not store results:', e);
    }

    return this.results;
  },

  /**
   * Check localStorage availability
   */
  checkLocalStorage() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check sessionStorage availability
   */
  checkSessionStorage() {
    try {
      const test = '__test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check async/await support
   */
  checkAsyncAwait() {
    try {
      new Function('async () => {}');
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check optional chaining support
   */
  checkOptionalChaining() {
    try {
      new Function('const obj = {}; return obj?.foo?.bar;');
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check nullish coalescing support
   */
  checkNullishCoalescing() {
    try {
      new Function('const x = null ?? "default";');
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check class support
   */
  checkClasses() {
    try {
      new Function('class Test {}');
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check arrow function support
   */
  checkArrowFunctions() {
    try {
      new Function('const fn = () => {};');
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check template literal support
   */
  checkTemplateLiterals() {
    try {
      new Function('const x = `test`;');
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check destructuring support
   */
  checkDestructuring() {
    try {
      new Function('const { a, b } = { a: 1, b: 2 };');
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check spread operator support
   */
  checkSpreadOperator() {
    try {
      new Function('const arr = [...[1, 2, 3]];');
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Check Web Audio API support
   */
  checkWebAudio() {
    return typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined';
  },

  /**
   * Check for critical issues that would prevent the app from working
   */
  checkCriticalIssues() {
    const f = this.results.features;

    if (!f.localStorage) {
      this.results.issues.push({
        severity: 'critical',
        feature: 'localStorage',
        message: 'localStorage not available. App cannot save data. Are you in private browsing mode?'
      });
    }

    if (!f.promises) {
      this.results.issues.push({
        severity: 'critical',
        feature: 'promises',
        message: 'Promises not supported. Browser too old.'
      });
    }

    if (!f.asyncAwait) {
      this.results.issues.push({
        severity: 'critical',
        feature: 'async/await',
        message: 'async/await not supported. Browser too old.'
      });
    }

    if (!f.classes) {
      this.results.issues.push({
        severity: 'critical',
        feature: 'classes',
        message: 'ES6 classes not supported. Browser too old.'
      });
    }

    if (!f.optionalChaining) {
      this.results.issues.push({
        severity: 'warning',
        feature: 'optionalChaining',
        message: 'Optional chaining (?.) not supported. Some features may fail.'
      });
    }

    if (!f.fetch) {
      this.results.issues.push({
        severity: 'warning',
        feature: 'fetch',
        message: 'Fetch API not supported.'
      });
    }

    // Log issues
    if (this.results.issues.length > 0) {
      console.warn('[Compat] Issues detected:', this.results.issues);
    } else {
      console.log('[Compat] No compatibility issues detected');
    }
  },

  /**
   * Get a summary of results
   */
  getSummary() {
    return {
      hasIssues: this.results.issues?.length > 0,
      criticalIssues: this.results.issues?.filter(i => i.severity === 'critical') || [],
      warnings: this.results.issues?.filter(i => i.severity === 'warning') || [],
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
      isAndroid: /Android/i.test(navigator.userAgent),
      isSafari: /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent),
      isOpera: /Opera|OPR/i.test(navigator.userAgent),
    };
  },

  /**
   * Show compatibility results in UI (for debugging)
   */
  showResults() {
    const summary = this.getSummary();
    let html = `
      <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);color:#fff;padding:20px;overflow:auto;z-index:99999;font-family:monospace;font-size:12px;">
        <h2>Compatibility Check Results</h2>
        <p><strong>Device:</strong> ${summary.isMobile ? 'Mobile' : 'Desktop'} ${summary.isIOS ? '(iOS)' : ''} ${summary.isAndroid ? '(Android)' : ''}</p>
        <p><strong>Browser:</strong> ${summary.isSafari ? 'Safari' : ''} ${summary.isOpera ? 'Opera' : ''}</p>
        <p><strong>User Agent:</strong> ${this.results.userAgent}</p>

        <h3>Issues (${this.results.issues.length})</h3>
        ${this.results.issues.length === 0 ? '<p style="color:#0f0;">No issues detected</p>' : ''}
        ${this.results.issues.map(i => `<p style="color:${i.severity === 'critical' ? '#f00' : '#ff0'};">[${i.severity}] ${i.feature}: ${i.message}</p>`).join('')}

        <h3>Features</h3>
        <pre>${JSON.stringify(this.results.features, null, 2)}</pre>

        <h3>Screen/Viewport</h3>
        <pre>${JSON.stringify({ screen: this.results.screen, viewport: this.results.viewport }, null, 2)}</pre>

        <button onclick="this.parentElement.remove()" style="position:fixed;top:10px;right:10px;padding:10px 20px;font-size:16px;">Close</button>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
  }
};

// Auto-run on load
if (typeof window !== 'undefined') {
  window.CompatibilityCheck = CompatibilityCheck;

  // Run immediately
  CompatibilityCheck.run();
}
