"use server";

import { actionMiddleware } from "@/middlewares/actions/action-factory";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminSessionInternal } from "../session";

import type { VehicleFormData, ActionResult } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getCarsAction(page: number = 1, limit: number = 50): Promise<ActionResult<any[]>> {
  const session = await getAdminSessionInternal();

  const { unstable_noStore: noStore } = await import("next/cache");
  noStore();

  return actionMiddleware("getCars", async () => {
    if (!session) throw new Error("Não autorizado");

    let query = supabaseAdmin
      .from("vehicles")
      .select(`
        *,
        partner:partners(name),
        driver:users!current_driver_id(full_name)
      `)
      .order("created_at", { ascending: false });

    // Filter for Partners
    if (["PARTNER_ADMIN", "PARTNER_STAFF", "DRIVER"].includes(session.role)) {
      if (!session.partnerId) throw new Error("Parceiro não identificado");
      query = query.eq("partner_id", session.partnerId);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching vehicles:", error);
      throw error;
    }

    return (data || []).map(v => ({
      ...v,
      partnerName: v.partner?.name,
      memberName: v.driver?.full_name,
      status: v.status || 'active',
      image: v.image_url
    }));

  }, { page, limit });
}

export async function getCarAction(carId: string): Promise<ActionResult<any>> {
  return actionMiddleware("getCar", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autorizado");

    // Fetch car with driver info
    const { data: car, error } = await supabaseAdmin
      .from("vehicles")
      .select("*, driver:users!current_driver_id(full_name), vehicle_classes(name)")
      .eq("id", carId)
      .single();

    if (error || !car) throw new Error("Veículo não encontrado");

    // Check ownership for partners
    if (["PARTNER_ADMIN", "PARTNER_STAFF"].includes(session.role)) {
      if (car.partner_id !== session.partnerId) {
        throw new Error("Acesso negado a este veículo.");
      }
    }

    // Fetch extras associated with this vehicle using existing column `extras` (UUID[])
    let extrasList: any[] = [];
    let extrasIds: string[] = [];
    try {
      extrasIds = Array.isArray(car.extras) ? car.extras : (car.extras ? JSON.parse(car.extras as any) : []);
      if (extrasIds && extrasIds.length > 0) {
        const { data: matchedExtras, error: extrasErr } = await supabaseAdmin
          .from("extras")
          .select("id, name, price, type")
          .in("id", extrasIds);

        if (!extrasErr && matchedExtras) extrasList = matchedExtras;
      }
    } catch (e) {
      // ignore parsing errors
    }

    // Mapping snake_case DB fields to camelCase Form fields
    const mappedCar = {
      ...car,
      licensePlate: car.license_plate,
      partnerId: car.partner_id,
      fuelType: car.fuel_type,
      engineNumber: car.engine_number,
      luggageCapacity: car.luggage_small, // Assuming 'luggage_small' maps correctly or needs adjustment based on schema
      smallLuggageCapacity: car.luggage_small,
      insuranceCompany: car.insurance_company,
      insurancePolicy: car.insurance_policy,
      insuranceExpiry: car.insurance_expiry,
      inspectionLast: car.inspection_last,
      inspectionExpiry: car.inspection_expiry,
      lastService: car.last_service,
      nextService: car.next_service,
      conditionLevel: car.condition_level,
      hasAC: car.has_ac,
      hasABS: car.has_abs,
      hasAirbags: car.has_airbags,
      hasLSD: car.has_lsd,
      hasEB: car.has_eb,
      // services: Array.isArray(car.services) ? car.services : [], // If services is a relation, fetch separately? Leaving simplified for now.

      // Driver Name
      memberName: car.driver?.full_name,

      // Extras List
      extrasList,

      // Ensure numeric values are numbers
      mileage: Number(car.mileage || 0),
      year: Number(car.year || new Date().getFullYear()),
      seats: Number(car.seats || 5),
      doors: Number(car.doors || 4),
      image: car.image_url,
      imageUrl: car.image_url,
      categoryName: (car.vehicle_classes as any)?.name,
      category: car.vehicle_class_id,
      services: Array.isArray(car.services) ? car.services : (typeof car.services === 'string' ? JSON.parse(car.services) : []),
      extras: extrasIds || [],
    };

    return mappedCar;
  }, { carId });
}

