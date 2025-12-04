# Landing Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the landing page with modern UX/UI while maintaining the logo and baseball 90s identity, improving visual hierarchy, animations, and responsive design.

**Architecture:** 
- Modern hero section with better visual hierarchy
- Enhanced feature cards with subtle animations
- Improved layout and spacing
- Smooth scroll animations
- Better mobile/tablet/desktop responsiveness
- Maintain TOSCO baseball aesthetic but more refined

**Tech Stack:** 
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- next-intl (i18n)
- CSS animations

---

## Task 1: Update Landing Page Layout Structure

**Files:**
- Modify: `web/app/[locale]/page.tsx`

**Step 1: Update main container structure**

Replace the main content structure with a more modern layout:

```tsx
<main className="min-h-screen flex flex-col bg-[--color-tb-navy] relative overflow-hidden">
  {/* Background pattern - more subtle */}
  <div className="absolute inset-0 opacity-[0.08]" style={{
    backgroundImage: `
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 60px,
        rgba(200, 46, 60, 0.2) 60px,
        rgba(200, 46, 60, 0.2) 64px
      )
    `
  }} />

  {/* Gradient overlay for depth */}
  <div className="absolute inset-0 bg-gradient-to-b from-[--color-tb-navy] via-[--color-tb-navy] to-[#0a1528]" />

  {/* Language Selector */}
  <div className="absolute top-4 right-4 z-30">
    <LanguageSelector />
  </div>

  {/* Main Content - Better spacing and structure */}
  <div className="relative z-10 flex-1">
    {/* Hero Section */}
    <section className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center space-y-12 sm:space-y-16 lg:space-y-20">
          {/* Logo Section - Maintained exactly as is */}
          <div className="flex justify-center animate-fade-in">
            <div className="bg-[--color-tb-bone] p-4 sm:p-6 border-8 border-[--color-tb-shadow] shadow-[12px_12px_0_0_rgba(62,62,62,1)]">
              <Image
                src="/touchbase-logo.png"
                alt={t('hero.headline')}
                width={400}
                height={400}
                priority
                className="w-auto h-32 sm:h-40 md:h-48 lg:h-56"
              />
            </div>
          </div>

          {/* Hero Headline - Enhanced */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black uppercase text-[--color-tb-bone] leading-tight tracking-wider">
              {t('hero.headline')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-sans text-[--color-tb-cream] font-bold max-w-3xl mx-auto uppercase tracking-wide">
              {t('tagline')}
            </p>
            <p className="text-base sm:text-lg md:text-xl font-sans text-[--color-tb-bone]/90 max-w-2xl mx-auto font-medium leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* CTA Buttons - Prominent */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CTAButton href={`/${locale}/signup`} variant="primary">
              {t('cta.getStarted')}
            </CTAButton>
            <CTAButton href={`/${locale}/login`} variant="secondary">
              {t('cta.login')}
            </CTAButton>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section - Separated for better flow */}
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[--color-tb-bone]/5">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase text-[--color-tb-cream] tracking-wider mb-4">
            {t('hero.title')}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          <FeatureCard
            icon={
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            title={t('features.players.title')}
            description={t('features.players.description')}
            iconBgColor="bg-[--color-tb-red]"
          />
          <FeatureCard
            icon={
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title={t('features.analytics.title')}
            description={t('features.analytics.description')}
            iconBgColor="bg-[--color-tb-stitch]"
          />
          <FeatureCard
            icon={
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            title={t('features.mobile.title')}
            description={t('features.mobile.description')}
            iconBgColor="bg-[--color-tb-navy]"
          />
        </div>
      </div>
    </section>
  </div>

  {/* Company Signature */}
  <CompanySignature />
</main>
```

**Step 2: Verify the page structure**

Run: `cd web && npm run dev`
Expected: Page loads without errors, layout is improved

**Step 3: Commit**

```bash
git add web/app/[locale]/page.tsx
git commit -m "feat: redesign landing page layout with modern structure"
```

---

## Task 2: Enhance FeatureCard Component

**Files:**
- Modify: `web/components/landing/FeatureCard.tsx`

**Step 1: Add hover animations and better styling**

