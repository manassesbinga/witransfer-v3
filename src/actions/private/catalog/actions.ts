"use server";

import { actionMiddleware } from "@/middlewares/actions/action-factory";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

export async function getCategoriesAction(page: number = 1, limit: number = 50) {
  return actionMiddleware("getCategories", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    const res = await apiRequest("/api/admin/listing-categories", {
      method: "POST",
      body: JSON.stringify({ action: "LIST", role: session.role, partnerId: session.partnerId, data: { page, limit } }),
      cache: "no-store",
      next: { tags: ["classes"] } as any,
    });
    console.log("SERVER DEBUG: getCategoriesAction - Total items:", Array.isArray(res) ? res.length : "not an array");
    return res;
  }, { page, limit });
}

export async function saveCategoryAction(data: any) {
  return actionMiddleware("saveCategory", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-categories", {
      method: "POST",
      body: JSON.stringify({ action: "SAVE", role: session.role, partnerId: session.partnerId, data }),
    });
  }, data);
}

export async function deleteCategoryAction(id: string) {
  return actionMiddleware("deleteCategory", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-categories", {
      method: "POST",
      body: JSON.stringify({ action: "DELETE", role: session.role, partnerId: session.partnerId, data: { id } }),
    });
  }, { id });
}

export async function getExtrasAction(page: number = 1, limit: number = 50) {
  return actionMiddleware("getExtras", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    const res = await apiRequest("/api/admin/listing-extras", {
      method: "POST",
      body: JSON.stringify({ action: "LIST", role: session.role, partnerId: session.partnerId, data: { page, limit } }),
      cache: "no-store",
      next: { tags: ["extras"] } as any,
    });
    console.log("SERVER DEBUG: getExtrasAction - Total items:", Array.isArray(res) ? res.length : "not an array");
    return res;
  }, { page, limit });
}

export async function saveExtraAction(data: any) {
  return actionMiddleware("saveExtra", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-extras", {
      method: "POST",
      body: JSON.stringify({ action: "SAVE", role: session.role, partnerId: session.partnerId, data }),
    });
  }, data);
}

export async function deleteExtraAction(id: string) {
  return actionMiddleware("deleteExtra", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-extras", {
      method: "POST",
      body: JSON.stringify({ action: "DELETE", role: session.role, partnerId: session.partnerId, data: { id } }),
    });
  }, { id });
}

export async function getServiceCategoriesAction(page: number = 1, limit: number = 50) {
  return actionMiddleware("getServiceCategories", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    const res = await apiRequest("/api/admin/listing-service-categories", {
      method: "POST",
      body: JSON.stringify({ action: "LIST", role: session.role, partnerId: session.partnerId, data: { page, limit } }),
      cache: "no-store",
      next: { tags: ["services"] } as any,
    });
    console.log("SERVER DEBUG: getServiceCategoriesAction - Total items:", Array.isArray(res) ? res.length : "not an array");
    return res;
  }, { page, limit });
}

export async function saveServiceCategoryAction(data: any) {
  return actionMiddleware("saveServiceCategory", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-service-categories", {
      method: "POST",
      body: JSON.stringify({ action: "SAVE", role: session.role, partnerId: session.partnerId, data }),
    });
  }, data);
}

export async function deleteServiceCategoryAction(id: string) {
  return actionMiddleware("deleteServiceCategory", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-service-categories", {
      method: "POST",
      body: JSON.stringify({ action: "DELETE", role: session.role, partnerId: session.partnerId, data: { id } }),
    });
  }, { id });
}

export async function getClassPricesAction(classId: string) {
  return actionMiddleware("getClassPrices", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-prices", {
      method: "POST",
      body: JSON.stringify({ action: "LIST_BY_CLASS", role: session.role, data: { classId, partnerId: session.partnerId } }),
    });
  }, { classId });
}

export async function saveClassPricesAction(classId: string, prices: any[]) {
  return actionMiddleware("saveClassPrices", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/listing-prices", {
      method: "POST",
      body: JSON.stringify({
        action: "SAVE_BATCH",
        role: session.role,
        data: {
          classId,
          prices,
          partnerId: session.partnerId
        }
      }),
    });
  }, { classId, prices });
}
