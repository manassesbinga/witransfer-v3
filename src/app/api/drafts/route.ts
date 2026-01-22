import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    const { data: draft, error } = await supabaseAdmin
      .from("drafts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !draft)
      return NextResponse.json(
        { error: "Rascunho não encontrado" },
        { status: 404 },
      );

    return NextResponse.json({
      ...draft,
      ...(typeof draft.data === 'object' ? draft.data : {})
    });
  } catch (error) {
    console.error("Erro ao buscar rascunho:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { data: newDraft, error } = await supabaseAdmin
      .from("drafts")
      .insert([{
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Expira em 1h
        data: data, // Assumindo coluna JSONB chamada data ou similar
      }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar rascunho:", error);
      throw error;
    }

    return NextResponse.json({ id: newDraft.id });
  } catch (error) {
    console.error("Erro ao criar rascunho:", error);
    return NextResponse.json(
      { error: "Falha ao criar rascunho" },
      { status: 500 },
    );
  }
}
