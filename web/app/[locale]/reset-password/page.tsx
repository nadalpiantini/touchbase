"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';

export default function ResetPasswordPage() {
  const t = useTranslations('resetPassword');
  const locale = useLocale();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      const supabase = supabaseBrowser();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setSessionError(true);
      } else {
        setSessionReady(true);
      }
    };

    // Listen for auth state changes (for when user clicks the reset link)
    const supabase = supabaseBrowser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
        setSessionError(false);
      }
    });

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('errors.passwordTooShort'));
      setLoading(false);
      return;
    }

    try {
      const supabase = supabaseBrowser();

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
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

  if (sessionError) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-tb-bone)' }}>
        {/* Rule of Thirds: Error state centered */}
        <div className="w-full max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="hidden lg:block" />
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-dugout border border-[--color-tb-line] p-8 space-y-6 text-center max-w-sm mx-auto lg:mx-0">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[--color-tb-navy]">
                  {t('errors.invalidLink')}
                </h2>
                <p className="text-[--color-tb-shadow] font-sans">
                  {t('errors.invalidLinkMessage')}
                </p>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="inline-block px-6 py-3 bg-[--color-tb-red] text-white font-display font-bold rounded-xl hover:bg-[--color-tb-stitch] transition"
                >
                  {t('errors.requestNewLink')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-tb-bone)' }}>
        {/* Rule of Thirds: Success state centered */}
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
                  className="inline-block px-6 py-3 bg-[--color-tb-red] text-white font-display font-bold rounded-xl hover:bg-[--color-tb-stitch] transition"
                >
                  {t('success.loginButton')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!sessionReady) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-tb-bone)' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg className="animate-spin h-8 w-8 text-[--color-tb-red]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg text-[--color-tb-shadow]">{t('loading')}</p>
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
            <div className="w-32 h-32 rounded-full bg-[--color-tb-navy]/10 border-4 border-[--color-tb-navy] flex items-center justify-center shadow-dugout">
              <svg className="w-16 h-16 text-[--color-tb-navy]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-center text-[--color-tb-shadow] font-sans text-sm max-w-[200px]">
              {locale === 'es' ? 'Crea una nueva contraseña segura' : 'Create a new secure password'}
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
            <div className="space-y-5">
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 text-lg border border-[--color-tb-line] placeholder-[--color-tb-shadow]/50 text-[--color-tb-ink] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition font-sans"
                  placeholder={t('form.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 text-lg border border-[--color-tb-line] placeholder-[--color-tb-shadow]/50 text-[--color-tb-ink] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition font-sans"
                  placeholder={t('form.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
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
          </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
