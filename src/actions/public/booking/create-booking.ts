"use server";

import { revalidatePath } from "next/cache";
import { createPublicAction } from "@/middlewares/actions/action-factory";
import type { Booking } from "@/types";

export async function createBooking(data: Partial<Booking>) {
  return createPublicAction(
    "CreateBooking",
    async (bookingData: Partial<Booking>) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar reserva");
      }

      const result = await response.json();
      revalidatePath("/admin/bookings");

      return {
        data: result.booking,
        message: "Reserva criada com sucesso!",
      };
    },
    data,
  );
}
