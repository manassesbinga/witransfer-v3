import { NextResponse } from "next/server";
import db from "@/data/db.json";
import { getCarsByIds } from "@/actions/public/search/cars";

export async function POST(request: Request) {
  try {
    const { carIds, selectedExtras, rentalDays = 3 } = await request.json();

    const cars = await getCarsByIds(carIds);
    if (!cars || cars.length === 0) {
      return NextResponse.json(
        { error: "Carros não encontrados" },
        { status: 404 },
      );
    }

    let total = 0;
    const breakdown = {
      cars: [] as any[],
      extras: [] as any[],
      total: 0,
    };

    // Cálculo de Carros e Seguros
    cars.forEach((car) => {
      const carRental = car.price * rentalDays;
      const carInsurance = (car.insurance?.dailyPrice || 0) * rentalDays;
      total += carRental + carInsurance;

      breakdown.cars.push({
        id: car.id,
        name: car.name,
        rentalPrice: carRental,
        insurancePrice: carInsurance,
      });
    });

    // Cálculo de Extras
    Object.entries(selectedExtras as Record<string, number>).forEach(
      ([key, qty]) => {
        const segments = key.split("-");
        const carId = segments.length > 1 ? segments[0] : null;
        const extraId = segments.length > 1 ? segments[1] : key;

        cars.forEach((car) => {
          // Se for extra global ou específico deste carro
          const isForThisCar = carId ? car.id === carId : true;
          const isIncluded = car.extras?.includes(extraId) || false;

          if (isForThisCar && !isIncluded) {
            const extra = db.extras.find((e) => e.id === extraId);
            if (extra) {
              const price = extra.perDay
                ? extra.price * rentalDays
                : extra.price;
              const itemTotal = price * qty;
              total += itemTotal;

              breakdown.extras.push({
                id: extraId,
                name: extra.name,
                qty,
                carId: car.id,
                total: itemTotal,
              });
            }
          }
        });
      },
    );

    breakdown.total = total;
    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Calculation API Error:", error);
    return NextResponse.json(
      { error: "Erro ao calcular total" },
      { status: 500 },
    );
  }
}