```tsx
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
}

export function FeatureCard({ icon, title, description, iconBgColor = 'bg-[--color-tb-navy]' }: FeatureCardProps) {
  return (
    <div className="group relative bg-[--color-tb-bone] p-6 sm:p-8 lg:p-10 border-4 border-[--color-tb-shadow] shadow-[8px_8px_0_0_rgba(62,62,62,1)] hover:shadow-[12px_12px_0_0_rgba(62,62,62,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 ease-out">
      <div className="flex flex-col items-center text-center space-y-5 sm:space-y-6">
        {/* Enhanced Icon with animation */}
        <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center border-4 border-[--color-tb-shadow] ${iconBgColor} group-hover:scale-110 transition-transform duration-300`}>
          <div className="scale-125">
            {icon}
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-black uppercase text-[--color-tb-ink] tracking-wide group-hover:text-[--color-tb-red] transition-colors duration-300">
          {title}
        </h3>

        <p className="text-sm sm:text-base lg:text-lg font-sans text-[--color-tb-shadow] font-medium leading-relaxed max-w-xs">
          {description}
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Test hover effects**

Run: `cd web && npm run dev`
Expected: Cards have smooth hover animations, icons scale up, text color changes

**Step 3: Commit**

```bash
git add web/components/landing/FeatureCard.tsx
git commit -m "feat: enhance FeatureCard with hover animations"
```

---

## Task 3: Enhance CTAButton Component

**Files:**
- Modify: `web/components/landing/CTAButton.tsx`

**Step 1: Improve button styling and animations**

```tsx
import Link from 'next/link';

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function CTAButton({ href, children, variant = 'primary', className = '' }: CTAButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center px-12 sm:px-16 lg:px-20 py-6 sm:py-8 lg:py-10 font-display font-black text-xl sm:text-2xl lg:text-3xl uppercase tracking-wider transition-all duration-300 ease-out active:translate-y-1 min-w-[260px] sm:min-w-[320px] lg:min-w-[380px]";

  const variantStyles = {
    primary: "bg-[--color-tb-red] text-white border-4 border-[--color-tb-shadow] shadow-[6px_6px_0_0_rgba(62,62,62,1)] hover:shadow-[10px_10px_0_0_rgba(62,62,62,1)] hover:-translate-y-1 hover:-translate-x-1 hover:bg-[--color-tb-stitch]",
    secondary: "bg-transparent text-[--color-tb-bone] border-4 border-[--color-tb-bone] shadow-[6px_6px_0_0_rgba(250,247,240,0.4)] hover:shadow-[10px_10px_0_0_rgba(250,247,240,0.6)] hover:-translate-y-1 hover:-translate-x-1 hover:bg-[--color-tb-bone]/10 hover:text-white"
  };

  return (
    <Link
      href={href}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
```

**Step 2: Test button interactions**

Run: `cd web && npm run dev`
Expected: Buttons have smooth hover effects, better visual feedback

**Step 3: Commit**

```bash
git add web/components/landing/CTAButton.tsx
git commit -m "feat: enhance CTAButton with improved animations"
```

---

## Task 4: Add Scroll Animations

**Files:**
- Modify: `web/app/globals.css`

**Step 1: Add scroll-triggered animation utilities**

Add to the end of `web/app/globals.css`:

```css
/* ============================================================
 * Scroll Animations
 * ============================================================ */

@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-up {
  animation: slide-in-up 0.8s ease-out forwards;
}

.animate-slide-in-left {
  animation: slide-in-left 0.8s ease-out forwards;
}

.animate-slide-in-right {
  animation: slide-in-right 0.8s ease-out forwards;
}

/* Intersection Observer will add these classes */
.scroll-fade-in {
  opacity: 0;
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-fade-in.visible {
  opacity: 1;
}
```

**Step 2: Verify CSS compiles**

Run: `cd web && npm run build`
Expected: Build succeeds without CSS errors

**Step 3: Commit**

```bash
git add web/app/globals.css
git commit -m "feat: add scroll animation utilities"
```

---

## Task 5: Improve Responsive Design

**Files:**
- Modify: `web/app/[locale]/page.tsx`

**Step 1: Enhance mobile/tablet breakpoints**

Update spacing and sizing for better mobile experience:

