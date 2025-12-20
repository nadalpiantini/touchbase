'use client';

import {
  HTMLAttributes,
  ReactNode,
  forwardRef,
  memo,
  createContext,
  useContext,
} from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================
// Breadcrumb Context
// ============================================================

interface BreadcrumbContextValue {
  separator?: ReactNode;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({});

function useBreadcrumbContext() {
  return useContext(BreadcrumbContext);
}

// ============================================================
// Breadcrumb Container
// ============================================================

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Custom separator between items (default: chevron) */
  separator?: ReactNode;
}

const Breadcrumb = memo(forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator, children, ...props }, ref) => {
    return (
      <BreadcrumbContext.Provider value={{ separator }}>
        <nav
          ref={ref}
          aria-label="Breadcrumb"
          className={cn('', className)}
          {...props}
        >
          <ol className="flex items-center gap-2 text-sm font-sans">
            {children}
          </ol>
        </nav>
      </BreadcrumbContext.Provider>
    );
  }
));

Breadcrumb.displayName = 'Breadcrumb';

// ============================================================
// Breadcrumb List (for styling the ol)
// ============================================================

export type BreadcrumbListProps = HTMLAttributes<HTMLOListElement>;

const BreadcrumbList = memo(forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, ...props }, ref) => {
    return (
      <ol
        ref={ref}
        className={cn('flex items-center gap-2 text-sm font-sans flex-wrap', className)}
        {...props}
      />
    );
  }
));

BreadcrumbList.displayName = 'BreadcrumbList';

// ============================================================
// Breadcrumb Item
// ============================================================

export interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {
  /** Whether this is the current/active page */
  isCurrent?: boolean;
}

const BreadcrumbItem = memo(forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, isCurrent, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        aria-current={isCurrent ? 'page' : undefined}
        {...props}
      >
        {children}
      </li>
    );
  }
));

BreadcrumbItem.displayName = 'BreadcrumbItem';

// ============================================================
// Breadcrumb Link
// ============================================================

export interface BreadcrumbLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  /** Target URL */
  href: string;
  /** Whether this link is active/current */
  isActive?: boolean;
}

const BreadcrumbLink = memo(forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, href, isActive, children, ...props }, ref) => {
    if (isActive) {
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          className={cn(
            'text-tb-navy font-medium',
            className
          )}
          aria-current="page"
          {...(props as HTMLAttributes<HTMLSpanElement>)}
        >
          {children}
        </span>
      );
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'text-tb-shadow hover:text-tb-navy transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </Link>
    );
  }
));

BreadcrumbLink.displayName = 'BreadcrumbLink';

// ============================================================
// Breadcrumb Separator
// ============================================================

export type BreadcrumbSeparatorProps = HTMLAttributes<HTMLSpanElement>;

const BreadcrumbSeparator = memo(forwardRef<HTMLSpanElement, BreadcrumbSeparatorProps>(
  ({ className, children, ...props }, ref) => {
    const { separator } = useBreadcrumbContext();

    return (
      <span
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('text-tb-shadow/50', className)}
        {...props}
      >
        {children || separator || (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </span>
    );
  }
));

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// ============================================================
// Breadcrumb Page (current page indicator)
// ============================================================

export type BreadcrumbPageProps = HTMLAttributes<HTMLSpanElement>;

const BreadcrumbPage = memo(forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn('text-tb-navy font-medium', className)}
        {...props}
      />
    );
  }
));

BreadcrumbPage.displayName = 'BreadcrumbPage';

// ============================================================
// Breadcrumb Ellipsis (for truncated breadcrumbs)
// ============================================================

export type BreadcrumbEllipsisProps = HTMLAttributes<HTMLSpanElement>;

const BreadcrumbEllipsis = memo(forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('flex h-9 w-9 items-center justify-center', className)}
        {...props}
      >
        <svg
          className="w-4 h-4 text-tb-shadow"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          />
        </svg>
        <span className="sr-only">More pages</span>
      </span>
    );
  }
));

BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

// ============================================================
// Exports
// ============================================================

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbEllipsis,
};

export default Breadcrumb;
