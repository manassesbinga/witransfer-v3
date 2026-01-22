/** @format */

import React from "react";
import ServicesClient from "@/components/list/ServicesClient";
import { getServiceCategoriesAction } from "@/actions/private/catalog/actions";

export default async function ServicesPage() {
    const res = await getServiceCategoriesAction();
    const initialServices = res.success && Array.isArray(res.data) ? res.data : [];

    return <ServicesClient initialServices={initialServices} />;
}
