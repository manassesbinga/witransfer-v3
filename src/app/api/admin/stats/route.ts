import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { role, partnerId } = await request.json();

    const stats: any = {
      partners: 0,
      partners_total: 0,
      users: 0,
      cars: 0,
      isSystemAdmin: ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(role),
      members: 0,
      bookings: { rental: 0, transfer: 0, total: 0 },
      revenue: 0,
      vehicleStatus: { active: 0, maintenance: 0, inactive: 0 },
      todayTrips: 0,
      canceledRate: 0,
      recentActivity: [] as any[],
    };

    const isSystemAdmin = stats.isSystemAdmin;

    // Queries based on role
    const queries = [];

    if (isSystemAdmin) {
      queries.push(supabaseAdmin.from("partners").select("id", { count: "exact", head: true }).eq("status", "active"));
      queries.push(supabaseAdmin.from("partners").select("id", { count: "exact", head: true }));
      queries.push(supabaseAdmin.from("users").select("id", { count: "exact", head: true }));
      queries.push(supabaseAdmin.from("vehicles").select("id", { count: "exact", head: true }));
      queries.push(supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("role", "DRIVER"));
      queries.push(supabaseAdmin.from("bookings").select("*"));
      queries.push(supabaseAdmin.from("vehicles").select("status"));
    } else {
      queries.push(Promise.resolve({ count: 0 })); // dummy partners active
      queries.push(Promise.resolve({ count: 0 })); // dummy partners total
      queries.push(supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("partner_id", partnerId));
      queries.push(supabaseAdmin.from("vehicles").select("id", { count: "exact", head: true }).eq("partner_id", partnerId));
      queries.push(supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("partner_id", partnerId).eq("role", "DRIVER"));
      queries.push(supabaseAdmin.from("bookings").select("*").eq("partner_id", partnerId));
      queries.push(supabaseAdmin.from("vehicles").select("status").eq("partner_id", partnerId));
    }

    const [partnersRes, partnersTotalRes, usersRes, vehiclesCountRes, driversRes, bookingsRes, vehiclesStatusRes] = await Promise.all(queries);

    stats.partners = partnersRes.count || 0;
    stats.partners_total = partnersTotalRes.count || 0;
    stats.users = usersRes.count || 0;
    stats.cars = vehiclesCountRes.count || 0;
    stats.members = driversRes.count || 0;

    const bookings = (bookingsRes as any).data || [];
    stats.bookings = {
      rental: bookings.filter((b: any) => b.service_type === "rental").length,
      transfer: bookings.filter((b: any) => b.service_type === "transfer").length,
      total: bookings.length,
    };
    stats.revenue = bookings.reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);

    const vehiclesData = (vehiclesStatusRes as any).data || [];
    stats.vehicleStatus = {
      active: vehiclesData.filter((v: any) => v.status === "active" || v.status === "available").length,
      maintenance: vehiclesData.filter((v: any) => v.status === "maintenance").length,
      inactive: vehiclesData.filter((v: any) => v.status === "inactive").length,
    };

    const today = new Date().toISOString().slice(0, 10);
    stats.todayTrips = bookings.filter((b: any) => b.start_time?.startsWith(today)).length;
    stats.canceledRate = bookings.length ? (bookings.filter((b: any) => b.status === "cancelled").length / bookings.length) * 100 : 0;

    stats.recentActivity = bookings
      .slice(-5)
      .reverse()
      .map((b: any) => ({
        id: b.id,
        type: b.service_type,
        userName: "Cliente", // Join needs to be implemented for actual names
        carName: "Viatura",  // Join needs to be implemented for actual names
        status: b.status,
        createdAt: b.created_at,
      }));

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar estatísticas." },
      { status: 500 },
    );
  }
}
