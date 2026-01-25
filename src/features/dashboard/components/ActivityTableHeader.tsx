import { RefreshCw } from "lucide-react";

interface ActivityTableHeaderProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function ActivityTableHeader({
  loading,
  refreshing,
  onRefresh
}: ActivityTableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-4">
      <h3 className="text-lg font-medium text-secondary tracking-tight">Recent Activity</h3>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="p-2 hover:bg-gray-50 active:scale-95 rounded-2xl transition-all disabled:opacity-50 border border-gray-100 hover:border-gray-200"
          title="Refresh transactions"
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-400 ${
              refreshing || loading ? "animate-spin text-primary" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
