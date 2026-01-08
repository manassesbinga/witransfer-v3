import { NextResponse } from "next/server";
import { getDB } from "@/lib/db-admin";

export async function POST(request: Request) {
  try {
    const { role, companyId } = await request.json();
    const db = getDB();

    const stats: any = {
      companies: 0,
      users: 0,
      cars: 0,
      isSuperAdmin: role === "SUPER_ADMIN",
      motoristas: 0,
      bookings: { rental: 0, transfer: 0, total: 0 },
      revenue: 0,
      vehicleStatus: { active: 0, maintenance: 0, inactive: 0 },
      todayTrips: 0,
      canceledRate: 0,
      recentActivity: [] as any[],
    };

    if (role === "SUPER_ADMIN") {
      stats.companies = db.companies?.length || 0;
      stats.users = db.users?.length || 0;
      stats.cars = db.cars?.length || 0;
      stats.motoristas = db.motoristas?.length || 0;
      stats.bookings = {
        rental: db.bookings?.filter((b: any) => b.type === "rental").length || 0,
        transfer: db.bookings?.filter((b: any) => b.type === "transfer").length || 0,
        total: db.bookings?.length || 0,
      };
      stats.revenue = db.bookings?.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0) || 0;
      stats.vehicleStatus = {
        active: db.cars?.filter((c: any) => c.status === "active").length || 0,
        maintenance: db.cars?.filter((c: any) => c.status === "maintenance").length || 0,
        inactive: db.cars?.filter((c: any) => c.status === "inactive").length || 0,
      };
      const today = new Date().toISOString().slice(0, 10);
      stats.todayTrips = db.bookings?.filter((b: any) => b.date?.startsWith(today)).length || 0;
      stats.canceledRate = db.bookings?.length ? ((db.bookings?.filter((b: any) => b.status === "canceled").length || 0) / db.bookings.length) * 100 : 0;
      stats.recentActivity = (db.bookings || [])
        .slice(-5)
        .reverse()
        .map((b: any) => ({
          id: b.id,
          type: b.type,
          userName: b.userName,
          carName: b.carName,
          status: b.status,
          createdAt: b.createdAt,
        }));
    } else {
      stats.users =
        db.users?.filter((u: any) => u.companyId === companyId).length || 0;
      stats.cars =
        db.cars?.filter((c: any) => c.companyId === companyId).length || 0;
      stats.motoristas = db.motoristas?.filter((m: any) => m.companyId === companyId).length || 0;
      const companyBookings = db.bookings?.filter((b: any) => b.companyId === companyId) || [];
      stats.bookings = {
        rental: companyBookings.filter((b: any) => b.type === "rental").length,
        transfer: companyBookings.filter((b: any) => b.type === "transfer").length,
        total: companyBookings.length,
      };
      stats.revenue = companyBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);
      stats.vehicleStatus = {
        active: companyBookings.filter((c: any) => c.status === "active").length,
        maintenance: companyBookings.filter((c: any) => c.status === "maintenance").length,
        inactive: companyBookings.filter((c: any) => c.status === "inactive").length,
      };
      const today = new Date().toISOString().slice(0, 10);
      stats.todayTrips = companyBookings.filter((b: any) => b.date?.startsWith(today)).length;
      stats.canceledRate = companyBookings.length ? (companyBookings.filter((b: any) => b.status === "canceled").length / companyBookings.length) * 100 : 0;
      stats.recentActivity = companyBookings
        .slice(-5)
        .reverse()
        .map((b: any) => ({
          id: b.id,
          type: b.type,
          userName: b.userName,
          carName: b.carName,
          status: b.status,
          createdAt: b.createdAt,
        }));
    }

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas." },
      { status: 500 },
    );
  }
}
