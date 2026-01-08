"use server";

import { createPublicAction } from "@/middlewares/actions/action-factory";

interface PaymentData {
  paymentId: string;
  amount: number;
  method: "gpo" | "reference" | "proposal";
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  metadata?: any;
}

export async function simulatePayment(payload: PaymentData) {
  return createPublicAction(
    "SimulatePayment",
    async (data: PaymentData) => {
      // Note: We use process.env.BASE_URL if it exists, otherwise relative
      // In server actions, relative URLs to your own API are best handled with absolute internally or assuming internal routing
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const response = await fetch(`${baseUrl}/api/payment/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          status: "success",
          timestamp: new Date().toISOString(),
          metadata: {
            ...data.metadata,
            processedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha ao processar pagamento: ${response.statusText}`);
      }

      return await response.json();
    },
    payload,
  );
}
