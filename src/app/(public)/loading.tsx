import {
  ResultCardSkeleton,
  ItemListSkeleton,
} from "@/components/skeletons/skeleton-examples";

export default function Loading() {
  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <main className="lg:col-span-3 space-y-6">
            <ResultCardSkeleton />
            <ItemListSkeleton count={3} />
          </main>

          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 space-y-3">
              <div className="h-6 w-3/4 bg-gray-200 rounded-md" />
              <div className="h-10 bg-gray-200 rounded-md" />
              <div className="h-10 bg-gray-200 rounded-md" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
