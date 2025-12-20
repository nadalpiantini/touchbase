import { HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Image URL for the avatar */
  src?: string | null;
  /** Alt text for the image (also used to generate initials) */
  alt: string;
  /** Size variant */
  size?: AvatarSize;
  /** Fallback initials (if not provided, generated from alt) */
  initials?: string;
  /** Custom background color for initials fallback */
  bgColor?: string;
  /** Custom text color for initials */
  textColor?: string;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; image: number }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs', image: 24 },
  sm: { container: 'w-8 h-8', text: 'text-xs', image: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', image: 40 },
  lg: { container: 'w-12 h-12', text: 'text-base', image: 48 },
  xl: { container: 'w-16 h-16', text: 'text-lg', image: 64 },
  '2xl': { container: 'w-24 h-24', text: 'text-2xl', image: 96 },
};

/**
 * Generates initials from a name string
 * Examples:
 * - "John Doe" → "JD"
 * - "María" → "M"
 * - "John Paul Smith" → "JS" (first + last)
 */
function getInitials(name: string): string {
  if (!name) return '?';

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  // First and last initials
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export default function Avatar({
  src,
  alt,
  size = 'md',
  initials,
  bgColor = 'bg-tb-navy/10',
  textColor = 'text-tb-navy',
  className,
  ...props
}: AvatarProps) {
  const { container, text, image } = sizeClasses[size];
  const displayInitials = initials || getInitials(alt);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0',
        container,
        className
      )}
      role="img"
      aria-label={alt}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={image}
          height={image}
          className="object-cover w-full h-full"
          unoptimized={src.startsWith('http')} // Unoptimized for external URLs
        />
      ) : (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center font-display font-semibold',
            bgColor,
            textColor,
            text
          )}
        >
          {displayInitials}
        </div>
      )}
    </div>
  );
}

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars to show before truncating */
  max?: number;
  /** Array of avatar src URLs */
  avatars: Array<{
    src?: string | null;
    alt: string;
    initials?: string;
  }>;
  /** Size variant for all avatars */
  size?: AvatarSize;
}

/**
 * Avatar Group component for displaying multiple avatars with overflow handling
 */
export function AvatarGroup({
  max = 4,
  avatars,
  size = 'md',
  className,
  ...props
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);
  const { container, text } = sizeClasses[size];

  return (
    <div className={cn('flex items-center -space-x-2', className)} {...props}>
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className="ring-2 ring-white rounded-full"
          style={{ zIndex: displayAvatars.length - index }}
        >
          <Avatar
            src={avatar.src}
            alt={avatar.alt}
            initials={avatar.initials}
            size={size}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0',
            'bg-tb-shadow/10 text-tb-shadow font-display font-semibold ring-2 ring-white',
            container,
            text
          )}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

AvatarGroup.displayName = 'AvatarGroup';
