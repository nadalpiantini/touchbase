# 🎨 TOUCHBASE ACADEMY — Guía de Línea Gráfica

**Versión Oficial 1.0**  
*Basado en el Brand Guide Oficial*

> 📄 **Brand Guide Oficial:** `/items/touchbase_academy_brand_guide.pdf`  
> 🎨 **Logos disponibles:** `/items/LOGO/`

---

## 1) Paleta de Colores

Colores oficiales según el Brand Guide:

| Nombre | HEX | Uso Recomendado |
|--------|-----|-----------------|
| **TB Red** | `#B21E2A` | Títulos, acentos, botones primarios |
| **TB Navy** | `#14213D` | Fondos, encabezados, navbar, sombras fuertes |
| **TB Cream** | `#F8EBD0` | Fondos suaves, tarjetas, secciones cálidas |
| **TB Stitch** | `#C82E3C` | Detalles, notificaciones, highlights |
| **TB Shadow** | `#3E3E3E` | Texto secundario, líneas, bloques oscuros |
| **TB Bone** | `#FAF7F0` | BG alternativas, secciones claras |
| **TB Ink** | `#0E0E0E` | Texto principal sobre fondos claros |

#### Regla visual:

👉 **Rojo = emoción y acción**  
👉 **Navy = estructura y confianza**  
👉 **Cream = nostalgia MLB 90's**

---

## 2) Tipografía

### Títulos
**Oswald** — Fuerte, deportiva, seria.

### Texto
**Inter** — Moderna, limpia, perfecta para apps.

### Script
**Lobster Two** — Script amigable, retro y distintivo.

### Snippet Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&family=Lobster+Two&display=swap" rel="stylesheet">
```

---

## 3) Componentes UI Base y Reglas de Uso de Logo

### 3.1. Iconografía y Estilo Visual

### 3.1. Línea gráfica de íconos

- Bordes gruesos estilo 90's MLB
- Color base: **TB Navy**
- Relleno **TB Red** para íconos de acción
- Esquinas suaves (no totalmente redondas, no totalmente rectas)
- Sombras sutiles estilo "sticker"

### 3.2. Efectos

**Shadow Dugout:**

```css
box-shadow: 0 10px 24px rgba(20,33,61,.25);
```

**Outline retro:** 1–2px TB Navy en textos grandes.

---

### 3.2. UI Components Standard

### 4.1. Botón Primario

```tsx
<button className="bg-tb-red text-white font-display px-5 py-3 rounded-xl 
  shadow-dugout hover:bg-tb-stitch transition active:translate-y-[1px]">
  Create Game
</button>
```

### 4.2. Botón Secundario

```tsx
<button className="border border-tb-navy text-tb-navy px-5 py-3 rounded-xl 
  hover:bg-tb-navy hover:text-white transition">
  View Players
</button>
```

### 4.3. Badge

```tsx
<span className="bg-tb-stitch/15 text-tb-stitch ring-1 ring-tb-stitch/40 
  px-3 py-1 rounded-full text-xs font-bold">
  LIVE
</span>
```

### 4.4. Card

```tsx
<div className="rounded-2xl bg-tb-cream p-5 border border-tb-line shadow-sm">
  <h3 className="font-display text-tb-navy">U12 Roster</h3>
  <p className="text-sm text-tb-shadow/80">18 Players</p>
</div>
```

---

### 3.3. Brand Motion

Si haces animación (y tú haces 👑):

- **Entrada:** slide-up 20px + fade-in
- **Acentos:** pequeño bounce (no cartoon, MLB TV style)
- **Hover:** tiny scale 1.02

### Ejemplo de animación:

```css
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-entrance {
  animation: slideUpFade 0.4s ease-out;
}

.hover-scale:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}
```

---

### 3.4. Reglas de Uso del Logo

#### Logos Principales

Los logos oficiales se encuentran en `/items/LOGO/`. Hay **dos logos principales** que mantienen la misma línea de color:

1. **LOGO_TBAS02.png** — Logo **moderno** (principal)
2. **LOGO_TBASR02.png** — Logo **retro** (principal)

**Estrategia de uso:**
- ✅ Pueden usarse **aleatoriamente** para sorprender al usuario
- ✅ Pueden permitir al usuario **elegir en el onboarding**
- ✅ Ambos mantienen la misma línea de color y son intercambiables

**Referencia completa:** Ver `/items/touchbase_academy_brand_guide.pdf` para especificaciones detalladas.

#### Fondos permitidos

✔ **TB Cream**  
✔ **TB Navy**  
✔ **Blanco absoluto**  
✔ **Foto con 40–60% blur ligero**

#### No permitido

❌ Sombra glow  
❌ Cambiar inclinación del texto  
❌ Colores fuera de la paleta  
❌ Sobre fondos muy saturados

#### Espacio libre

Deja siempre un margen igual al alto de la "T" alrededor del logo.

---

## 4. Implementación Técnica

### 4.1. Tailwind Config Ready-To-Paste

### Para Tailwind v3 (config tradicional):

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        tb: {
          red: "#B21E2A",
          navy: "#14213D",
          cream: "#F8EBD0",
          stitch: "#C82E3C",
          shadow: "#3E3E3E",
          bone: "#FAF7F0",
          ink: "#0E0E0E",
          line: "#D7D7D7"
        }
      },
      fontFamily: {
        display: ["Oswald", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        script: ["Lobster Two", "cursive"]
      },
      boxShadow: {
        dugout: "0 10px 24px rgba(20,33,61,.25)"
      }
    }
  }
}
```

