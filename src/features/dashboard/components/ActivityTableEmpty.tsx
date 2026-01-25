import { motion } from "framer-motion";
import { History } from "lucide-react";

export default function ActivityTableEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-16 text-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="p-5 bg-gray-50 rounded-full border-2 border-gray-100">
          <History className="w-8 h-8 text-gray-300" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-secondary">No Activity Yet</p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Your transaction history will appear here once you start using your wallet.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
