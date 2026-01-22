"use server";

import { actionMiddleware } from "@/middlewares/actions/action-factory";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

export async function getUsersAction() {
  return actionMiddleware("getUsers", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        action: "LIST",
        role: session.role,
        companyId: session.companyId,
      }),
    });
  }, {});
}

export async function saveUserAction(data: any) {
  return actionMiddleware("saveUser", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    const result = await apiRequest("/api/admin/users", {
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
  }, data);
}