```tsx
{/* Hero Section - Better mobile spacing */}
<section className="min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 xl:py-24">
  <div className="w-full max-w-6xl mx-auto">
    <div className="text-center space-y-8 sm:space-y-12 lg:space-y-16 xl:space-y-20">
      {/* Logo - Responsive sizing */}
      <div className="flex justify-center animate-fade-in">
        <div className="bg-[--color-tb-bone] p-3 sm:p-4 md:p-6 border-6 sm:border-8 border-[--color-tb-shadow] shadow-[8px_8px_0_0_rgba(62,62,62,1)] sm:shadow-[12px_12px_0_0_rgba(62,62,62,1)]">
          <Image
            src="/touchbase-logo.png"
            alt={t('hero.headline')}
            width={400}
            height={400}
            priority
            className="w-auto h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56"
          />
        </div>
      </div>

      {/* Headline - Better mobile typography */}
      <div className="space-y-4 sm:space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-display font-black uppercase text-[--color-tb-bone] leading-tight tracking-wider px-4">
          {t('hero.headline')}
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-sans text-[--color-tb-cream] font-bold max-w-3xl mx-auto uppercase tracking-wide px-4">
          {t('tagline')}
        </p>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-sans text-[--color-tb-bone]/90 max-w-2xl mx-auto font-medium leading-relaxed px-4">
          {t('hero.subtitle')}
        </p>
      </div>

      {/* CTA Buttons - Better mobile layout */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center pt-2 sm:pt-4 animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
        <CTAButton href={`/${locale}/signup`} variant="primary" className="w-full sm:w-auto">
          {t('cta.getStarted')}
        </CTAButton>
        <CTAButton href={`/${locale}/login`} variant="secondary" className="w-full sm:w-auto">
          {t('cta.login')}
        </CTAButton>
      </div>
    </div>
  </div>
</section>

{/* Features Section - Better grid on mobile */}
<section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 bg-[--color-tb-bone]/5">
  <div className="w-full max-w-6xl mx-auto">
    <div className="text-center mb-8 sm:mb-12 lg:mb-16">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black uppercase text-[--color-tb-cream] tracking-wider mb-4 px-4">
        {t('hero.title')}
      </h2>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
      {/* Feature cards remain the same */}
    </div>
  </div>
</section>
```

**Step 2: Test responsive breakpoints**

Run: `cd web && npm run dev`
Test at: 320px, 640px, 768px, 1024px, 1280px
Expected: Layout adapts smoothly at all breakpoints

**Step 3: Commit**

```bash
git add web/app/[locale]/page.tsx
git commit -m "feat: improve responsive design for all breakpoints"
```

---

## Task 6: Final Polish and Verification

**Files:**
- Verify: `web/app/[locale]/page.tsx`
- Verify: `web/components/landing/FeatureCard.tsx`
- Verify: `web/components/landing/CTAButton.tsx`

**Step 1: Visual verification checklist**

- [ ] Logo is maintained exactly as before
- [ ] Hero section has better visual hierarchy
- [ ] Feature cards have smooth hover animations
- [ ] CTA buttons are prominent and interactive
- [ ] Layout works on mobile (320px+)
- [ ] Layout works on tablet (768px+)
- [ ] Layout works on desktop (1024px+)
- [ ] Colors maintain baseball 90s identity
- [ ] Typography is readable at all sizes
- [ ] Animations are smooth (60fps)

**Step 2: Accessibility check**

- [ ] All text has sufficient contrast (WCAG AA)
- [ ] Focus states are visible
- [ ] Images have alt text
- [ ] Semantic HTML structure

**Step 3: Performance check**

Run: `cd web && npm run build`
Expected: Build succeeds, no errors

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete landing page redesign with modern UX/UI"
```

---

## Summary

This plan redesigns the landing page with:
- ✅ Modern layout structure with better visual hierarchy
- ✅ Enhanced feature cards with hover animations
- ✅ Improved CTA buttons with better interactions
- ✅ Better responsive design for all devices
- ✅ Maintained logo and baseball 90s identity
- ✅ Smooth animations and transitions
- ✅ Better spacing and typography

All changes maintain the existing TOSCO baseball aesthetic while modernizing the user experience.

