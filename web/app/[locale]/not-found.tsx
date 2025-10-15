import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-300 mb-4">
          {t('title')}
        </h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          {t('message')}
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {t('backHome')}
        </Link>
      </div>
    </main>
  );
}
