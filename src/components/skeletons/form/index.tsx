import { Skeleton } from "@/components/ui/skeleton";

export function SearchFormSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
        {/* De onde */}
        <div className="md:col-span-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded" />
        </div>

        {/* Para onde */}
        <div className="md:col-span-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded" />
        </div>

        {/* Data */}
        <div className="md:col-span-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded" />
        </div>

        {/* Hora */}
        <div className="col-span-1 space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-10 w-full rounded" />
        </div>

        {/* Passageiros */}
        <div className="col-span-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded" />
        </div>

        {/* Luggage */}
        <div className="hidden md:block space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-10 w-full rounded" />
        </div>

        {/* Botão */}
        <div className="col-span-2 md:col-span-1 flex items-end">
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
