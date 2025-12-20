import { HTMLAttributes, forwardRef, memo } from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar = memo(forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, showLabel = false, color = 'primary', size = 'md', ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    const colorClasses = {
      primary: 'bg-tb-red',
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
            <span className="text-sm font-sans font-medium text-tb-shadow">Progress</span>
            <span className="text-sm font-display font-semibold text-tb-navy">{Math.round(clampedValue)}%</span>
          </div>
        )}
        <div 
          className={cn('w-full bg-tb-line rounded-full overflow-hidden', sizeClasses[size])}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={showLabel ? undefined : `Progress: ${Math.round(clampedValue)}%`}
        >
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
));

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

