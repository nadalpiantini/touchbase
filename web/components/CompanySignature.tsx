'use client';

export function CompanySignature() {
  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <div className="flex items-center gap-1.5 text-[--color-tb-shadow]/35 text-[11px] font-sans font-light tracking-[0.15em] uppercase select-none">
        <span className="opacity-50 font-extralight">by</span>
        <span className="opacity-75 font-light">EMPLEAIDO</span>
        <span className="opacity-30 font-extralight">&</span>
        <span className="opacity-75 font-light">ALED SYSTEMS</span>
      </div>
    </div>
  );
}

