"use server";

import { randomUUID } from "crypto";
import { createPublicAction } from "@/middlewares/actions/action-factory";

const draftsInMemory: any[] = [];

export async function createBookingDraft(data: any) {
  return createPublicAction(
    "CreateBookingDraft",
    async (draftData: any) => {
      const draftId = randomUUID();
      const newDraft = {
        id: draftId,
        createdAt: new Date().toISOString(),
        ...draftData,
      };

      draftsInMemory.push(newDraft);
      return draftId;
    },
    data,
  );
}

export async function getBookingDraft(draftId: string) {
  return createPublicAction(
    "GetBookingDraft",
    async (id: string) => {
      return draftsInMemory.find((d) => d.id === id) || null;
    },
    draftId,
  );
}
