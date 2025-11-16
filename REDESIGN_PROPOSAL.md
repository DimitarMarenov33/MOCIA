# Minimal Cognitive Load Redesign Proposal

## 📋 **Overview**

This document outlines the proposed redesign of the main menu and exercises to follow the minimal cognitive load principle: **one thing per screen**.

---

## 🏠 **Main Menu Redesign**

### **Current Structure (Problems)**

Currently all on one screen:
- Header with welcome text
- Dashboard with stats
- 3 exercise cards in a grid
- Settings button
- Footer with version info

**Problem**: Too much information, unclear where to start, overwhelming on mobile.

### **New Structure (Solution)**

**Screen 1: Welcome Splash**
```
┌─────────────────────────┐
│                         │
│         🧠              │
│                         │
│   Cognitieve Training   │
│                         │
│   Houd uw geest scherp  │
│                         │
│   ┌─────────────────┐   │
│   │     Start →     │   │
│   └─────────────────┘   │
│                         │
│       ⚙️ Instellingen   │
│                         │
└─────────────────────────┘
```

**Screen 2: Dashboard (if returning user)**
```
┌─────────────────────────┐
│   ← Terug               │
│                         │
│      Uw Voortgang       │
│                         │
│   ┌─────────────────┐   │
│   │ 15 Sessies      │   │
│   │ 8 Uur Training  │   │
│   │ 12 Dagen Actief │   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │  Ga Verder →    │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```

**Screen 3: Exercise Selection (Carousel)**
```
┌─────────────────────────┐
│   ← Terug               │
│                         │
│    Kies een Oefening    │
│                         │
│   ←  ┌───────────┐  →   │
│      │    🔢     │      │
│      │ Cijferreeks│     │
│      │ Onthouden  │     │
│      │           │      │
│      │ Makkelijk  │      │
│      │ 5-10 min   │      │
│      └───────────┘      │
│                         │
│   ┌─────────────────┐   │
│   │ Selecteer →     │   │
│   └─────────────────┘   │
│                         │
│       ● ○ ○             │
└─────────────────────────┘
```

**Screen 4: Exercise Detail**
```
┌─────────────────────────┐
│   ← Terug               │
│                         │
│          🔢             │
│                         │
│   Cijferreeks Onthouden │
│                         │
│  Onthoud en herhaal     │
│  cijferreeksen om uw    │
│  werkgeheugen te trainen│
│                         │
│  ⏱️ Duurt: 5-10 min     │
│  📊 Moeilijkheid: Laag  │
│                         │
│   ┌─────────────────┐   │
│   │ Start Oefening  │   │
│   └─────────────────┘   │
│                         │
│   📚 Bekijk Tutorial    │
│                         │
└─────────────────────────┘
```

---

## 🎯 **Exercise Redesign (Dual N-Back)**

### **Current Structure (Problems)**

Welcome screen has:
- Large icon
- Title
- Long description
- Instructions panel
- Important note panel
- 2 buttons (tutorial + start)

**Problem**: Too much text, overwhelming, instructions should be separate.

### **New Structure (Solution)**

**Screen 1: Simple Welcome**
```
┌─────────────────────────┐
│   ← Terug               │
│                         │
│          🎯             │
│                         │
│      Dual N-Back        │
│                         │
│  Train uw werkgeheugen  │
│   en aandacht tegelijk  │
│                         │
│   ┌─────────────────┐   │
│   │  Start →        │   │
│   └─────────────────┘   │
│                         │
│   📚 Bekijk Tutorial    │
│                         │
└─────────────────────────┘
```

**Screen 2a: Tutorial (One Concept Per Screen)**
```
┌─────────────────────────┐
│   ← Terug               │
│                         │
│    📚 Hoe het Werkt     │
│                         │
│                         │
│   Let op het blauwe     │
│   vierkant op het       │
│   raster                │
│                         │
│   [Visual: Grid demo]   │
│                         │
│                         │
│   ┌─────────────────┐   │
│   │   Volgende →    │   │
│   └─────────────────┘   │
│                         │
│       ● ○ ○ ○           │
└─────────────────────────┘
```

