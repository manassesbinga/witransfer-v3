/** @format */

"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Fix Leaflet's default icon issue with Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface VehicleMapProps {
  vehicles: Array<{
    id: string;
    modelo: string;
    marca: string;
    matricula: string;
    status: string;
    motoristanome?: string;
    position: [number, number];
    velocidade?: number;
  }>;
  selectedVehicle?: string | null;
  onVehicleClick?: (vehicleId: string) => void;
  bookingByVehicle?:
    | Record<
        string,
        {
          pickupLocation?: string;
          dropoffLocation?: string;
          status?: string;
        }
      >
    | undefined;
}

// Custom icon creator for vehicles
const createVehicleIcon = (status: string) => {
  if (typeof window === "undefined") return undefined;

  const statusColor =
    status === "ativa"
      ? "#10b981"
      : status === "manutencao"
      ? "#f59e0b"
      : "#6b7280";

  return L.divIcon({
    className: "custom-vehicle-marker",
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 32px;
          background: ${statusColor};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" fill="white" style="width: 20px; height: 20px;">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Component to handle map centering
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

const VehicleMap: React.FC<VehicleMapProps> = ({
  vehicles,
  selectedVehicle,
  onVehicleClick,
  bookingByVehicle,
}) => {
  const [mounted, setMounted] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-8.83, 13.26]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicle);
      if (vehicle) {
        setMapCenter(vehicle.position);
      }
    }
  }, [selectedVehicle, vehicles]);

  useEffect(() => {
    // Add animation styles to document
    if (typeof document !== "undefined") {
      const style = document.createElement("style");
      style.innerHTML = `
        .custom-vehicle-marker {
          background: transparent !important;
          border: none !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, []);

  if (!mounted) {
    return (
      <div className="relative w-full h-[600px] rounded-none overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Inicializando mapa...</p>
        </div>
      </div>
    );
  }

  const activeVehicles = vehicles.filter((v) => v.status === "ativa").length;
  const maintenanceVehicles = vehicles.filter(
    (v) => v.status === "manutencao"
  ).length;

  return (
    <div className="relative w-full h-full overflow-hidden border border-gray-100 shadow-sm">
      {/* Map UI Overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-none shadow-md z-1000 border border-gray-100">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3 text-sm">
          <Navigation size={18} className="text-blue-600" />
          Monitoramento em Tempo Real
        </h3>
        <div className="text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Veículos Ativos ({activeVehicles})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Em Manutenção ({maintenanceVehicles})</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter} />

        {vehicles.map((vehicle) => {
          const icon = createVehicleIcon(vehicle.status);
          if (!icon) return null;

          return (
            <Marker key={vehicle.id} position={vehicle.position} icon={icon}>
              <Popup>
                <div className="text-center p-2 min-w-[200px]">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 mb-2 w-full"
                    onClick={() => onVehicleClick?.(vehicle.id)}>
                    <Car size={20} className="text-blue-600" />
                    <p className="font-bold text-slate-900">
                      {vehicle.matricula}
                    </p>
                  </button>
                  <p className="text-sm text-slate-600 mb-2">
                    {vehicle.marca} {vehicle.modelo}
                  </p>

                  {(bookingByVehicle?.[vehicle.id]?.pickupLocation ||
                    bookingByVehicle?.[vehicle.id]?.dropoffLocation) && (
                    <div className="mt-2 border-t border-slate-100 pt-2">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Trajeto
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {(bookingByVehicle?.[vehicle.id]?.pickupLocation ||
                          "-") +
                          " → " +
                          (bookingByVehicle?.[vehicle.id]?.dropoffLocation ||
                            "-")}
                      </p>
                    </div>
                  )}

                  {vehicle.motoristanome && (
                    <p className="text-xs text-slate-500 mb-2">
                      Motorista: {vehicle.motoristanome}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <Badge
                      variant={
                        vehicle.status === "ativa"
                          ? "success"
                          : vehicle.status === "manutencao"
                          ? "warning"
                          : "default"
                      }
                      className="text-[10px]">
                      {vehicle.status}
                    </Badge>
                    {vehicle.velocidade !== undefined && (
                      <span className="text-xs text-slate-600">
                        {vehicle.velocidade} km/h
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default VehicleMap;
