import { ArrowDown } from "lucide-react";

interface SwapButtonProps {
  onClick?: () => void;
}

export function SwapButton({ onClick }: SwapButtonProps) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
      <button
        onClick={onClick}
        className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border-4 border-white dark:border-gray-950 text-gray-400 hover:text-white hover:bg-primary transition-all shadow-lg group"
      >
        <ArrowDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