export async function saveCarAction(data: VehicleFormData): Promise<ActionResult> {
  const session = await getAdminSessionInternal();
  return actionMiddleware("saveCar", async () => {
    if (!session) throw new Error("Não autorizado");

    // Map form data to DB columns
    const vehicleData: any = {
      partner_id: session.role === 'PARTNER_ADMIN' ? session.partnerId : (data.partnerId || session.partnerId),
      brand: data.brand,
      model: data.model,
      year: data.year ? Number(data.year) : undefined,
      color: data.color,
      license_plate: data.licensePlate,
      status: data.status,

      vin: data.vin,
      engine_number: data.engineNumber,
      fuel_type: data.fuelType,
      transmission: data.transmission,
      potency: data.potency,
      displacement: data.displacement,

      mileage: data.mileage !== undefined ? Number(data.mileage) : undefined,
      condition: data.condition,
      condition_level: data.conditionLevel,

      seats: data.seats ? Number(data.seats) : undefined,
      doors: data.doors ? Number(data.doors) : undefined,
      luggage_big: data.luggageCapacity ? Number(data.luggageCapacity) : undefined,
      luggage_small: data.smallLuggageCapacity ? Number(data.smallLuggageCapacity) : undefined,

      has_ac: data.hasAC,
      has_abs: data.hasABS,
      has_airbags: data.hasAirbags,
      has_lsd: data.hasLSD,
      has_eb: data.hasEB,

      last_service: data.lastService || null,
      next_service: data.nextService || null,
      insurance_company: data.insuranceCompany,
      insurance_policy: data.insurancePolicy,
      insurance_expiry: data.insuranceExpiry || null,
      inspection_last: data.inspectionLast || null,
      inspection_expiry: data.inspectionExpiry || null,

      extras: data.extras || [],
      services: data.services || [],
      vehicle_class_id: data.category,

      image_url: data.image_url || data.image || data.imageUrl || null
    };

    // Clean data for UPDATE (exclude null/undefined/empty string if not specifically intended to clear)
    const cleanData: any = {};
    Object.keys(vehicleData).forEach(key => {
      const val = vehicleData[key];
      // We allow boolean false to pass
      if (val !== undefined && val !== null && val !== "") {
        cleanData[key] = val;
      }
      // Explicitly allow null for dates if they are null
      if (val === null && (key.endsWith('_service') || key.endsWith('_expiry') || key.endsWith('_last'))) {
        cleanData[key] = null;
      }
    });

    // Debug logging
    console.log(`📦 [SAVE CAR] Saving car ${data.brand} ${data.model} (${data.id || 'NEW'})`);
    console.log(`   Extras: ${vehicleData.extras?.length || 0} items -> ${JSON.stringify(vehicleData.extras)}`);
    console.log(`   Services: ${vehicleData.services?.length || 0} items -> ${JSON.stringify(vehicleData.services)}`);

    if (data.id) {
      // Update
      // Check permissions first? For now assuming simple override.
      const { error } = await supabaseAdmin
        .from("vehicles")
        .update(cleanData)
        .eq("id", data.id);

      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabaseAdmin
        .from("vehicles")
        .insert([vehicleData]);

      if (error) throw error;
    }

    revalidateTag("vehicles");
    revalidatePath("/fleet/vehicles");
    revalidatePath("/", "layout");
    return { message: "Veículo salvo com sucesso" };
  }, data, { revalidateTags: ["vehicles"] });
}

export async function getRelatedVehiclesAction(carId: string, memberId?: string, partnerId?: string): Promise<ActionResult<any[]>> {
  const session = await getAdminSessionInternal();
  return actionMiddleware("getRelatedVehicles", async () => {
    if (!session) throw new Error("Não autorizado");

    let query = supabaseAdmin
      .from("vehicles")
      .select("*, driver:users!current_driver_id(full_name)")
      .neq("id", carId);

    // Filter by partner
    const partner = partnerId || session.partnerId;
    if (partner) {
      query = query.eq("partner_id", partner);
    }

    // Filter by driver/member
    if (memberId) {
      query = query.eq("current_driver_id", memberId);
    }

    const { data, error } = await query.limit(5);

    if (error) {
      console.error("Error fetching related vehicles:", error);
      return [];
    }

    return (data || []).map(v => ({
      ...v,
      image: v.image_url,
      memberName: v.driver?.full_name,
    }));
  }, { carId, memberId, partnerId });
}

