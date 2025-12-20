import { TextareaHTMLAttributes, forwardRef, useId, memo } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
}

const Textarea = memo(forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, required, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const helperId = `${textareaId}-help`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-sans font-medium text-tb-navy mb-1.5"
          >
            {label}
            {required && <span className="text-tb-stitch ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl border-2 transition-colors font-sans resize-y',
            'bg-white text-tb-navy',
            'border-tb-line focus:border-tb-red focus:outline-none',
            'focus:ring-2 focus:ring-tb-red/20 focus:ring-offset-0',
            'placeholder:text-tb-shadow/60',
            'disabled:bg-tb-bone/50 disabled:cursor-not-allowed disabled:text-tb-shadow',
            error && 'border-tb-stitch focus:border-tb-stitch focus:ring-tb-stitch/20',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || helperText ? helperId : undefined}
          aria-required={required}
          {...props}
        />
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

Textarea.displayName = 'Textarea';

export default Textarea;
