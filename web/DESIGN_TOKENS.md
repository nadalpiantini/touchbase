# Design Tokens Documentation

## Overview

TouchBase uses a **design token system** with CSS variables to enable **whitelabel theming**. This allows different academies/organizations to customize the platform's appearance without code changes.

## Architecture

### Two-Layer Token System

1. **Whitelabel Tokens** - Can be overridden dynamically per tenant
2. **TouchBase Tokens** - Static brand colors for TouchBase itself

---

## Whitelabel Tokens

These tokens can be customized per tenant via the `ThemeProvider` component.

### Colors

```css
--primary: #B21E2A;      /* Main brand color (buttons, links, headers) */
--secondary: #14213D;    /* Secondary brand color (backgrounds, borders) */
--accent: #C82E3C;       /* Accent color (highlights, badges, alerts) */
```

**Usage in Tailwind**:
```tsx
<button className="bg-primary text-white">Click me</button>
<div className="border-secondary">Content</div>
<span className="text-accent">Highlighted</span>
```

### Typography

```css
--font-brand: var(--font-oswald), 'Oswald', ui-sans-serif, system-ui;
--font-body: var(--font-inter), 'Inter', ui-sans-serif, system-ui;
```

**Usage in Tailwind**:
```tsx
<h1 className="font-brand">Heading</h1>
<p className="font-body">Body text</p>
```

### Layout

```css
--radius: 0.5rem;        /* Default border radius */
--spacing-unit: 0.25rem; /* Base spacing unit (4px) */
```

---

## TouchBase Static Tokens

These are specific to the TouchBase brand and **do not change** per tenant.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--tb-red` | #B21E2A | Primary red (default primary) |
| `--tb-navy` | #14213D | Navy blue (default secondary) |
| `--tb-beige` | #F8EBD0 | Beige background |
| `--tb-stitch` | #C82E3C | Stitch red (default accent) |
| `--tb-shadow` | #3E3E3E | Shadow gray |
| `--tb-bone` | #FAF7F0 | Bone white |
| `--tb-line` | #D7D7D7 | Line gray |
| `--tb-ink` | #0E0E0E | Ink black |

**Usage in Tailwind**:
```tsx
<div className="bg-tb-navy text-tb-bone">TouchBase branding</div>
```

---

## Applying Custom Themes

### 1. Define Theme Object

```typescript
import { Theme } from '@/types/theme';

const philliesTheme: Theme = {
  primaryColor: '#E81828',      // Phillies red
  secondaryColor: '#002D72',     // Phillies blue
  accentColor: '#FFFFFF',        // White
  logoUrl: '/phillies-logo.png',
  fontFamily: 'Roboto',
};
```

### 2. Inject via ThemeProvider

The `ThemeProvider` component (to be implemented in STORY-01.2) will:

```typescript
// Pseudo-code
useEffect(() => {
  document.documentElement.style.setProperty('--primary', theme.primaryColor);
  document.documentElement.style.setProperty('--secondary', theme.secondaryColor);
  document.documentElement.style.setProperty('--accent', theme.accentColor);
  document.documentElement.style.setProperty('--font-brand', theme.fontFamily);
}, [theme]);
```

### 3. Use in Components

```tsx
// Component automatically uses current tenant's theme
<button className="bg-primary hover:bg-secondary">
  Dynamic Themed Button
</button>
```

---

## Validation

### Schema Validation (Zod)

```typescript
import { themeSchema } from '@/lib/schemas/theme';

// Validate before saving to database
const result = themeSchema.safeParse(userThemeInput);
if (!result.success) {
  console.error(result.error);
}
```

### Accessibility Validation

```typescript
import { validateThemeAccessibility } from '@/lib/schemas/theme';

const { valid, warnings } = validateThemeAccessibility(theme);
if (!valid) {
  console.warn('Theme accessibility issues:', warnings);
}
```

**Ensures**:
- WCAG AA contrast ratio (4.5:1 minimum)
- Warnings for low-contrast combinations
- Safe color choices for text readability

---

## Best Practices

### ✅ Do

- **Use semantic tokens** (`primary`, `secondary`, `accent`) instead of color names (`red`, `blue`)
- **Reference CSS variables** in Tailwind classes: `bg-primary`
- **Validate themes** before applying to ensure accessibility
- **Provide fallbacks** for older browsers (already included in `:root`)

### ❌ Don't

- **Hard-code colors** in components (e.g., `bg-red-500`)
- **Override TouchBase static tokens** (`--tb-*`) for whitelabel
- **Skip validation** when accepting user-provided theme colors
- **Use inline styles** for theming (use CSS variables instead)

---

## Token Reference

### Available Tailwind Utilities

**Colors**:
- `bg-primary`, `text-primary`, `border-primary`
- `bg-secondary`, `text-secondary`, `border-secondary`
- `bg-accent`, `text-accent`, `border-accent`
- `bg-tb-red`, `bg-tb-navy`, `bg-tb-beige`, etc.

**Typography**:
- `font-brand` - Display/heading font
- `font-body` - Body text font
- `font-display` - Oswald (TouchBase specific)
- `font-sans` - Inter (TouchBase specific)
- `font-script` - Lobster Two (TouchBase specific)

**Shadows**:
- `shadow-dugout` - Custom shadow with navy tint

---

## Examples

### Themed Button

```tsx
export function ThemedButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="bg-primary hover:bg-secondary text-white font-brand px-4 py-2 rounded-[var(--radius)]">
      {children}
    </button>
  );
}
```

### Themed Card

```tsx
export function ThemedCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="border-2 border-secondary rounded-[var(--radius)] p-4">
      <h3 className="font-brand text-primary">{title}</h3>
      <p className="font-body text-foreground">{content}</p>
    </div>
  );
}
```

### Accessing Variables in CSS

```css
/* In a CSS module or scoped style */
.custom-element {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: var(--radius);
  padding: calc(var(--spacing-unit) * 4);
}
```

---

## Migration from Old Code

If you have existing hardcoded colors:

**Before**:
```tsx
<button className="bg-red-600 hover:bg-blue-700">Submit</button>
```

**After**:
```tsx
<button className="bg-primary hover:bg-secondary">Submit</button>
```

---

## Future Enhancements

- [ ] Dark mode variants (`--primary-dark`, `--secondary-dark`)
- [ ] Extended color palette (success, warning, error, info)
- [ ] Responsive spacing tokens
- [ ] Animation tokens (duration, easing)

---

**Related Files**:
- `web/types/theme.ts` - TypeScript types
- `web/lib/schemas/theme.ts` - Zod validation
- `web/app/globals.css` - Token definitions
- `claudedocs/docs/stories/STORY-01.1-design-tokens.md` - Story spec

**Story**: STORY-01.1
**Created**: 2025-10-30
