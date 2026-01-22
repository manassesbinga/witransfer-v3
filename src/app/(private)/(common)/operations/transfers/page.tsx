/** @format */

import React from "react";
import TransfersClient from "@/components/list/TransfersClient";
import { getBookingsAction } from "@/actions/private/bookings/actions";

export default async function TransfersPage() {
  const result = await getBookingsAction("transfer");
  const initialTransfers = result.success ? (result.data || []).map((b: any) => {
    // Handle cases where joins might return an array or object
    const client = Array.isArray(b.client) ? b.client[0] : b.client;

    return {
      ...b,
      pickupLocation: b.pickup_address || "N/A",
      dropoffLocation: b.dropoff_address || "N/A",
      totalAmount: b.total_price || 0,
      created_at: b.created_at,
      userName: client?.full_name || client?.name || "Cliente",
      userEmail: client?.email,
      userPhone: client?.phone,
      partnerName: b.partner?.name || "N/A"
    };
  }) : [];

  return <TransfersClient initialTransfers={initialTransfers} />;
}
