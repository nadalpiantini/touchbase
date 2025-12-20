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
      // Translate Supabase error messages
      let errorKey = 'generic';
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
          errorKey = 'invalidCredentials';
        } else if (msg.includes('email not confirmed')) {
          errorKey = 'emailNotConfirmed';
        } else if (msg.includes('rate limit') || msg.includes('too many requests')) {
          errorKey = 'tooManyRequests';
        } else if (msg.includes('network') || msg.includes('fetch')) {
          errorKey = 'networkError';
        }
      }
      setError(t(`errors.${errorKey}`));
      setLoading(false);
    }
  };

  return (
    <main className="thirds-auth-layout bg-tb-bone">
      {/* Left Third - Branding panel (hidden on mobile) */}
      <div className="thirds-auth-brand">
        <div className="w-32 h-32 rounded-full bg-tb-red/10 border-4 border-tb-red flex items-center justify-center shadow-dugout mb-6">
          <svg className="w-16 h-16 text-tb-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
        <p className="text-center text-tb-bone/80 font-sans text-sm max-w-[200px]">
          {t('brandMessage')}
        </p>
      </div>

      {/* Right 2/3 - Login Form */}
      <div className="thirds-auth-content">
        <div className="max-w-sm mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-dugout border border-tb-line p-8 space-y-8 max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              {/* Logo - Small */}
              <div className="flex justify-center">
                <Image
                  src="/touchbase-logo.png"
                  alt={t('logoAlt')}
                  width={200}
                  height={200}
                  priority
                  className="w-auto h-16 sm:h-20"
                />
              </div>

              {/* Title - Large, centered */}
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-tb-navy">
                  {t('title')}
                </h2>
              </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 text-lg border border-tb-line placeholder-tb-shadow/50 text-tb-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60 focus:border-tb-stitch transition font-sans"
                  placeholder={t('form.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 text-lg border border-tb-line placeholder-tb-shadow/50 text-tb-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60 focus:border-tb-stitch transition font-sans"
                  placeholder={t('form.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent font-display font-bold text-lg tracking-wide rounded-xl text-white bg-tb-red hover:bg-tb-stitch shadow-dugout focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tb-red/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-y-[1px]"
              >
                {loading ? t('form.submittingButton') : t('form.submitButton')}
              </button>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm font-sans text-tb-shadow">
                <Link href={`/${locale}/forgot-password`} className="font-medium text-tb-navy hover:text-tb-stitch transition">
                  {t('footer.forgotPassword')}
                </Link>
              </p>
              <p className="text-base font-sans text-tb-shadow">
                {t('footer.firstTime')} <Link href={`/${locale}/signup`} className="font-medium text-tb-navy hover:text-tb-stitch transition">{t('footer.createAccount')}</Link>
              </p>
            </div>
          </form>
            </div>
        </div>
      </div>
    </main>
  );
}
