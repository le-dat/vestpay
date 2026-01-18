interface SwapModeToggleProps {
  activeMode: "Instant" | "Limit";
  onModeChange: (mode: "Instant" | "Limit") => void;
}

export function SwapModeToggle({ activeMode, onModeChange }: SwapModeToggleProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10 w-fit">
      {["Instant", "Limit"].map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode as "Instant" | "Limit")}
          className={`px-5 py-1.5 rounded-full text-[14px] font-black transition-all duration-300 flex items-center gap-2 ${
            activeMode === mode
              ? "bg-[#111827] text-white shadow-xl"
              : "text-[#94a3b8] hover:text-[#111827] hover:bg-gray-100 dark:hover:bg-white/5"
          }`}
        >
          {mode}
          {mode === "Limit" && (
            <span className="text-[9px] py-0.5 px-1.5 bg-[#00d084]/20 text-[#00d084] rounded-full font-black uppercase tracking-wider">
              Soon
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
