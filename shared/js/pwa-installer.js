/**
 * PWA INSTALLER
 * Handles service worker registration and install prompt
 */

class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;

    this.init();
  }

  async init() {
    // Register service worker
    this.registerServiceWorker();

    // Listen for install prompt
    this.setupInstallPrompt();

    // Check if already installed
    this.checkIfInstalled();
  }

  /**
   * Register the service worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[PWA] Service Worker registered successfully:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[PWA] New service worker found, installing...');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available! Please refresh.');
              // Optionally show update notification to user
              this.showUpdateNotification();
            }
          });
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    } else {
      console.warn('[PWA] Service Workers are not supported in this browser');
    }
  }

  /**
   * Setup install prompt capture
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('[PWA] Install prompt available');

      // Prevent default mini-infobar
      event.preventDefault();

      // Save for later
      this.deferredPrompt = event;

      // Show custom install button (optional)
      this.showInstallButton();
    });

    // Detect when app is installed
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  /**
   * Check if app is already installed
   */
  checkIfInstalled() {
    // Check if running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] App is running in standalone mode');
      this.isInstalled = true;
      return true;
    }

    // Check iOS Safari standalone mode
    if (window.navigator.standalone === true) {
      console.log('[PWA] App is running in iOS standalone mode');
      this.isInstalled = true;
      return true;
    }

    return false;
  }

  /**
   * Trigger install prompt
   */
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('[PWA] Install prompt not available');

      // Show manual instructions for iOS
      if (this.isIOS()) {
        this.showIOSInstructions();
      }

      return false;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`[PWA] User response to install prompt: ${outcome}`);

    // Clear the prompt
    this.deferredPrompt = null;

    return outcome === 'accepted';
  }

  /**
   * Show custom install button
   */
  showInstallButton() {
    // Create install button if it doesn't exist
    let installBtn = document.getElementById('pwa-install-button');

    if (!installBtn && !this.isInstalled) {
      installBtn = document.createElement('button');
      installBtn.id = 'pwa-install-button';
      installBtn.textContent = '📱 Installeer App';
      installBtn.className = 'btn btn-primary';
      installBtn.style.cssText = `
        position: fixed;
        bottom: var(--spacing-lg);
        right: var(--spacing-lg);
        z-index: 1000;
        box-shadow: var(--shadow-lg);
      `;

      installBtn.addEventListener('click', () => {
        this.promptInstall();
      });

      document.body.appendChild(installBtn);
    }
  }

  /**
   * Hide install button
   */
  hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-button');
    if (installBtn) {
      installBtn.remove();
    }
  }

  /**
   * Show update notification
   */
  showUpdateNotification() {
    // Only show if user wants notifications
    const showNotification = localStorage.getItem('mocia_show_update_notifications') !== 'false';

    if (!showNotification) return;

    // Create notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: var(--spacing-lg);
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-info);
      color: white;
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      display: flex;
      gap: var(--spacing-md);
      align-items: center;
    `;

    notification.innerHTML = `
      <span>Een nieuwe versie is beschikbaar!</span>
      <button onclick="location.reload()" style="background: white; color: var(--color-info); border: none; padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-sm); cursor: pointer; font-weight: bold;">
        Vernieuwen
      </button>
      <button onclick="this.parentElement.remove()" style="background: transparent; color: white; border: 1px solid white; padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-sm); cursor: pointer;">
        Later
      </button>
    `;

    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Show iOS install instructions
   */
  showIOSInstructions() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
    `;

    modal.innerHTML = `
      <div style="background: white; border-radius: var(--border-radius-lg); padding: var(--spacing-xl); max-width: 500px; width: 100%;">
        <h2 style="margin-bottom: var(--spacing-md);">📱 Installeer MOCIA</h2>
        <p style="margin-bottom: var(--spacing-lg); line-height: 1.6;">
          Op iOS Safari, klik op het <strong>Deel</strong> icoon onderaan
          en kies <strong>"Zet op beginscherm"</strong>.
        </p>
        <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" class="btn btn-primary" style="width: 100%;">
          Begrepen
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * Check if running on iOS
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
}

// Initialize PWA installer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaInstaller = new PWAInstaller();
  });
} else {
  window.pwaInstaller = new PWAInstaller();
}
