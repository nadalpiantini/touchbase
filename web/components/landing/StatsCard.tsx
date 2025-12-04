import { ReactNode } from 'react';

interface StatsCardProps {
  value: string | number;
  label: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatsCard({ value, label, icon, trend }: StatsCardProps) {
  return (
    <div className="group relative bg-[--color-tb-bone] p-6 sm:p-8 border-4 border-[--color-tb-shadow] shadow-[6px_6px_0_0_rgba(62,62,62,1)] hover:shadow-[10px_10px_0_0_rgba(62,62,62,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 ease-out">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm sm:text-base font-sans text-[--color-tb-shadow] font-medium uppercase tracking-wide mb-2">
            {label}
          </p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[--color-tb-ink] mb-2">
            {value}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-sans font-semibold ${
              trend.isPositive ? 'text-[--color-tb-red]' : 'text-[--color-tb-shadow]'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className="ml-4 p-4 bg-[--color-tb-red] border-4 border-[--color-tb-shadow] group-hover:scale-110 transition-transform duration-300">
          <div className="text-[--color-tb-bone]">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

