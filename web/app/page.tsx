import Image from "next/image";
import Link from 'next/link';

export default function RootPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--color-tb-bone)' }}>
      {/* Logo Full */}
      <div className="flex justify-center mb-8">
        <Image
          src="/touchbase-logo-full.png"
          alt="TouchBase - Your dugout in the cloud"
          width={600}
          height={600}
          priority
          className="w-auto h-32 sm:h-40 md:h-48 lg:h-56"
        />
      </div>
      
      {/* ENTER Button - TB Navy */}
      <Link 
        href="/login" 
        className="inline-flex items-center justify-center px-8 py-4 bg-[--color-tb-navy] text-white font-display font-bold text-xl sm:text-2xl rounded-xl shadow-dugout hover:bg-[--color-tb-navy]/90 transition-all active:translate-y-[1px] tracking-wide"
      >
        ENTER
      </Link>
    </main>
  );
}