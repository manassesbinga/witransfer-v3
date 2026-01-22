/** @format */

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
    return (
        <div className="space-y-6 animate-pulse p-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48 rounded-none" />
                <Skeleton className="h-10 w-40 rounded-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-none" />)}
            </div>
            <Skeleton className="h-[400px] w-full rounded-none" />
        </div>
    );
}
