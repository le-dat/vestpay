import { AnimatePresence, motion } from "framer-motion";

interface ActivityTableErrorProps {
  error: string | null;
}

export default function ActivityTableError({ error }: ActivityTableErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <p className="text-sm text-rose-700 font-bold">
            Failed to load transactions: {error}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
