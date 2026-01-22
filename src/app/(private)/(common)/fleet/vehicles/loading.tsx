import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 rounded-none" />
                    <Skeleton className="h-4 w-96 rounded-none" />
                </div>
                <Skeleton className="h-10 w-32 rounded-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-[120px] rounded-none w-full shadow-sm bg-white" />
                ))}
            </div>
            <div className="bg-white border border-slate-100 p-6 h-[500px] rounded-none space-y-4 shadow-sm">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-16 w-full rounded-none" />
                ))}
            </div>
        </div>
    );
}
