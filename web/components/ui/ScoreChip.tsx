import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ScoreChipProps extends HTMLAttributes<HTMLDivElement> {
  homeTeam: string;
  homeScore: number;
  awayTeam: string;
  awayScore: number;
}

const ScoreChip = forwardRef<HTMLDivElement, ScoreChipProps>(
  ({ className, homeTeam, homeScore, awayTeam, awayScore, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-[--color-tb-beige] px-3 py-1',
          'ring-1 ring-[--color-tb-line] text-[--color-tb-navy] font-display font-semibold text-sm',
          className
        )}
        {...props}
      >
        <span>{homeTeam}</span>
        <span className="text-[--color-tb-red]">{homeScore}</span>
        <span className="text-[--color-tb-shadow]/50">—</span>
        <span className="text-[--color-tb-red]">{awayScore}</span>
        <span>{awayTeam}</span>
      </div>
    );
  }
);

ScoreChip.displayName = 'ScoreChip';

export default ScoreChip;
