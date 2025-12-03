import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, showLabel = false, color = 'primary', size = 'md', ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    const colorClasses = {
      primary: 'bg-[--color-tb-red]',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    const sizeClasses = {
      sm: 'h-1.5',
      md: 'h-2',
      lg: 'h-3',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-[--color-tb-shadow]">Progress</span>
            <span className="text-sm font-semibold text-[--color-tb-navy]">{Math.round(clampedValue)}%</span>
          </div>
        )}
        <div className={cn('w-full bg-[--color-tb-line] rounded-full overflow-hidden', sizeClasses[size])}>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              colorClasses[color]
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

