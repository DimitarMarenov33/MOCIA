/**
 * MOBILE DEBUG CONSOLE
 * On-screen error logging for mobile debugging
 */

const MobileDebug = {
  isEnabled: false,
  logContainer: null,
  logs: [],
  maxLogs: 50,

  /**
   * Initialize the debug console
   */
  init() {
    // Check if debug mode is enabled in localStorage
    this.isEnabled = localStorage.getItem('mocia_debug_mode') === 'true';

    if (this.isEnabled) {
      this.createUI();
      this.interceptConsole();
      this.interceptErrors();
      this.log('info', 'Debug console initialized');
      this.log('info', `User Agent: ${navigator.userAgent}`);
    }
  },

  /**
   * Enable debug mode
   */
  enable() {
    localStorage.setItem('mocia_debug_mode', 'true');
    this.isEnabled = true;
    this.createUI();
    this.interceptConsole();
    this.interceptErrors();
    this.log('info', 'Debug mode enabled');
  },

  /**
   * Disable debug mode
   */
  disable() {
    localStorage.setItem('mocia_debug_mode', 'false');
    this.isEnabled = false;
    if (this.logContainer) {
      this.logContainer.remove();
      this.logContainer = null;
    }
  },

  /**
   * Create the debug UI
   */
  createUI() {
    if (this.logContainer) return;

    // Create container
    this.logContainer = document.createElement('div');
    this.logContainer.id = 'mobile-debug-console';
    this.logContainer.innerHTML = `
      <div class="debug-header">
        <span>Debug Console</span>
        <div class="debug-actions">
          <button id="debug-clear">Clear</button>
          <button id="debug-minimize">_</button>
          <button id="debug-close">X</button>
        </div>
      </div>
      <div class="debug-logs"></div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #mobile-debug-console {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 200px;
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        font-family: monospace;
        font-size: 11px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        border-top: 2px solid #444;
      }
      #mobile-debug-console.minimized {
        height: 30px;
      }
      #mobile-debug-console.minimized .debug-logs {
        display: none;
      }
      .debug-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 10px;
        background: #333;
        border-bottom: 1px solid #444;
        flex-shrink: 0;
      }
      .debug-actions {
        display: flex;
        gap: 5px;
      }
      .debug-actions button {
        background: #555;
        color: #fff;
        border: none;
        padding: 3px 8px;
        border-radius: 3px;
        font-size: 11px;
        cursor: pointer;
      }
      .debug-actions button:active {
        background: #777;
      }
      .debug-logs {
        flex: 1;
        overflow-y: auto;
        padding: 5px;
        -webkit-overflow-scrolling: touch;
      }
      .debug-log {
        padding: 3px 5px;
        border-bottom: 1px solid #333;
        word-wrap: break-word;
      }
      .debug-log.error {
        color: #ff6b6b;
        background: rgba(255, 0, 0, 0.1);
      }
      .debug-log.warn {
        color: #ffd93d;
      }
      .debug-log.info {
        color: #6bcfff;
      }
      .debug-log .timestamp {
        color: #888;
        margin-right: 5px;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.logContainer);

    // Event listeners
    this.logContainer.querySelector('#debug-clear').addEventListener('click', () => {
      this.clear();
    });

    this.logContainer.querySelector('#debug-minimize').addEventListener('click', () => {
      this.logContainer.classList.toggle('minimized');
    });

    this.logContainer.querySelector('#debug-close').addEventListener('click', () => {
      this.disable();
    });
  },

  /**
   * Intercept console methods
   */
  interceptConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
      this.log('log', args.map(a => this.stringify(a)).join(' '));
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      this.log('error', args.map(a => this.stringify(a)).join(' '));
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.log('warn', args.map(a => this.stringify(a)).join(' '));
      originalWarn.apply(console, args);
    };

    console.info = (...args) => {
      this.log('info', args.map(a => this.stringify(a)).join(' '));
      originalInfo.apply(console, args);
    };
  },

  /**
   * Intercept global errors
   */
  interceptErrors() {
    window.addEventListener('error', (e) => {
      this.log('error', `${e.message} at ${e.filename}:${e.lineno}:${e.colno}`);
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.log('error', `Unhandled Promise: ${e.reason}`);
    });
  },

  /**
   * Add a log entry
   */
  log(type, message) {
    if (!this.isEnabled || !this.logContainer) return;

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `debug-log ${type}`;
    logEntry.innerHTML = `<span class="timestamp">${timestamp}</span>${this.escapeHtml(message)}`;

    const logsContainer = this.logContainer.querySelector('.debug-logs');
    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;

    // Keep only maxLogs entries
    this.logs.push({ type, message, timestamp });
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
      logsContainer.removeChild(logsContainer.firstChild);
    }
  },

  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
    if (this.logContainer) {
      this.logContainer.querySelector('.debug-logs').innerHTML = '';
    }
  },

  /**
   * Stringify any value for display
   */
  stringify(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return String(value);
      }
    }
    return String(value);
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.MobileDebug = MobileDebug;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileDebug.init());
  } else {
    MobileDebug.init();
  }
}
