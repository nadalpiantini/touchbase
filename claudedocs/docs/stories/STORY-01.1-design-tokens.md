# STORY-01.1: Design System Tokens

## Story Information

**ID**: STORY-01.1
**Epic**: EPIC-01 (Whitelabel Foundation & RBAC)
**Priority**: P0
**Points**: 2
**Sprint**: 0
**Status**: Ready for Development

---

## User Story

**As a** platform administrator
**I want** a design token system with CSS variables
**So that** tenant themes can be applied dynamically without rebuilding the app

---

## Acceptance Criteria

### Functional

- [AC-1] CSS variables defined for theming
  - `--primary`, `--secondary`, `--accent` (colors)
  - `--font-brand`, `--font-body` (typography)
  - `--radius` (border radius)
  - `--spacing-unit` (base spacing)

- [AC-2] Default theme values in `globals.css`
  - Fallback values if no tenant theme loaded
  - WCAG AA contrast ratios maintained

- [AC-3] Token documentation created
  - README with token usage examples
  - Visual reference (Figma/Storybook optional)

### Technical

- [AC-4] Tokens applied in Tailwind config
  - `theme.extend.colors` references CSS variables
  - No hard-coded color values in components

- [AC-5] TypeScript types for theme object
  - `Theme` interface in `types/theme.ts`
  - Zod schema for validation

### Quality

- [AC-6] No breaking changes to existing components
- [AC-7] Tokens tested in light/dark mode (if applicable)

---

## Implementation Guidance

### Files to Create

1. **`web/app/globals.css`** (modify)
```css
:root {
  /* Colors */
  --primary: #e74c3c;
  --secondary: #3498db;
  --accent: #f39c12;

  /* Typography */
  --font-brand: 'Oswald', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Layout */
  --radius: 0.5rem;
  --spacing-unit: 0.25rem;
}
```

2. **`web/types/theme.ts`** (create)
```typescript
export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl?: string;
  fontFamily: string;
  customDomain?: string;
}

export const defaultTheme: Theme = {
  primaryColor: '#e74c3c',
  secondaryColor: '#3498db',
  accentColor: '#f39c12',
  logoUrl: '/touchbase-logo.png',
  fontFamily: 'Oswald',
};
```

3. **`web/lib/schemas/theme.ts`** (create)
```typescript
import { z } from 'zod';

export const themeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  logoUrl: z.string().url(),
  faviconUrl: z.string().url().optional(),
  fontFamily: z.string().min(1),
  customDomain: z.string().optional(),
});
```

4. **`tailwind.config.ts`** (modify)
```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        brand: 'var(--font-brand)',
        body: 'var(--font-body)',
      },
    },
  },
};
```

### Testing Checklist

- [ ] Default theme renders correctly
- [ ] Changing CSS variable updates UI
- [ ] No console errors or warnings
- [ ] Existing components unaffected
- [ ] Type checking passes

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] No TypeScript errors
- [ ] No linting warnings
- [ ] Changes committed with message: "feat: add design system tokens for whitelabel support"
- [ ] Story marked as completed in project board

---

## Dependencies

**Blocks**:
- STORY-01.2 (Theme Provider needs tokens)

**Depends On**:
- None (foundational story)

---

## Notes

- Keep token names semantic (primary/secondary) not descriptive (red/blue)
- Consider adding dark mode variants later (--primary-dark)
- Document token usage in component examples

---

**Created**: 2025-10-30
**Author**: BMAD Team
**Last Updated**: 2025-10-30
