# MOCIA PWA Deployment Guide

This guide will help you deploy the MOCIA Cognitive Training app as a Progressive Web App (PWA).

## 📋 Prerequisites

Before deploying, you need:
1. All files in this project folder
2. App icons (see Icon Requirements below)
3. A hosting service account (Netlify, Vercel, GitHub Pages, etc.)

## 🎨 Icon Requirements

You need to create app icons in these sizes and place them in an `/icons/` folder:
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px (required for Android)
- 384x384px
- 512x512px (required for Android)

**How to create icons:**
1. Design a 512x512px icon with the MOCIA logo/brain icon
2. Use a tool like [PWA Image Generator](https://www.pwabuilder.com/imageGenerator) to create all sizes
3. Save them as PNG files in the `/icons/` folder

**Quick temporary solution:**
If you don't have icons yet, you can use a simple colored square as a placeholder:
- Go to [Favicon.io](https://favicon.io/favicon-generator/)
- Generate a simple icon with "M" or brain emoji
- Download and resize to all required sizes

## 🚀 Deployment Options

### Option 1: Netlify (Recommended - Easiest)

1. **Sign up** at [netlify.com](https://netlify.com) (free)

2. **Deploy via Drag & Drop:**
   - Click "Add new site" → "Deploy manually"
   - Drag your entire project folder into the browser
   - Done! Your site is live at `your-site-name.netlify.app`

3. **Or Deploy via GitHub:**
   - Push your code to a GitHub repository
   - Connect Netlify to your GitHub repo
   - Netlify will auto-deploy on every push

4. **Custom Domain (Optional):**
   - Go to Site settings → Domain management
   - Add your custom domain (e.g., `mocia.nl`)

### Option 2: Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub or drag & drop folder
4. Deploy - done!

### Option 3: GitHub Pages

1. Create a GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/mocia.git
   git push -u origin main
   ```
3. Go to repository Settings → Pages
4. Select "main" branch and "/" root folder
5. Save - your site will be at `https://YOUR-USERNAME.github.io/mocia/`

**Important for GitHub Pages:**
If deploying to a subdirectory (like `/mocia/`), you need to update paths:
- In `manifest.json`: change `"start_url": "/"` to `"start_url": "/mocia/"`
- In `sw.js`: update all paths to include `/mocia/` prefix

### Option 4: Cloudflare Pages

1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect to GitHub or upload files
3. Deploy

## 📱 How Users Install the App

### On Android (Chrome):
1. Visit your deployed URL (e.g., `https://mocia.netlify.app`)
2. Chrome will show "Add to Home screen" banner
3. Tap "Install" or "Add"
4. App icon appears on home screen
5. Works offline after first visit

### On iOS (Safari):
1. Visit your deployed URL in Safari
2. Tap the "Share" button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen
6. Works offline after first visit

### On Desktop:
1. Visit URL in Chrome or Edge
2. Click the install icon (➕) in the address bar
3. Click "Install"
4. App opens in its own window

## ✅ Testing Before Deployment

Test locally first:

1. **Install a local server:**
   ```bash
   # Using Python (built-in)
   python3 -m http.server 8000

   # Or using Node.js
   npx http-server -p 8000
   ```

2. **Open browser:**
   - Go to `http://localhost:8000`
   - Open DevTools (F12) → Application tab
   - Check:
     - ✅ Manifest is loaded
     - ✅ Service Worker is registered
     - ✅ All files are cached

3. **Test offline:**
   - Visit all pages once (to cache them)
   - In DevTools → Network tab, check "Offline"
   - Refresh page - should still work!

## 🔒 Security Checklist

Before deploying:
- ✅ HTTPS is enabled (automatic with Netlify/Vercel)
- ✅ No API keys or secrets in code
- ✅ All data stored locally (localStorage)
- ✅ No external tracking scripts
- ✅ Service worker is properly configured

## 🐛 Troubleshooting

### Service Worker not registering
- Check browser console for errors
- Make sure you're on HTTPS (required for PWA)
- Clear browser cache and reload

### App not working offline
- Visit all pages at least once while online (to cache them)
- Check DevTools → Application → Service Workers
- Verify files are cached in Cache Storage

### Install prompt not showing
- Android: Make sure site is HTTPS and has valid manifest
- iOS: No install prompt - users must manually "Add to Home Screen"

### Icons not showing
- Verify icons exist in `/icons/` folder
- Check paths in `manifest.json`
- Use absolute paths (starting with `/`)

## 📊 Monitoring

After deployment, you can monitor:
- **Netlify Analytics:** See visitor count, page views
- **Browser DevTools:** Check console for errors
- **Lighthouse:** Run audit to check PWA score (should be 100%)

## 🔄 Updating the App

When you make changes:

1. **Update cache version** in `sw.js`:
   ```javascript
   const CACHE_VERSION = 'mocia-v1.0.1'; // Increment version
   ```

2. **Deploy updated files** (Netlify/Vercel auto-deploy from GitHub)

3. **Users get update:**
   - Next time they open the app, service worker detects new version
   - Shows "Update available" notification
   - They click "Refresh" to get latest version

## 📞 Support

For deployment issues:
- Netlify Docs: https://docs.netlify.com
- Vercel Docs: https://vercel.com/docs
- PWA Docs: https://web.dev/progressive-web-apps/

## ✨ Post-Deployment

After deployment:
1. Test on multiple devices (Android, iOS, Desktop)
2. Check PWA score with [Lighthouse](https://developers.google.com/web/tools/lighthouse)
3. Share the URL with users
4. Consider creating a QR code for easy access

---

**Your app is now a fully functional Progressive Web App! 🎉**

Users can install it on their phones and use it offline, with all their data stored securely on their device.
