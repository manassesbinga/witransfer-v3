/** @format */

import React from "react";
import { getCarAction } from "@/actions/private/cars/actions";
import { getPartnersAction } from "@/actions/private/partners/actions";
import { getCategoriesAction, getExtrasAction, getServiceCategoriesAction } from "@/actions/private/catalog/actions";
import { getCurrentUserAction } from "@/actions/private/auth/actions";
import { redirect } from "next/navigation";
import EditVehicleWrapper from "@/components/form/edit-vehicle-wrapper";
import { VehicleFormData } from "@/types";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Parallel data fetching on the server to prevent waterfall and client-side loops
    const [
        carRes,
        partnersRes,
        categoriesRes,
        extrasRes,
        userRes,
        servicesRes
    ] = await Promise.all([
        getCarAction(id),
        getPartnersAction(),
        getCategoriesAction(),
        getExtrasAction(),
        getCurrentUserAction(),
        getServiceCategoriesAction()
    ]);

    // If car load fails, redirect back
    if (!carRes || !carRes.success || !carRes.data) {
        redirect("/admin/fleet/vehicles");
    }

    // Process data for the form
    const rawExtras = (extrasRes.success && extrasRes.data) ? extrasRes.data : [];
    const features = rawExtras.filter((e: any) =>
        e.type === 'vehicle_feature' || e.type === 'service_extra' || !e.type
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <EditVehicleWrapper
                vehicleId={id}
                initialData={carRes.data as VehicleFormData}
                partners={partnersRes.success && partnersRes.data ? partnersRes.data : []}
                categories={categoriesRes.success && categoriesRes.data ? categoriesRes.data : []}
                features={features}
                currentUser={userRes.success ? userRes.data : null}
                services={servicesRes.success && servicesRes.data ? servicesRes.data : []}
            />
        </div>
    );
}
