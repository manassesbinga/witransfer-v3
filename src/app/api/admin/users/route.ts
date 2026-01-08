import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db-admin";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
  console.log("[API] Users Operation Started");
  try {
    const body = await request.json();
    const { action, role, companyId, data } = body;
    console.log(
      `[API] Action: ${action}, Role: ${role}, CompanyId: ${companyId}`,
    );
    const db = getDB();

    if (action === "LIST") {
      let users = db.users || [];
      if (role !== "SUPER_ADMIN") {
        users = users.filter((u: any) => u.companyId === companyId);
      }
      return NextResponse.json(users.map(({ password, ...rest }: any) => rest));
    }

    if (action === "SAVE") {
      const isNew = !data.id;
      if (isNew) {
        const targetCompanyId =
          role === "SUPER_ADMIN" ? data.companyId || "system" : companyId;
        const newUser = {
          ...data,
          id: `user_${Date.now()}`,
          companyId: targetCompanyId,
          status: "invited", // Novo campo para rastrear convite
          createdAt: new Date().toISOString(),
        };

        if (!db.users) db.users = [];
        db.users.push(newUser);
        saveDB(db);

        // Busca o nome da empresa para o e-mail
        const targetCompany = db.companies?.find(
          (c: any) => c.id === targetCompanyId,
        );
        const companyName = targetCompany?.name || "WiTransfer";

        // Envio de convite por e-mail
        if (data.email) {
          const inviteLink = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/portal/invite?type=user&id=${newUser.id}`;

          await sendEmail({
            to: data.email,
            subject: `Convite WiTransfer: Você foi adicionado à empresa ${companyName}`,
            template: "invitation",
            templateData: {
              type: "user",
              name: data.name,
              companyName,
              inviteLink,
            },
          }).catch((err) =>
            console.error(
              "Falha ao enviar e-mail de convite para usuário:",
              err,
            ),
          );
        }

        const { password, ...safeUser } = newUser;
        return NextResponse.json(safeUser);
      } else {
        const index = db.users.findIndex((u: any) => u.id === data.id);
        if (index === -1)
          return NextResponse.json(
            { error: "Usuário não encontrado" },
            { status: 404 },
          );

        if (role !== "SUPER_ADMIN" && db.users[index].companyId !== companyId) {
          return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        db.users[index] = {
          ...db.users[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        saveDB(db);
        const { password, ...safeUser } = db.users[index];
        return NextResponse.json(safeUser);
      }
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro na operação de usuários:", error);
    return NextResponse.json(
      { error: "Erro na operação de usuários." },
      { status: 500 },
    );
  }
}
