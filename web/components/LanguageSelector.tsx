'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/config';

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

    // Add new locale
    const newPath = newLocale === 'es'
      ? pathnameWithoutLocale // Default locale, no prefix
      : `/${newLocale}${pathnameWithoutLocale}`;

    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            locale === loc
              ? 'bg-[--color-tb-navy] text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label={`Switch to ${loc === 'es' ? 'Spanish' : 'English'}`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
