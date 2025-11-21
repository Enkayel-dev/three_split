# Accessibility, UX & Fallback Strategies

## Overview

This document defines accessibility requirements, user experience considerations, and fallback strategies for the Liquid Glass 3D website. Accessibility is not optional—it's a core design requirement that ensures the portfolio is usable by everyone.

---

## Accessibility Goals

### WCAG Compliance Target

**Level**: WCAG 2.1 AA (targeting AAA where feasible)

### Core Requirements

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Perceivable | All content accessible to all senses | Text alternatives, contrast, adaptable |
| Operable | All functionality keyboard accessible | Focus management, timing adjustable |
| Understandable | Predictable and readable | Clear navigation, error prevention |
| Robust | Compatible with assistive tech | Semantic HTML, ARIA |

---

## User Preferences Detection

### System Preferences

Detect and respect these OS/browser settings:

| Preference | Media Query | Action |
|------------|-------------|--------|
| Reduced Motion | `prefers-reduced-motion: reduce` | Disable animations, instant transitions |
| Reduced Transparency | `prefers-reduced-transparency: reduce` | Use opaque materials |
| High Contrast | `prefers-contrast: more` | Enhanced borders, solid backgrounds |
| Color Scheme | `prefers-color-scheme: dark/light` | Adapt glass tint and text |

### Implementation

```typescript
function useAccessibilityPreferences() {
  const [prefs, setPrefs] = useState({
    reducedMotion: false,
    reducedTransparency: false,
    highContrast: false,
    darkMode: false,
  });

  useEffect(() => {
    const queries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: more)'),
      darkMode: window.matchMedia('(prefers-color-scheme: dark)'),
    };

    const updatePrefs = () => {
      setPrefs({
        reducedMotion: queries.reducedMotion.matches,
        reducedTransparency: false, // Manual toggle
        highContrast: queries.highContrast.matches,
        darkMode: queries.darkMode.matches,
      });
    };

    updatePrefs();

    Object.values(queries).forEach(mq =>
      mq.addEventListener('change', updatePrefs)
    );

    return () => {
      Object.values(queries).forEach(mq =>
        mq.removeEventListener('change', updatePrefs)
      );
    };
  }, []);

  return prefs;
}
```

---

## Reduced Motion Mode

### What Changes

| Feature | Normal | Reduced Motion |
|---------|--------|----------------|
| Hover scale | 1.03x over 120ms | Instant or disabled |
| Press animation | Spring rebound | Instant state change |
| Idle oscillation | Continuous | Disabled |
| Camera transitions | 900ms spline | Instant cut or 100ms fade |
| Parallax | Continuous | Disabled |
| Morphing | 500ms shape change | Cross-fade |
| Ripple effects | Animated | Disabled |

### Implementation

```typescript
const animationDuration = reducedMotion ? 0 : 280;
const springConfig = reducedMotion
  ? { duration: 0 }
  : { tension: 120, friction: 14 };

// Camera transition
if (reducedMotion) {
  camera.position.copy(targetPosition);
} else {
  animateCameraAlongSpline(targetPosition, 900);
}
```

### CSS Fallback

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Reduced Transparency Mode

### What Changes

| Feature | Normal | Reduced Transparency |
|---------|--------|---------------------|
| Glass transmission | 0.92 | 0.3 |
| Blur amount | roughness 0.12 | roughness 0.6 |
| Background | Visible through glass | Mostly opaque |
| Refraction | Active | Disabled |
| Text contrast | AA | Enhanced (AAA) |

### Material Variant

```typescript
const reducedTransparencyMaterial = {
  transmission: 0.3,
  roughness: 0.6,
  refractionStrength: 0,
  tint: darkMode ? 'rgba(30,30,35,0.85)' : 'rgba(245,245,250,0.85)',
};
```

---

## High Contrast Mode

### What Changes

| Feature | Normal | High Contrast |
|---------|--------|---------------|
| Glass material | Translucent | Opaque solid |
| Borders | Subtle | 2px solid, high contrast |
| Text color | Balanced | Pure black/white |
| Focus indicators | Subtle ring | Thick, obvious outline |
| Icons | Tinted | High contrast fill |

