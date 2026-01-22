/** @format */

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClassesLoading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64 rounded-none" />
                    <Skeleton className="h-4 w-96 rounded-none" />
                </div>
                <Skeleton className="h-12 w-40 rounded-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-[250px] rounded-none w-full" />
                ))}
            </div>
        </div>
    );
}