**Screen 2b: Tutorial (Next Concept)**
```
┌─────────────────────────┐
│   ← Terug               │
│                         │
│    📚 Hoe het Werkt     │
│                         │
│                         │
│   Luister naar de       │
│   letters die worden    │
│   uitgesproken          │
│                         │
│   [Visual: Speaker icon]│
│                         │
│                         │
│   ┌─────────────────┐   │
│   │   Volgende →    │   │
│   └─────────────────┘   │
│                         │
│       ○ ● ○ ○           │
└─────────────────────────┘
```

**Screen 3: Exercise (Minimal UI)**
```
┌─────────────────────────┐
│ Poging 5 van 25         │
│                         │
│                         │
│   ┌───┬───┬───┐         │
│   │   │ ● │   │         │
│   ├───┼───┼───┤         │
│   │   │   │   │         │
│   ├───┼───┼───┤         │
│   │   │   │   │         │
│   └───┴───┴───┘         │
│                         │
│                         │
│   ┌─────────────────┐   │
│   │ 📍 Positie      │   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │ 🔊 Geluid       │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```
**Notes**:
- No stats panel during exercise
- No warmup indicator (just gray out buttons)
- No N-level description (just "2-Back" at top)
- Clean, focused interface

**Screen 4: Block Results (Simplified)**
```
┌─────────────────────────┐
│                         │
│      Blok 1 Klaar!      │
│                         │
│                         │
│         85%             │
│     Nauwkeurigheid      │
│                         │
│                         │
│   Uitstekend gedaan!    │
│                         │
│                         │
│   ┌─────────────────┐   │
│   │   Volgende →    │   │
│   └─────────────────┘   │
│                         │
│   Stop Oefening         │
│                         │
└─────────────────────────┘
```
**Notes**:
- No position/sound breakdown (too much detail)
- Just overall score
- Simple feedback message
- Clear next action

**Screen 5: Final Results (Simplified)**
```
┌─────────────────────────┐
│                         │
│          🎉             │
│                         │
│    Sessie Voltooid!     │
│                         │
│       ┌─────┐           │
│       │  3  │           │
│       └─────┘           │
│    Hoogste N-Back       │
│                         │
│   10 Blokken Voltooid   │
│   Nauwkeurigheid: 82%   │
│                         │
│   ┌─────────────────┐   │
│   │ Probeer Opnieuw │   │
│   └─────────────────┘   │
│                         │
│   Terug naar Menu       │
│                         │
└─────────────────────────┘
```
**Notes**:
- No chart (too complex)
- Just key stats
- Clear actions

---

## 🎨 **CSS/Layout Changes**

### **Mobile-First Approach**

**New CSS Architecture:**

```css
/* Base: Mobile (320px - 768px) */
- Single column layouts
- Full-width cards
- Large touch targets (min 48px)
- Font size: 18-20px base
- Generous spacing (16-24px)
- Bottom-aligned primary actions

/* Tablet (768px - 1024px) */
- Slightly larger cards
- More whitespace
- Font size: 20-22px base

/* Desktop (1024px+) */
- Max-width: 600px (centered)
- Even more whitespace
- Don't spread content wide
```

**Key Changes:**

1. **Remove grid layouts** - Use vertical stacks
2. **Simplify header** - Just title, no description in header
3. **Hide footer** - Only show on final screens
4. **Full-screen modals** - No small popups on mobile
5. **Card-based navigation** - Swipeable carousels
6. **Bottom action bar** - Primary buttons at thumb level
7. **Minimal top bar** - Just back button + screen title

---

## 📱 **New Shared Components**

To support this redesign, create these reusable components:

