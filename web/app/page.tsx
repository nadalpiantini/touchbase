import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_20%_20%,#F8EBD0,transparent_60%),linear-gradient(180deg,#14213D,#0E0E0E)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Logo with Slogan */}
          <div className="flex justify-center mb-8">
            <Image
              src="/touchbase-logo.png"
              alt="TouchBase - Your dugout in the cloud"
              width={400}
              height={400}
              priority
              className="w-auto h-26 drop-shadow-2xl hidden md:block"
            />
            <Image
              src="/touchbase-slogan-logo.png"
              alt="TouchBase - Your dugout in the cloud"
              width={400}
              height={400}
              priority
              className="w-auto h-26 drop-shadow-2xl block md:hidden"
            />
          </div>
          <p className="text-xl text-[--color-tb-bone] mb-12 font-medium">
            Sistema Moderno de Gestión de Clubes Deportivos
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-[--color-tb-line] shadow-sm hover:shadow-dugout transition-shadow">
              <div className="text-[--color-tb-navy] mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold mb-2 text-[--color-tb-navy]">Gestión de Jugadores</h3>
              <p className="text-[--color-tb-shadow] text-sm">
                Administra rosters, estadísticas y rendimiento
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[--color-tb-line] shadow-sm hover:shadow-dugout transition-shadow">
              <div className="text-[--color-tb-stitch] mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold mb-2 text-[--color-tb-navy]">Análisis en Tiempo Real</h3>
              <p className="text-[--color-tb-shadow] text-sm">
                Estadísticas y métricas actualizadas al instante
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[--color-tb-line] shadow-sm hover:shadow-dugout transition-shadow">
              <div className="text-[--color-tb-red] mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold mb-2 text-[--color-tb-navy]">Acceso Móvil</h3>
              <p className="text-[--color-tb-shadow] text-sm">
                Gestiona tu equipo desde cualquier dispositivo
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent font-display tracking-wide rounded-xl text-white bg-[--color-tb-navy] hover:bg-[--color-tb-ink] shadow-dugout transition-all active:translate-y-[1px]"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
