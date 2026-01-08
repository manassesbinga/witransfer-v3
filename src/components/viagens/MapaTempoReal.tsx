'use client';

import dynamic from 'next/dynamic';


// Dynamically import the map component to avoid SSR issues
const DynamicMap = dynamic<any>(() => import('./MapaComponent'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-gray-200 shadow-lg mb-8 bg-gray-100 flex items-center justify-center">
      <div className="text-gray-600">Carregando mapa...</div>
    </div>
  ),
});

const MapaTempoReal = () => {
  return <DynamicMap />;
};

export default MapaTempoReal;
