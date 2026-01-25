import { ArrowRight, RefreshCw } from "lucide-react";

interface ActivityTableFooterProps {
  transactionCount: number;
  hasNextPage: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export default function ActivityTableFooter({
  transactionCount,
  hasNextPage,
  loadingMore,
  onLoadMore
}: ActivityTableFooterProps) {
  if (!hasNextPage && transactionCount <= 5) return null;

  return (
    <div className="mt-10 flex items-center justify-between pt-8 border-t border-gray-50">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Showing {transactionCount} transactions
      </p>
      {hasNextPage && (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="group flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-gray-800 rounded-2xl text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-50"
        >
          {loadingMore ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Load More</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
