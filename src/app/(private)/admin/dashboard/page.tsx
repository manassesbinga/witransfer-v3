/** @format */

import React from "react";
import PartnersClient from "@/components/list/PartnersClient";
import {
    getPendingPartnersAction,
    getPartnersAction
} from "@/actions/private/partners/actions";
import { getDashboardStatsAction } from "@/actions/private/stats/actions";

export default async function PartnersPage() {
    // Parallel fetching for better performance
    const [partnersRes, pendingRes, statsRes] = await Promise.all([
        getPartnersAction(),
        getPendingPartnersAction(),
        getDashboardStatsAction()
    ]);

    const initialPartners = partnersRes.success ? (partnersRes.data || []) : [];
    const initialPendingRequests = pendingRes.success ? (pendingRes.data || []) : [];
    const initialStats = statsRes.success ? statsRes.data : null;

    return (
        <PartnersClient
            initialPartners={initialPartners}
            initialPendingRequests={initialPendingRequests}
            initialStats={initialStats}
        />
    );
}
