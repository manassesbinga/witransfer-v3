"use server";

import { actionMiddleware } from "@/middlewares/actions/action-factory";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

export async function getDashboardStatsAction() {
  const session = await getAdminSessionInternal();
  return actionMiddleware("getDashboardStats", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/stats", {
      method: "POST",
      body: JSON.stringify({
        role: session.role,
        partnerId: session.partnerId,
      }),
      next: { tags: ["dashboard-stats", `stats-partner-${session.partnerId}`] }
    });
  }, {});
}
