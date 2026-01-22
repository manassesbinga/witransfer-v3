/** @format */

import React from "react";
import ClassesClient from "@/components/list/ClassesClient";
import { getCategoriesAction } from "@/actions/private/catalog/actions";

export default async function ClassesPage() {
    const res = await getCategoriesAction();
    const initialClasses = res.success && Array.isArray(res.data) ? res.data : [];

    return <ClassesClient initialClasses={initialClasses} />;
}
