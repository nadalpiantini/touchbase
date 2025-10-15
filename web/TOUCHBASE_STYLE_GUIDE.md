# 🎨 TOUCHBASE Style Guide
**Version 1.0 — 90's MLB Retro Identity**

---

## 🎯 Brand Identity

TouchBase es un sistema moderno de gestión de clubes deportivos con una identidad visual inspirada en la estética del béisbol profesional de los años 90. La paleta evoca nostalgia, tradición y profesionalismo.

**Tagline:** *"Your dugout in the cloud"*

---

## 🎨 Color Palette

### Primary Colors

| Elemento | Nombre | HEX | RGB | Uso |
|----------|--------|-----|-----|-----|
| **Rojo Principal** | TouchBase Red | `#B21E2A` | rgb(178, 30, 42) | Títulos principales, CTAs, énfasis, branding |
| **Azul Marino** | MLB Navy | `#14213D` | rgb(20, 33, 61) | Navbar, headers de tablas, fondos oscuros |
| **Beige Vintage** | Baseball Beige | `#F8EBD0` | rgb(248, 235, 208) | Fondos cálidos, elementos retro, chips |
| **Rojo Costura** | Stitch Red | `#C82E3C` | rgb(200, 46, 60) | Hover states, badges "LIVE", highlights |
| **Gris Sombra** | Shadow Gray | `#3E3E3E` | rgb(62, 62, 62) | Texto secundario, iconos, detalles sutiles |

### Supporting Colors

| Elemento | Nombre | HEX | RGB | Uso |
|----------|--------|-----|-----|-----|
| **Blanco Hueso** | Bone White | `#FAF7F0` | rgb(250, 247, 240) | Backgrounds alternativos, cards |
| **Gris Línea** | Line Gray | `#D7D7D7` | rgb(215, 215, 215) | Borders, dividers, outlines sutiles |
| **Negro Profundo** | Deep Ink | `#0E0E0E` | rgb(14, 14, 14) | Texto principal, fondos oscuros |

### CSS Variables

```css
:root {
  /* Primary Palette */
  --tb-red: #B21E2A;
  --tb-navy: #14213D;
  --tb-beige: #F8EBD0;
  --tb-stitch: #C82E3C;
  --tb-shadow: #3E3E3E;

  /* Supporting Colors */
  --tb-bone: #FAF7F0;
  --tb-line: #D7D7D7;
  --tb-ink: #0E0E0E;
}
```

---

## 🔤 Typography

### Font Families

**Display** — Oswald (títulos, navbar, CTAs)
- Weights: 400, 500, 600, 700
- Uso: Headers (H1-H3), botones importantes, navbar
- Característica: Bold, deportivo, impacto visual

**Sans** — Inter (body text, UI)
- Weights: 400, 500, 600, 700
- Uso: Párrafos, forms, labels, UI general
- Característica: Legible, moderno, versátil

**Script** — Lobster Two (taglines, detalles)
- Weights: 400, 700, italic
- Uso: Tagline "your dugout in the cloud", detalles especiales
- Característica: Cursivo suave, nostálgico

### Google Fonts Import

**HTML `<head>`:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
```

**CSS `@import`:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&display=swap');
```

### Tailwind Config (Next.js)

```typescript
import { Oswald, Inter, Lobster_Two } from 'next/font/google';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const lobsterTwo = Lobster_Two({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lobster',
});
```

### Typography Scale

```css
.text-display-lg { @apply font-display text-5xl font-bold tracking-tight; }
.text-display-md { @apply font-display text-3xl font-semibold; }
.text-display-sm { @apply font-display text-xl font-medium; }
.text-body-lg { @apply font-sans text-lg font-normal; }
.text-body { @apply font-sans text-base font-normal; }
.text-body-sm { @apply font-sans text-sm font-normal; }
.text-script { @apply font-script text-lg italic; }
```

---

## 🧩 Component Library

### 1. Button (Primary)

```tsx
<button className="inline-flex items-center gap-2 rounded-xl bg-tb-red px-5 py-3
  font-display text-white tracking-wide shadow-dugout hover:bg-tb-stitch
  active:translate-y-[1px] transition-all duration-150
  disabled:opacity-50 disabled:cursor-not-allowed">
  Create Game
</button>
```

