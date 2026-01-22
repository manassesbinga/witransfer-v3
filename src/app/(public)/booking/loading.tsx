import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50/50 flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-4 w-full max-w-3xl px-4">
        <div className="w-full bg-white p-4 rounded-none border border-gray-100">
          <Skeleton className="h-4 rounded-none w-1/3 mb-3 bg-slate-100" aria-hidden />
          <Skeleton className="h-3 rounded-none w-2/3 mb-2 bg-slate-100" aria-hidden />
          <Skeleton className="h-36 rounded-none w-full mb-3 bg-slate-100" aria-hidden />
          <Skeleton className="h-8 rounded-none w-full bg-slate-100" aria-hidden />
        </div>
        <p className="text-xs font-medium text-slate-500">
          Preparando detalhes da reserva...
        </p>
      </div>
    </div>
  );
}
