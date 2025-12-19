"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';

export default function ForgotPasswordPage() {
  const t = useTranslations('forgotPassword');
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = supabaseBrowser();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : t('errors.generic');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-tb-bone)' }}>
        {/* Rule of Thirds: Success state centered in 2/3 */}
        <div className="w-full max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="hidden lg:block" />
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-dugout border border-[--color-tb-line] p-8 space-y-6 text-center max-w-sm mx-auto lg:mx-0">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[--color-tb-navy]">
                  {t('success.title')}
                </h2>
                <p className="text-[--color-tb-shadow] font-sans">
                  {t('success.message')}
                </p>
                <Link
                  href={`/${locale}/login`}
                  className="inline-block text-[--color-tb-red] hover:underline font-medium"
                >
                  {t('success.backToLogin')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-tb-bone)' }}>
      {/* Rule of Thirds: 3-column grid with form at right 2/3 */}
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Third - Decorative element */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-6 lg:pr-8">
            <div className="w-32 h-32 rounded-full bg-[--color-tb-red]/10 border-4 border-[--color-tb-red] flex items-center justify-center shadow-dugout">
              <svg className="w-16 h-16 text-[--color-tb-red]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="text-center text-[--color-tb-shadow] font-sans text-sm max-w-[200px]">
              {locale === 'es' ? 'Te enviaremos un enlace para restablecer tu contraseña' : 'We\'ll send you a link to reset your password'}
            </p>
          </div>

          {/* Right 2/3 - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-dugout border border-[--color-tb-line] p-8 space-y-8 max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              {/* Logo */}
              <div className="flex justify-center">
                <Image
                  src="/touchbase-logo.png"
                  alt="TouchBase"
                  width={200}
                  height={200}
                  priority
                  className="w-auto h-16 sm:h-20"
                />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[--color-tb-navy]">
                  {t('title')}
                </h2>
                <p className="mt-2 text-sm text-[--color-tb-shadow] font-sans">
                  {t('subtitle')}
                </p>
              </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 text-lg border border-[--color-tb-line] placeholder-[--color-tb-shadow]/50 text-[--color-tb-ink] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition font-sans"
                placeholder={t('form.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                <div className="text-sm text-red-800 font-medium text-center">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent font-display font-bold text-lg tracking-wide rounded-xl text-white bg-[--color-tb-red] hover:bg-[--color-tb-stitch] shadow-dugout focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-tb-red]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-y-[1px]"
              >
                {loading ? t('form.submittingButton') : t('form.submitButton')}
              </button>
            </div>

            <div className="text-center">
              <p className="text-base font-sans text-[--color-tb-shadow]">
                <Link href={`/${locale}/login`} className="font-medium text-[--color-tb-navy] hover:text-[--color-tb-stitch] transition">
                  {t('footer.backToLogin')}
                </Link>
              </p>
            </div>
          </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
