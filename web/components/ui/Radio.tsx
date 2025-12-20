'use client';

import {
  InputHTMLAttributes,
  HTMLAttributes,
  forwardRef,
  useId,
  memo,
  createContext,
  useContext,
  useCallback,
  KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Radio Group Context
// ============================================================

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}

// ============================================================
// Radio Group
// ============================================================

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Name for all radio inputs in the group */
  name: string;
  /** Currently selected value */
  value?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Label for the group */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Disable all radios in group */
  disabled?: boolean;
  /** Make selection required */
  required?: boolean;
  /** Size of radio buttons */
  size?: 'sm' | 'md' | 'lg';
  /** Orientation of the group */
  orientation?: 'horizontal' | 'vertical';
}

const RadioGroup = memo(forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      name,
      value,
      onChange,
      label,
      error,
      helperText,
      disabled,
      required,
      size = 'md',
      orientation = 'vertical',
      children,
      ...props
    },
    ref
  ) => {
    const groupId = useId();
    const labelId = `${groupId}-label`;
    const helperId = `${groupId}-help`;

    // Keyboard navigation for roving tabindex
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        const radios = Array.from(
          event.currentTarget.querySelectorAll<HTMLInputElement>(
            'input[type="radio"]:not(:disabled)'
          )
        );
        const currentIndex = radios.findIndex((radio) => radio === document.activeElement);

        let nextIndex = currentIndex;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault();
          nextIndex = currentIndex < radios.length - 1 ? currentIndex + 1 : 0;
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : radios.length - 1;
        }

        if (nextIndex !== currentIndex && radios[nextIndex]) {
          radios[nextIndex].focus();
          radios[nextIndex].click();
        }
      },
      []
    );

    return (
      <RadioGroupContext.Provider value={{ name, value, onChange, disabled, required, size }}>
        <div
          ref={ref}
          role="radiogroup"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={error || helperText ? helperId : undefined}
          aria-required={required}
          aria-invalid={error ? 'true' : undefined}
          onKeyDown={handleKeyDown}
          className={cn('w-full', className)}
          {...props}
        >
          {label && (
            <div
              id={labelId}
              className="text-sm font-sans font-medium text-tb-navy mb-2"
            >
              {label}
              {required && <span className="text-tb-stitch ml-1" aria-hidden="true">*</span>}
            </div>
          )}
          <div
            className={cn(
              'flex gap-3',
              orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
            )}
          >
            {children}
          </div>
          {(error || helperText) && (
            <p
              id={helperId}
              role={error ? 'alert' : undefined}
              className={cn(
                'mt-2 text-sm',
                error ? 'text-tb-stitch' : 'text-tb-shadow/70'
              )}
            >
              {error || helperText}
            </p>
          )}
        </div>
      </RadioGroupContext.Provider>
    );
  }
));

RadioGroup.displayName = 'RadioGroup';

// ============================================================
// Radio Item
// ============================================================

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** Label text displayed next to radio */
  label?: string;
  /** Description text below the label */
  description?: string;
}

const sizeClasses = {
  sm: {
    radio: 'h-4 w-4',
    label: 'text-sm',
    description: 'text-xs',
    touch: 'min-h-[36px]',
  },
  md: {
    radio: 'h-5 w-5',
    label: 'text-sm',
    description: 'text-sm',
    touch: 'min-h-[44px]',
  },
  lg: {
    radio: 'h-6 w-6',
    label: 'text-base',
    description: 'text-sm',
    touch: 'min-h-[48px]',
  },
};

const Radio = memo(forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, value, disabled: itemDisabled, ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || generatedId;
    const groupContext = useRadioGroupContext();

    const name = groupContext?.name || props.name;
    const isChecked = groupContext ? groupContext.value === value : props.checked;
    const isDisabled = itemDisabled || groupContext?.disabled;
    const size = groupContext?.size || 'md';
    const sizeClass = sizeClasses[size];

    const handleChange = () => {
      if (groupContext?.onChange && value !== undefined) {
        groupContext.onChange(String(value));
      }
    };

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'relative flex items-start gap-3 cursor-pointer select-none',
          sizeClass.touch,
          isDisabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <input
          ref={ref}
          id={radioId}
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          // Roving tabindex: only checked or first radio is tabbable
          tabIndex={isChecked ? 0 : -1}
          className={cn(
            // Base styles
            'appearance-none shrink-0 rounded-full border-2 transition-all duration-150 mt-0.5',
            sizeClass.radio,
            // Colors
            'border-tb-line bg-white',
            'hover:border-tb-navy',
            // Focus
            'focus:outline-none focus:ring-2 focus:ring-tb-red/50 focus:ring-offset-2',
            // Checked state - inner dot
            'checked:border-tb-red checked:bg-white',
            'checked:before:absolute checked:before:inset-0 checked:before:m-auto',
            'checked:before:h-2.5 checked:before:w-2.5 checked:before:rounded-full checked:before:bg-tb-red',
            size === 'sm' && 'checked:before:h-2 checked:before:w-2',
            size === 'lg' && 'checked:before:h-3 checked:before:w-3',
            // Disabled
            'disabled:bg-tb-bone/50 disabled:border-tb-line/50',
            'relative',
            className
          )}
          aria-required={groupContext?.required}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className={cn('font-sans text-tb-navy', sizeClass.label)}>
                {label}
              </span>
            )}
            {description && (
              <span className={cn('text-tb-shadow', sizeClass.description)}>
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
));

Radio.displayName = 'Radio';

// ============================================================
// Exports
// ============================================================

export { RadioGroup, Radio };
export default Radio;
