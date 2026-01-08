import { Skeleton } from "@/components/ui/skeleton";

export function SearchHeroSkeleton() {
  return (
    <section className="relative min-h-[550px] md:min-h-[600px] flex items-start justify-center pt-32 md:pt-40 pb-16 md:pb-20 overflow-hidden bg-gradient-to-b from-[#003580] via-[#1a73e8] to-[#42a5f5]">
      <div className="container mx-auto px-4 relative z-10 text-white w-full">
        <div className="max-w-6xl mx-auto">
          {/* Título */}
          <div className="mb-8 space-y-2">
            <Skeleton className="h-10 w-3/4 bg-blue-300" />
            <Skeleton className="h-10 w-2/3 bg-blue-300" />
          </div>

          {/* Formulário */}
          <div className="w-full my-[10px] relative z-20">
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-12 bg-gray-300" />
                    <Skeleton className="h-10 w-full rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
