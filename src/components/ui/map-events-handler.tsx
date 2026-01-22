"use client";

import { useEffect } from "react";
import { useMapEvents, useMap } from "react-leaflet";

interface MapEventsHandlerProps {
    onClick: (lat: number, lng: number) => void;
    center?: [number, number];
}

export function MapEventsHandler({ onClick, center }: MapEventsHandlerProps) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);

    useMapEvents({
        click(e) {
            map.invalidateSize();
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });

    // Aggressive fix for "wrong click position" in modals
    useEffect(() => {
        if (!map) return;

        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });

        const container = map.getContainer();
        resizeObserver.observe(container);

        // Also do immediate invalidates
        map.invalidateSize();
        const t1 = setTimeout(() => map.invalidateSize(), 100);
        const t2 = setTimeout(() => map.invalidateSize(), 500);

        return () => {
            resizeObserver.disconnect();
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [map]);

    return null;
}
