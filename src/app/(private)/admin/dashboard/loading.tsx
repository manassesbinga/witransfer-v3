import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64 rounded-none" />
                    <Skeleton className="h-5 w-80 rounded-none" />
                </div>
                <Skeleton className="h-11 w-40 rounded-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-slate-200/60 p-6 rounded-none h-[140px] space-y-4">
                        <Skeleton className="w-11 h-11 rounded-none" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200/60 p-4 rounded-none h-16">
                <Skeleton className="h-8 w-full rounded-none" />
            </div>

            <div className="bg-white border border-slate-200/60 rounded-none h-[400px]">
                <div className="p-6 border-b border-slate-100 flex gap-4">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 flex-1" />)}
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            </div>
        </div>
    );
}
