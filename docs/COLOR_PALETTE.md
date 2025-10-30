# BookIt Color Palette

## Primary Colors

### Purple Theme

- **Primary**: `#4100f4` - Main brand purple

  - CSS Variable: `var(--color-primary)`
  - Usage: Primary buttons, links, accents

- **Primary Light**: `#6366f1` - Lighter purple for gradients

  - CSS Variable: `var(--color-primary-light)`
  - Usage: Gradient endings, hover states

- **Primary Dark**: `#3300cc` - Darker purple for hover states

  - CSS Variable: `var(--color-primary-dark)`
  - Usage: Button hover states, active states

- **Primary Darker**: `#2600a3` - Deepest purple
  - CSS Variable: `var(--color-primary-darker)`
  - Usage: Deep shadows, pressed states

### Light Purple (For Dark Backgrounds)

- **Text Light**: `#d1a0ee` - Lavender for text on dark backgrounds

  - CSS Variable: `var(--color-text-light)`
  - Usage: Text on dark/semi-transparent backgrounds, overlays
  - **This is the primary text color for darker UI elements**

- **Text Light Hover**: `#e0b8f5` - Lighter lavender for hover
  - CSS Variable: `var(--color-text-light-hover)`
  - Usage: Hover states for light purple text

## Neutral Colors

### Grays

- **Gray 100**: `#f5f5f5` - Lightest gray
- **Gray 200**: `#e0e0e0` - Light gray (borders, dividers)
- **Gray 300**: `#d4d4d4` - Medium-light gray
- **Gray 400**: `#999999` - Medium gray (placeholder text)
- **Gray 500**: `#666666` - Dark gray (secondary text)
- **Gray 600**: `#333333` - Darkest gray (primary text on light)

### Base

- **White**: `#ffffff`
- **Black**: `#000000`

## Accent Colors

- **Danger**: `#dc2626` - Error states, delete actions
- **Danger Dark**: `#cc0000` - Danger hover states
- **Success**: `#16a34a` - Success states, confirmations
- **Warning**: `#ea580c` - Warning states, caution

## Background Colors

- **Background Dark**: `rgba(25, 25, 25, 0.2)` - Dark semi-transparent

  - CSS Variable: `var(--color-bg-dark)`

- **Background Light**: `rgba(255, 255, 255, 0.5)` - Light semi-transparent

  - CSS Variable: `var(--color-bg-light)`

- **Background Glassmorphic**: `rgba(255, 255, 255, 0.25)` - Glass effect
  - CSS Variable: `var(--color-bg-glassmorphic)`

## Gradients

- **Primary Gradient**: `linear-gradient(135deg, #4100f4 0%, #6366f1 100%)`

  - CSS Variable: `var(--gradient-primary)`
  - Usage: Buttons, headers, featured elements

- **Primary Gradient Hover**: `linear-gradient(135deg, #3300cc 0%, #4f46e5 100%)`
  - CSS Variable: `var(--gradient-primary-hover)`
  - Usage: Hover states for gradient elements

## Shadows

- **Shadow Small**: `0 2px 8px rgba(0, 0, 0, 0.08)`

  - CSS Variable: `var(--shadow-sm)`

- **Shadow Medium**: `0 4px 12px rgba(0, 0, 0, 0.15)`

  - CSS Variable: `var(--shadow-md)`

- **Shadow Large**: `0 8px 24px rgba(0, 0, 0, 0.2)`

  - CSS Variable: `var(--shadow-lg)`

- **Shadow Primary**: `0 4px 12px rgba(65, 0, 244, 0.25)`

  - CSS Variable: `var(--shadow-primary)`
  - Usage: Purple-tinted shadows for brand elements

- **Shadow Primary Large**: `0 6px 16px rgba(65, 0, 244, 0.35)`
  - CSS Variable: `var(--shadow-primary-lg)`
  - Usage: Elevated purple-tinted shadows

## Usage Guidelines

### Text on Dark Backgrounds

Always use `#d1a0ee` (var(--color-text-light)) for text on:

- Dark overlays
- Semi-transparent dark backgrounds
- Loading screens
- Modal overlays
- Dark cards

### Text on Light Backgrounds

Use gray scale colors:

- Primary text: `#333333` (var(--color-gray-600))
- Secondary text: `#666666` (var(--color-gray-500))
- Placeholder text: `#999999` (var(--color-gray-400))

### Buttons

- Primary actions: Use purple gradient (var(--gradient-primary))
- Secondary actions: White with purple border
- Danger actions: White with red border

### Consistency

Always use CSS variables instead of hardcoded colors to maintain consistency and enable easy theme updates:

```css
/* Good ✓ */
color: var(--color-text-light);
background: var(--gradient-primary);

/* Avoid ✗ */
color: #d1a0ee;
background: linear-gradient(135deg, #4100f4 0%, #6366f1 100%);
```
