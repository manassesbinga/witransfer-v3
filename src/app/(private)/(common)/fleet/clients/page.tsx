/** @format */

import React from "react";
import ClientsClient from "@/components/list/ClientsClient";
import { getClientsAction } from "@/actions/private/clients/actions";
import { getCurrentUserAction } from "@/actions/private/auth/actions";

export default async function ClientsPage() {
    const [clientsRes, userRes] = await Promise.all([
        getClientsAction(),
        getCurrentUserAction()
    ]);

    const initialClients = clientsRes.success ? (clientsRes.data || []) : [];
    const user = userRes.success ? userRes.data : null;

    return <ClientsClient initialClients={initialClients} userRole={user?.role} />;
}

