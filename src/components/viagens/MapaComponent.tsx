'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

// Fix Leaflet's default icon issue with Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface Driver {
  id: number;
  name: string;
  photo: string;
  position: [number, number];
  status: 'livre' | 'ocupado';
}

// Mock data for drivers with their positions
const drivers: Driver[] = [
  {
    id: 1,
    name: 'João Santos',
    photo: 'https://i.pravatar.cc/150?img=12',
    position: [-8.839988, 13.289437],
    status: 'ocupado',
  },
  {
    id: 2,
    name: 'Ana Oliveira',
    photo: 'https://i.pravatar.cc/150?img=5',
    position: [-8.85, 13.3],
    status: 'livre',
  },
  {
    id: 3,
    name: 'Lucas Pereira',
    photo: 'https://i.pravatar.cc/150?img=33',
    position: [-8.82, 13.24],
    status: 'ocupado',
  },
  {
    id: 4,
    name: 'Maria Santos',
    photo: 'https://i.pravatar.cc/150?img=9',
    position: [-8.81, 13.22],
    status: 'livre',
  },
];

// Custom icon creator with driver photo
const createDriverIcon = (driver: Driver) => {
  if (typeof window === 'undefined') return undefined;
  
  const statusColor = driver.status === 'livre' ? '#14b8a6' : '#f59e0b';
  
  return L.divIcon({
    className: 'custom-driver-marker',
    html: `
      <div style="position: relative; width: 50px; height: 50px;">
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background: ${statusColor};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          overflow: hidden;
          animation: pulse 2s infinite;
        ">
          <img 
            src="${driver.photo}" 
            alt="${driver.name}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            "
          />
        </div>
        <div style="
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          background: ${statusColor};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <svg viewBox="0 0 24 24" fill="white" style="width: 100%; height: 100%; padding: 3px;">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
  });
};

const MapaComponent = () => {
  useEffect(() => {
    // Add animation styles to document
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 6px rgba(0,0,0,0.3), 0 0 0 0 rgba(20, 184, 166, 0.7);
          }
          50% {
            box-shadow: 0 4px 6px rgba(0,0,0,0.3), 0 0 0 10px rgba(20, 184, 166, 0);
          }
        }
        .custom-driver-marker {
          background: transparent !important;
          border: none !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <div className="relative w-full h-[500px] overflow-hidden border border-gray-200 shadow-lg mb-8">
      {/* Map UI Overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-md z-[1000]">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Navigation size={18} className="text-teal-600" />
          Monitoramento em Tempo Real
        </h3>
        <div className="text-xs text-gray-600 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500"></span>
            <span>Motoristas Livres ({drivers.filter(d => d.status === 'livre').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Em Viagem ({drivers.filter(d => d.status === 'ocupado').length})</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={[-8.83, 13.26]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {drivers.map((driver) => {
          const icon = createDriverIcon(driver);
          if (!icon) return null;
          
          return (
            <Marker
              key={driver.id}
              position={driver.position}
              icon={icon}
            >
              <Popup>
                <div className="text-center p-2">
                  <img 
                    src={driver.photo} 
                    alt={driver.name}
                    className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-gray-200"
                  />
                  <p className="font-semibold text-gray-900">{driver.name}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    driver.status === 'livre' 
                      ? 'bg-teal-100 text-teal-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {driver.status === 'livre' ? 'Disponível' : 'Em Viagem'}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapaComponent;
