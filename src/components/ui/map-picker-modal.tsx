"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2, Navigation, Check, X, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
// import L from "leaflet"; // Removido import estático para evitar erro de SSR (window is not defined)
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { MapEventsHandler } from "@/components/ui/map-events-handler";

interface MapPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: string, lat: number, lng: number) => void;
    initialValue?: string;
    title?: string;
}

export function MapPickerModal({
    isOpen,
    onClose,
    onSelect,
    initialValue = "",
    title = "Selecionar Localização",
}: MapPickerModalProps) {
    const [searchQuery, setSearchQuery] = useState(initialValue);
    const [position, setPosition] = useState<[number, number]>([-8.839, 13.289]); // Luanda default
    const [mapCenter, setMapCenter] = useState<[number, number]>([-8.839, 13.289]);
    const [resolvedAddress, setResolvedAddress] = useState(initialValue);
    const [isSearching, setIsSearching] = useState(false);
    const [isResolving, setIsResolving] = useState(false);

    // Fix Leaflet icons
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Importação dinâmica do Leaflet apenas no cliente
            import("leaflet").then((L) => {
                // @ts-ignore
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                });
            });
        }
    }, []);

    // Update initial position if possible (Geocode the initial value)
    useEffect(() => {
        if (isOpen && initialValue && initialValue.length > 3) {
            handleSearch(initialValue);
        }
    }, [isOpen]);

    const handleSearch = async (query: string) => {
        if (!query || query.length < 3) return;
        setIsSearching(true);
        try {
            const res = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
            const data = await res.json();

            // Check if we have results in either data.results or data itself
            const results = Array.isArray(data) ? data : (data.results || []);

            if (results.length > 0) {
                const result = results[0];
                const lat = typeof result.lat === 'string' ? parseFloat(result.lat) : result.lat;
                const lng = typeof result.lng === 'string' ? parseFloat(result.lng) : result.lng;

                if (!isNaN(lat) && !isNaN(lng)) {
                    const newPos: [number, number] = [lat, lng];
                    setPosition(newPos);
                    setMapCenter(newPos);
                    const label = result.label || result.display_name;
                    setResolvedAddress(label);
                    setSearchQuery(label);
                }
            } else {
                // Fallback to direct Nominatim call if local API fails
                const nomRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                        query + ", Angola"
                    )}&format=json&limit=1`
                );
                const nomData = await nomRes.json();
                if (nomData && nomData.length > 0) {
                    const lat = parseFloat(nomData[0].lat);
                    const lng = parseFloat(nomData[0].lon);
                    const newPos: [number, number] = [lat, lng];
                    setPosition(newPos);
                    setMapCenter(newPos);
                    setResolvedAddress(nomData[0].display_name);
                    setSearchQuery(nomData[0].display_name);
                }
            }
        } catch (e) {
            console.error("Geocoding error:", e);
        } finally {
            setIsSearching(false);
        }
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        setIsResolving(true);
        try {
            // Fetch both for data redundancy
            const [orsRes, nomRes] = await Promise.allSettled([
                fetch(`/api/geocode?lat=${lat}&lng=${lng}`).then(r => r.json()),
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`).then(r => r.json())
            ]);

            const orsData = orsRes.status === 'fulfilled' ? orsRes.value : null;
            const nomData = nomRes.status === 'fulfilled' ? nomRes.value : null;

            console.log("📍 [REVERSE-GEO] ORS:", orsData);
            console.log("📍 [REVERSE-GEO] Nominatim:", nomData);

            // RIGID SELECTION: Nominatim is often better for residential Luanda (Bairros/Portas)
            const street = nomData?.address?.road || nomData?.address?.pedestrian || orsData?.street || (orsData?.layer === 'venue' ? orsData.name : null);
            const number = nomData?.address?.house_number || orsData?.number;
            const neighborhood = nomData?.address?.neighbourhood || orsData?.neighborhood || nomData?.address?.suburb || nomData?.address?.city_district;
            const city = nomData?.address?.city || orsData?.city || nomData?.address?.town || "Luanda";

            const parts: string[] = [];

            // 1. Street and house number (Rigid: Rua X, nº Y)
            if (street) {
                const streetLabel = number ? `${street}, ${number}` : street;
                parts.push(streetLabel);
            }

            // 2. Neighborhood (Rigid: Bairro)
            // Ensure neighborhood is not identical to street
            if (neighborhood && neighborhood.toLowerCase() !== street?.toLowerCase()) {
                parts.push(neighborhood);
            }

            // 3. City
            if (city && city.toLowerCase() !== neighborhood?.toLowerCase()) {
                parts.push(city);
            }

            // Final check: if we have less than 2 parts, try to use ORS label as fallback
            let finalAddress = parts.length >= 2 ? parts.join(" - ") : (orsData?.label || nomData?.display_name || "Ponto no Mapa");

            // Final deduplication for cases like "Maianga - Maianga - Luanda"
            const finalParts = finalAddress.split(" - ");
            const uniqueParts = finalParts.filter((val, idx) => finalParts.indexOf(val) === idx);
            finalAddress = uniqueParts.join(" - ");

            setResolvedAddress(finalAddress);
            setSearchQuery(finalAddress);
        } catch (e) {
            console.error("Reverse geocoding error:", e);
        } finally {
            setIsResolving(false);
        }
    };

    const handleMapClick = (lat: number, lng: number) => {
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
    };

    const handleConfirm = () => {
        onSelect(resolvedAddress || searchQuery, position[0], position[1]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-none border-none shadow-2xl bg-white focus:outline-none">
                <DialogHeader className="p-6 bg-[#003580] text-white flex-shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <MapIcon className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                </DialogHeader>



                <div className="flex-1 relative bg-gray-100 min-h-0 overflow-hidden mb-[108px] md:mb-[96px]">
                    {isOpen && (
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={position} key={`${position[0]}-${position[1]}`} />
                            <MapEventsHandler onClick={handleMapClick} center={mapCenter} />
                        </MapContainer>
                    )}

                    <Button
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((pos) => {
                                    const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                                    setMapCenter(newPos);
                                    handleMapClick(newPos[0], newPos[1]);
                                });
                            }
                        }}
                        className="absolute bottom-4 right-4 z-[1000] bg-white text-gray-700 hover:bg-gray-50 border shadow-md w-10 h-10 p-0 rounded-full"
                        title="Minha Localização"
                    >
                        <Navigation className="h-5 w-5" />
                    </Button>

                    {(isSearching || isResolving) && (
                        <div className="absolute inset-0 bg-white/40 z-[1000] flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-white p-5 shadow-2xl border-2 border-[#003580]/10 flex flex-col items-center gap-3 min-w-[200px]">
                                <Loader2 className="h-8 w-8 animate-spin text-[#003580]" />
                                <span className="text-sm font-bold text-gray-700">
                                    {isSearching ? "A pesquisar local..." : "A identificar ponto..."}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t flex flex-col md:flex-row gap-4 items-center justify-between z-[1001] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                        <MapPin className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Local Selecionado</span>
                            <span className="text-sm font-bold text-gray-900 truncate">
                                {resolvedAddress || searchQuery || "Clique no mapa..."}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="outline" onClick={onClose} className="flex-1 md:flex-none h-11 md:h-12 rounded-none font-bold border-gray-300">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!position || isResolving}
                            className="flex-1 md:flex-none h-11 md:h-12 px-8 bg-[#008009] hover:bg-[#006607] text-white rounded-none font-bold shadow-lg disabled:opacity-50"
                        >
                            <Check className="h-5 w-5 mr-2" />
                            Confirmar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
