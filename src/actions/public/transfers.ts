"use server";

import { revalidatePath } from "next/cache";
import { createPublicAction } from "@/middlewares/actions/action-factory";

export async function createTransfer(data: any) {
  return createPublicAction(
    "CreateTransfer",
    async (transferData: any) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/transfers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transferData),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar viagem");
      }

      const result = await response.json();
      revalidatePath("/admin/transfers");

      return {
        data: result.transfer,
        userCreated: result.userCreated,
        message: result.message,
      };
    },
    data,
  );
}

export async function getTransfers(userId?: string) {
  return createPublicAction(
    "GetTransfers",
    async (id?: string) => {
      const url = id
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/transfers?userId=${id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/transfers`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar viagens");
      }

      const result = await response.json();

      return result.transfers;
    },
    userId,
  );
}
