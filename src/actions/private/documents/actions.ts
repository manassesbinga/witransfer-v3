"use server";

import { actionMiddleware } from "@/middlewares/actions/action-factory";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

/**
 * Get pending document verifications
 */
export async function getPendingDocumentsAction() {
  const session = await getAdminSessionInternal();
  return actionMiddleware("getPendingDocuments", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/document-verifications", {
      method: "POST",
      body: JSON.stringify({
        action: "LIST_PENDING",
        role: session.role,
        data: {},
      }),
      next: { tags: ["documents", "documents-pending"] }
    });
  }, {});
}

/**
 * Get document details
 */
export async function getDocumentDetailsAction(id: string) {
  const session = await getAdminSessionInternal();
  return actionMiddleware("getDocumentDetails", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/document-verifications", {
      method: "POST",
      body: JSON.stringify({
        action: "GET_DETAILS",
        role: session.role,
        data: { id },
      }),
      next: { tags: [`document-${id}`] }
    });
  }, id);
}

/**
 * Verify document as valid
 */
export async function verifyDocumentAction(id: string) {
  const session = await getAdminSessionInternal();
  return actionMiddleware("verifyDocument", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/document-verifications", {
      method: "POST",
      body: JSON.stringify({
        action: "VERIFY",
        role: session.role,
        userId: session.id,
        data: { id },
      }),
    });
  }, { id }, { revalidateTags: ["documents", "documents-pending"] });
}

/**
 * Reject document and request revision
 */
export async function rejectDocumentAction(id: string) {
  const session = await getAdminSessionInternal();
  return actionMiddleware("rejectDocument", async () => {
    if (!session) throw new Error("Não autorizado");

    return await apiRequest("/api/admin/document-verifications", {
      method: "POST",
      body: JSON.stringify({
        action: "REJECT",
        role: session.role,
        userId: session.id,
        data: { id },
      }),
    });
  }, { id }, { revalidateTags: ["documents", "documents-pending"] });
}
