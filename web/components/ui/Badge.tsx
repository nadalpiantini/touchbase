import { HTMLAttributes, forwardRef, memo } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'live' | 'status' | 'info' | 'success' | 'warning' | 'error';
}

const Badge = memo(forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'info', children, ...props }, ref) => {
    const variants = {
      live: 'bg-tb-stitch/10 text-tb-stitch ring-1 ring-tb-stitch/30',
      status: 'bg-tb-navy/10 text-tb-navy',
      info: 'bg-tb-beige text-tb-shadow ring-1 ring-tb-line',
      success: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
      warning: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20',
      error: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
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
