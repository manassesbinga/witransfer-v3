import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db-admin";

export async function POST(request: Request) {
  try {
    const { action, role, companyId, data } = await request.json();
    const db = getDB();
    console.log(
      `[API-CARS] Request - Action: ${action}, Role: ${role}, CompanyId: ${companyId}`,
    );

    if (action === "LIST") {
      let cars = db.cars || [];
      console.log(`[API-CARS] Total cars in DB: ${cars.length}`);

      if (role !== "SUPER_ADMIN") {
        cars = cars.filter((car: any) => car.companyId === companyId);
        console.log(
          `[API-CARS] Filtered cars for company ${companyId}: ${cars.length}`,
        );
      }

      return NextResponse.json(cars);
    }

    if (action === "SAVE") {
      const isNew = !data.id;
      if (isNew) {
        const newCar = {
          ...data,
          id: `car_${Date.now()}`,
          companyId:
            role === "SUPER_ADMIN" ? data.companyId || "system" : companyId,
          createdAt: new Date().toISOString(),
        };
        if (!db.cars) db.cars = [];
        db.cars.push(newCar);
        saveDB(db);
        return NextResponse.json(newCar);
      } else {
        const index = db.cars.findIndex((c: any) => c.id === data.id);
        if (index === -1)
          return NextResponse.json(
            { error: "Carro não encontrado" },
            { status: 404 },
          );

        if (role !== "SUPER_ADMIN" && db.cars[index].companyId !== companyId) {
          return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        db.cars[index] = {
          ...db.cars[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        saveDB(db);
        return NextResponse.json(db.cars[index]);
      }
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro na operação de carros." },
      { status: 500 },
    );
  }
}
