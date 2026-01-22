/** @format */

"use client";

import { useRouter, usePathname } from "next/navigation";
import VehicleRegistrationForm from "@/components/form/vehicles";

interface CreateVehicleWrapperProps {
    partners: any[];
    categories: any[];
    features: any[];
    services: any[];
    currentUser: any;
}

export default function CreateVehicleWrapper({
    partners,
    categories,
    features,
    services,
    currentUser,
}: CreateVehicleWrapperProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleSuccess = () => {
        // Go back to the list (parent directory)
        // pathname is usually .../fleet/vehicles/new
        const listPath = pathname.split("/").slice(0, -1).join("/") || "/fleet/vehicles";
        router.push(listPath);
        router.refresh();
    };

    return (
        <VehicleRegistrationForm
            isEdit={false}
            onSuccess={handleSuccess}
            partners={partners}
            categories={categories}
            features={features}
            services={services}
            currentUser={currentUser}
        />
    );
}