**Variantes:**
- `bg-tb-red hover:bg-tb-stitch` — Primary
- `bg-tb-navy hover:bg-tb-navy/90` — Secondary
- `border-2 border-tb-red text-tb-red hover:bg-tb-red hover:text-white` — Outline

### 2. Button (Secondary/Outline)

```tsx
{/* Secondary */}
<button className="rounded-xl bg-tb-navy px-5 py-3 font-display text-white
  hover:bg-tb-navy/90 shadow-sm transition">
  View Stats
</button>

{/* Outline */}
<button className="rounded-xl border-2 border-tb-red px-5 py-3 font-display
  text-tb-red hover:bg-tb-red hover:text-white transition">
  Cancel
</button>
```

### 3. Card/Panel

```tsx
<div className="rounded-2xl border border-tb-line bg-white shadow-sm p-6">
  <h3 className="font-display text-lg text-tb-navy mb-2">Academy U12</h3>
  <p className="text-sm text-tb-shadow/80 mb-4">Roster: 18 | Next game: Friday</p>
  <div className="flex gap-2">
    <button className="rounded-lg bg-tb-red px-4 py-2 text-white text-sm">
      Add Player
    </button>
    <button className="rounded-lg border border-tb-line px-4 py-2 text-sm">
      Schedule
    </button>
  </div>
</div>
```

### 4. Badge

```tsx
{/* Live Badge */}
<span className="inline-flex items-center rounded-full bg-tb-stitch/10
  text-tb-stitch px-3 py-1 text-xs font-semibold ring-1 ring-tb-stitch/30">
  LIVE
</span>

{/* Status Badge */}
<span className="inline-flex items-center rounded-full bg-tb-navy/10
  text-tb-navy px-3 py-1 text-xs font-semibold">
  Active
</span>
```

### 5. Score Chip

```tsx
<div className="inline-flex items-center gap-2 rounded-full bg-tb-beige
  px-3 py-1 ring-1 ring-tb-line text-tb-navy font-semibold text-sm">
  NYA <span className="text-tb-red">5</span> — BOS <span className="text-tb-red">3</span>
</div>
```

### 6. Navbar/Header

```tsx
<header className="w-full bg-tb-navy text-white">
  <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-4">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-tb-red"></div>
      <span className="font-display text-xl tracking-wide">TOUCHBASE</span>
    </div>
    <nav className="flex items-center gap-6 text-sm">
      <a href="#" className="hover:text-tb-beige transition">Games</a>
      <a href="#" className="hover:text-tb-beige transition">Players</a>
      <a href="#" className="hover:text-tb-beige transition">Teams</a>
      <button className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20 transition">
        Sign in
      </button>
    </nav>
  </div>
</header>
```

### 7. Table Header

```tsx
<thead className="bg-tb-navy text-white">
  <tr>
    <th className="px-4 py-3 text-left font-display text-sm">Player</th>
    <th className="px-4 py-3 text-left font-display text-sm">Position</th>
    <th className="px-4 py-3 text-left font-display text-sm">Status</th>
  </tr>
</thead>
```

### 8. Input/Form Field

```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-tb-shadow">
    Email Address
  </label>
  <input
    type="email"
    className="w-full rounded-lg border border-tb-line px-4 py-2
      focus:outline-none focus:ring-2 focus:ring-tb-stitch/60
      focus:border-tb-stitch transition"
    placeholder="you@example.com"
  />
</div>
```

---

## 🎭 Interaction States

### Hover States
```css
/* Buttons */
.btn-primary:hover { @apply bg-tb-stitch; }
.btn-secondary:hover { @apply bg-tb-navy/90; }
.btn-outline:hover { @apply bg-tb-red text-white; }

/* Links */
.link-nav:hover { @apply text-tb-beige; }
.link-body:hover { @apply text-tb-stitch; }
```

### Focus States
```css
.input-focus:focus {
  @apply ring-2 ring-tb-stitch/60 border-tb-stitch outline-none;
}

.button-focus:focus {
  @apply ring-2 ring-offset-2 ring-tb-red/50;
}
```

### Disabled States
```css
.btn-disabled:disabled {
  @apply opacity-50 cursor-not-allowed;
}
```

### Active/Pressed States
```css
.btn-active:active {
  @apply translate-y-[1px];
}
```

---

## 🌈 Backgrounds & Gradients

