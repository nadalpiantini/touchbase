import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/Footer';

export default async function TermsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isSpanish = locale === 'es';
  const lastUpdated = '2024-12-19';

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
            </div>
          </div>
        </div>
      </nav>

      {/* Content - Rule of Thirds: Header offset left, content in right 2/3 */}
      <article className="pt-28 sm:pt-36 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Grid - Title at left 2/3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
            <header className="lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase text-[--color-tb-ink] mb-4">
                {isSpanish ? 'Términos de Servicio' : 'Terms of Service'}
              </h1>
              <p className="text-sm text-[--color-tb-shadow] font-sans">
                {isSpanish ? 'Última actualización:' : 'Last updated:'} {lastUpdated}
              </p>
            </header>
            {/* Right Third - Decorative */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[--color-tb-bone] border-4 border-[--color-tb-navy] shadow-dugout flex items-center justify-center">
                <span className="text-2xl font-display font-bold text-[--color-tb-navy]">ToS</span>
              </div>
            </div>
          </div>

          {/* Content Grid - Content at right 2/3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="hidden lg:block" />
            <div className="lg:col-span-2 prose prose-lg max-w-none font-sans text-[--color-tb-ink]">
            {isSpanish ? (
              <>
                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    1. Aceptación de los Términos
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    Al acceder y utilizar TouchBase (&quot;el Servicio&quot;), usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    2. Descripción del Servicio
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    TouchBase es una plataforma de gestión deportiva que permite a organizaciones administrar equipos, jugadores, horarios y estadísticas. El Servicio incluye funcionalidades de educación deportiva y herramientas de análisis.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    3. Registro de Cuenta
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    Para utilizar el Servicio, debe crear una cuenta proporcionando información precisa y completa. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña, y de restringir el acceso a su computadora o dispositivo.
                  </p>
                  <ul className="list-disc pl-6 text-[--color-tb-shadow] space-y-2">
                    <li>Debe tener al menos 13 años de edad para usar el Servicio</li>
                    <li>Si tiene menos de 18 años, debe tener el consentimiento de un padre o tutor</li>
                    <li>Una persona o entidad legal solo puede mantener una cuenta gratuita</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    4. Uso Aceptable
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    Usted acepta utilizar el Servicio solo para fines legales y de acuerdo con estos Términos. Específicamente, usted no debe:
                  </p>
                  <ul className="list-disc pl-6 text-[--color-tb-shadow] space-y-2">
                    <li>Violar cualquier ley o regulación aplicable</li>
                    <li>Infringir los derechos de propiedad intelectual de terceros</li>
                    <li>Transmitir material dañino, ofensivo o ilegal</li>
                    <li>Intentar obtener acceso no autorizado al Servicio</li>
                    <li>Usar el Servicio para enviar spam o comunicaciones no solicitadas</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    5. Pagos y Facturación
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    Algunos aspectos del Servicio requieren pago. Al suscribirse a un plan de pago:
                  </p>
                  <ul className="list-disc pl-6 text-[--color-tb-shadow] space-y-2">
                    <li>Autoriza los cargos recurrentes según el plan seleccionado</li>
                    <li>Las tarifas no son reembolsables excepto según se indique</li>
                    <li>Podemos cambiar los precios con aviso previo de 30 días</li>
                    <li>Usted es responsable de todos los impuestos aplicables</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    6. Propiedad Intelectual
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    El Servicio y su contenido original, características y funcionalidad son propiedad de TouchBase y están protegidos por leyes de propiedad intelectual. Usted retiene los derechos sobre cualquier contenido que cargue o publique en el Servicio.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    7. Terminación
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    Podemos terminar o suspender su cuenta inmediatamente, sin previo aviso, por cualquier violación de estos Términos. Tras la terminación, su derecho a usar el Servicio cesará inmediatamente.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    8. Limitación de Responsabilidad
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    En ningún caso TouchBase, sus directores, empleados, socios o afiliados serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pérdida de beneficios, datos u otra pérdida intangible.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    9. Cambios en los Términos
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. Le notificaremos de cambios materiales publicando los nuevos términos y actualizando la fecha de &quot;última actualización&quot;. El uso continuado del Servicio después de dichos cambios constituye su aceptación de los nuevos términos.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    10. Contacto
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed">
                    Si tiene preguntas sobre estos Términos, contáctenos en:{' '}
                    <a href="mailto:legal@touchbase.app" className="text-[--color-tb-red] hover:underline">
                      legal@touchbase.app
                    </a>
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    By accessing and using TouchBase (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    2. Description of Service
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    TouchBase is a sports management platform that allows organizations to manage teams, players, schedules, and statistics. The Service includes sports education features and analytics tools.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    3. Account Registration
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    To use the Service, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account and password, and for restricting access to your computer or device.
                  </p>
                  <ul className="list-disc pl-6 text-[--color-tb-shadow] space-y-2">
                    <li>You must be at least 13 years old to use the Service</li>
                    <li>If you are under 18, you must have parental or guardian consent</li>
                    <li>One person or legal entity may only maintain one free account</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    4. Acceptable Use
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    You agree to use the Service only for lawful purposes and in accordance with these Terms. Specifically, you must not:
                  </p>
                  <ul className="list-disc pl-6 text-[--color-tb-shadow] space-y-2">
                    <li>Violate any applicable law or regulation</li>
                    <li>Infringe upon third-party intellectual property rights</li>
                    <li>Transmit harmful, offensive, or illegal material</li>
                    <li>Attempt to gain unauthorized access to the Service</li>
                    <li>Use the Service to send spam or unsolicited communications</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    5. Payments and Billing
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    Some aspects of the Service require payment. By subscribing to a paid plan:
                  </p>
                  <ul className="list-disc pl-6 text-[--color-tb-shadow] space-y-2">
                    <li>You authorize recurring charges according to the selected plan</li>
                    <li>Fees are non-refundable except as indicated</li>
                    <li>We may change prices with 30 days prior notice</li>
                    <li>You are responsible for all applicable taxes</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    6. Intellectual Property
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    The Service and its original content, features, and functionality are owned by TouchBase and are protected by intellectual property laws. You retain rights to any content you upload or post to the Service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    7. Termination
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the Service will cease immediately.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    8. Limitation of Liability
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    In no event shall TouchBase, its directors, employees, partners, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible loss.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    9. Changes to Terms
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed mb-4">
                    We reserve the right to modify these terms at any time. We will notify you of material changes by posting the new terms and updating the &quot;last updated&quot; date. Continued use of the Service after such changes constitutes your acceptance of the new terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-[--color-tb-ink] mb-4 uppercase">
                    10. Contact
                  </h2>
                  <p className="text-[--color-tb-shadow] leading-relaxed">
                    If you have questions about these Terms, contact us at:{' '}
                    <a href="mailto:legal@touchbase.app" className="text-[--color-tb-red] hover:underline">
                      legal@touchbase.app
                    </a>
                  </p>
                </section>
              </>
            )}
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <Footer locale={locale} />
    </main>
  );
}
