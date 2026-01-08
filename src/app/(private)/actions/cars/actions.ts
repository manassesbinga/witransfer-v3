"use server";

import { actionMiddleware } from "@/middlewares/actions/action-wrapper";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

export async function getCarsAction() {
  return actionMiddleware("getCars", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/fleet-cars", {
      method: "POST",
      body: JSON.stringify({
        action: "LIST",
        role: session.role,
        companyId: session.companyId,
      }),
    });
  });
}

export async function saveCarAction(data: any) {
  return actionMiddleware("saveCar", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    const result = await apiRequest("/api/admin/fleet-cars", {
      method: "POST",
      body: JSON.stringify({
        action: "SAVE",
        role: session.role,
        companyId: session.companyId,
        data,
      }),
    });

    if (result.error) throw new Error(result.error);
    return result;
  });
}