### **1. Simple Screen Template**
```javascript
UIComponents.createSimpleScreen({
  backButton: true,
  icon: '🎯',
  title: 'Dual N-Back',
  description: 'Train your memory',
  primaryAction: {
    text: 'Start',
    onClick: () => {}
  },
  secondaryAction: {
    text: 'Tutorial',
    onClick: () => {}
  }
})
```

### **2. Carousel Component**
```javascript
UIComponents.createCarousel({
  items: [exercise1, exercise2, exercise3],
  renderItem: (item) => renderCard(item),
  onSelect: (item) => {}
})
```

### **3. Tutorial Stepper**
```javascript
UIComponents.createTutorialStepper({
  steps: [
    { title: '...', content: '...', visual: '...' },
    ...
  ],
  onComplete: () => {}
})
```

### **4. Screen Manager**
```javascript
ScreenManager.show('welcome')
ScreenManager.navigate('dashboard')
ScreenManager.back()
```

---

## 🔄 **Navigation Flow**

### **Main Menu Navigation**

```
Welcome → Dashboard (if returning) → Exercise Carousel → Exercise Detail → Exercise
   ↑                                       ↑                    ↑              ↓
   └───────────────────────────────────────┴────────────────────┴──────────────┘
                        (Back navigation at each step)
```

### **Exercise Navigation**

```
Exercise Detail → Welcome → Tutorial (optional) → Exercise → Results
       ↑                        ↑                    ↓           ↓
       └────────────────────────┴────────────────────┴───────────┘
                        (Back to menu always available)
```

---

## ✅ **Implementation Checklist**

### **Phase 1: Create New Components**
- [ ] Screen Manager utility
- [ ] Simple Screen template
- [ ] Carousel component
- [ ] Tutorial Stepper component
- [ ] Mobile-first CSS framework

### **Phase 2: Refactor Main Menu**
- [ ] Create welcome splash screen
- [ ] Create dashboard screen
- [ ] Create exercise carousel
- [ ] Create exercise detail screen
- [ ] Wire up navigation between screens
- [ ] Update settings to be full-screen

### **Phase 3: Refactor Dual N-Back Exercise**
- [ ] Simplify welcome screen
- [ ] Break tutorial into single-concept screens
- [ ] Minimize exercise UI
- [ ] Simplify block results
- [ ] Simplify final results
- [ ] Remove unnecessary information displays

### **Phase 4: Apply to Other Exercises**
- [ ] Apply pattern to Digit Span
- [ ] Apply pattern to UFOV
- [ ] Test all exercises on mobile

### **Phase 5: Testing & Refinement**
- [ ] Test on actual mobile devices
- [ ] Verify touch targets
- [ ] Check font sizes
- [ ] Verify cognitive load is minimal
- [ ] Get user feedback

---

## 📊 **Expected Improvements**

After this redesign:

- ✅ **Reduced cognitive load** - One clear action per screen
- ✅ **Better mobile experience** - Designed for touch-first
- ✅ **Faster task completion** - Less confusion, clearer paths
- ✅ **Lower error rates** - Simpler interfaces = fewer mistakes
- ✅ **Better accessibility** - Larger text, clearer hierarchy
- ✅ **Easier navigation** - Always clear how to go forward/back
- ✅ **Less overwhelming** - No information overload

---

## 🎯 **Next Steps**

1. **Review this proposal** - Get feedback on the design direction
2. **Create components** - Build the reusable UI components
3. **Refactor main menu** - Apply new design to main menu
4. **Refactor exercises** - Apply new design to exercises
5. **Test thoroughly** - Verify improvements on mobile devices

---

## 💡 **Key Takeaways**

> The goal is to make every screen so simple that a user with cognitive decline can understand it immediately, with zero confusion about what to do next.

> If a screen has more than one primary action, it should be split into multiple screens.

> Mobile-first means designing for the smallest screen first, then scaling up - not adapting desktop designs to mobile.
