"use server";

import db from "@/data/db.json";
import { createPublicAction } from "@/middlewares/actions/action-factory";

export async function getExtras() {
  return createPublicAction(
    "GetExtras",
    async () => {
      return db.extras || [];
    },
    {},
  );
}
