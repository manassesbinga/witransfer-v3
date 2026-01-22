"use server";

import { createPublicAction } from "@/middlewares/actions/action-factory";
import { supabase } from "@/lib/supabase";

export type GetExtrasParams = {
  vehicleId?: string | null;
  partnerId?: string | null;
  role?: string | null; // ADMIN/SUPER_ADMIN/GERENCIADOR bypasses filtering
};

export async function getExtras(params: GetExtrasParams = {}) {
  return createPublicAction(
    "GetExtras",
    async () => {
      const { vehicleId, partnerId, role } = params || {};

      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN" || role === "GERENCIADOR";

      if (isAdmin) {
        const { data, error } = await supabase.from("extras").select("*");
        if (error) throw error;
        return (data || []).map(mapExtraRow);
      }

      // If a vehicleId is provided, fetch extras from vehicle's extras array
      if (vehicleId) {
        const vRes = await supabase.from("vehicles").select("extras, partner_id").eq("id", vehicleId).single();
        if (vRes.error && vRes.error.code !== "PGRST116") {
          console.warn("Failed to fetch vehicle extras:", vRes.error);
        }

        const vehicleExtras: string[] = (vRes.data && Array.isArray(vRes.data.extras)) ? vRes.data.extras : [];

        if (vehicleExtras.length > 0) {
          const { data: evData, error: evError } = await supabase
            .from("extras")
            .select("*")
            .in("id", vehicleExtras);

          if (evError) throw evError;
          return (evData || []).map(mapExtraRow);
        }

        return [];
      }

      // partner-level extras: show global (partner_id = null) OR partner's own extras
      if (partnerId) {
        const { data, error } = await supabase
          .from("extras")
          .select("*")
          .or(`partner_id.is.null,partner_id.eq.${partnerId}`);

        if (error) throw error;
        return (data || []).map(mapExtraRow);
      }

      // default: return only global extras (no partner filter)
      const { data, error } = await supabase
        .from("extras")
        .select("*")
        .is("partner_id", null);

      if (error) throw error;
      return (data || []).map(mapExtraRow);
    },
    params,
  );
}

export async function getExtrasDebug() {
  return createPublicAction(
    "GetExtrasDebug",
    async () => {
      const { data, error } = await supabase.from("extras").select("*");
      if (error) throw error;
      const items = data || [];

      const debug = {
        count: items.length,
        ids: items.map((i: any) => i.id),
        preview: items.slice(0, 20),
      };

      try {
        // eslint-disable-next-line no-console
        console.debug("GetExtrasDebug:", debug);
      } catch (e) {
        /* ignore logging errors */
      }

      return debug;
    },
    {},
  );
}

function mapExtraRow(e: any) {
  return {
    id: e.id,
    name: e.name,
    description: e.description,
    price: Number(e.price || 0),
    type: e.type,
    partnerId: e.partner_id,
    perDay: e.per_day === true || e.per_day === "true",
  };
}
