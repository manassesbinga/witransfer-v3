/** @format */

import React from "react";
import ExtrasClient from "@/components/list/ExtrasClient";
import { getExtrasAction } from "@/actions/private/catalog/actions";

import { getCurrentUserAction } from "@/actions/private/auth/actions";

export default async function ExtrasPage() {
    const [res, userRes] = await Promise.all([
        getExtrasAction(),
        getCurrentUserAction()
    ]);
    const initialExtras = res.success && Array.isArray(res.data) ? res.data : [];

    return <ExtrasClient initialExtras={initialExtras} currentUser={userRes.success ? userRes.data : null} />;
}
