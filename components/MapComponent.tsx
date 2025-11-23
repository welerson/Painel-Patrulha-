import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Proprio, RoutePoint, Visit } from '../types';
import { formatTime, formatDate, getStartOfDay, getDaysSince } from '../utils/geo';

// Icons configuration based on status
const createIcon = (status: 'green' | 'orange' | 'red' | 'viatura', isViatura = false) => {
  const size = isViatura ? 32 : 14;
  
  let colorHex = '#3b82f6'; // default blue fallback
  let borderColor = 'white';

  if (isViatura) {
    colorHex = '#ef4444'; // Red pulse for viatura
  } else {
    switch (status) {
      case 'green': // Visited TODAY
        colorHex = '#10b981'; 
        break;
      case 'orange': // Pending TODAY (Visited recently)
        colorHex = '#f97316';
        break;
      case 'red': // Critical (Not visited > 3 days)
        colorHex = '#ef4444';
        break;
    }
  }
  
  const zIndex = isViatura ? 1000 : 1;

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="
      background-color: ${colorHex};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${isViatura ? '3px' : '2px'} solid ${borderColor};
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
    // Returns visits sorted by newest first
    return visits.filter(v => v.cod === cod).sort((a, b) => b.timestamp - a.timestamp);
  };

  const getStatus = (propVisits: Visit[]) => {
    if (propVisits.length === 0) return 'red'; // Never visited

    const lastVisit = propVisits[0];
    const startOfToday = getStartOfDay();

    if (lastVisit.timestamp >= startOfToday) {
      return 'green'; // Visited today
    }

    const daysSince = getDaysSince(lastVisit.timestamp);
    if (daysSince <= 3) {
      return 'orange'; // Pending today, but ok recently
    }

    return 'red'; // Critical (> 3 days)
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
        const status = getStatus(propVisits);
        const lastVisit = propVisits.length > 0 ? propVisits[0] : null;
        
        // Legend logic for popup
        const statusText = 
          status === 'green' ? 'Visitado Hoje' : 
          status === 'orange' ? 'Pendente Hoje' : 
          'ATENÇÃO: Atrasado (> 3 dias)';
        
        const statusColorClass = 
          status === 'green' ? 'text-emerald-700' : 
          status === 'orange' ? 'text-orange-600' : 
          'text-red-600';

        return (
          <Marker 
            key={proprio.cod} 
            position={[proprio.lat, proprio.lng]} 
            icon={createIcon(status)}
            zIndexOffset={status === 'green' ? 0 : 10} // Bring attention to unvisited
          >
            <Popup>
              <div className="text-sm min-w-[220px]">
                <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-slate-800 text-base pr-2">{proprio.nome_equipamento}</h3>
                   <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${status === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : status === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                     {status === 'green' ? 'OK' : status === 'orange' ? 'VISITAR' : 'CRÍTICO'}
                   </span>
                </div>
                <p className="text-slate-600 mt-1">{proprio.tipo_logradouro} {proprio.nome_logradouro}, {proprio.numero_imovel}</p>
                <p className="text-slate-500 text-xs mb-2">{proprio.bairro} - {proprio.regional}</p>
                
                <div className="pt-2 border-t border-slate-200 bg-slate-50 -mx-4 -mb-4 p-3 rounded-b">
                  <div className="flex items-center gap-2 mb-2">
                     <div className={`w-2 h-2 rounded-full ${status === 'green' ? 'bg-emerald-500' : status === 'orange' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                     <span className={`${statusColorClass} font-bold text-xs`}>
                       {statusText}
                     </span>
                  </div>
                  
                  {lastVisit ? (
                    <div className="mb-2 text-xs text-slate-500">
                      Última visita: <strong>{formatDate(lastVisit.timestamp)}</strong> às {formatTime(lastVisit.timestamp)}
                      {status !== 'green' && <span className="block text-[10px] text-slate-400">({getDaysSince(lastVisit.timestamp)} dias atrás)</span>}
                    </div>
                  ) : (
                    <div className="mb-2 text-xs text-red-500 font-semibold">
                      Nunca visitado
                    </div>
                  )}

                  {propVisits.length > 0 && (
                    <div className="max-h-24 overflow-y-auto space-y-1 border-t border-slate-200 pt-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Histórico Recente</p>
                      {propVisits.slice(0, 3).map((v, i) => (
                        <div key={i} className="text-xs text-slate-500 pb-1">
                          <span className="font-mono">{formatDate(v.timestamp)} {formatTime(v.timestamp)}</span><br/>
                          <span className="text-[10px]">{v.idViatura} ({v.agente})</span>
                        </div>
                      ))}
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
          <Marker position={[currentPosition.lat, currentPosition.lng]} icon={createIcon('viatura', true)} zIndexOffset={1000}>
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