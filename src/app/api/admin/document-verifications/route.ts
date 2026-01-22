import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { action, role, userId, data } = await request.json();
    const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(role);

    if (!isSystemAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (action === "LIST_PENDING") {
      const { data: documents, error } = await supabaseAdmin
        .from("document_verifications")
        .select("*")
        .eq("status", "pending")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json(documents);
    }

    if (action === "GET_DETAILS") {
      const { id } = data;

      const { data: document, error: docError } = await supabaseAdmin
        .from("document_verifications")
        .select("*")
        .eq("id", id)
        .single();

      if (docError || !document) {
        return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
      }

      // Get partner details
      const { data: partner } = await supabaseAdmin
        .from("partners")
        .select("*")
        .eq("id", document.partner_id)
        .single();

      // Get verified by user details if applicable
      let verifiedByUser = null;
      if (document.verified_by) {
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("id", document.verified_by)
          .single();
        verifiedByUser = user;
      }

      return NextResponse.json({
        ...document,
        partner,
        verified_by_user: verifiedByUser,
      });
    }

    if (action === "VERIFY") {
      const { id, notes } = data;

      const { data: document, error: docError } = await supabaseAdmin
        .from("document_verifications")
        .select("*")
        .eq("id", id)
        .single();

      if (docError || !document) {
        return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
      }

      const { data: verified, error: updateError } = await supabaseAdmin
        .from("document_verifications")
        .update({
          status: "verified",
          verified_by: userId,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        data: verified,
      });
    }

    if (action === "REJECT") {
      const { id, reason } = data;

      const { data: document, error: docError } = await supabaseAdmin
        .from("document_verifications")
        .select("*")
        .eq("id", id)
        .single();

      if (docError || !document) {
        return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
      }

      const { data: rejected, error: updateError } = await supabaseAdmin
        .from("document_verifications")
        .update({
          status: "needs_revision",
          verified_by: userId,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        data: rejected,
      });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de verificação de documentos:", error);
    return NextResponse.json(
      { error: "Erro na operação de documentos." },
      { status: 500 },
    );
  }
}
