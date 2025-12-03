'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

/**
 * Client component that updates the <html> lang attribute
 * based on the current locale from next-intl
 * 
 * Note: The root layout uses suppressHydrationWarning on the html tag
 * to prevent hydration mismatches when this component updates the lang attribute
 */
export function LocaleHtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    // Update lang attribute to match current locale
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.getAttribute('lang');
      if (currentLang !== locale) {
        document.documentElement.lang = locale;
      }
    }
  }, [locale]);

  return null;
}

