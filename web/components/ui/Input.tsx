import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-sans font-medium text-[--color-tb-navy] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl border-2 transition-colors font-sans',
            'bg-white text-[--color-tb-navy]',
            'border-[--color-tb-line] focus:border-[--color-tb-red] focus:outline-none',
            'placeholder:text-[--color-tb-shadow]/60',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || helperText ? `${inputId}-help` : undefined}
          {...props}
        />
        {(error || helperText) && (
          <p
            id={`${inputId}-help`}
            role={error ? 'alert' : undefined}
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-red-600' : 'text-[--color-tb-shadow]/70'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

