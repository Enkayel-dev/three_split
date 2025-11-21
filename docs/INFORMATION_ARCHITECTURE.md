# Spatial Information Architecture & Navigation Map

## Overview

This document defines the information architecture for the 3D Liquid Glass website. Unlike traditional 2D websites, this IA treats the site as a **graph of spatial nodes** (rooms) connected by **camera paths** (edges). Each node is a 3D composition of glass UI objects.

---

## Site Hierarchy

### Primary Nodes (Rooms)

| Node | Purpose | Content Type |
|------|---------|--------------|
| **Home Hub** | Entry plaza, primary navigation | Hero panel, navigation cards |
| **Consulting Room** | Business operations portfolio | Case study cards, workflow diagrams |
| **Software Room** | Development portfolio | Project cards, interactive demos |
| **Construction Room** | Architecture portfolio | Project renders, floor plans |
| **Contact Node** | Lead generation | Form panel, calendar integration |

### Secondary Nodes (Overlays)

| Node | Purpose | Trigger |
|------|---------|---------|
| Settings Modal | Accessibility toggles | Settings button |
| Privacy Panel | Cookie/privacy controls | Footer link |
| Project Detail | Expanded project view | Card click |

---

## Navigation Graph

```
                         ┌─────────────────┐
                         │   Home Hub      │
                         │   (Entry Point) │
                         └────────┬────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
            ▼                     ▼                     ▼
   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
   │ Consulting Room │   │  Software Room  │   │Construction Room│
   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
            │                     │                     │
            ▼                     ▼                     ▼
   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
   │ Project Detail  │   │ Project Detail  │   │ Project Detail  │
   │    (Modal)      │   │    (Modal)      │   │    (Modal)      │
   └─────────────────┘   └─────────────────┘   └─────────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Contact Node   │
                         └─────────────────┘
```

### Navigation Connections

| From | To | Transition Type |
|------|-----|-----------------|
| Home Hub | Consulting Room | Camera spline |
| Home Hub | Software Room | Camera spline |
| Home Hub | Construction Room | Camera spline |
| Any Room | Contact Node | Camera spline |
| Any Room | Home Hub | Camera spline (back) |
| Project Card | Project Detail | Modal expand |

---

## Node Specifications

### Home Hub

**Purpose**: Welcome visitors, establish brand, provide clear navigation

**Camera Position**: `(-3, 1.5, 3)` looking at `(0, 1.2, 0)`

**Spatial Layout**:
```
                    [Floating Logo]
                      (0, 2, -0.5)
                          │
                    [Hero Card]
                    (0, 1.2, 0)
                    2m × 1.2m
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
[Consulting]         [Software]         [Construction]
(-1.5, 0.8, -1.2)   (0, 0.8, -1.2)    (1.5, 0.8, -1.2)
  0.8m × 0.5m         0.8m × 0.5m       0.8m × 0.5m
```

**Content**:
- Hero Card: Company tagline, "Enter Portfolio" CTA
- Navigation Cards: Visual icons + labels for each discipline
- Floating Logo: Subtle rotation, brand accent

**Interactions**:
- Hero Card: Hover Fresnel boost, click enters Consulting Room
- Nav Cards: Hover ripple, click navigates to respective room

---

### Consulting Room

**Purpose**: Showcase business operations consulting portfolio

**Camera Position**: `(0, 1.5, 3)` looking at `(0, 1.2, 0)`

**Spatial Layout**:
```
        [Urban Threads]
        (0, 1.0, -1.2)
             │
    ┌────────┴────────┐
    │                 │
[Brew Lab]    [Placeholder 2]
(-1.2, 1.0, 0)  (0, 1.0, 1.2)
    │                 │
    └────────┬────────┘
             │
      [Placeholder 1]
      (1.2, 1.0, 0.2)
```

**Card Configuration**:
- Arc arrangement, ~1m radius from center
- Cards sized 0.9m × 0.5m
- Vertical oscillation ±0.05m

**Content Per Card**:
- Project title
- Type/category label
- Brief result summary
- Expandable to detail modal

---

### Software Room

**Purpose**: Showcase software development projects with interactive demos

**Camera Position**: `(0, 1.8, 3.5)` looking at `(0, 1.5, 0)`

**Spatial Layout**:
```
        [Drake Bartends]
        (0, 1.2, -1.5)
             │
    ┌────────┴────────┐
    │                 │
[Liquid Ledger]  [Crypto Dashboard]
(-1.5, 1.2, 0)    (1.5, 1.2, 0)
```

**Special Features**:
- Background: Subtle parallax grid with animated data nodes
- Click expansion: Demo panels show mock UI
- Light reflection changes with cursor proximity

**Card Configuration**:
- L-shaped arrangement
- Cards sized 0.9m × 0.6m
- Demo panels expand forward 0.3-0.5m

---

### Construction Room

**Purpose**: Showcase architecture and construction portfolio

**Camera Position**: `(0, 1.6, 3.2)` looking at `(0, 1.5, 0)`

**Spatial Layout**:
```
      [Adaptive Workspace]
         (0, 1.0, -1.2)
              │
    ┌─────────┴─────────┐
    │                   │
[Modern Luxury]    [Boutique Retail]
(-1.2, 1.0, 0)     (1.2, 1.0, 0.2)
```

