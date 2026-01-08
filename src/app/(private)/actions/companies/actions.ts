"use server";

import { actionMiddleware } from "@/middlewares/actions/action-wrapper";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

export async function getCompaniesAction() {
  return actionMiddleware("getCompanies", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-companies", {
      method: "POST",
      body: JSON.stringify({ action: "LIST", role: session.role }),
    });
  });
}

export async function saveCompanyAction(data: any) {
  return actionMiddleware("saveCompany", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    const result = await apiRequest("/api/admin/listing-companies", {
      method: "POST",
      body: JSON.stringify({ action: "SAVE", role: session.role, data }),
    });

    if (result.error) throw new Error(result.error);
    return result;
  });
}
