"use client";

import { motion } from "framer-motion";

interface SwapModeToggleProps {
  activeMode: "Instant" | "Limit";
  onModeChange: (mode: "Instant" | "Limit") => void;
}

export function SwapModeToggle({ activeMode, onModeChange }: SwapModeToggleProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-50/50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10 w-fit backdrop-blur-sm shadow-sm relative overflow-hidden">
      {["Instant", "Limit"].map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode as "Instant" | "Limit")}
          className={`relative px-6 py-2 rounded-full text-[13px] font-black transition-all duration-300 flex items-center gap-2 z-10 ${
            activeMode === mode
              ? "text-white"
              : "text-[#94a3b8] hover:text-[#111827] dark:hover:text-white"
          }`}
        >
          {activeMode === mode && (
            <motion.div
              layoutId="active-toggle"
              className="absolute inset-0 bg-[#111827] rounded-full shadow-lg -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {mode}
          {mode === "Limit" && (
            <span
              className={`text-[8px] py-0.5 px-1.5 rounded-full font-black uppercase tracking-wider transition-colors duration-300 ${
                activeMode === mode
                  ? "bg-[#00d084]/20 text-[#00d084]"
                  : "bg-gray-200 dark:bg-white/10 text-[#94a3b8]"
              }`}
            >
              Soon
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
