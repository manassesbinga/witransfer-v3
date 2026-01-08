import { Skeleton } from "@/components/ui/skeleton";

export function CarResultsSkeleton() {
  return (
    <div className="flex-1">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Imagem */}
              <div className="md:col-span-1">
                <Skeleton className="w-full aspect-video rounded-lg" />
              </div>

              {/* Detalhes */}
              <div className="md:col-span-2 space-y-3">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2 pt-2">
                  {[1, 2, 3].map((badge) => (
                    <Skeleton key={badge} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Preço e botão */}
              <div className="md:col-span-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-32 ml-auto" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
