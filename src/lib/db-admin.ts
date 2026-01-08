import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dbPath = path.join(process.cwd(), "src/data/db.json");

export function getDB() {
  const fileData = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(fileData);
}

export function saveDB(db: any) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
}

export function getSession(request: any) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie);
  } catch {
    return null;
  }
}

export function authGuard(request: any) {
  const session = getSession(request);
  if (!session) {
    return {
      error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}
