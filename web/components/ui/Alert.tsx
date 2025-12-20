import { HTMLAttributes, forwardRef, memo } from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
}

const Alert = memo(forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, children, ...props }, ref) => {
    // Using TB design tokens with semantic color support
    const variants = {
      success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      error: 'bg-tb-stitch/10 border-tb-stitch/30 text-tb-stitch',
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      info: 'bg-tb-navy/10 border-tb-navy/30 text-tb-navy',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'rounded-lg border p-4 font-sans',
          variants[variant],
          className
        )}
        {...props}
      >
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <div className="text-sm">{children}</div>
      </div>
    );
  }
));

Alert.displayName = 'Alert';

export default Alert;

