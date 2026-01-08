"use server";

import { actionMiddleware } from "@/middlewares/actions/action-wrapper";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

export async function getCategoriesAction() {
  return actionMiddleware("getCategories", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-categories", {
      method: "POST",
      body: JSON.stringify({ action: "LIST", role: session.role }),
    });
  });
}

export async function getExtrasAction() {
  return actionMiddleware("getExtras", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-extras", {
      method: "POST",
      body: JSON.stringify({ action: "LIST", role: session.role }),
    });
  });
}
