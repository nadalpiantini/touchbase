import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tb-navy to-tb-ink">
      <div className="text-center px-4">
        <h1 className="text-9xl font-display font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-display font-semibold text-tb-bone mb-4">
          {t('title')}
        </h2>
        <p className="text-tb-beige mb-8 max-w-md mx-auto">
          {t('message')}
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-tb-red hover:bg-tb-stitch text-white font-display rounded-xl shadow-dugout transition-all active:translate-y-[1px]"
        >
          {t('backHome')}
        </Link>
      </div>
    </main>
  );
}
