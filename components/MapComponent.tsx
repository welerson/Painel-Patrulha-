
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Proprio, RoutePoint, Visit } from '../types';
import { formatTime, formatDate, getProprioStatus } from '../utils/geo';

// Icons configuration
const createIcon = (status: 'green' | 'blue' | 'red' | 'viatura', isViatura = false) => {
  const size = isViatura ? 32 : 14;
  
  let colorHex = '#3b82f6'; 
  let borderColor = 'white';

  if (isViatura) {
    colorHex = '#ef4444'; // Viatura Vermelha
  } else {
    switch (status) {
      case 'green': 
        colorHex = '#10b981'; // Verde (Visitado Hoje)
        break;
      case 'blue': 
        colorHex = '#3b82f6'; // AZUL (Pendente Hoje / Recente)
        break;
      case 'red': 
        colorHex = '#ef4444'; // Vermelho (Atrasado)
        break;
    }
  }
  
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
    tooltipAnchor: [0, -size / 2], // Ajuste para centralizar o tooltip acima do ícone
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
    return visits.filter(v => v.cod === cod).sort((a, b) => b.timestamp - a.timestamp);
  };

  return (
    <MapContainer center={center || [-19.9167, -43.9345]} zoom={zoom || 13} style={{ height: '100%', width: '100%', background: '#e2e8f0' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={center} zoom={zoom} position={currentPosition} />

      {proprios.map(proprio => {
        const propVisits = getVisitInfo(proprio.cod);
        const lastVisit = propVisits.length > 0 ? propVisits[0] : undefined;
        
        // Retorna 'green', 'blue' ou 'red'
        const status = getProprioStatus(lastVisit?.timestamp, proprio.prioridade);
        
        let statusText = '';
        if (status === 'green') statusText = 'Visitado Hoje (OK)';
        else if (status === 'blue') statusText = 'Planejamento (Fazer Hoje)';
        else statusText = 'Atrasado (> 3 dias)';
        
        const statusColorClass = 
          status === 'green' ? 'text-emerald-700' : 
          status === 'blue' ? 'text-blue-600' : 
          'text-red-600';

        const statusBgClass = 
          status === 'green' ? 'bg-emerald-500' : 
          status === 'blue' ? 'bg-blue-500' : 
          'bg-red-500';

        return (
          <Marker 
            key={proprio.cod} 
            position={[proprio.lat, proprio.lng]} 
            icon={createIcon(status)}
            zIndexOffset={status === 'green' ? 0 : 10} 
          >
            <Tooltip 
              direction="top" 
              offset={[0, -10]} 
              opacity={1} 
              interactive={true} // Permite clicar no conteúdo (ex: foto)
            >
              <div className="text-sm min-w-[220px]">
                <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-slate-800 text-base pr-2">{proprio.nome_equipamento}</h3>
                   {proprio.prioridade && (
                     <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-gray-50 border-gray-200 text-gray-600">
                       {proprio.prioridade}
                     </span>
                   )}
                </div>
                <p className="text-slate-600 mt-1">{proprio.tipo_logradouro} {proprio.nome_logradouro}, {proprio.numero_imovel}</p>
                <p className="text-slate-500 text-xs mb-2">{proprio.bairro} - {proprio.regional}</p>
                
                <div className="pt-2 border-t border-slate-200 bg-slate-50 -mx-2 -mb-2 p-3 rounded-b">
                  <div className="flex items-center gap-2 mb-2">
                     <div className={`w-2 h-2 rounded-full ${statusBgClass}`}></div>
                     <span className={`${statusColorClass} font-bold text-xs uppercase`}>
                       {statusText}
                     </span>
                  </div>
                  
                  {lastVisit ? (
                    <div className="mb-2 text-xs text-slate-500">
                      Última: <strong>{formatDate(lastVisit.timestamp)}</strong> às {formatTime(lastVisit.timestamp)}
                      
                      {lastVisit.photo && (
                        <div className="mt-2">
                          <p className="text-[10px] font-bold text-slate-400 mb-1">PROVA VISUAL</p>
                          <img 
                            src={lastVisit.photo} 
                            alt="Prova" 
                            className="w-full h-auto rounded border border-slate-300 shadow-sm cursor-pointer hover:opacity-90 transition"
                            onClick={() => {
                              const w = window.open("");
                              w?.document.write(`<img src="${lastVisit.photo}" style="width:100%; max-width:800px; margin: 0 auto; display:block;">`);
                            }}
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Por: {lastVisit.agente} - {lastVisit.idViatura}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-2 text-xs text-red-500 font-semibold">
                      Nunca visitado
                    </div>
                  )}
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}

      {currentPosition && (
        <>
          <Circle center={[currentPosition.lat, currentPosition.lng]} radius={70} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.15, weight: 0 }} />
          <Marker position={[currentPosition.lat, currentPosition.lng]} icon={createIcon('viatura', true)} zIndexOffset={1000}>
             <Tooltip direction="top" offset={[0, -16]}>Viatura Atual</Tooltip>
          </Marker>
        </>
      )}

      {routePath && routePath.length > 1 && (
        <Polyline 
          positions={routePath.map(p => [p.lat, p.lng])} 
          pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.8, lineCap: 'round' }} 
        />
      )}

    </MapContainer>
  );
};
