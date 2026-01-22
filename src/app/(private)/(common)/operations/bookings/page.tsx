/** @format */

import React from "react";
import BookingsClient from "@/components/list/BookingsClient";
import { getBookingsAction } from "@/actions/private/bookings/actions";

export default async function RentalsPage() {
  const result = await getBookingsAction("rental");
  const initialBookings = result.success ? (result.data || []).map((b: any) => {
    // Handle cases where joins might return an array or object
    const client = Array.isArray(b.client) ? b.client[0] : b.client;
    const vehicle = Array.isArray(b.vehicle) ? b.vehicle[0] : b.vehicle;

    return {
      ...b,
      carName: vehicle ? `${vehicle.brand} ${vehicle.model}` : "Viatura",
      carPlate: vehicle?.license_plate,
      startDate: b.start_time,
      endDate: b.end_time || b.start_time,
      totalAmount: b.total_price || 0,
      created_at: b.created_at,
      userName: client?.full_name || client?.name || "Cliente",
      userEmail: client?.email,
      userPhone: client?.phone,
      partnerName: b.partner?.name || "N/A"
    };
  }) : [];

  return <BookingsClient initialBookings={initialBookings} />;
}
