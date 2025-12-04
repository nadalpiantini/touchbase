import Image from "next/image";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CompanySignature } from '@/components/CompanySignature';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { CTAButton } from '@/components/landing/CTAButton';
import { StatsCard } from '@/components/landing/StatsCard';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Ensure locale is set before getting translations
  setRequestLocale(locale);
  // Get translations - setRequestLocale ensures correct locale is used
  const t = await getTranslations('landing');

  return (
    <main className="min-h-screen flex flex-col bg-[--color-tb-navy] relative overflow-hidden">
      {/* Background pattern - more subtle */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 60px,
            rgba(200, 46, 60, 0.2) 60px,
            rgba(200, 46, 60, 0.2) 64px
          )
        `
      }} />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[--color-tb-navy] via-[--color-tb-navy] to-[#0a1528]" />

      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageSelector />
      </div>

      {/* Main Content - Better spacing and structure */}
      <div className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 xl:py-24">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center space-y-8 sm:space-y-12 lg:space-y-16 xl:space-y-20">
              {/* Logo Section - Minimalist baseball club style */}
              <div className="flex justify-center animate-fade-in">
                <Image
                  src="/touchbase-logo.png"
                  alt={t('hero.headline')}
                  width={400}
                  height={400}
                  priority
                  className="w-auto h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56 drop-shadow-lg"
                />
              </div>

              {/* Hero Headline - Enhanced */}
              <div className="space-y-4 sm:space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-display font-black uppercase text-[--color-tb-bone] leading-tight tracking-wider px-4">
                  {t('hero.headline')}
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-sans text-[--color-tb-cream] font-bold max-w-3xl mx-auto uppercase tracking-wide px-4">
                  {t('tagline')}
                </p>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-sans text-[--color-tb-bone]/90 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                  {t('hero.subtitle')}
                </p>
              </div>

              {/* CTA Buttons - Prominent */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center pt-2 sm:pt-4 animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
                <CTAButton href={`/${locale}/signup`} variant="primary" className="w-full sm:w-auto">
                  {t('cta.getStarted')}
                </CTAButton>
                <CTAButton href={`/${locale}/login`} variant="secondary" className="w-full sm:w-auto">
                  {t('cta.login')}
                </CTAButton>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Inspired by TailAdmin */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[--color-tb-navy] relative">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black uppercase text-[--color-tb-cream] tracking-wider mb-4 px-4">
                {t('stats.title')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <StatsCard
                value={t('stats.organizations.value')}
                label={t('stats.organizations.label')}
                icon={
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
              <StatsCard
                value={t('stats.players.value')}
                label={t('stats.players.label')}
                icon={
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <StatsCard
                value={t('stats.teams.value')}
                label={t('stats.teams.label')}
                icon={
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <StatsCard
                value={t('stats.satisfaction.value')}
                label={t('stats.satisfaction.label')}
                icon={
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        {/* Features Section - Separated for better flow */}
        <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 bg-[--color-tb-bone]/5">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black uppercase text-[--color-tb-cream] tracking-wider mb-4 px-4">
                {t('hero.title')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
              <FeatureCard
                icon={
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                title={t('features.players.title')}
                description={t('features.players.description')}
                iconBgColor="bg-[--color-tb-red]"
              />
              <FeatureCard
                icon={
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                title={t('features.analytics.title')}
                description={t('features.analytics.description')}
                iconBgColor="bg-[--color-tb-stitch]"
              />
              <FeatureCard
                icon={
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                title={t('features.mobile.title')}
                description={t('features.mobile.description')}
                iconBgColor="bg-[--color-tb-navy]"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Company Signature */}
      <CompanySignature />
    </main>
  );
}
