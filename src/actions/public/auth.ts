"use server";

import { createPublicAction } from "@/middlewares/actions/action-factory";

/**
 * Example of using the middleware for email verification
 */
export async function verifyEmail(email: string) {
  return createPublicAction(
    "VerifyEmail",
    async (emailStr: string) => {
      // Simulate a database check
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const exists =
        emailStr.toLowerCase().includes("witransfer") ||
        emailStr.toLowerCase().includes("admin");

      return {
        exists,
        message: exists
          ? "Bem-vindo de volta!"
          : "E-mail verificado com sucesso.",
      };
    },
    email,
  );
}
