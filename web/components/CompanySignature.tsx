'use client';

import Image from 'next/image';

export function CompanySignature() {
  return (
    <div className="w-full flex items-center justify-center pb-2 pointer-events-none">
      <div className="flex items-center justify-center opacity-30">
        {/* EMPLEAIDO Logo */}
        <div className="relative h-2.5 w-auto">
          <Image
            src="/logos/empleaido-logo.png"
            alt="EMPLEAIDO"
            width={50}
            height={10}
            className="object-contain h-full w-auto"
            unoptimized
            priority={false}
          />
        </div>
      </div>
    </div>
  );
}

