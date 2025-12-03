import { getRequestConfig } from 'next-intl/server';

// Define available locales
export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'es';

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = (locale && (locales as readonly string[]).includes(locale))
    ? (locale as Locale)
    : defaultLocale;

  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default
  };
});