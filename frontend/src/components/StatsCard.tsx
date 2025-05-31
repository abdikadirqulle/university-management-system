import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  bgColor?: string;
  className?: string;
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-primary",
  bgColor,
  className,
}: StatsCardProps) => {
  return (
    <div className={cn("card-stats", bgColor, className)}>
      <div className="flex items-center justify-between">
        <h3 className="card-stats-title text-white text-xl">{title}</h3>
        <div className={cn("rounded-full p-2 text-black")}>
          <Icon className={cn("h-6 w-6 ")} />
        </div>
      </div>
      <p className="card-stats-value text-white text-3xl">{value}</p>
    </div>
  );
};

export default StatsCard;
