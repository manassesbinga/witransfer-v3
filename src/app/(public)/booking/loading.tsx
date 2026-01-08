import { Skeleton } from "@/components/ui/skeleton";
import {
  ResultCardSkeleton,
  ItemListSkeleton,
} from "@/components/skeletons/skeleton-examples";

export default function Loading() {
  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="mb-8">
          <div className="h-8 w-1/3 bg-gray-200 rounded-md" />
        </header>

        <div className="space-y-6">
          <ResultCardSkeleton />
          <ItemListSkeleton count={2} />
        </div>
      </div>
    </div>
  );
}
