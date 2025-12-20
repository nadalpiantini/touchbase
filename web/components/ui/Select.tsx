import { SelectHTMLAttributes, forwardRef, useId, memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Label text displayed above the select */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below the select */
  helperText?: string;
  /** Options array - use this OR children, not both */
  options?: SelectOption[];
  /** Placeholder text shown as first disabled option */
  placeholder?: string;
  /** Children elements (native <option> elements) - use this OR options prop */
  children?: ReactNode;
}

const Select = memo(forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, required, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const helperId = `${selectId}-help`;

    // Determine whether to use children or options prop
    const hasChildren = children !== undefined && children !== null;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-sans font-medium text-tb-navy mb-1.5"
          >
            {label}
            {required && <span className="text-tb-stitch ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl border-2 transition-colors font-sans appearance-none',
            'bg-white text-tb-navy cursor-pointer',
            'border-tb-line focus:border-tb-red focus:outline-none',
            'focus:ring-2 focus:ring-tb-red/20 focus:ring-offset-0',
            'disabled:bg-tb-bone/50 disabled:cursor-not-allowed disabled:text-tb-shadow',
            error && 'border-tb-stitch focus:border-tb-stitch focus:ring-tb-stitch/20',
            // Custom arrow indicator
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2314213D\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || helperText ? helperId : undefined}
          aria-required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {hasChildren
            ? children
            : options?.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
        </select>
        {(error || helperText) && (
          <p
            id={helperId}
            role={error ? 'alert' : undefined}
            className={cn(
              'mt-1.5 text-sm',
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

Select.displayName = 'Select';

export default Select;