### Color Palette (High Contrast)

```css
:root {
  --hc-background: #ffffff;
  --hc-foreground: #000000;
  --hc-border: #000000;
  --hc-focus: #0066cc;
  --hc-error: #cc0000;
}

@media (prefers-color-scheme: dark) {
  :root {
    --hc-background: #000000;
    --hc-foreground: #ffffff;
    --hc-border: #ffffff;
    --hc-focus: #66b3ff;
    --hc-error: #ff6666;
  }
}
```

---

## Keyboard Navigation

### Focus Management

All interactive elements must be focusable and have visible focus indicators.

#### Focus Order

1. Skip link (hidden until focused)
2. Navigation bar
3. Main content (cards, in reading order)
4. Secondary actions
5. Footer

#### Focus Indicators

```css
/* Visible focus ring */
:focus-visible {
  outline: 3px solid var(--focus-color);
  outline-offset: 2px;
}

/* Remove default outline when using mouse */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter / Space | Activate focused element |
| Escape | Close modal, cancel action |
| Arrow Keys | Navigate within component groups |
| Home | Return to Home Hub |

### Skip Link

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<style>
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 1rem;
  background: var(--bg);
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
</style>
```

---

## Screen Reader Support

### Semantic HTML Layer

All 3D content must have HTML equivalents for screen readers:

```tsx
<Canvas>
  <GlassCard data={project} />
</Canvas>

{/* Hidden but accessible */}
<article className="sr-only" aria-label={project.title}>
  <h2>{project.title}</h2>
  <p>{project.description}</p>
  <a href={project.link}>View project</a>
</article>
```

### ARIA Attributes

```tsx
<div
  role="button"
  aria-label="Navigate to Consulting portfolio"
  aria-pressed={isActive}
  tabIndex={0}
>
  {/* 3D button content */}
</div>
```

### Live Regions

Announce dynamic changes:

```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>

// On navigation
setAnnouncement('Navigated to Consulting Room. Showing 4 case studies.');
```

### Common ARIA Patterns

| Element | Role | Attributes |
|---------|------|------------|
| Card | `article` | `aria-labelledby` |
| Button | `button` | `aria-pressed`, `aria-disabled` |
| Modal | `dialog` | `aria-modal`, `aria-labelledby` |
| Nav | `navigation` | `aria-label` |
| Toolbar | `toolbar` | `aria-label` |

---

## Color & Contrast

### Minimum Contrast Ratios

| Text Size | Requirement | Ratio |
|-----------|-------------|-------|
| Normal text (< 18px) | AA | 4.5:1 |
| Large text (≥ 18px bold or ≥ 24px) | AA | 3:1 |
| UI components | AA | 3:1 |
| Normal text | AAA | 7:1 |
| Large text | AAA | 4.5:1 |

### Testing Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Stark](https://www.getstark.co/)
- Chrome DevTools Contrast Ratio

### Glass Material Contrast

When text appears over glass:

```css
/* Ensure readability over glass */
.glass-text {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* For light mode */
.glass-text--dark {
  color: #1a1a1a;
  background: rgba(255, 255, 255, 0.4); /* Semi-opaque backplate */
}
```

---

## Fallback Strategies

### No WebGL Support

Detect and provide 2D fallback:

```typescript
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

// In app
if (!hasWebGL()) {
  return <FallbackSite />;
}
```

### 2D Fallback Site

The fallback should:
- Use same content and information architecture
- Apply CSS `backdrop-filter: blur()` for glass effect
- Maintain full functionality
- Be fully accessible

```tsx
function FallbackSite() {
  return (
    <div className="fallback-site">
      <nav className="glass-nav">
        <a href="#consulting">Consulting</a>
        <a href="#software">Software</a>
        <a href="#construction">Construction</a>
      </nav>

      <main>
        <section id="consulting" className="glass-panel">
          {/* Card grid */}
        </section>
        {/* ... */}
      </main>
    </div>
  );
}
```

### CSS Glass Fallback

```css
.glass-panel {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

/* Fallback for no backdrop-filter support */
@supports not (backdrop-filter: blur(12px)) {
  .glass-panel {
    background: rgba(255, 255, 255, 0.85);
  }
}
```