### Hero Gradient (Landing Page)
```tsx
<div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#F8EBD0,transparent_60%),linear-gradient(180deg,#14213D,#0E0E0E)]">
  {/* Hero content */}
</div>
```

### Clubhouse Stripes (Optional accent)
```css
.clubhouse-stripes {
  background: repeating-linear-gradient(
    90deg,
    #14213D 0 8px,
    #0E0E0E 8px 16px
  );
}
```

### Subtle Beige Background
```tsx
<div className="bg-tb-beige/20">
  {/* Content with subtle vintage tint */}
</div>
```

---

## 🏷️ Logo Usage Guidelines

### Clearspace
- Minimum clearspace: altura de la "T" en todos los lados
- No colocar texto u otros elementos dentro del clearspace

### Tagline Placement
- "your dugout in the cloud" en `font-script`
- Tamaño: 60-70% del ancho del logo
- Color sobre fondo claro: `text-tb-navy`
- Color sobre fondo oscuro: `text-white`

### Logo Variants
- **Full logo con slogan**: Landing, Login, Signup (páginas principales)
- **Logo solo**: Header dashboard, favicon, espacios reducidos

### Prohibiciones
❌ No distorsionar proporción
❌ No cambiar colores base
❌ No añadir efectos glow/sombras excesivas
❌ No rotar o inclinar

---

## 📐 Spacing & Layout

### Spacing Scale (Tailwind)
```
xs: 0.25rem (1)
sm: 0.5rem (2)
md: 1rem (4)
lg: 1.5rem (6)
xl: 2rem (8)
2xl: 3rem (12)
```

### Container Widths
```
max-w-7xl → Dashboard, main content
max-w-4xl → Landing hero
max-w-md → Login/Signup forms
```

### Border Radius
```
rounded-lg → 0.5rem (inputs, small buttons)
rounded-xl → 0.75rem (cards, primary buttons)
rounded-2xl → 1rem (large panels)
rounded-full → Pills, badges, avatar
```

---

## 🎯 Shadow System

### Shadows
```css
.shadow-dugout {
  box-shadow: 0 8px 24px rgba(20, 33, 61, 0.25);
}

.shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.shadow {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}
```

---

## ✅ Accessibility

### Color Contrast
- **tb-red (#B21E2A) on white**: 6.52:1 ✅ AA Large
- **tb-navy (#14213D) on white**: 13.24:1 ✅ AAA
- **tb-shadow (#3E3E3E) on white**: 9.73:1 ✅ AAA
- **White on tb-red**: 6.52:1 ✅ AA Large
- **White on tb-navy**: 13.24:1 ✅ AAA

### Focus Indicators
Siempre visible: `ring-2 ring-tb-stitch/60`

### Font Sizes
- Mínimo cuerpo: 14px (text-sm)
- Estándar: 16px (text-base)
- No usar script para texto crítico

---

## 🚀 Implementation Checklist

### Phase 1: Foundation
- [ ] Install Google Fonts (Oswald, Inter, Lobster Two)
- [ ] Configure Tailwind with TouchBase colors
- [ ] Update globals.css with CSS variables
- [ ] Create base UI components (Button, Card, Badge)

### Phase 2: Pages
- [ ] Apply palette to Landing page (hero gradient)
- [ ] Update Login/Signup with new styles
- [ ] Redesign Dashboard navbar (bg-tb-navy)
- [ ] Update Dashboard cards and stats

### Phase 3: Components
- [ ] Update table headers (bg-tb-navy)
- [ ] Apply badges (LIVE → tb-stitch)
- [ ] Consistent buttons across app
- [ ] Form inputs with focus states

### Phase 4: Polish
- [ ] Verify accessibility (contrast ratios)
- [ ] Test responsive breakpoints
- [ ] Validate build (no warnings)
- [ ] Cross-browser testing

---

## 📚 Resources

**Design Inspiration:**
- MLB official branding (1990-2000)
- Vintage baseball card aesthetics
- Dugout/clubhouse materials

**Typography Pairings:**
- Oswald + Inter = Modern deportivo
- Lobster Two = Detalles nostálgicos

**Color Psychology:**
- Rojo = Pasión, energía, acción
- Azul navy = Confianza, profesionalismo
- Beige = Tradición, calidez, nostalgia

---

**Last Updated:** 2025-10-15
**Maintainer:** TouchBase Development Team
**Version:** 1.0
