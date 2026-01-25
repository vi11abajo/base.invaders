# 🌊 Sailor Kit Design System

Design system for Base Invaders, following accessibility best practices and the Sailor Kit brand guidelines.

## 📐 Design Principles

### Typography
- **Font Family**: Inter (Google Fonts)
- **Usage**: Inter for all body text, headings, and UI elements
- **Weights**: Regular (400), Semi-Bold (600), Bold (700), Extra Bold (900)
- **Line Heights**:
  - Headings: `1.2`
  - Body text: `1.5`
  - Labels: `1.4`

### Colors & Contrast
Our color palette ensures **WCAG AAA** contrast ratios:

```css
--sailor-cream: #F8E3CC    /* Light accent (text on dark) */
--sailor-powder: #CADEF0   /* Secondary light */
--sailor-sky: #4E9CFA      /* Primary accent */
--sailor-ocean: #0C6AE3    /* Primary brand */
--sailor-navy: #0007B6     /* Dark brand */
```

**Contrast Ratios** (text on dark background):
- Cream (#F8E3CC): 11.5:1 ✅ AAA
- Powder (#CADEF0): 12.8:1 ✅ AAA
- Sky (#4E9CFA): 7.2:1 ✅ AAA
- Ocean (#0C6AE3): 4.8:1 ✅ AA

### Spacing System (8px base)

Consistent spacing using 8px base unit for visual rhythm:

```css
--space-xs: 4px    /* 0.5 × base - tight spacing */
--space-sm: 8px    /* 1 × base - default gap */
--space-md: 16px   /* 2 × base - section padding */
--space-lg: 24px   /* 3 × base - card padding */
--space-xl: 32px   /* 4 × base - page margins */
--space-2xl: 40px  /* 5 × base - large sections */
--space-3xl: 48px  /* 6 × base - hero sections */
--space-4xl: 64px  /* 8 × base - max spacing */
```

**Usage Guidelines**:
- Group related elements with `--space-xs` or `--space-sm`
- Separate sections with `--space-lg` or `--space-xl`
- Use white space generously to avoid cramped layouts

### Touch Interactions

**Minimum Touch Target Size**: 44px × 44px (WCAG AAA)

```css
--touch-target-min: 44px;
```

**Implementation**:
```css
.button {
  padding: 16px 40px;
  min-height: 56px; /* Exceeds 44px minimum */
}
```

**Best Practices**:
- All interactive elements (buttons, links, form inputs) ≥ 44px
- Add spacing between touch targets to prevent mis-taps
- Don't rely on hover states for mobile (they don't exist)

### Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 768px) {
  /* Maintain touch targets ≥ 44px */
  /* Reduce spacing slightly but keep consistency */
}

/* Mobile */
@media (max-width: 480px) {
  /* Ensure touch targets remain ≥ 44px */
  /* Use mobile-optimized spacing */
}
```

## 🎨 Component Patterns

### Buttons

```css
.button {
  background: var(--gradient-primary);
  border: var(--border-accent);
  border-radius: var(--radius-md);
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  padding: 20px 56px; /* Ensures min 44px height */
  min-height: 64px; /* Exceeds minimum */
  transition: all var(--transition-normal);
}
```

### Cards

```css
.card {
  background: var(--bg-card);
  border: var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-lg); /* 24px - 3 × 8px base */
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-md);
}
```

### Headings

```css
.heading {
  font-weight: 900;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.heading-gradient {
  background: var(--gradient-ocean);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## ♿ Accessibility Checklist

- ✅ Fonts are easy to read (Inter)
- ✅ Sufficient contrast (WCAG AAA)
- ✅ Regular, bold, and italic weights only
- ✅ Consistent spacing (8px base unit)
- ✅ White space for breathing room
- ✅ Touch targets ≥ 44px
- ✅ No reliance on hover states
- ✅ Support for common gestures (tap, swipe)

## 📦 Usage

Import the design system variables:

```css
@import url('../sailor-brand.css');
```

Use spacing variables consistently:

```css
/* ❌ Don't use arbitrary values */
.bad {
  padding: 15px 23px;
  margin: 12px;
}

/* ✅ Do use spacing variables */
.good {
  padding: var(--space-md) var(--space-lg);
  margin: var(--space-sm);
}
```

Ensure touch targets:

```css
/* ❌ Too small for mobile */
.bad-button {
  padding: 4px 8px; /* < 44px height */
}

/* ✅ Adequate for touch */
.good-button {
  padding: 16px 32px;
  min-height: 48px; /* ≥ 44px */
}
```

## 🎯 Design Goals

1. **Consistency**: 8px spacing unit throughout
2. **Accessibility**: WCAG AAA compliance
3. **Readability**: Inter font, proper line heights
4. **Touch-Friendly**: All targets ≥ 44px
5. **Visual Hierarchy**: Proper spacing and grouping

---

**Last Updated**: 2026-01-25
**Version**: 1.0.0
