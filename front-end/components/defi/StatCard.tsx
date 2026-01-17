import { Info } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  showInfo?: boolean;
  valueClassName?: string;
}

export const StatCard = ({
  label,
  value,
  unit,
  showInfo = false,
  valueClassName = "text-gray-900",
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        {label}
        {showInfo && <Info className="w-4 h-4" />}
      </div>
      <div className={`text-4xl font-bold ${valueClassName}`}>
        {value} {unit && <span className="text-base text-gray-500 font-normal">{unit}</span>}
      </div>
    </div>
  );
};
