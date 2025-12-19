import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

// Icons for features
function UsersIcon() {
  return (
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[--color-tb-bone]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('landing');

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-tb-bone)' }}>
      {/* Navigation - Rule of thirds: logo at left 1/3, nav at right 2/3 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[--color-tb-bone]/95 backdrop-blur-sm border-b-4 border-[--color-tb-shadow]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-16 sm:h-20">
            {/* Left third - Logo */}
            <div className="flex items-center">
              <Link href={`/${locale}`}>
                <Image
                  src="/touchbase-logo.png"
                  alt="TouchBase"
                  width={150}
                  height={50}
                  className="h-10 sm:h-12 w-auto"
                  priority
                />
              </Link>
            </div>
            {/* Center third - empty for balance */}
            <div className="hidden md:block" />
            {/* Right third - Navigation */}
            <div className="flex items-center justify-end gap-3 sm:gap-6">
              <Link
                href={`/${locale}/pricing`}
                className="hidden sm:block text-[--color-tb-ink] hover:text-[--color-tb-red] font-display font-bold uppercase text-sm tracking-wide transition-colors"
              >
                {t('nav.pricing')}
              </Link>
              <Link
                href={`/${locale}/login`}
                className="text-[--color-tb-ink] hover:text-[--color-tb-red] font-display font-bold uppercase text-sm tracking-wide transition-colors"
              >
                {t('cta.login')}
              </Link>
              <Link
                href={`/${locale}/signup`}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-[--color-tb-red] text-white font-display font-bold text-sm uppercase tracking-wide border-2 border-[--color-tb-shadow] shadow-[3px_3px_0_0_rgba(62,62,62,1)] hover:shadow-[5px_5px_0_0_rgba(62,62,62,1)] hover:-translate-y-0.5 transition-all"
              >
                {t('cta.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Rule of thirds: content at left 2/3, visual weight at right 1/3 */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
        {/* Background Pattern - positioned at right third */}
        <div className="absolute inset-y-0 right-0 w-1/3 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, var(--color-tb-shadow) 0, var(--color-tb-shadow) 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid: 2/3 content, 1/3 visual */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Left 2/3 - Main content */}
            <div className="lg:col-span-2 text-left">
              {/* Tagline at intersection point */}
              <p className="inline-block px-4 py-2 bg-[--color-tb-navy] text-[--color-tb-bone] font-display font-bold text-xs sm:text-sm uppercase tracking-widest mb-6 sm:mb-8 border-2 border-[--color-tb-shadow]">
                {t('tagline')}
              </p>

              {/* Main Headline - positioned at upper-left intersection */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black uppercase text-[--color-tb-ink] mb-4 sm:mb-6 tracking-tight leading-tight">
                {t('hero.headline')}
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl font-sans text-[--color-tb-shadow] max-w-2xl mb-8 sm:mb-12 leading-relaxed">
                {t('hero.subtitle')}
              </p>

              {/* CTA Buttons - at lower-left intersection */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <Link
                  href={`/${locale}/signup`}
                  className="inline-flex items-center justify-center px-10 sm:px-14 py-5 sm:py-6 bg-[--color-tb-red] text-white font-display font-black text-lg sm:text-xl uppercase tracking-wider border-4 border-[--color-tb-shadow] shadow-[6px_6px_0_0_rgba(62,62,62,1)] hover:shadow-[10px_10px_0_0_rgba(62,62,62,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all"
                >
                  {t('cta.getStarted')}
                </Link>
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-[--color-tb-ink] font-display font-bold text-lg uppercase tracking-wide border-4 border-[--color-tb-shadow] hover:bg-[--color-tb-shadow] hover:text-[--color-tb-bone] transition-all"
                >
                  {t('cta.login')}
                </Link>
              </div>
            </div>

            {/* Right 1/3 - Logo/Visual */}
            <div className="hidden lg:flex justify-center items-center">
              <Image
                src="/touchbase-logo-full.png"
                alt="TouchBase - Your dugout in the cloud"
                width={400}
                height={400}
                priority
                className="w-auto h-48 xl:h-64 opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Rule of thirds: 3-column grid with offset spacing */}
      <section className="py-16 sm:py-24 bg-[--color-tb-navy]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header - offset to left third */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 sm:mb-16">
            <div className="lg:col-span-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase text-[--color-tb-bone] mb-4">
                {t('features.sectionTitle')}
              </h2>
              <p className="text-lg sm:text-xl text-[--color-tb-bone]/80 font-sans max-w-xl">
                {t('features.sectionSubtitle')}
              </p>
            </div>
          </div>

          {/* Features grid - 3 columns following rule of thirds */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: <UsersIcon />, title: t('features.players.title'), desc: t('features.players.description') },
              { icon: <ChartIcon />, title: t('features.analytics.title'), desc: t('features.analytics.description') },
              { icon: <DeviceIcon />, title: t('features.mobile.title'), desc: t('features.mobile.description') },
              { icon: <CalendarIcon />, title: t('features.scheduling.title'), desc: t('features.scheduling.description') },
              { icon: <ShieldIcon />, title: t('features.security.title'), desc: t('features.security.description') },
              { icon: <BookIcon />, title: t('features.education.title'), desc: t('features.education.description') },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-[--color-tb-bone] p-6 sm:p-8 border-4 border-[--color-tb-shadow] shadow-[6px_6px_0_0_rgba(62,62,62,1)] hover:shadow-[10px_10px_0_0_rgba(62,62,62,1)] hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-[--color-tb-red] border-3 border-[--color-tb-shadow]">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-display font-bold uppercase text-[--color-tb-ink] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base font-sans text-[--color-tb-shadow]">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Rule of thirds: asymmetric layout */}
      <section className="py-16 sm:py-24 bg-[--color-tb-bone]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header offset to right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 sm:mb-16">
            <div className="lg:col-start-2 lg:col-span-2 lg:text-right">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase text-[--color-tb-ink]">
                {t('stats.title')}
              </h2>
            </div>
          </div>

          {/* Stats in asymmetric 2+2 layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[--color-tb-navy] p-6 sm:p-8 border-4 border-[--color-tb-shadow] shadow-[6px_6px_0_0_rgba(62,62,62,1)] lg:translate-y-4">
              <p className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-[--color-tb-bone] mb-2">
                {t('stats.organizations.value')}
              </p>
              <p className="text-sm sm:text-base font-sans text-[--color-tb-bone]/80 uppercase tracking-wide">
                {t('stats.organizations.label')}
              </p>
            </div>
            <div className="bg-[--color-tb-red] p-6 sm:p-8 border-4 border-[--color-tb-shadow] shadow-[6px_6px_0_0_rgba(62,62,62,1)]">
              <p className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-[--color-tb-bone] mb-2">
                {t('stats.players.value')}
              </p>
              <p className="text-sm sm:text-base font-sans text-[--color-tb-bone]/80 uppercase tracking-wide">
                {t('stats.players.label')}
              </p>
            </div>
            <div className="bg-[--color-tb-navy] p-6 sm:p-8 border-4 border-[--color-tb-shadow] shadow-[6px_6px_0_0_rgba(62,62,62,1)]">
              <p className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-[--color-tb-bone] mb-2">
                {t('stats.teams.value')}
              </p>
              <p className="text-sm sm:text-base font-sans text-[--color-tb-bone]/80 uppercase tracking-wide">
                {t('stats.teams.label')}
              </p>
            </div>
            <div className="bg-[--color-tb-red] p-6 sm:p-8 border-4 border-[--color-tb-shadow] shadow-[6px_6px_0_0_rgba(62,62,62,1)] lg:-translate-y-4">
              <p className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-[--color-tb-bone] mb-2">
                {t('stats.satisfaction.value')}
              </p>
              <p className="text-sm sm:text-base font-sans text-[--color-tb-bone]/80 uppercase tracking-wide">
                {t('stats.satisfaction.label')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Rule of thirds: steps at intersection points */}
      <section className="py-16 sm:py-24 bg-[--color-tb-shadow]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase text-[--color-tb-bone]">
              {t('howItWorks.title')}
            </h2>
          </div>

          {/* Steps positioned at thirds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-4">
            {[
              { num: '1', title: t('howItWorks.step1.title'), desc: t('howItWorks.step1.description') },
              { num: '2', title: t('howItWorks.step2.title'), desc: t('howItWorks.step2.description') },
              { num: '3', title: t('howItWorks.step3.title'), desc: t('howItWorks.step3.description') },
            ].map((step, i) => (
              <div key={i} className="relative text-center lg:text-left">
                {/* Connection line for desktop */}
                {i < 2 && (
                  <div className="hidden lg:block absolute top-10 left-1/2 w-full h-1 bg-[--color-tb-bone]/20" />
                )}
                <div className="relative inline-flex flex-col items-center lg:items-start">
                  <div className="w-20 h-20 bg-[--color-tb-red] border-4 border-[--color-tb-bone] flex items-center justify-center mb-6 shadow-[4px_4px_0_0_rgba(250,247,240,0.3)]">
                    <span className="text-3xl font-display font-black text-[--color-tb-bone]">{step.num}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[--color-tb-bone] mb-3 uppercase">
                    {step.title}
                  </h3>
                  <p className="text-base sm:text-lg font-sans text-[--color-tb-bone]/80 max-w-xs">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Rule of thirds: content at left 2/3 */}
      <section className="py-16 sm:py-24 bg-[--color-tb-red]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase text-[--color-tb-bone] mb-4">
                {t('finalCta.title')}
              </h2>
              <p className="text-lg sm:text-xl text-[--color-tb-bone]/90 font-sans mb-8">
                {t('finalCta.subtitle')}
              </p>
              <Link
                href={`/${locale}/signup`}
                className="inline-flex items-center justify-center px-10 sm:px-14 py-5 sm:py-6 bg-[--color-tb-bone] text-[--color-tb-ink] font-display font-black text-lg sm:text-xl uppercase tracking-wider border-4 border-[--color-tb-shadow] shadow-[6px_6px_0_0_rgba(62,62,62,0.5)] hover:shadow-[10px_10px_0_0_rgba(62,62,62,0.5)] hover:-translate-y-1 transition-all"
              >
                {t('cta.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}
