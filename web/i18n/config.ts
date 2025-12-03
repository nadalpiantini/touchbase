import { getRequestConfig } from 'next-intl/server';

// Define available locales
export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'es';

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});