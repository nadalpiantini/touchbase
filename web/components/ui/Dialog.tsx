'use client';

import {
  HTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  memo,
  forwardRef,
  createContext,
  useContext,
} from 'react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

// ============================================================
// Dialog Context
// ============================================================

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

// ============================================================
// Dialog Root
// ============================================================

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <DialogContext.Provider value={{ open, onOpenChange, titleId, descriptionId }}>
      {children}
    </DialogContext.Provider>
  );
}

// ============================================================
// Dialog Trigger
// ============================================================

export interface DialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogTrigger = memo(forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onOpenChange(true)}
        {...props}
      >
        {children}
      </button>
    );
  }
));

DialogTrigger.displayName = 'DialogTrigger';

// ============================================================
// Dialog Portal & Content
// ============================================================

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Prevent closing when clicking overlay */
  preventOverlayClose?: boolean;
  /** Maximum width class */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[calc(100vw-2rem)]',
};

const DialogContent = memo(forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, preventOverlayClose, size = 'md', ...props }, ref) => {
    const { open, onOpenChange, titleId, descriptionId } = useDialogContext();
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<Element | null>(null);

    // Handle escape key
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onOpenChange(false);
        }
      },
      [onOpenChange]
    );

    // Focus trap
    useEffect(() => {
      if (!open) return;

      // Store previously focused element
      previousActiveElement.current = document.activeElement;

      // Add event listener
      document.addEventListener('keydown', handleKeyDown);

      // Prevent body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus first focusable element
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;

        // Return focus to previously focused element
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }, [open, handleKeyDown]);

    // Tab trap
    useEffect(() => {
      if (!open) return;

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }, [open]);

    if (!open) return null;

    // Use portal to render at document body
    if (typeof window === 'undefined') return null;

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
          onClick={() => !preventOverlayClose && onOpenChange(false)}
          aria-hidden="true"
        />

        {/* Dialog */}
        <div
          ref={(node) => {
            dialogRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={cn(
            'relative z-50 w-full bg-white rounded-2xl shadow-2xl',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4',
            'max-h-[calc(100vh-2rem)] overflow-y-auto',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  }
));

DialogContent.displayName = 'DialogContent';

// ============================================================
// Dialog Header
// ============================================================

const DialogHeader = memo(forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 p-6 pb-0', className)}
      {...props}
    />
  )
));

DialogHeader.displayName = 'DialogHeader';

// ============================================================
// Dialog Title
// ============================================================

const DialogTitle = memo(forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { titleId } = useDialogContext();

    return (
      <h2
        ref={ref}
        id={titleId}
        className={cn('text-xl font-display font-bold text-tb-navy', className)}
        {...props}
      />
    );
  }
));

DialogTitle.displayName = 'DialogTitle';

// ============================================================
// Dialog Description
// ============================================================

const DialogDescription = memo(forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = useDialogContext();

    return (
      <p
        ref={ref}
        id={descriptionId}
        className={cn('text-sm text-tb-shadow', className)}
        {...props}
      />
    );
  }
));

DialogDescription.displayName = 'DialogDescription';

// ============================================================
// Dialog Body
// ============================================================

const DialogBody = memo(forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    />
  )
));

DialogBody.displayName = 'DialogBody';

// ============================================================
// Dialog Footer
// ============================================================

const DialogFooter = memo(forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-6 pt-0',
        className
      )}
      {...props}
    />
  )
));

DialogFooter.displayName = 'DialogFooter';

// ============================================================
// Dialog Close Button
// ============================================================

const DialogClose = memo(forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onOpenChange(false)}
        className={cn(
          'absolute right-4 top-4 rounded-full p-1.5',
          'text-tb-shadow hover:text-tb-navy hover:bg-tb-bone/50',
          'focus:outline-none focus:ring-2 focus:ring-tb-red/50',
          'transition-colors',
          className
        )}
        aria-label="Close dialog"
        {...props}
      >
        {children || (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        )}
      </button>
    );
  }
));

DialogClose.displayName = 'DialogClose';

// ============================================================
// Exports
// ============================================================

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
};
