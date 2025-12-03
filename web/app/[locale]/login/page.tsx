"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSelector } from '@/components/LanguageSelector';

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
    <main className="min-h-screen flex items-center justify-center bg-[--color-tb-beige]/20 relative">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <Image
            src="/touchbase-slogan-logo.png"
            alt="TouchBase - Your dugout in the cloud"
            width={600}
            height={600}
            priority
            className="w-auto h-50 mb-6"
          />
          <h2 className="text-center text-3xl font-display font-bold text-[--color-tb-navy]">
            {t('title')}
          </h2>
          <p className="mt-2 text-center text-sm text-[--color-tb-shadow]">
            {t('subtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                {t('form.emailPlaceholder')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-[--color-tb-line] placeholder-[--color-tb-shadow]/50 text-[--color-tb-ink] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition sm:text-sm"
                placeholder={t('form.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                {t('form.passwordPlaceholder')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-[--color-tb-line] placeholder-[--color-tb-shadow]/50 text-[--color-tb-ink] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition sm:text-sm"
                placeholder={t('form.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
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
            <p className="text-sm text-[--color-tb-shadow]">
              {t('footer.firstTime')} <Link href={`/${locale}/signup`} className="font-medium text-[--color-tb-navy] hover:text-[--color-tb-stitch] transition">{t('footer.createAccount')}</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
