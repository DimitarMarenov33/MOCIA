# Design Principles for Minimal Cognitive Load

## 🎯 **Core Principle: One Thing at a Time**

The MOCIA Cognitive Training Module is designed for older adults (60+) who may experience cognitive decline. To maximize usability and reduce confusion, we follow a strict **minimal cognitive load** design principle.

### **The Golden Rule**

> **On any screen, show only ONE primary element or task at a time.**

This means users should never be overwhelmed with multiple choices, dense information, or competing visual elements. Each screen should have a single, clear purpose.

---

## 📱 **Mobile-First Design**

All interfaces are designed with mobile devices as the primary target platform, as users will primarily interact with the application on smartphones and tablets.

### **Mobile Design Requirements**

- **Touch-first**: All interactive elements are at least 48x48px (WCAG AAA standard)
- **Single column layouts**: No complex multi-column grids on mobile
- **Large, clear typography**: Minimum 18px base font size
- **High contrast**: WCAG AAA contrast ratios (7:1 for normal text)
- **Generous spacing**: Plenty of whitespace between elements
- **Bottom-aligned actions**: Primary actions near thumb reach zones

---

## 🏗️ **Screen Flow Architecture**

### **Main Menu Flow**

The main menu is broken into separate, focused screens:

```
1. Welcome Screen
   └─ Simple greeting + "Start" button

2. Dashboard Screen (optional, if user has history)
   └─ Progress summary + "Continue" button

3. Exercise List Screen
   └─ ONE exercise card visible at a time
   └─ Swipe/arrow to see next exercise
   └─ "Select" button

4. Exercise Detail Screen
   └─ Exercise description + "Start Exercise" button
```

### **Exercise Flow**

Every exercise follows this pattern:

```
1. Welcome Screen
   └─ Icon + Title + "Start" or "Tutorial" button

2. Tutorial Screens (if user selects tutorial)
   └─ ONE concept per screen
   └─ "Next" / "Previous" / "Start Exercise" buttons

3. Exercise Screen
   └─ ONLY the essential exercise elements
   └─ Minimal UI (progress hidden or minimized)
   └─ Clear, large interaction buttons

4. Break Screen (if applicable)
   └─ Just timer + "Continue" button

5. Results Screen
   └─ Simple score display + "Try Again" / "Back to Menu" buttons
```

---

## 🎨 **Visual Hierarchy Guidelines**

### **Element Priority**

On any screen, elements should follow this hierarchy:

1. **Primary Action** - The ONE thing the user should do (large, prominent button)
2. **Context** - Minimal text explaining what to do (1-2 sentences max)
3. **Secondary Action** - Optional exit/back option (smaller, less prominent)

### **Information Density**

- **Maximum 3 pieces of information** on any screen
- **One primary call-to-action** per screen
- **No more than 2 buttons** on most screens
- **Hide optional information** until needed (use "Show More" patterns)

### **Typography**

- **Headings**: Bold, large (24-32px on mobile)
- **Body text**: Clear, readable (18-20px on mobile)
- **Buttons**: 18-22px text with ample padding
- **Icons**: Used to reduce text, but always labeled

---

## ✅ **Checklist for Every Screen**

Before creating or modifying a screen, verify:

- [ ] Does this screen have a single, clear purpose?
- [ ] Can I describe this screen's goal in 5 words or less?
- [ ] Is there only ONE primary action?
- [ ] Would an elderly user with cognitive decline understand this immediately?
- [ ] Could this be simplified further?
- [ ] Are there more than 3 elements competing for attention? (If yes, simplify)
- [ ] Does this work well on a mobile phone held in portrait mode?
- [ ] Are touch targets at least 48x48px?
- [ ] Is the text large enough to read at arm's length?

---

## 🚫 **Anti-Patterns to Avoid**

### **Don't:**

- ❌ Show multiple navigation options on the same screen
- ❌ Display statistics alongside exercise controls
- ❌ Use complex multi-step forms
- ❌ Show all tutorial information at once
- ❌ Display multiple exercises in a grid on mobile
- ❌ Use small text or dense paragraphs
- ❌ Place multiple buttons next to each other without clear hierarchy
- ❌ Show settings/config options during exercises
- ❌ Display timers, scores, and controls all together

### **Do:**

- ✅ Use full-screen, focused interfaces
- ✅ Show one concept or task at a time
- ✅ Use large, clear buttons with plenty of spacing
- ✅ Break tutorials into single-concept screens
- ✅ Use progressive disclosure (hide complexity)
- ✅ Make the next action obvious and unmissable
- ✅ Use card-based or carousel navigation for lists
- ✅ Separate settings into a dedicated flow
- ✅ Keep exercise UI minimal and distraction-free

