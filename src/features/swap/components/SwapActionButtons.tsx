import { BarChart3, RefreshCcw, RotateCw, Sparkles } from "lucide-react";

export function SwapActionButtons() {
  return (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-all">
        <Sparkles className="w-4 h-4" />
        Prime
        <RotateCw className="w-3 h-3" />
      </button>
      <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
        <BarChart3 className="w-5 h-5" />
      </button>
      <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
        <RefreshCcw className="w-4 h-4" />
      </button>
    </div>
  );
}
