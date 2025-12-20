import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.touchbase.academy';
  const locales = ['en', 'es'];
  const currentDate = new Date();

  // Public pages that should be indexed
  const publicPages = [
    '', // home
    '/pricing',
    '/terms',
    '/privacy',
    '/login',
    '/signup',
    '/forgot-password',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add entries for each locale
  for (const locale of locales) {
    for (const page of publicPages) {
      const url = page === '' ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${page}`;

      sitemapEntries.push({
        url,
        lastModified: currentDate,
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : page === '/pricing' ? 0.9 : 0.7,
      });
    }
  }

  // Add root URL
  sitemapEntries.unshift({
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 1.0,
  });

  return sitemapEntries;
}
