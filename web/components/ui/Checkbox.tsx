import { InputHTMLAttributes, forwardRef, useId, memo } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Label text displayed next to checkbox */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below the checkbox */
  helperText?: string;
  /** Size variant for visual appearance */
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    checkbox: 'h-4 w-4',
    label: 'text-sm',
    touch: 'min-h-[36px]', // Touch target padding
  },
  md: {
    checkbox: 'h-5 w-5',
    label: 'text-sm',
    touch: 'min-h-[44px]', // WCAG minimum touch target
  },
  lg: {
    checkbox: 'h-6 w-6',
    label: 'text-base',
    touch: 'min-h-[48px]',
  },
};

const Checkbox = memo(forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, id, size = 'md', disabled, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const helperId = `${checkboxId}-help`;
    const sizeClass = sizeClasses[size];

    return (
      <div className="w-full">
        <label
          htmlFor={checkboxId}
          className={cn(
            'relative flex items-center gap-3 cursor-pointer select-none',
            sizeClass.touch,
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            className={cn(
              // Base styles
              'appearance-none shrink-0 rounded border-2 transition-all duration-150',
              sizeClass.checkbox,
              // Colors
              'border-tb-line bg-white',
              'hover:border-tb-navy',
              // Focus
              'focus:outline-none focus:ring-2 focus:ring-tb-red/50 focus:ring-offset-2',
              // Checked state
              'checked:bg-tb-red checked:border-tb-red checked:hover:bg-tb-stitch checked:hover:border-tb-stitch',
              // Checkmark (using pseudo-element trick via CSS)
              'relative',
              'checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center',
              "checked:after:content-['✓'] checked:after:text-white checked:after:font-bold",
              size === 'sm' && 'checked:after:text-xs',
              size === 'md' && 'checked:after:text-sm',
              size === 'lg' && 'checked:after:text-base',
              // Indeterminate state
              'indeterminate:bg-tb-red indeterminate:border-tb-red',
              // Error state
              error && 'border-tb-stitch',
              // Disabled
              'disabled:bg-tb-bone/50 disabled:border-tb-line/50',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error || helperText ? helperId : undefined}
            {...props}
          />
          {label && (
            <span className={cn('font-sans text-tb-navy', sizeClass.label)}>
              {label}
            </span>
          )}
        </label>
        {(error || helperText) && (
          <p
            id={helperId}
            role={error ? 'alert' : undefined}
            className={cn(
              'mt-1 text-sm ml-8',
              error ? 'text-tb-stitch' : 'text-tb-shadow/70'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
));

Checkbox.displayName = 'Checkbox';

export default Checkbox;
