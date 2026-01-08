import { Skeleton } from "@/components/ui/skeleton";

/**
 * Exemplo: Skeleton para card de resultado
 * Use este como referência para criar seus próprios skeletons
 */
export function ResultCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Image Column */}
        <div className="md:col-span-1">
          <Skeleton className="w-full aspect-square rounded-lg" />
        </div>

        {/* Content Column */}
        <div className="md:col-span-2 space-y-4">
          {/* Title */}
          <Skeleton className="h-6 w-3/4" />

          {/* Description Lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Tags/Badges */}
          <div className="flex gap-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Price Column */}
        <div className="md:col-span-1 flex flex-col justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32 ml-auto" />
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-3 w-20 ml-auto" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Exemplo: Skeleton para tabela
 */
export function TableRowSkeleton() {
  return (
    <div className="border-b border-gray-200 p-4 grid grid-cols-4 gap-4">
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
    </div>
  );
}

/**
 * Exemplo: Skeleton para modal/dialog
 */
export function ModalSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 space-y-4">
      {/* Header */}
      <Skeleton className="h-8 w-3/4" />

      {/* Form Fields */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4 flex-row-reverse">
        <Skeleton className="h-10 w-20 rounded" />
        <Skeleton className="h-10 w-20 rounded" />
      </div>
    </div>
  );
}

/**
 * Exemplo: Skeleton para list/grid
 */
export function ItemListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 space-y-3">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full rounded" />
        </div>
      ))}
    </div>
  );
}
