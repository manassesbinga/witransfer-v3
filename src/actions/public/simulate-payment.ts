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
      // Simulação de sucesso imediato sem call externo
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay artificial

      return {
        success: true,
        transactionId: `tx_${Math.random().toString(36).substr(2, 9)}`,
        message: "Pagamento simulado com sucesso",
        status: "completed"
      };
    },
    payload,
  );
}
