/** @format */

"use client";

import { useRouter, usePathname } from "next/navigation";
import VehicleRegistrationForm from "@/components/form/vehicles";
import { VehicleFormData } from "@/types";

interface EditVehicleWrapperProps {
    vehicleId: string;
    initialData: VehicleFormData;
    partners: any[];
    categories: any[];
    features: any[];
    services: any[];
    currentUser: any;
}

export default function EditVehicleWrapper({
    vehicleId,
    initialData,
    partners,
    categories,
    features,
    services,
    currentUser,
}: EditVehicleWrapperProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleSuccess = () => {
        // Attempt to derive the list path from the current edit path
        const listPath = pathname.split("/").slice(0, -2).join("/") || "/admin/fleet/vehicles";
        router.push(listPath);
        router.refresh();
    };

    return (
        <VehicleRegistrationForm
            isEdit={true}
            vehicleId={vehicleId}
            initialData={initialData}
            onSuccess={handleSuccess}
            partners={partners}
            categories={categories}
            features={features}
            services={services}
            currentUser={currentUser}
        />
    );
}
