interface SwapModeToggleProps {
  activeMode: "Instant" | "Limit";
  onModeChange: (mode: "Instant" | "Limit") => void;
}

export function SwapModeToggle({ activeMode, onModeChange }: SwapModeToggleProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/5 backdrop-blur-md">
      {["Instant", "Limit"].map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode as "Instant" | "Limit")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            activeMode === mode
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {mode}
          {mode === "Limit" && (
            <span className="text-[10px] py-0.5 px-1.5 bg-primary/20 text-primary rounded font-bold uppercase tracking-wider">
              Beta
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
