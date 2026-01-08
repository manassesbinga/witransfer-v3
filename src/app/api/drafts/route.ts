import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src/data/db.json");

async function getDb() {
  const data = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
}

async function saveDb(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

  const db = await getDb();
  const draft = db.drafts.find((d: any) => d.id === id);

  if (!draft)
    return NextResponse.json(
      { error: "Rascunho não encontrado" },
      { status: 404 },
    );

  return NextResponse.json(draft);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    const draftId = `DRF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newDraft = {
      id: draftId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Expira em 1h
      ...data,
    };

    // Limpar rascunhos expirados para não encher o JSON
    db.drafts = db.drafts.filter(
      (d: any) => new Date(d.expiresAt) > new Date(),
    );

    db.drafts.push(newDraft);
    await saveDb(db);

    return NextResponse.json({ id: draftId });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao criar rascunho" },
      { status: 500 },
    );
  }
}
