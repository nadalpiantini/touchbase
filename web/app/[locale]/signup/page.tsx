"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSelector } from '@/components/LanguageSelector';

// Use the singleton client at module level
const supabase = supabaseClient!;

export default function SignUpPage() {
  const t = useTranslations('signup');
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      setLoading(false);
      return;
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      setError(t('errors.passwordTooShort'));
      setLoading(false);
      return;
    }

    try {
      // En desarrollo, podemos desactivar confirmación de email
      // pero la mejor solución es configurar SMTP personalizado en Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Solo en producción usar redirect de email
          emailRedirectTo: process.env.NODE_ENV === 'production' 
            ? `${window.location.origin}/auth/callback`
            : undefined,
        }
      });

      if (error) throw error;

      setSuccess(true);
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('errors.genericError'));
    } finally {
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
            width={300}
            height={300}
            priority
            className="w-auto h-25 mb-4"
          />
          <h2 className="text-center text-3xl font-display font-bold text-[--color-tb-navy]">
            {t('title')}
          </h2>
          <p className="mt-2 text-center text-sm text-[--color-tb-shadow]">
            {t('subtitle')}
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {t('success.title')}
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    {t('success.message')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
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
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-[--color-tb-line] placeholder-[--color-tb-shadow]/50 text-[--color-tb-ink] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition sm:text-sm"
                  placeholder={t('form.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[--color-tb-navy] mb-2">
                  {t('form.confirmPasswordPlaceholder')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-[--color-tb-line] placeholder-[--color-tb-shadow]/50 text-[--color-tb-ink] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] transition sm:text-sm"
                  placeholder={t('form.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
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

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/login" className="font-medium text-[--color-tb-navy] hover:text-[--color-tb-stitch] transition">
                  {t('footer.hasAccount')} {t('footer.loginLink')}
                </Link>
              </div>
            </div>

          </form>
        )}
      </div>
    </main>
  );
}