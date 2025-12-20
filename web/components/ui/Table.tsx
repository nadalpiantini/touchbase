import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, forwardRef, memo } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Table Container
// ============================================================

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Wrap table in a container with border and overflow handling */
  container?: boolean;
}

const Table = memo(forwardRef<HTMLTableElement, TableProps>(
  ({ className, container = true, children, ...props }, ref) => {
    const table = (
      <table
        ref={ref}
        className={cn('w-full text-sm caption-bottom', className)}
        {...props}
      >
        {children}
      </table>
    );

    if (container) {
      return (
        <div className="relative w-full overflow-auto border border-tb-line rounded-xl bg-white">
          {table}
        </div>
      );
    }

    return table;
  }
));

Table.displayName = 'Table';

// ============================================================
// Table Header
// ============================================================

const TableHeader = memo(forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-tb-bone/50 [&_tr]:border-b [&_tr]:border-tb-line', className)}
    {...props}
  />
)));

TableHeader.displayName = 'TableHeader';

// ============================================================
// Table Body
// ============================================================

const TableBody = memo(forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
)));

TableBody.displayName = 'TableBody';

// ============================================================
// Table Footer
// ============================================================

const TableFooter = memo(forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-tb-line bg-tb-bone/30 font-medium',
      className
    )}
    {...props}
  />
)));

TableFooter.displayName = 'TableFooter';

// ============================================================
// Table Row
// ============================================================

const TableRow = memo(forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-tb-line transition-colors',
      'hover:bg-tb-bone/30',
      'data-[state=selected]:bg-tb-beige/20',
      className
    )}
    {...props}
  />
)));

TableRow.displayName = 'TableRow';

// ============================================================
// Table Head Cell
// ============================================================

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Column is sortable */
  sortable?: boolean;
  /** Current sort direction */
  sorted?: 'asc' | 'desc' | false;
}

const TableHead = memo(forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sorted, children, ...props }, ref) => (
    <th
      ref={ref}
      scope="col"
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-tb-shadow',
        '[&:has([role=checkbox])]:pr-0',
        sortable && 'cursor-pointer select-none hover:text-tb-navy',
        className
      )}
      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : sorted === false ? 'none' : undefined}
      {...props}
    >
      {sortable ? (
        <div className="flex items-center gap-1">
          {children}
          <span className="inline-flex flex-col" aria-hidden="true">
            <svg
              className={cn(
                'h-3 w-3 -mb-1',
                sorted === 'asc' ? 'text-tb-navy' : 'text-tb-shadow/40'
              )}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
            <svg
              className={cn(
                'h-3 w-3 -mt-1',
                sorted === 'desc' ? 'text-tb-navy' : 'text-tb-shadow/40'
              )}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
      ) : (
        children
      )}
    </th>
  )
));

TableHead.displayName = 'TableHead';

// ============================================================
// Table Cell
// ============================================================

const TableCell = memo(forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 align-middle text-tb-navy',
      '[&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
)));

TableCell.displayName = 'TableCell';

// ============================================================
// Table Caption
// ============================================================

const TableCaption = memo(forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-tb-shadow', className)}
    {...props}
  />
)));

TableCaption.displayName = 'TableCaption';

// ============================================================
// Exports
// ============================================================

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
