"use server";

import { actionMiddleware } from "@/middlewares/actions/action-wrapper";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

/**
 * Recupera a lista de solicitações (Aluguer ou Transfer)
 */
export async function getBookingsAction(type?: "rental" | "transfer") {
  return actionMiddleware("getBookings", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-bookings", {
      method: "POST",
      body: JSON.stringify({
        action: "LIST",
        role: session.role,
        companyId: session.companyId,
        data: { type },
      }),
    });
  });
}

export type BookingFilter = {
  type?: "rental" | "transfer";
  status?: string;
  carId?: string;
  driverId?: string;
};

export async function getFilteredBookingsAction(filters: BookingFilter) {
  return actionMiddleware("getFilteredBookings", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-bookings", {
      method: "POST",
      body: JSON.stringify({
        action: "LIST",
        role: session.role,
        companyId: session.companyId,
        data: filters,
      }),
    });
  });
}

/**
 * Atualiza o status de um pedido (Confirmar, Cancelar, etc)
 */
export async function updateBookingStatusAction(id: string, status: string) {
  return actionMiddleware("updateBookingStatus", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-bookings", {
      method: "POST",
      body: JSON.stringify({
        action: "UPDATE_STATUS",
        role: session.role,
        companyId: session.companyId,
        data: { id, status },
      }),
    });
  });
}

export async function cancelBookingAction(id: string) {
  return updateBookingStatusAction(id, "canceled");
}
