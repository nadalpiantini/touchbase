'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

/**
 * Client component that updates the <html> lang attribute
 * based on the current locale from next-intl
 */
export function LocaleHtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}