### Low-Performance Devices

Detect and reduce quality:

```typescript
function getDeviceCapability(): 'high' | 'medium' | 'low' | 'fallback' {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');

  if (!gl) return 'fallback';

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    // Check for known low-power GPUs
    if (/Intel|Mali-4|Adreno 3/i.test(renderer)) {
      return 'low';
    }
  }

  // Check device memory (if available)
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    return 'low';
  }

  return 'high';
}
```

---

## Touch & Mobile Considerations

### Touch Targets

Minimum touch target size: **44x44px** (equivalent in 3D space)

```typescript
// Minimum 3D touch target
const MIN_TOUCH_SIZE = 0.1; // meters at typical viewing distance

// Ensure clickable area is large enough
<mesh
  onClick={handleClick}
  scale={Math.max(baseScale, MIN_TOUCH_SIZE / baseSize)}
>
```

### Gesture Support

| Gesture | Action |
|---------|--------|
| Tap | Select/click |
| Double-tap | Zoom/expand |
| Swipe | Navigate between cards |
| Pinch | Zoom (if applicable) |
| Two-finger drag | Pan view |

### Mobile-Specific Fallbacks

```typescript
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Reduce quality
  setQualityLevel('low');

  // Disable heavy effects
  setParallaxEnabled(false);
  setIdleAnimationsEnabled(false);

  // Simplify materials
  setMaterialLOD('mobile');
}
```

---

## Settings Panel

Provide user-accessible controls:

### Accessibility Settings UI

```tsx
function AccessibilityPanel() {
  const { reducedMotion, reducedTransparency, highContrast, setPrefs } = usePrefs();

  return (
    <div role="dialog" aria-label="Accessibility settings">
      <h2>Accessibility</h2>

      <label>
        <input
          type="checkbox"
          checked={reducedMotion}
          onChange={(e) => setPrefs({ reducedMotion: e.target.checked })}
        />
        Reduce motion
      </label>

      <label>
        <input
          type="checkbox"
          checked={reducedTransparency}
          onChange={(e) => setPrefs({ reducedTransparency: e.target.checked })}
        />
        Reduce transparency
      </label>

      <label>
        <input
          type="checkbox"
          checked={highContrast}
          onChange={(e) => setPrefs({ highContrast: e.target.checked })}
        />
        High contrast
      </label>
    </div>
  );
}
```

---

## Testing Checklist

### Automated Testing

- [ ] Lighthouse accessibility score > 90
- [ ] axe-core passes with 0 critical/serious issues
- [ ] WAVE tool shows no errors

### Manual Testing

- [ ] Navigate entire site using only keyboard
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Test with reduced motion enabled
- [ ] Test with high contrast enabled
- [ ] Test at 200% zoom
- [ ] Test on low-end mobile device
- [ ] Test with no WebGL

### User Testing

- [ ] Test with users who rely on assistive technology
- [ ] Test with users who have motor impairments
- [ ] Test with users who have visual impairments

---

## Error Handling & Feedback

### Error Messages

```tsx
// Accessible error message
<div role="alert" aria-live="assertive">
  <span className="error-icon" aria-hidden="true">!</span>
  <span>Please enter a valid email address</span>
</div>
```

### Loading States

```tsx
<div role="status" aria-live="polite">
  <span className="sr-only">Loading portfolio...</span>
  <LoadingSpinner aria-hidden="true" />
</div>
```

### Success Feedback

```tsx
<div role="status" aria-live="polite">
  Message sent successfully. We'll be in touch within 24 hours.
</div>
```

---

## Documentation for Users

### Accessibility Statement

Include a public accessibility statement:

```markdown
## Accessibility Statement

Enkayel Studios is committed to ensuring digital accessibility for people with
disabilities. We continually improve the user experience for everyone and apply
the relevant accessibility standards.

### Conformance Status
This website conforms to WCAG 2.1 level AA.

### Feedback
We welcome your feedback on the accessibility of this website. Please contact
us at accessibility@enkayel.com.
```

---

*Accessibility is a continuous effort. This document should be updated as new features are added and testing reveals areas for improvement.*
