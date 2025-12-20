// ============================================================
// TouchBase Academy - UI Components Export
// ============================================================

// Core Form Components
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Select } from './Select';
export type { SelectOption, SelectProps } from './Select';
export { default as Textarea } from './Textarea';
export { default as Checkbox } from './Checkbox';
export { Radio, RadioGroup } from './Radio';
export type { RadioProps, RadioGroupProps } from './Radio';

// Display Components
export { default as Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { default as Badge } from './Badge';
export { default as ProgressBar } from './ProgressBar';
export { default as ScoreChip } from './ScoreChip';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as Alert } from './Alert';

// Table Components
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './Table';
export type { TableProps, TableHeadProps } from './Table';

// Dialog Components
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
} from './Dialog';
export type { DialogProps, DialogContentProps, DialogTriggerProps } from './Dialog';

// Loading & Empty States
export {
  default as Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonProfile,
  SkeletonModuleCard,
  SkeletonStats,
} from './Skeleton';

export {
  default as EmptyState,
  EmptyModules,
  EmptyUsers,
  EmptyAssignments,
  EmptyClasses,
  EmptyOrganizations,
  EmptySearchResults,
  EmptyBadges,
} from './EmptyState';

// Navigation Components
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbEllipsis,
} from './Breadcrumb';

// Dropdown Menu
export { DropdownMenu, DropdownMenuItemButton } from './DropdownMenu';
export type { DropdownMenuItem, DropdownMenuProps, DropdownMenuItemButtonProps } from './DropdownMenu';

// Toast Notifications
export { default as ToastProvider, useToast } from './Toast';

// Avatar Component
export { default as Avatar, AvatarGroup } from './Avatar';
export type { AvatarProps, AvatarSize, AvatarGroupProps } from './Avatar';

