import { Skeleton } from "@/components/ui/skeleton";

export function FilterSidebarSkeleton() {
  return (
    <aside className="w-full lg:w-60 flex-shrink-0 hidden lg:flex lg:sticky lg:top-[20px] h-fit max-h-[calc(100vh-40px)] flex-col">
      <div className="bg-white rounded-[4px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>

        {/* Filter Sections */}
        <div className="divide-y divide-gray-100 overflow-y-auto no-scrollbar">
          {[1, 2, 3, 4, 5].map((section) => (
            <div key={section} className="p-3 space-y-3">
              {/* Section Title */}
              <Skeleton className="h-4 w-32" />

              {/* Filter Items */}
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                    <Skeleton className="h-3 w-6" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
