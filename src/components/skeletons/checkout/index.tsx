import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-32">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Skeleton className="h-8 w-12 rounded" />
            <Skeleton className="h-1 w-[1px] bg-gray-200 hidden md:block" />
            <div className="hidden md:block flex-1">
              <Skeleton className="h-6 w-64" />
            </div>
          </div>
          <Skeleton className="h-8 w-48 rounded" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* User Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="h-9 w-28 rounded-full flex-shrink-0" />
              </div>
            </div>

            {/* Payment Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 border border-gray-200 rounded-lg space-y-2"
                  >
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:sticky lg:top-4 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Skeleton className="h-6 w-40 mb-6" />

              {/* Dates */}
              <div className="flex gap-4 mb-6 border-b border-gray-100 pb-6">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-4 w-4" />
                <div className="flex flex-col gap-1 text-right flex-1">
                  <Skeleton className="h-3 w-16 ml-auto" />
                  <Skeleton className="h-5 w-24 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>

              {/* Car Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-end pt-2 mb-8">
                <Skeleton className="h-6 w-16" />
                <div className="space-y-1">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>

              {/* Button */}
              <Skeleton className="h-14 w-full rounded-lg" />

              {/* Footer text */}
              <Skeleton className="h-3 w-48 mx-auto mt-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
