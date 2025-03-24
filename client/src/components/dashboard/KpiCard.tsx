import { ArrowDown, ArrowUp } from "lucide-react";
import { KpiData } from "@shared/types";
import { cn } from "@/lib/utils";

interface KpiCardProps extends Omit<KpiData, 'icon'> {
  icon: React.ReactNode;
}

const KpiCard = ({
  title,
  value,
  change,
  changeText,
  icon,
  iconBgClass,
  iconColorClass
}: KpiCardProps) => {
  const isPositiveChange = change >= 0;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{value}</p>
        </div>
        <div className={cn("p-3 rounded-full", iconBgClass)}>
          <div className={cn("w-6 h-6", iconColorClass)}>{icon}</div>
        </div>
      </div>
      <div className="flex items-center mt-4">
        <span
          className={cn(
            "text-sm font-semibold flex items-center",
            isPositiveChange ? "text-green-500" : "text-red-500"
          )}
        >
          {isPositiveChange ? (
            <ArrowUp className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDown className="w-4 h-4 mr-1" />
          )}
          {Math.abs(change).toFixed(1)}%
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">{changeText}</span>
      </div>
    </div>
  );
};

export default KpiCard;
