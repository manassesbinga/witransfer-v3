"use server";

import { actionMiddleware } from "@/middlewares/actions/action-factory";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

export async function getRolesAction() {
  return actionMiddleware("getRoles", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/roles", {
      method: "POST",
      body: JSON.stringify({
        role: session.role,
        companyId: session.companyId,
      }),
    });
  }, {});
}
