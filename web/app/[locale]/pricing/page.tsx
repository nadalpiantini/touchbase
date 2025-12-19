import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/Footer';

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-[--color-tb-red] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5 text-[--color-tb-shadow]/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  highlighted?: boolean;
}

export default async function PricingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isSpanish = locale === 'es';

  const translations = {
    title: isSpanish ? 'Planes y Precios' : 'Plans & Pricing',
    subtitle: isSpanish
      ? 'Elige el plan perfecto para tu organización deportiva'
      : 'Choose the perfect plan for your sports organization',
    monthly: isSpanish ? '/mes' : '/month',
    yearly: isSpanish ? '/año' : '/year',
    free: isSpanish ? 'Gratis' : 'Free',
    popular: isSpanish ? 'Más Popular' : 'Most Popular',
    contact: isSpanish ? 'Contáctanos' : 'Contact Us',
    getStarted: isSpanish ? 'Comenzar Gratis' : 'Get Started Free',
    tryFree: isSpanish ? 'Probar Gratis' : 'Try Free',
    contactSales: isSpanish ? 'Contactar Ventas' : 'Contact Sales',
    faqTitle: isSpanish ? 'Preguntas Frecuentes' : 'Frequently Asked Questions',
  };

  const tiers: PricingTier[] = [
    {
      name: isSpanish ? 'Starter' : 'Starter',
      price: translations.free,
      period: '',
      description: isSpanish
        ? 'Perfecto para equipos pequeños que están comenzando.'
        : 'Perfect for small teams just getting started.',
      features: [
        { text: isSpanish ? 'Hasta 25 jugadores' : 'Up to 25 players', included: true },
        { text: isSpanish ? '1 equipo' : '1 team', included: true },
        { text: isSpanish ? 'Calendario básico' : 'Basic scheduling', included: true },
        { text: isSpanish ? 'Estadísticas básicas' : 'Basic stats', included: true },
        { text: isSpanish ? 'Soporte por email' : 'Email support', included: true },
        { text: isSpanish ? 'Análisis avanzados' : 'Advanced analytics', included: false },
        { text: isSpanish ? 'Branding personalizado' : 'Custom branding', included: false },
        { text: isSpanish ? 'API access' : 'API access', included: false },
      ],
      cta: translations.getStarted,
    },
    {
      name: 'Pro',
      price: '$29',
      period: translations.monthly,
      description: isSpanish
        ? 'Para organizaciones en crecimiento que necesitan más poder.'
        : 'For growing organizations that need more power.',
      features: [
        { text: isSpanish ? 'Hasta 100 jugadores' : 'Up to 100 players', included: true },
        { text: isSpanish ? '5 equipos' : '5 teams', included: true },
        { text: isSpanish ? 'Calendario avanzado' : 'Advanced scheduling', included: true },
        { text: isSpanish ? 'Estadísticas completas' : 'Full statistics', included: true },
        { text: isSpanish ? 'Soporte prioritario' : 'Priority support', included: true },
        { text: isSpanish ? 'Análisis avanzados' : 'Advanced analytics', included: true },
        { text: isSpanish ? 'Branding personalizado' : 'Custom branding', included: true },
        { text: isSpanish ? 'API access' : 'API access', included: false },
      ],
      cta: translations.tryFree,
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: translations.contact,
      period: '',
      description: isSpanish
        ? 'Para grandes organizaciones con necesidades específicas.'
        : 'For large organizations with specific needs.',
      features: [
        { text: isSpanish ? 'Jugadores ilimitados' : 'Unlimited players', included: true },
        { text: isSpanish ? 'Equipos ilimitados' : 'Unlimited teams', included: true },
        { text: isSpanish ? 'Todas las funcionalidades' : 'All features', included: true },
        { text: isSpanish ? 'Estadísticas en tiempo real' : 'Real-time stats', included: true },
        { text: isSpanish ? 'Soporte dedicado 24/7' : 'Dedicated 24/7 support', included: true },
        { text: isSpanish ? 'Análisis personalizados' : 'Custom analytics', included: true },
        { text: isSpanish ? 'Branding white-label' : 'White-label branding', included: true },
        { text: isSpanish ? 'API access completo' : 'Full API access', included: true },
      ],
      cta: translations.contactSales,
    },
  ];

  const faqs = [
    {
      question: isSpanish ? '¿Puedo cambiar de plan en cualquier momento?' : 'Can I change plans anytime?',
      answer: isSpanish
        ? 'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratea el costo.'
        : 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and costs are prorated.',
    },
    {
      question: isSpanish ? '¿Hay período de prueba?' : 'Is there a free trial?',
      answer: isSpanish
        ? 'Sí, todos los planes de pago incluyen 14 días de prueba gratis. No se requiere tarjeta de crédito para comenzar.'
        : 'Yes, all paid plans include a 14-day free trial. No credit card required to start.',
    },
    {
      question: isSpanish ? '¿Qué métodos de pago aceptan?' : 'What payment methods do you accept?',
      answer: isSpanish
        ? 'Aceptamos todas las principales tarjetas de crédito (Visa, MasterCard, American Express) y también PayPal.'
        : 'We accept all major credit cards (Visa, MasterCard, American Express) and also PayPal.',
    },
    {
      question: isSpanish ? '¿Puedo cancelar en cualquier momento?' : 'Can I cancel anytime?',
      answer: isSpanish
        ? 'Sí, puedes cancelar tu suscripción en cualquier momento. Tendrás acceso hasta el final de tu período de facturación.'
        : 'Yes, you can cancel your subscription at any time. You will have access until the end of your billing period.',
    },
    {
      question: isSpanish ? '¿Ofrecen descuentos para organizaciones sin fines de lucro?' : 'Do you offer discounts for nonprofits?',
      answer: isSpanish
        ? 'Sí, ofrecemos un 50% de descuento para organizaciones sin fines de lucro y escuelas. Contáctanos para más información.'
        : 'Yes, we offer a 50% discount for nonprofits and schools. Contact us for more information.',
    },
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-tb-bone)' }}>
      {/* Navigation - Rule of Thirds: Logo at left third, nav at right third */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[--color-tb-bone]/95 backdrop-blur-sm border-b-4 border-[--color-tb-shadow]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-16 sm:h-20">
            {/* Left Third - Logo */}
            <Link href={`/${locale}`} className="flex items-center justify-start">
              <Image
                src="/touchbase-logo.png"
                alt="TouchBase"
                width={150}
                height={50}
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </Link>
            {/* Center Third - Empty for balance */}
            <div className="hidden lg:block" />
            {/* Right Third - Navigation */}
            <div className="flex items-center justify-end gap-3 sm:gap-6 col-span-2 lg:col-span-1">
              <Link
                href={`/${locale}/login`}
                className="text-[--color-tb-ink] hover:text-[--color-tb-red] font-display font-bold uppercase text-sm tracking-wide transition-colors"
              >
                {isSpanish ? 'Iniciar Sesión' : 'Sign In'}
              </Link>
              <Link
                href={`/${locale}/signup`}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-[--color-tb-red] text-white font-display font-bold text-sm uppercase tracking-wide border-2 border-[--color-tb-shadow] shadow-[3px_3px_0_0_rgba(62,62,62,1)] hover:shadow-[5px_5px_0_0_rgba(62,62,62,1)] hover:-translate-y-0.5 transition-all"
              >
                {isSpanish ? 'Comenzar' : 'Get Started'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header - Rule of Thirds: Content offset to left 2/3 */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 text-left lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black uppercase text-[--color-tb-ink] mb-4">
                {translations.title}
              </h1>
              <p className="text-lg sm:text-xl text-[--color-tb-shadow] font-sans max-w-2xl">
                {translations.subtitle}
              </p>
            </div>
            {/* Right Third - Decorative baseball stitching pattern */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[--color-tb-bone] border-4 border-[--color-tb-red] shadow-dugout flex items-center justify-center">
                <span className="text-4xl">$</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards - Rule of Thirds: 3 columns with asymmetric vertical offsets */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`relative bg-[--color-tb-bone] p-6 sm:p-8 border-4 ${
                  tier.highlighted
                    ? 'border-[--color-tb-red] shadow-[8px_8px_0_0_rgba(203,45,62,0.5)] lg:-translate-y-4'
                    : 'border-[--color-tb-shadow] shadow-[8px_8px_0_0_rgba(62,62,62,1)]'
                } ${index === 0 ? 'lg:translate-y-6' : ''} ${index === 2 ? 'lg:translate-y-3' : ''} transition-all hover:-translate-y-1`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-[--color-tb-red] text-[--color-tb-bone] font-display font-bold text-xs uppercase tracking-wider border-2 border-[--color-tb-shadow]">
                      {translations.popular}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-[--color-tb-ink] mb-2">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl sm:text-5xl font-display font-black text-[--color-tb-ink]">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-base text-[--color-tb-shadow] font-sans">
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-[--color-tb-shadow] font-sans">
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? <CheckIcon /> : <XIcon />}
                      <span
                        className={`text-sm font-sans ${
                          feature.included ? 'text-[--color-tb-ink]' : 'text-[--color-tb-shadow]/60'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.name === 'Enterprise' ? 'mailto:sales@touchbase.app' : `/${locale}/signup`}
                  className={`block w-full text-center py-3 sm:py-4 font-display font-bold uppercase text-sm tracking-wide border-4 transition-all ${
                    tier.highlighted
                      ? 'bg-[--color-tb-red] text-white border-[--color-tb-shadow] shadow-[4px_4px_0_0_rgba(62,62,62,1)] hover:shadow-[6px_6px_0_0_rgba(62,62,62,1)] hover:-translate-y-0.5'
                      : 'bg-transparent text-[--color-tb-ink] border-[--color-tb-shadow] hover:bg-[--color-tb-shadow] hover:text-[--color-tb-bone]'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Rule of Thirds: Title offset to right, content spans 2/3 */}
      <section className="py-16 sm:py-24 bg-[--color-tb-navy]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Grid - offset to right third */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
            <div className="hidden lg:block" />
            <div className="lg:col-span-2 lg:text-right">
              <h2 className="text-3xl sm:text-4xl font-display font-black uppercase text-[--color-tb-bone]">
                {translations.faqTitle}
              </h2>
            </div>
          </div>
          {/* FAQ Grid - 2/3 width with offset */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 lg:col-start-2 space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`bg-[--color-tb-bone] p-6 border-4 border-[--color-tb-shadow] shadow-[4px_4px_0_0_rgba(62,62,62,1)] ${
                    index % 2 === 0 ? 'lg:-translate-x-4' : 'lg:translate-x-4'
                  }`}
                >
                  <h3 className="text-lg font-display font-bold text-[--color-tb-ink] mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-[--color-tb-shadow] font-sans leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer locale={locale} />
    </main>
  );
}