export async function deleteCarAction(carId: string): Promise<ActionResult> {
  const session = await getAdminSessionInternal();
  return actionMiddleware("deleteCar", async () => {
    if (!session) throw new Error("Não autorizado");

    // Logic: Partners can delete OWN. Admins can delete ANY.

    // 1. Check existence and owner
    const { data: car, error: fetchError } = await supabaseAdmin
      .from("vehicles")
      .select("partner_id")
      .eq("id", carId)
      .single();

    if (fetchError || !car) throw new Error("Veículo não encontrado");

    // 2. Permission Check
    if (["PARTNER_ADMIN", "PARTNER_STAFF", "DRIVER"].includes(session.role)) {
      if (car.partner_id !== session.partnerId) {
        throw new Error("Você não tem permissão para apagar este veículo.");
      }
    }
    // Admins override this check and can delete anyone's vehicle

    const { error } = await supabaseAdmin.from("vehicles").delete().eq("id", carId);
    if (error) throw error;

    revalidateTag("vehicles");
    revalidatePath("/fleet/vehicles");

    return { message: "Veículo removido com sucesso" };
  }, { carId }, { revalidateTags: ["vehicles"] });
}

export async function addVehicleExtraAction(vehicleId: string, extraId: string): Promise<ActionResult> {
  const session = await getAdminSessionInternal();
  return actionMiddleware("addVehicleExtra", async () => {
    if (!session) throw new Error("Não autorizado");

    // Check if vehicle exists and belongs to partner
    const { data: vehicle, error: vehicleError } = await supabaseAdmin
      .from("vehicles")
      .select("partner_id")
      .eq("id", vehicleId)
      .single();

    if (vehicleError || !vehicle) throw new Error("Veículo não encontrado");

    // Check permissions
    if (["PARTNER_ADMIN", "PARTNER_STAFF", "DRIVER"].includes(session.role)) {
      if (vehicle.partner_id !== session.partnerId) {
        throw new Error("Você não tem permissão para modificar este veículo.");
      }
    }

    // Add extra to vehicle.extras array column (existing schema)
    const { data: vehicleFull, error: fetchErr } = await supabaseAdmin
      .from("vehicles")
      .select("extras")
      .eq("id", vehicleId)
      .single();

    if (fetchErr) throw fetchErr;

    let current: string[] = [];
    if (vehicleFull?.extras) {
      current = Array.isArray(vehicleFull.extras) ? vehicleFull.extras : (typeof vehicleFull.extras === 'string' ? JSON.parse(vehicleFull.extras) : []);
    }

    if (!current.includes(extraId)) {
      current.push(extraId);
      const { error } = await supabaseAdmin
        .from("vehicles")
        .update({ extras: current })
        .eq("id", vehicleId);
      if (error) throw error;
    }

    revalidateTag("vehicles");
    revalidatePath(`/admin/fleet/vehicles/${vehicleId}`);

    return { message: "Extra adicionado com sucesso" };
  }, { vehicleId, extraId });
}

export async function removeVehicleExtraAction(vehicleId: string, extraId: string): Promise<ActionResult> {
  const session = await getAdminSessionInternal();
  return actionMiddleware("removeVehicleExtra", async () => {
    if (!session) throw new Error("Não autorizado");

    // Check if vehicle exists and belongs to partner
    const { data: vehicle, error: vehicleError } = await supabaseAdmin
      .from("vehicles")
      .select("partner_id")
      .eq("id", vehicleId)
      .single();

    if (vehicleError || !vehicle) throw new Error("Veículo não encontrado");

    // Check permissions
    if (["PARTNER_ADMIN", "PARTNER_STAFF", "DRIVER"].includes(session.role)) {
      if (vehicle.partner_id !== session.partnerId) {
        throw new Error("Você não tem permissão para modificar este veículo.");
      }
    }

    // Remove extra from vehicle.extras array column
    const { data: vehicleFull, error: fetchErr } = await supabaseAdmin
      .from("vehicles")
      .select("extras")
      .eq("id", vehicleId)
      .single();

    if (fetchErr) throw fetchErr;

    let current: string[] = [];
    if (vehicleFull?.extras) {
      current = Array.isArray(vehicleFull.extras) ? vehicleFull.extras : (typeof vehicleFull.extras === 'string' ? JSON.parse(vehicleFull.extras) : []);
    }

    const updated = current.filter((id: string) => id !== extraId);
    const { error } = await supabaseAdmin
      .from("vehicles")
      .update({ extras: updated })
      .eq("id", vehicleId);

    if (error) throw error;

    revalidateTag("vehicles");
    revalidatePath(`/admin/fleet/vehicles/${vehicleId}`);

    return { message: "Extra removido com sucesso" };
  }, { vehicleId, extraId });
}
