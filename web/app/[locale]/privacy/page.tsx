import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/Footer';

export default async function PrivacyPage({
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-tb-bone/95 backdrop-blur-sm border-b-4 border-tb-shadow">
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
                className="text-tb-ink hover:text-tb-red font-display font-bold uppercase text-sm tracking-wide transition-colors"
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase text-tb-ink mb-4">
                {isSpanish ? 'Política de Privacidad' : 'Privacy Policy'}
              </h1>
              <p className="text-sm text-tb-shadow font-sans">
                {isSpanish ? 'Última actualización:' : 'Last updated:'} {lastUpdated}
              </p>
            </header>
            {/* Right Third - Decorative */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-tb-bone border-4 border-tb-navy shadow-dugout flex items-center justify-center">
                <svg className="w-10 h-10 text-tb-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content Grid - Content at right 2/3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="hidden lg:block" />
            <div className="lg:col-span-2 prose prose-lg max-w-none font-sans text-tb-ink">
            {isSpanish ? (
              <>
                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    1. Información que Recopilamos
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    Recopilamos información que usted nos proporciona directamente, incluyendo:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Información de cuenta (nombre, correo electrónico, contraseña)</li>
                    <li>Información de perfil (foto, número de teléfono)</li>
                    <li>Información de la organización (nombre, tipo, miembros)</li>
                    <li>Datos de jugadores y equipos</li>
                    <li>Estadísticas y registros de partidos</li>
                    <li>Comunicaciones con nuestro equipo de soporte</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    2. Información Recopilada Automáticamente
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    Cuando utiliza nuestro Servicio, recopilamos automáticamente:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Información del dispositivo (tipo, sistema operativo, navegador)</li>
                    <li>Dirección IP y ubicación aproximada</li>
                    <li>Información de uso (páginas visitadas, tiempo de sesión)</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    3. Cómo Usamos su Información
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    Utilizamos la información recopilada para:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Proporcionar, mantener y mejorar el Servicio</li>
                    <li>Procesar transacciones y enviar notificaciones relacionadas</li>
                    <li>Responder a sus comentarios y preguntas</li>
                    <li>Enviar información técnica, actualizaciones y alertas de seguridad</li>
                    <li>Comunicar ofertas promocionales (con su consentimiento)</li>
                    <li>Monitorear y analizar tendencias y uso</li>
                    <li>Detectar, investigar y prevenir actividades fraudulentas</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    4. Compartir Información
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    No vendemos su información personal. Podemos compartir información con:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Proveedores de servicios que nos ayudan a operar el Servicio</li>
                    <li>Socios comerciales con su consentimiento</li>
                    <li>Autoridades legales cuando sea requerido por ley</li>
                    <li>En caso de fusión, venta o transferencia de activos</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    5. Seguridad de los Datos
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    Implementamos medidas de seguridad técnicas y organizativas para proteger su información, incluyendo:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Encriptación de datos en tránsito y en reposo</li>
                    <li>Controles de acceso estrictos</li>
                    <li>Monitoreo continuo de seguridad</li>
                    <li>Auditorías de seguridad regulares</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    6. Sus Derechos
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    Usted tiene derecho a:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Acceder a su información personal</li>
                    <li>Corregir datos inexactos</li>
                    <li>Solicitar la eliminación de sus datos</li>
                    <li>Oponerse al procesamiento de sus datos</li>
                    <li>Solicitar la portabilidad de sus datos</li>
                    <li>Retirar su consentimiento en cualquier momento</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    7. Menores de Edad
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    Si nuestra plataforma es utilizada por menores de 18 años en el contexto de organizaciones deportivas, requerimos el consentimiento de un padre o tutor. No recopilamos intencionalmente información de niños menores de 13 años sin el consentimiento parental verificable.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    8. Retención de Datos
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    Conservamos su información mientras su cuenta esté activa o según sea necesario para proporcionar el Servicio. Después de la cancelación de la cuenta, podemos retener cierta información según sea necesario para cumplir con obligaciones legales.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    9. Transferencias Internacionales
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    Su información puede ser transferida y almacenada en servidores ubicados fuera de su país de residencia. Tomamos medidas para asegurar que dichas transferencias cumplan con las leyes aplicables de protección de datos.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    10. Contacto
                  </h2>
                  <p className="text-tb-shadow leading-relaxed">
                    Para ejercer sus derechos o si tiene preguntas sobre esta política, contáctenos en:{' '}
                    <a href="mailto:privacy@touchbase.app" className="text-tb-red hover:underline">
                      privacy@touchbase.app
                    </a>
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    1. Information We Collect
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    We collect information you provide directly to us, including:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Account information (name, email, password)</li>
                    <li>Profile information (photo, phone number)</li>
                    <li>Organization information (name, type, members)</li>
                    <li>Player and team data</li>
                    <li>Game statistics and records</li>
                    <li>Communications with our support team</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    2. Automatically Collected Information
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    When you use our Service, we automatically collect:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Device information (type, operating system, browser)</li>
                    <li>IP address and approximate location</li>
                    <li>Usage information (pages visited, session duration)</li>
                    <li>Cookies and similar technologies</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    3. How We Use Your Information
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    We use collected information to:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Provide, maintain, and improve the Service</li>
                    <li>Process transactions and send related notifications</li>
                    <li>Respond to your comments and questions</li>
                    <li>Send technical information, updates, and security alerts</li>
                    <li>Communicate promotional offers (with your consent)</li>
                    <li>Monitor and analyze trends and usage</li>
                    <li>Detect, investigate, and prevent fraudulent activities</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    4. Information Sharing
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    We do not sell your personal information. We may share information with:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Service providers who help us operate the Service</li>
                    <li>Business partners with your consent</li>
                    <li>Legal authorities when required by law</li>
                    <li>In case of merger, sale, or asset transfer</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    5. Data Security
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    We implement technical and organizational security measures to protect your information, including:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Strict access controls</li>
                    <li>Continuous security monitoring</li>
                    <li>Regular security audits</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    6. Your Rights
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 text-tb-shadow space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to processing of your data</li>
                    <li>Request data portability</li>
                    <li>Withdraw your consent at any time</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    7. Children&apos;s Privacy
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    If our platform is used by minors under 18 in the context of sports organizations, we require parental or guardian consent. We do not knowingly collect information from children under 13 without verifiable parental consent.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    8. Data Retention
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    We retain your information while your account is active or as needed to provide the Service. After account cancellation, we may retain certain information as necessary to comply with legal obligations.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    9. International Transfers
                  </h2>
                  <p className="text-tb-shadow leading-relaxed mb-4">
                    Your information may be transferred and stored on servers located outside your country of residence. We take steps to ensure such transfers comply with applicable data protection laws.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-display font-bold text-tb-ink mb-4 uppercase">
                    10. Contact
                  </h2>
                  <p className="text-tb-shadow leading-relaxed">
                    To exercise your rights or if you have questions about this policy, contact us at:{' '}
                    <a href="mailto:privacy@touchbase.app" className="text-tb-red hover:underline">
                      privacy@touchbase.app
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