**Special Features**:
- Gallery-wall style arrangement
- Cards rotate slowly on idle
- Click expands to floor plans + 3D renders

**Card Configuration**:
- Vertical offsets simulate gallery walls
- Cards sized 0.9m × 0.6m
- Rotation oscillation ±2° on Y-axis

---

### Contact Node

**Purpose**: Lead generation, booking, communication

**Camera Position**: `(0, 1.4, 2.8)` looking at `(0, 1.2, 0)`

**Spatial Layout**:
```
    [Form Panel]          [Calendar Card]
    (0, 1.2, 0)           (1.0, 1.0, -0.3)
    1.2m × 0.8m           0.8m × 0.6m
```

**Form Fields**:
1. Name (required)
2. Email (required)
3. Message (required)
4. Budget Range (optional)

**Interactions**:
- Input hover: Subtle ripple effect
- Submit: Tactile press, panel shake on success
- Calendar: External Calendly integration

---

## URL Structure & Deep Linking

### Route Mapping

| URL | Node | Camera State |
|-----|------|--------------|
| `/` | Home Hub | Default entry position |
| `/consulting` | Consulting Room | Center view |
| `/consulting/:id` | Project Detail | Modal overlay |
| `/software` | Software Room | Center view |
| `/software/:id` | Project Detail | Modal overlay |
| `/construction` | Construction Room | Center view |
| `/construction/:id` | Project Detail | Modal overlay |
| `/contact` | Contact Node | Form focused |

### State Preservation

- URL updates on node change
- Browser back/forward navigates camera
- Direct URL access positions camera correctly
- Share links include full state

---

## Navigation Patterns

### Camera Spline Transitions

**Between Main Nodes**:
- Duration: 0.8 - 1.0 seconds
- Easing: `cubic-bezier(0.2, 0.85, 0.25, 1)`
- Path: Bezier curve, slight arc to avoid linear feel

**Spline Control Points** (example: Home → Consulting):
```
Start: (-3, 1.5, 3)
Control 1: (-1, 2.0, 2)
Control 2: (-0.5, 1.8, 1)
End: (0, 1.5, 3)
```

### Modal Transitions

**Opening**:
- Card scales to 1.3x
- Translates toward camera 0.3-0.5m
- Detail panel morphs in from card shape
- Duration: 400-600ms

**Closing**:
- Reverse morph to original card
- Click outside or Escape key dismisses

### Back Navigation

- Always available via nav bar or keyboard
- Smooth reverse camera path
- Maintains scroll/focus state where appropriate

---

## Content Requirements

### Per Node Minimums

| Node | Cards | Content Items |
|------|-------|---------------|
| Home Hub | 4 | Hero + 3 nav |
| Consulting | 4 | 4 case studies |
| Software | 3 | 3 projects |
| Construction | 3 | 3 projects |
| Contact | 2 | Form + calendar |

### Content Depth Per Card

| Level | Content |
|-------|---------|
| Card Surface | Title, type, tagline |
| Expanded | Full description, images, results |
| Detail Modal | Complete case study/project page |

---

## Accessibility Navigation

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between interactive elements |
| Enter/Space | Activate focused element |
| Escape | Close modal, return to previous |
| Arrow Keys | Navigate within card groups |
| Home | Return to Home Hub |

### Fallback 2D Navigation

For screen readers and reduced-motion users:
- Sticky HTML topbar with text links
- Skip links to main content areas
- All nodes accessible without camera animation
- Full content available in semantic HTML

---

## Spatial Design Rules

### General Principles

1. **Maximum 4-6 interactive cards visible** at any time
2. **Maintain visual depth**: foreground, midground, background
3. **Consistent grid system**: 1 unit = 1 meter
4. **Default camera distance**: 3.2m from node center
5. **Card separation**: minimum 0.4m

### Coordinate System

- **X-axis**: Left (-) to Right (+)
- **Y-axis**: Down (-) to Up (+)
- **Z-axis**: Away (-) to Toward (+) camera

### Standard Dimensions

| Element | Size |
|---------|------|
| Navigation Card | 0.8m × 0.5m |
| Content Card | 0.9m × 0.5-0.6m |
| Hero Panel | 2.0m × 1.2m |
| Form Panel | 1.2m × 0.8m |
| Modal Expanded | 1.3x original |

---

## Onboarding Flow

### First-Time Visitor Experience

1. **Entry Animation** (3-4 seconds)
   - Camera zooms from far to Home Hub
   - Establishes scale and spatial context

2. **Hint System**
   - Small pulsing indicator on first nav card
   - Tooltip: "Click to explore"
   - Disappears after first interaction

3. **Progressive Disclosure**
   - Initial view shows only primary cards
   - Additional elements fade in as user explores

### Skip Option
- "Skip intro" button for returning visitors
- Stored in localStorage

---

## Analytics Touchpoints

### Track These Events

| Event | Data |
|-------|------|
| Node Visit | Node ID, time spent |
| Card Hover | Card ID, duration |
| Card Click | Card ID, expansion vs. navigation |
| Form Submit | Success/failure, field completion |
| Navigation Path | Sequence of nodes visited |
| Time to First Interaction | Seconds from load |
| Accessibility Mode | Which modes enabled |

---

*This IA document defines the spatial structure of the Liquid Glass website. All navigation and content placement should follow these specifications.*
