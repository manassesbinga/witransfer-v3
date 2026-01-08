"use server";

import { actionMiddleware } from "@/middlewares/actions/action-wrapper";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

export async function getDashboardStatsAction() {
  return actionMiddleware("getDashboardStats", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/stats", {
      method: "POST",
      body: JSON.stringify({
        role: session.role,
        companyId: session.companyId,
      }),
    });
  });
}