### Para Tailwind v4 (CSS-based, ya implementado en globals.css):

El proyecto ya usa Tailwind v4 con `@theme inline`. Los colores están definidos en `globals.css`:

```css
@theme inline {
  --color-tb-red: #B21E2A;
  --color-tb-navy: #14213D;
  --color-tb-cream: #F8EBD0;
  --color-tb-stitch: #C82E3C;
  --color-tb-shadow: #3E3E3E;
  --color-tb-bone: #FAF7F0;
  --color-tb-ink: #0E0E0E;
  --color-tb-line: #D7D7D7;
  
  --font-display: var(--font-oswald), 'Oswald', ui-sans-serif, system-ui;
  --font-sans: var(--font-inter), 'Inter', ui-sans-serif, system-ui;
  --font-script: var(--font-lobster), 'Lobster Two', cursive;
  
  --shadow-dugout: 0 10px 24px rgba(20, 33, 61, 0.25);
}
```

**Nota:** El proyecto actual usa `tb-beige` en lugar de `tb-cream`. Considerar actualizar para consistencia.

---

## 5. Resumen Rápido (Para Recordar)

🔥 **TOUCHBASE ACADEMY = MLB 90s + Tech Clean + Nostalgia Pro**

- **Red = acción**
- **Navy = estructura**
- **Cream = nostalgia**
- **Script = calidez**
- **Bold = fuerza**

---

## 6. Referencias y Archivos del Proyecto

### Archivos relacionados:

- `web/app/globals.css` - Variables CSS y configuración de tema
- `web/TOUCHBASE_STYLE_GUIDE.md` - Guía de estilo detallada
- `web/DESIGN_TOKENS.md` - Sistema de tokens para whitelabel
- `/items/touchbase_academy_brand_guide.pdf` - **Brand Guide Oficial (PDF)**
- `/items/LOGO/` - **Archivos de logo oficiales**

### Uso en componentes:

```tsx
// Ejemplo de componente usando la identidad
export function GameCard({ title, players }: { title: string; players: number }) {
  return (
    <div className="rounded-2xl bg-tb-cream p-5 border border-tb-line shadow-sm">
      <h3 className="font-display text-tb-navy text-xl mb-2">{title}</h3>
      <p className="text-sm text-tb-shadow/80">{players} Players</p>
      <button className="mt-4 bg-tb-red text-white font-display px-5 py-3 rounded-xl 
        shadow-dugout hover:bg-tb-stitch transition active:translate-y-[1px]">
        View Details
      </button>
    </div>
  );
}
```

### Implementación de Logos (Moderno/Retro)

#### Opción 1: Selección Aleatoria

```tsx
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const LOGOS = {
  modern: '/items/LOGO/LOGO_TBAS02.png',
  retro: '/items/LOGO/LOGO_TBASR02.png',
};

export function TouchBaseLogo({ className }: { className?: string }) {
  const [logo, setLogo] = useState<string>(LOGOS.modern);

  useEffect(() => {
    // Selección aleatoria al montar
    const randomLogo = Math.random() > 0.5 ? LOGOS.modern : LOGOS.retro;
    setLogo(randomLogo);
  }, []);

  return (
    <Image
      src={logo}
      alt="TouchBase Academy"
      width={200}
      height={200}
      className={className}
      priority
    />
  );
}
```

#### Opción 2: Selección en Onboarding

```tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

const LOGOS = {
  modern: '/items/LOGO/LOGO_TBAS02.png',
  retro: '/items/LOGO/LOGO_TBASR02.png',
};

export function LogoSelector({ onSelect }: { onSelect: (logo: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={() => {
          setSelected('modern');
          onSelect(LOGOS.modern);
        }}
        className={`p-4 rounded-xl border-2 transition ${
          selected === 'modern'
            ? 'border-tb-red bg-tb-cream'
            : 'border-tb-line hover:border-tb-navy'
        }`}
      >
        <Image
          src={LOGOS.modern}
          alt="Logo Moderno"
          width={120}
          height={120}
          className="object-contain"
        />
        <p className="mt-2 text-sm font-display text-tb-navy">Moderno</p>
      </button>
      
      <button
        onClick={() => {
          setSelected('retro');
          onSelect(LOGOS.retro);
        }}
        className={`p-4 rounded-xl border-2 transition ${
          selected === 'retro'
            ? 'border-tb-red bg-tb-cream'
            : 'border-tb-line hover:border-tb-navy'
        }`}
      >
        <Image
          src={LOGOS.retro}
          alt="Logo Retro"
          width={120}
          height={120}
          className="object-contain"
        />
        <p className="mt-2 text-sm font-display text-tb-navy">Retro</p>
      </button>
    </div>
  );
}
```

#### Opción 3: Usar Logo Guardado en Perfil

```tsx
// Guardar preferencia del usuario
const saveLogoPreference = (logoType: 'modern' | 'retro') => {
  localStorage.setItem('touchbase_logo_preference', logoType);
};

// Cargar logo preferido
const getLogoPreference = (): string => {
  const preference = localStorage.getItem('touchbase_logo_preference');
  if (preference === 'retro') return LOGOS.retro;
  return LOGOS.modern; // default
};
```

---

**Última actualización:** 2025-01-XX  
**Mantenedor:** TouchBase Development Team  
**Versión:** 1.0

