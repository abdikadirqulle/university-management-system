
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  className?: string;
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = 'text-primary',
  className,
}: StatsCardProps) => {
  return (
    <div className={cn('card-stats', className)}>
      <div className="flex items-center justify-between">
        <h3 className="card-stats-title">{title}</h3>
        <div className={cn('rounded-full p-2', iconColor.replace('text-', 'bg-') + '/10')}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
      <p className="card-stats-value">{value}</p>
      
      {trend && (
        <div 
          className={cn(
            'mt-2 flex items-center text-xs',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}
        >
          <span className="mr-1">
            {trend.isPositive ? '↑' : '↓'}
          </span>
          <span>
            {trend.value}% 
            {trend.isPositive ? ' increase' : ' decrease'}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
