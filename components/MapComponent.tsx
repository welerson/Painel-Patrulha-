import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Proprio, RoutePoint, Visit } from '../types';
import { formatTime } from '../utils/geo';

// Fix default leaflet icon issue
const createIcon = (color: 'blue' | 'green' | 'red', isViatura = false) => {
  const size = isViatura ? 32 : 14;
  const colorHex = isViatura 
    ? '#ef4444' // Red for viatura
    : color === 'green' 
      ? '#10b981' // Green for visited
      : '#3b82f6'; // Blue for unvisited
  
  const zIndex = isViatura ? 1000 : 1;

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="
      background-color: ${colorHex};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${isViatura ? '3px' : '2px'} solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      ${isViatura ? '<div style="width: 8px; height: 8px; background: white; border-radius: 50%"></div>' : ''}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

interface MapProps {
  proprios: Proprio[];
  visits: Visit[];
  currentPosition?: RoutePoint;
  routePath?: RoutePoint[];
  center?: [number, number];
  zoom?: number;
}

const MapUpdater: React.FC<{ center?: [number, number], zoom?: number, position?: RoutePoint }> = ({ center, zoom, position }) => {
  const map = useMap();
  
  // Fix for map not rendering correctly if container size changes
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (position) {
      map.panTo([position.lat, position.lng], { animate: true, duration: 0.5 });
    }
  }, [position, map]);

  return null;
};

export const MapComponent: React.FC<MapProps> = ({ proprios, visits, currentPosition, routePath, center, zoom }) => {
  
  const getVisitInfo = (cod: string) => {
    const relevantVisits = visits.filter(v => v.cod === cod).sort((a, b) => b.timestamp - a.timestamp);
    return relevantVisits;
  };

  const defaultCenter: [number, number] = center || [-19.9167, -43.9345]; // BH Center

  return (
    <MapContainer center={defaultCenter} zoom={zoom || 13} style={{ height: '100%', width: '100%', background: '#e2e8f0' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={center} zoom={zoom} position={currentPosition} />

      {/* Markers for Próprios */}
      {proprios.map(proprio => {
        const propVisits = getVisitInfo(proprio.cod);
        const isVisited = propVisits.length > 0;
        
        return (
          <Marker 
            key={proprio.cod} 
            position={[proprio.lat, proprio.lng]} 
            icon={createIcon(isVisited ? 'green' : 'blue')}
            zIndexOffset={isVisited ? 10 : 0}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <h3 className="font-bold text-slate-800 text-base">{proprio.nome_equipamento}</h3>
                <p className="text-slate-600 mt-1">{proprio.tipo_logradouro} {proprio.nome_logradouro}, {proprio.numero_imovel}</p>
                <p className="text-slate-500 text-xs mb-2">{proprio.bairro} - {proprio.regional}</p>
                
                <div className="pt-2 border-t border-slate-200 bg-slate-50 -mx-4 -mb-4 p-3 rounded-b">
                  {isVisited ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                         <span className="text-emerald-700 font-bold text-xs">
                           Visitado {propVisits.length}x
                         </span>
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {propVisits.slice(0, 5).map((v, i) => (
                          <div key={i} className="text-xs text-slate-500 border-b border-slate-100 last:border-0 pb-1">
                            <span className="font-mono">{formatTime(v.timestamp)}</span> - {v.idViatura} <br/>
                            <span className="text-[10px]">{v.agente}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                       <span className="text-slate-500 text-xs">Não visitado neste turno</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Current Position Marker & Pulse */}
      {currentPosition && (
        <>
          <Circle center={[currentPosition.lat, currentPosition.lng]} radius={70} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.15, weight: 0 }} />
          <Marker position={[currentPosition.lat, currentPosition.lng]} icon={createIcon('red', true)} zIndexOffset={1000}>
             <Popup>Viatura Atual</Popup>
          </Marker>
        </>
      )}

      {/* Route Path */}
      {routePath && routePath.length > 1 && (
        <Polyline 
          positions={routePath.map(p => [p.lat, p.lng])} 
          pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.8, lineCap: 'round' }} 
        />
      )}

    </MapContainer>
  );
};