import { HTMLAttributes, forwardRef, memo } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'live' | 'status' | 'info' | 'success' | 'warning' | 'error';
}

const Badge = memo(forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'info', children, ...props }, ref) => {
    // Using TB design tokens with semantic color support
    const variants = {
      live: 'bg-tb-stitch/10 text-tb-stitch ring-1 ring-tb-stitch/30',
      status: 'bg-tb-navy/10 text-tb-navy',
      info: 'bg-tb-beige text-tb-shadow ring-1 ring-tb-line',
      success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
      warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
      error: 'bg-tb-stitch/10 text-tb-stitch ring-1 ring-tb-stitch/30',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-sans font-semibold',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
));

Badge.displayName = 'Badge';

export default Badge;
