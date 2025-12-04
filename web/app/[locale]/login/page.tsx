"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('login');
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get Supabase client dynamically (will throw if env vars are missing)
      const supabase = supabaseBrowser();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!data.session) {
        throw new Error("No se pudo establecer la sesión. Intenta nuevamente.");
      }

      // Wait a moment for session to be established in storage
      await new Promise(resolve => setTimeout(resolve, 300));

      // Verify session is stored
      const { data: { session: verifySession } } = await supabase.auth.getSession();
      if (!verifySession) {
        throw new Error("La sesión no se guardó correctamente. Intenta nuevamente.");
      }
      
      // Use window.location for a full page reload to ensure session is set
      window.location.href = `/${locale}/dashboard`;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Error al iniciar sesión. Verifica tus credenciales.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--color-tb-bone)' }}>
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image
          src="/touchbase-logo.png"
          alt={t('logoAlt')}
          width={400}
          height={400}
          priority
          className="w-auto h-24 sm:h-32 md:h-40 lg:h-48"
        />
      </div>

      {/* Login Form - Centered with margins */}
      <div className="w-full max-w-md px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-dugout border border-[--color-tb-line] p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[--color-tb-navy]">
              {t('title')}
            </h2>
            <p className="mt-2 text-sm font-sans text-[--color-tb-shadow]">
              {t('subtitle')}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-sans font-medium text-[--color-tb-navy] mb-2">
                {t('form.emailPlaceholder')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-[--color-tb-line] placeholder-[--color-tb-shadow]/50 text-[--color-tb-ink] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition sm:text-sm font-sans"
                placeholder={t('form.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-sans font-medium text-[--color-tb-navy] mb-2">
                {t('form.passwordPlaceholder')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-[--color-tb-line] placeholder-[--color-tb-shadow]/50 text-[--color-tb-ink] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition sm:text-sm font-sans"
                placeholder={t('form.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200 shadow-sm">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-red-800 font-medium">{error}</div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent font-display tracking-wide rounded-xl text-white bg-[--color-tb-red] hover:bg-[--color-tb-stitch] shadow-dugout focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-tb-red]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-y-[1px]"
            >
              {loading ? t('form.submittingButton') : t('form.submitButton')}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm font-sans text-[--color-tb-shadow]">
              {t('footer.firstTime')} <Link href={`/${locale}/signup`} className="font-medium text-[--color-tb-navy] hover:text-[--color-tb-stitch] transition">{t('footer.createAccount')}</Link>
            </p>
          </div>
          </form>
        </div>
      </div>
    </main>
  );
}