---

## 📐 **Layout Patterns**

### **Pattern 1: Action Screen**

Use when the user needs to perform a single action:

```
┌─────────────────────────┐
│                         │
│         [Icon]          │
│                         │
│      Primary Text       │
│   (What will happen)    │
│                         │
│   ┌─────────────────┐   │
│   │  Primary Button │   │
│   └─────────────────┘   │
│                         │
│     [Secondary Link]    │
│                         │
└─────────────────────────┘
```

### **Pattern 2: Information Screen**

Use when the user needs to read/understand something:

```
┌─────────────────────────┐
│                         │
│         [Icon]          │
│                         │
│      Heading Text       │
│                         │
│    Short explanation    │
│    (max 2 sentences)    │
│                         │
│   ┌─────────────────┐   │
│   │   "Got it" →    │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```

### **Pattern 3: Exercise Screen**

Use during active exercise:

```
┌─────────────────────────┐
│                         │
│    [Minimal Progress]   │
│                         │
│                         │
│    Exercise Content     │
│    (Grid, Image, etc)   │
│                         │
│                         │
│   ┌─────────────────┐   │
│   │  Action Button  │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```

### **Pattern 4: Selection Screen (Carousel)**

Use when user needs to pick from multiple options:

```
┌─────────────────────────┐
│                         │
│    ← [Card Content] →   │
│                         │
│      Option Title       │
│      Brief desc         │
│                         │
│   ┌─────────────────┐   │
│   │  Select This    │   │
│   └─────────────────┘   │
│                         │
│      ● ○ ○  (dots)      │
│                         │
└─────────────────────────┘
```

---

## 🔄 **Navigation Patterns**

### **Forward Navigation**

- Use clear, action-oriented labels: "Start", "Continue", "Next", "Begin Exercise"
- Place at the bottom center (thumb reach zone)
- Make prominent with primary button styling

### **Backward Navigation**

- Always provide a way back: "Back", "Cancel", "Exit"
- Place at top-left (standard pattern)
- Use secondary button styling (less prominent)

### **Progress Indication**

- Use minimal, non-intrusive progress indicators
- Dots for multi-step tutorials: ● ○ ○ ○
- Simple text for exercises: "Trial 3 of 20"
- Progress bars should be thin and at the very top

---

## 🧪 **Applying to New Exercises**

When creating a new cognitive exercise:

1. **Sketch the flow** - Draw each screen separately
2. **Count elements** - Ensure each screen has ≤3 main elements
3. **Identify the one thing** - What's the single purpose of this screen?
4. **Remove everything else** - Be ruthless in simplification
5. **Test on mobile first** - Design for smallest screen
6. **Add spacing** - Double the spacing you think you need
7. **Increase font sizes** - Larger than feels comfortable
8. **Review with checklist** - Use the checklist above

---

## 📚 **Examples**

### **Before: Cognitive Overload**

```
Welcome Screen:
- Header with app name
- User stats panel
- 3 exercise cards in a grid
- Settings button
- Tutorial button
- About section
- Footer with version info
```

**Problems**: 7+ elements competing for attention, unclear what to do first, overwhelming for users with cognitive decline.

### **After: Minimal Cognitive Load**

```
Screen 1 - Welcome:
- "Welcome to Cognitive Training"
- "Start" button

Screen 2 - Dashboard (if returning user):
- "Your Progress: X sessions"
- "Continue" button

Screen 3 - Exercise Selection:
- Single exercise card (swipeable)
- "Select Exercise" button
- Dots indicator (● ○ ○)

Screen 4 - Exercise Detail:
- Exercise title + icon
- "This exercise trains your memory"
- "Start Exercise" button
```

**Benefits**: One clear action per screen, no cognitive overload, obvious next steps, mobile-friendly.

---

## 🎯 **Success Metrics**

A design follows minimal cognitive load principles if:

- ✅ Users complete tasks without confusion
- ✅ No questions like "What do I do now?"
- ✅ Single-tap actions (no complex gestures)
- ✅ Immediate understanding (no learning curve)
- ✅ Low error rates
- ✅ High task completion rates
- ✅ Positive user feedback on simplicity

---

## 📝 **Summary**

> **Remember**: If a screen feels too simple, it's probably just right for our target audience. When in doubt, remove elements until only the essential remains. One screen, one purpose, one action.

This principle should be applied to every new feature, exercise, and UI component in the MOCIA Cognitive Training Module.
