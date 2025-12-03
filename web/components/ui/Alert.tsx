import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, children, ...props }, ref) => {
    const variants = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
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
);

Alert.displayName = 'Alert';

export default Alert;

