# 📋 Pre-Deployment Checklist

Use this checklist before deploying MOCIA to ensure everything works correctly.

## ⚠️ CRITICAL - Must Do Before Deploy

### 1. Create App Icons
- [ ] Create `/icons/` folder in project root
- [ ] Generate icon-72.png (72x72)
- [ ] Generate icon-96.png (96x96)
- [ ] Generate icon-128.png (128x128)
- [ ] Generate icon-144.png (144x144)
- [ ] Generate icon-152.png (152x152)
- [ ] Generate icon-192.png (192x192) ⭐ REQUIRED
- [ ] Generate icon-384.png (384x384)
- [ ] Generate icon-512.png (512x512) ⭐ REQUIRED

**Quick Solution:** Use [Favicon.io](https://favicon.io/favicon-generator/) to generate all sizes

### 2. Test Locally
- [ ] Start local server: `python3 -m http.server 8000`
- [ ] Open `http://localhost:8000` in browser
- [ ] Test all 5 cognitive domain pages load
- [ ] Test at least one exercise from each domain
- [ ] Check DevTools → Application → Service Worker (should show "activated")
- [ ] Check DevTools → Application → Manifest (should load without errors)
- [ ] Enable offline mode (Network tab → Offline) and refresh - should still work

## ✅ Recommended - Quality Assurance

### 3. Browser Testing
- [ ] Test in Chrome (desktop)
- [ ] Test in Safari (iOS - if available)
- [ ] Test in Chrome (Android - if available)
- [ ] Test in Firefox (desktop)
- [ ] Test in Edge (desktop)

### 4. PWA Features
- [ ] Service Worker registers without errors
- [ ] manifest.json loads correctly
- [ ] App can be installed (check for install prompt)
- [ ] Offline mode works after first visit
- [ ] Data persists after closing browser

### 5. Exercise Functionality
- [ ] **Werkgeheugen** - Digit Span works
- [ ] **Werkgeheugen** - Dual N-Back works
- [ ] **Verwerkingssnelheid** - UFOV Basic works
- [ ] **Verwerkingssnelheid** - UFOV Complex works
- [ ] **Aandacht** - Visual Search works
- [ ] **Aandacht** - Complex Dual Task works
- [ ] **Executieve Functies** - Stroop works
- [ ] **Executieve Functies** - Task Switching works
- [ ] **Episodisch Geheugen** - Word Pair works (including timer)

### 6. Navigation
- [ ] Back button (← Terug) works on all pages
- [ ] Home button (🏠) works on all pages
- [ ] Domain selection grid displays correctly (3 top, 2 bottom centered)
- [ ] Exercise cards are clickable
- [ ] Settings modal opens and closes

### 7. Data & Privacy
- [ ] Data saves to localStorage
- [ ] Settings persist after refresh
- [ ] Export data works (downloads JSON)
- [ ] No console errors related to data storage
- [ ] localStorage is under 5MB limit

### 8. Mobile Responsiveness
- [ ] Layout looks good on phone (< 768px)
- [ ] Layout looks good on tablet (768-1024px)
- [ ] Touch targets are large enough (48px minimum)
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling

### 9. Accessibility
- [ ] Tab navigation works (keyboard only)
- [ ] Focus indicators are visible
- [ ] Contrast ratios meet WCAG AAA (7:1)
- [ ] Text can zoom to 200% without breaking layout
- [ ] Screen reader can read all content (if available)

### 10. Performance
- [ ] Page loads in < 3 seconds
- [ ] No JavaScript errors in console
- [ ] Service Worker caches all resources
- [ ] Lighthouse PWA score is 90+ (run audit in DevTools)

## 🚀 Ready to Deploy

Once all checkboxes above are checked:

1. **Choose hosting platform:**
   - Netlify (easiest - drag & drop)
   - Vercel (great for GitHub)
   - GitHub Pages (free for public repos)
   - Cloudflare Pages (fast CDN)

2. **Deploy:**
   - Follow instructions in `DEPLOYMENT.md`
   - Get your live URL (e.g., `https://mocia.netlify.app`)

3. **Post-Deploy Testing:**
   - Visit deployed URL on multiple devices
   - Test install on iOS and Android
   - Verify HTTPS is working (required for PWA)
   - Run Lighthouse audit (aim for 100 PWA score)

4. **Share:**
   - Give URL to users
   - Provide installation instructions
   - Consider creating a QR code for easy access

---

## 🐛 Common Pre-Deploy Issues

**Issue:** Icons not showing
- **Fix:** Verify `/icons/` folder exists with all required sizes
- **Fix:** Check paths in manifest.json match actual file names

**Issue:** Service Worker not registering
- **Fix:** Must be served over HTTPS (works on localhost)
- **Fix:** Check `sw.js` is in project root
- **Fix:** Clear browser cache and reload

**Issue:** Offline mode not working
- **Fix:** Visit all pages once while online (to cache them)
- **Fix:** Check `sw.js` includes all necessary files in ASSETS_TO_CACHE
- **Fix:** Update cache version if you made changes

**Issue:** Domain grid not symmetric
- **Fix:** Already fixed with 6-column grid layout
- **Fix:** Test on actual devices, not just browser resize

**Issue:** localStorage quota exceeded
- **Fix:** Implement data cleanup in settings
- **Fix:** Limit number of stored sessions (currently max 100)

---

## ✨ Post-Deployment

After deploying:
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Share URL with test users
- [ ] Monitor for any reported issues
- [ ] Consider analytics (optional - privacy-respecting only)

---

**Need Help?** See `DEPLOYMENT.md` for detailed deployment instructions.
