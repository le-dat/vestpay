const LoadingSkeleton = ({ type }: { type: "lending" | "borrowing" }) => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50/50">
          <td className="py-5 pl-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-100 rounded-md" />
                <div className="h-3 w-24 bg-gray-50 rounded-md" />
              </div>
            </div>
          </td>
          <td className="py-5 text-right">
            <div className="space-y-2 flex flex-col items-end">
              <div className="h-4 w-20 bg-gray-100 rounded-md" />
              <div className="h-3 w-24 bg-gray-50 rounded-md" />
            </div>
          </td>
          <td className="py-5 text-right">
            <div className="space-y-2 flex flex-col items-end">
              <div className="h-4 w-24 bg-gray-100 rounded-md" />
              <div className="h-3 w-28 bg-gray-50 rounded-md" />
            </div>
          </td>
          <td className="py-5 text-right">
            <div className="space-y-2 flex flex-col items-end">
              <div className="h-4 w-24 bg-gray-100 rounded-md" />
              <div className="h-3 w-28 bg-gray-50 rounded-md" />
            </div>
          </td>
          <td className="py-5 text-right">
            <div className="h-4 w-12 bg-gray-100 rounded-md ml-auto" />
          </td>
          <td className="py-5 text-right">
            <div className="h-4 w-12 bg-gray-100 rounded-md ml-auto" />
          </td>
          <td className="py-5 text-right pr-2">
            <div className="flex flex-col sm:flex-row gap-2 justify-end items-end sm:items-center">
              <div className="h-8 w-16 sm:h-9 sm:w-20 bg-gray-100 rounded-xl" />
              <div className="h-8 w-20 sm:h-9 sm:w-24 bg-gray-50 rounded-xl" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default LoadingSkeleton;
