import { Skeleton } from "@/components/ui/skeleton";

export default function CarDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="h-6 w-1/2 bg-gray-200 rounded-md mb-3" />
          <div className="h-10 w-3/4 bg-gray-200 rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex gap-8">
                <div className="w-[280px]">
                  <Skeleton className="w-full h-48 rounded-lg" />
                </div>
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/4" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-10 w-full rounded-md mb-2" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="bg-[#f0fff1] border border-[#008009] p-4 rounded-lg">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
