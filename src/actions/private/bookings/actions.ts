"use server";

import { actionMiddleware } from "@/middlewares/actions/action-factory";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";
import { supabaseAdmin } from "@/lib/supabase";
import type { BookingFilter } from "@/types";

/**
 * Recupera a lista de solicitações (Aluguer ou Transfer)
 */
export async function getBookingsAction(type?: "rental" | "transfer", page: number = 1, limit: number = 50) {
  const session = await getAdminSessionInternal();
  const { unstable_noStore: noStore } = await import("next/cache");
  noStore();

  return actionMiddleware("getBookings", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-bookings", {
      method: "POST",
      body: JSON.stringify({
        action: "LIST",
        role: session.role,
        partnerId: session.partnerId,
        data: { type, page, limit },
      }),
      next: { tags: ["bookings", `bookings-${type || "all"}`, `bookings-partner-${session.partnerId}`] }
    });
  }, { type, page, limit });
}


export async function getFilteredBookingsAction(filters: BookingFilter & { page?: number; limit?: number }) {
  const session = await getAdminSessionInternal();
  const { unstable_noStore: noStore } = await import("next/cache");
  noStore();

  return actionMiddleware("getFilteredBookings", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-bookings", {
      method: "POST",
      body: JSON.stringify({
        action: "LIST",
        role: session.role,
        partnerId: session.partnerId,
        data: filters,
      }),
      next: { tags: ["bookings", `bookings-partner-${session.partnerId}`] }
    });
  }, filters);
}
/**
 * Atualiza o status de um pedido (Confirmar, Cancelar, etc)
 */
export async function updateBookingStatusAction(id: string, status: string) {
  const session = await getAdminSessionInternal();
  return actionMiddleware("updateBookingStatus", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-bookings", {
      method: "POST",
      body: JSON.stringify({
        action: "UPDATE_STATUS",
        role: session.role,
        partnerId: session.partnerId,
        data: { id, status },
      }),
    });
  }, { id, status }, { revalidateTags: ["bookings", `bookings-partner-${session?.partnerId}`, "dashboard-stats"] });
}
/**
 * Cancelar booking com tentativa de reatribuição automática
 */
export async function cancelAndReassignBookingAction(id: string, reason: string = "admin_cancel") {
  const session = await getAdminSessionInternal();
  return actionMiddleware("cancelAndReassignBooking", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-bookings", {
      method: "POST",
      body: JSON.stringify({
        action: "CANCEL_WITH_REASSIGN",
        role: session.role,
        partnerId: session.partnerId,
        data: { id, reason },
      }),
      next: { tags: [`booking-${id}`] }
    });
  }, { id, reason }, { revalidateTags: ["bookings", `bookings-partner-${session?.partnerId}`, "dashboard-stats"] });
}

export async function cancelBookingAdminAction(id: string) {
  return updateBookingStatusAction(id, "canceled");
}

/**
 * Recupera detalhes completos de um booking com todas as informações relacionadas
 */
export async function getBookingDetailsAction(id: string) {
  const session = await getAdminSessionInternal();
  return actionMiddleware("getBookingDetails", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-bookings", {
      method: "POST",
      body: JSON.stringify({
        action: "GET_DETAILS",
        role: session.role,
        partnerId: session.partnerId,
        data: { id },
      }),
      next: { tags: [`booking-${id}`] }
    });
  }, id);
}


/**
 * Process booking waitlist to attempt reassignments
 */
export async function processBookingWaitlistAction() {
  const session = await getAdminSessionInternal();
  return actionMiddleware("processBookingWaitlist", async () => {
    if (!session) throw new Error("Não autorizado");
    const isAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(session.role as string);
    if (!isAdmin) throw new Error("Apenas admins podem processar a lista de espera");

    return await apiRequest("/api/admin/process-waitlist", {
      method: "POST",
      body: JSON.stringify({}),
    });
  }, {}); // Added empty input to fix lint
}

/**
 * Gets available vehicles for a specific partner (used in manual reassignment)
 */
export async function getAvailableVehiclesAction(partnerId: string) {
  const session = await getAdminSessionInternal();
  return actionMiddleware("getAvailableVehicles", async () => {
    if (!session) throw new Error("Não autorizado");

    const { data, error } = await supabaseAdmin
      .from("vehicles")
      .select("*")
      .eq("partner_id", partnerId);

    if (error) throw error;
    return data;
  }, partnerId);
}

/**
 * Gets active drivers for a specific partner (used in manual reassignment)
 */
export async function getAvailableDriversAction(partnerId: string) {
  const session = await getAdminSessionInternal();
  return actionMiddleware("getAvailableDrivers", async () => {
    if (!session) throw new Error("Não autorizado");

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("partner_id", partnerId)
      .eq("role", "DRIVER")
      .eq("is_active", true);

    if (error) throw error;
    return data;
  }, partnerId);
}

export async function assignBookingManuallyAction(id: string, data: { partnerId: string, vehicleId: string, driverId?: string }) {
  const session = await getAdminSessionInternal();
  return actionMiddleware("assignBookingManually", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-bookings", {
      method: "POST",
      body: JSON.stringify({
        action: "MANUAL_ASSIGN",
        role: session.role,
        partnerId: session.partnerId,
        data: { id, ...data },
      }),
    });
  }, { id, ...data }, { revalidateTags: ["bookings", `booking-${id}`, "dashboard-stats"] });
}

export async function createBookingAdminAction(data: any) {
  const session = await getAdminSessionInternal();
  return actionMiddleware("createBooking", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-bookings", {
      method: "POST",
      body: JSON.stringify({
        action: "Create",
        role: session.role,
        partnerId: session.partnerId,
        data,
      }),
    });
  }, data, { revalidateTags: ["bookings", `bookings-partner-${session?.partnerId}`, "dashboard-stats"] });
}
