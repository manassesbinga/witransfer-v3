import { getCurrentUserAction } from "@/actions/private/auth/actions";
import { getCarsAction } from "@/actions/private/cars/actions";
import VehiclesClient from "@/components/list/VehiclesClient";
import { VehicleFormData } from "@/types";

export type VehicleStatus = "ativa" | "inativa" | "manutencao" | "inspecao" | "disponivel" | "indisponivel" | "available" | "maintenance";
export type Vehicle = Omit<VehicleFormData, "id" | "status"> & {
    id: string;
    status: VehicleStatus;
    memberName?: string;
    partnerName?: string;
};

export default async function VehiclesPage() {
    const [result, userRes] = await Promise.all([
        getCarsAction(),
        getCurrentUserAction()
    ]);

    let initialVehicles: Vehicle[] = [];

    if (result.success && result.data) {
        initialVehicles = result.data.map((item: any) => ({
            ...item,
            model: item.model || item.modelo || item.name || "Sem modelo",
            brand: item.brand || item.marca || "Sem marca",
            licensePlate: item.licensePlate || item.matricula || item.placa || `ID-${item.id.slice(0, 4)}`,
            status: item.status || "ativa",
            mileage: item.mileage || item.quilometragemAtual || item.kilometragem || 0,
            seats: item.seats || item.lugares || 5,
            hasAC: item.hasAC || item.arCondicionado || false,
            luggageCapacity: item.luggageCapacity || item.malasGrandes || 0,
            smallLuggageCapacity: item.smallLuggageCapacity || item.malasPequenas || 0,
            doors: item.doors || item.portas || 4,
            partnerName: item.partnerName || item.empresaParceira || "WiTransfer",
            memberName: item.memberName || "Não atribuído",
        }));
    }

    return <VehiclesClient initialVehicles={initialVehicles} currentUser={userRes.success ? userRes.data : null} />;
}
