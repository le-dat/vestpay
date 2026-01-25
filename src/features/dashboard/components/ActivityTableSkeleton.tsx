export default function ActivityTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-50 border border-gray-100 rounded-2xl p-4 animate-pulse"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-5 w-28 bg-gray-200 rounded ml-auto" />
              <div className="h-3 w-20 bg-gray-100 rounded ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
