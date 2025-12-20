'use client';

import { useState, useRef, useEffect, ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  divider?: boolean;
}

export interface DropdownMenuProps {
  /** Trigger element (button, icon, etc.) */
  trigger: ReactNode;
  /** Menu items configuration */
  items: DropdownMenuItem[];
  /** Alignment of menu relative to trigger */
  align?: 'left' | 'right';
  /** Custom className for the trigger wrapper */
  className?: string;
  /** Custom className for the menu panel */
  menuClassName?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'right',
  className,
  menuClassName,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Menu Panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[200px] rounded-xl border-2 border-tb-line bg-white shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1.5">
            {items.map((item, index) => (
              <div key={index}>
                {item.divider && (
                  <div className="my-1.5 border-t border-tb-line" role="separator" />
                )}
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    'w-full px-4 py-2.5 text-left font-sans text-sm transition-colors',
                    'flex items-center gap-3',
                    'hover:bg-tb-bone focus:bg-tb-bone focus:outline-none',
                    item.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                    item.variant === 'danger'
                      ? 'text-tb-stitch hover:bg-tb-stitch/10 focus:bg-tb-stitch/10'
                      : 'text-tb-navy'
                  )}
                  role="menuitem"
                  tabIndex={item.disabled ? -1 : 0}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export interface DropdownMenuItemButtonProps extends HTMLAttributes<HTMLButtonElement> {
  /** Content of the menu item */
  children: ReactNode;
  /** Icon to display before the label */
  icon?: ReactNode;
  /** Visual variant */
  variant?: 'default' | 'danger';
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Individual menu item button component for use with custom DropdownMenu implementations
 */
export function DropdownMenuItemButton({
  children,
  icon,
  variant = 'default',
  disabled,
  className,
  ...props
}: DropdownMenuItemButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'w-full px-4 py-2.5 text-left font-sans text-sm transition-colors',
        'flex items-center gap-3',
        'hover:bg-tb-bone focus:bg-tb-bone focus:outline-none',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
        variant === 'danger'
          ? 'text-tb-stitch hover:bg-tb-stitch/10 focus:bg-tb-stitch/10'
          : 'text-tb-navy',
        className
      )}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

DropdownMenuItemButton.displayName = 'DropdownMenuItemButton';
