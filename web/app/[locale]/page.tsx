import Image from "next/image";
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--color-tb-bone)' }}>
      {/* Logo with slogan - Clickable to dashboard */}
      <Link href={`/${locale}/dashboard`} className="flex justify-center cursor-pointer hover:opacity-90 transition-opacity duration-200">
        <Image
          src="/touchbase-slogan-logo.png"
          alt="TouchBase - Your dugout in the cloud"
          width={600}
          height={600}
          priority
          className="w-auto h-32 sm:h-40 md:h-48 lg:h-56"
        />
      </Link>
    </main>
  );
}
