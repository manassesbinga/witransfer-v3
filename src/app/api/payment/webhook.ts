// Rota de webhook simulada para pagamentos GPO e Referência (API Route Handler)
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, status, amount, method, customer, metadata } = body;

    // Aqui você pode adicionar lógica para atualizar o status do pagamento no banco de dados
    // Exemplo: atualizar reserva para "paga" se status === 'success'

    return NextResponse.json({
      received: true,
      paymentId,
      status,
      method,
      amount,
      customer,
      metadata,
      message: "Webhook recebido e processado com sucesso.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar webhook." },
      { status: 500 },
    );
  }
}
