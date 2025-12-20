import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
}

export function FeatureCard({ icon, title, description, iconBgColor = 'bg-tb-navy' }: FeatureCardProps) {
  return (
    <div className="group relative bg-tb-bone p-6 sm:p-8 lg:p-10 border-4 border-tb-shadow shadow-[8px_8px_0_0_rgba(62,62,62,1)] hover:shadow-[12px_12px_0_0_rgba(62,62,62,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 ease-out">
      <div className="flex flex-col items-center text-center space-y-5 sm:space-y-6">
        {/* Enhanced Icon with animation */}
        <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center border-4 border-tb-shadow ${iconBgColor} group-hover:scale-110 transition-transform duration-300`}>
          <div className="scale-125">
            {icon}
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-black uppercase text-tb-ink tracking-wide group-hover:text-tb-red transition-colors duration-300">
          {title}
        </h3>

        <p className="text-sm sm:text-base lg:text-lg font-sans text-tb-shadow font-medium leading-relaxed max-w-xs">
          {description}
        </p>
      </div>
    </div>
  );
}


