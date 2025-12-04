import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { LocaleHtmlLang } from '@/components/LocaleHtmlLang';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Validate locale
  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }
  
  setRequestLocale(locale);
  
  // Get messages for the current request locale - pass locale explicitly
  const messages = await getMessages({ locale });

  return (
    <AnalyticsProvider>
      <NextIntlClientProvider messages={messages}>
        <LocaleHtmlLang />
        {children}
      </NextIntlClientProvider>
    </AnalyticsProvider>
  );
}
