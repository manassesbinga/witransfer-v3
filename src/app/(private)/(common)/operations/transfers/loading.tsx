import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-64 rounded-none" />
                <Skeleton className="h-10 w-40 rounded-none" />
            </div>
            <div className="bg-white border border-slate-100 p-6 h-[500px] rounded-none space-y-4 shadow-sm">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-20 w-full rounded-none" />
                ))}
            </div>
        </div>
    );
}

