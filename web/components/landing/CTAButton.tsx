import Link from 'next/link';

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function CTAButton({ href, children, variant = 'primary', className = '' }: CTAButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center px-12 sm:px-16 lg:px-20 py-6 sm:py-8 lg:py-10 font-display font-black text-xl sm:text-2xl lg:text-3xl uppercase tracking-wider transition-all duration-300 ease-out active:translate-y-1 min-w-[260px] sm:min-w-[320px] lg:min-w-[380px]";

  const variantStyles = {
    primary: "bg-tb-red text-white border-4 border-tb-shadow shadow-[6px_6px_0_0_rgba(62,62,62,1)] hover:shadow-[10px_10px_0_0_rgba(62,62,62,1)] hover:-translate-y-1 hover:-translate-x-1 hover:bg-tb-stitch",
    secondary: "bg-transparent text-tb-bone border-4 border-tb-bone shadow-[6px_6px_0_0_rgba(250,247,240,0.4)] hover:shadow-[10px_10px_0_0_rgba(250,247,240,0.6)] hover:-translate-y-1 hover:-translate-x-1 hover:bg-tb-bone/10 hover:text-white"
  };

  return (
    <Link
      href={href}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}


