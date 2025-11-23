import React, { useState, useEffect, useRef } from 'react';
import { MapComponent } from './MapComponent';
import { MOCK_PROPRIOS, REGIONALS, VISITING_RADIUS_METERS, DEBOUNCE_MINUTES, getSimulationRoute } from '../constants';
import { ActivePatrol, Proprio, RoutePoint, Visit, UserSession } from '../types';
import { getDistanceFromLatLonInMeters, formatTime } from '../utils/geo';
import { savePatrol, saveVisit, getVisits } from '../services/storage';

interface AgenteViewProps {
  user: UserSession;
  onLogout: () => void;
}

export const AgenteView: React.FC<AgenteViewProps> = ({ user, onLogout }) => {
  const [patrolActive, setPatrolActive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viaturaId, setViaturaId] = useState('');
  const [selectedRegional, setSelectedRegional] = useState('');
  
  const [currentPos, setCurrentPos] = useState<RoutePoint | undefined>(undefined);
  const [patrolPath, setPatrolPath] = useState<RoutePoint[]>([]);
  const [nearbyVisits, setNearbyVisits] = useState<Visit[]>([]);
  
  // References for mutable state inside interval/geolocation callbacks
  const patrolPathRef = useRef<RoutePoint[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const simulationIntervalRef = useRef<any>(null);
  const activePatrolRef = useRef<ActivePatrol | null>(null);

  // Initialize filtered list of public buildings
  const [filteredProprios, setFilteredProprios] = useState<Proprio[]>([]);

  useEffect(() => {
    // Load previous visits for context on the map
    const loaded = getVisits();
    setNearbyVisits(loaded);
  }, []);

  useEffect(() => {
    if (selectedRegional) {
      setFilteredProprios(MOCK_PROPRIOS.filter(p => p.regional === selectedRegional));
    } else {
      setFilteredProprios(MOCK_PROPRIOS);
    }
  }, [selectedRegional]);

  const startPatrol = (simulate = false) => {
    if (!viaturaId) {
      alert('Por favor, informe a Viatura.');
      return;
    }
    
    if (!selectedRegional) {
      alert('Selecione a Regional para iniciar (mesmo em simulação).');
      return;
    }

    const newPatrol: ActivePatrol = {
      id: Date.now().toString(),
      idViatura: viaturaId,
      agente: user.name || 'Agente',
      regional: selectedRegional,
      inicioTurno: Date.now(),
      pontos: []
    };

    activePatrolRef.current = newPatrol;
    patrolPathRef.current = [];
    setPatrolPath([]);
    setPatrolActive(true);
    setIsSimulating(simulate);

    if (simulate) {
      startSimulation();
    } else {
      startRealGps();
    }
  };

  const startRealGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updatePosition(latitude, longitude);
      },
      (error) => {
        console.error("Geo error:", error);
        alert("Erro ao obter localização. Verifique permissões ou use a Simulação.");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  const startSimulation = () => {
    // Get dynamic route based on selected regional
    const route = getSimulationRoute(selectedRegional);
    
    if (route.length === 0) {
      alert("Não foi possível gerar rota para esta regional.");
      stopPatrol();
      return;
    }

    let routeIndex = 0;
    let progress = 0;
    const steps = 50; // steps between points for smoothness
    
    // Start at first point
    updatePosition(route[0].lat, route[0].lng);

    simulationIntervalRef.current = setInterval(() => {
      if (routeIndex >= route.length - 1) {
        // Loop route for continuous simulation or stop? Let's loop for continuous testing of "varias viaturas"
        routeIndex = 0;
        // clearInterval(simulationIntervalRef.current);
        // alert("Simulação de rota concluída.");
        // return;
      }

      const p1 = route[routeIndex];
      const p2 = route[routeIndex + 1];

      // Simple interpolation
      const lat = p1.lat + (p2.lat - p1.lat) * (progress / steps);
      const lng = p1.lng + (p2.lng - p1.lng) * (progress / steps);

      updatePosition(lat, lng);

      progress++;
      if (progress >= steps) {
        progress = 0;
        routeIndex++;
      }
    }, 100); // Update every 100ms for faster simulation
  };

  const updatePosition = (lat: number, lng: number) => {
    const timestamp = Date.now();
    const point: RoutePoint = { lat, lng, timestamp };

    // Update State
    setCurrentPos(point);
    
    // Add to path
    patrolPathRef.current = [...patrolPathRef.current, point];
    setPatrolPath(patrolPathRef.current);

    // Update active patrol object and save to storage (simulating backend update)
    if (activePatrolRef.current) {
      activePatrolRef.current.pontos = patrolPathRef.current;
      savePatrol(activePatrolRef.current);
    }

    // Check Proximity
    checkProximity(lat, lng, timestamp);
  };

  const stopPatrol = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    if (activePatrolRef.current) {
      activePatrolRef.current.fimTurno = Date.now();
      savePatrol(activePatrolRef.current);
    }
    setPatrolActive(false);
    setIsSimulating(false);
    activePatrolRef.current = null;
  };

  const checkProximity = (lat: number, lng: number, timestamp: number) => {
    const propriosToCheck = filteredProprios.length > 0 
      ? filteredProprios 
      : MOCK_PROPRIOS;

    propriosToCheck.forEach(proprio => {
      const dist = getDistanceFromLatLonInMeters(lat, lng, proprio.lat, proprio.lng);
      
      if (dist <= VISITING_RADIUS_METERS) {
        registerVisit(proprio, timestamp);
      }
    });
  };

  const registerVisit = (proprio: Proprio, timestamp: number) => {
    // Debounce check
    const recentVisits = getVisits().filter(
      v => v.proprioId === proprio.cod && 
           v.idViatura === viaturaId && 
           (timestamp - v.timestamp) < (DEBOUNCE_MINUTES * 60 * 1000)
    );

    if (recentVisits.length === 0) {
      const newVisit: Visit = {
        id: `${proprio.cod}-${timestamp}`,
        proprioId: proprio.cod,
        cod: proprio.cod,
        nome_equipamento: proprio.nome_equipamento,
        lat: proprio.lat,
        lng: proprio.lng,
        timestamp,
        idViatura: viaturaId,
        agente: user.name || 'Desconhecido',
        regional: selectedRegional
      };

      saveVisit(newVisit);
      setNearbyVisits(prev => [...prev, newVisit]);
      
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md z-20 flex justify-between items-center shrink-0">
        <div>
          <h1 className="font-bold text-lg leading-tight">Patrulha PBH</h1>
          <p className="text-xs text-slate-400">Bem-vindo, {user.name}</p>
        </div>
        <button onClick={onLogout} className="text-sm text-slate-300 hover:text-white underline">Sair</button>
      </header>

      {/* Controls Overlay */}
      <div className="bg-white shadow-md border-b border-slate-200 z-10 shrink-0">
        {!patrolActive ? (
          <div className="p-4 flex flex-col gap-3">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Viatura (Ex: VTR 123)" 
                  className="border border-slate-300 p-2 rounded w-full"
                  value={viaturaId}
                  onChange={e => setViaturaId(e.target.value)}
                />
                <select 
                  className="border border-slate-300 p-2 rounded w-full"
                  value={selectedRegional}
                  onChange={e => setSelectedRegional(e.target.value)}
                >
                  <option value="">Selecione a Regional</option>
                  {REGIONALS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => startPatrol(false)}
                className="flex-1 bg-blue-700 text-white font-bold py-3 px-4 rounded hover:bg-blue-800 transition shadow"
              >
                Iniciar GPS Real
              </button>
              <button 
                onClick={() => startPatrol(true)}
                className="flex-1 bg-amber-600 text-white font-bold py-3 px-4 rounded hover:bg-amber-700 transition shadow"
              >
                Modo Simulação
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Use o Modo Simulação para testar rotas automáticas na Regional selecionada.
            </p>
          </div>
        ) : (
          <div className="p-3 flex items-center justify-between bg-emerald-50 border-b border-emerald-100">
            <div className="flex flex-col">
              <span className="text-emerald-700 font-bold text-sm flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                {isSimulating ? 'Simulação Ativa' : 'Patrulhamento Ativo'}
              </span>
              <span className="text-xs text-slate-600 font-mono">{viaturaId} • {selectedRegional}</span>
            </div>
            <button 
              onClick={stopPatrol}
              className="bg-red-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-red-700 transition text-sm"
            >
              Encerrar Turno
            </button>
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className="flex-grow relative z-0 h-full">
        <MapComponent 
          proprios={filteredProprios} 
          visits={nearbyVisits}
          currentPosition={currentPos}
          routePath={patrolPath}
          // Only center automatically if not active. When active, map follows car.
          center={!patrolActive ? [-19.9167, -43.9345] : undefined} 
          zoom={patrolActive ? 15 : 12}
        />
        
        {/* Stats Overlay */}
        {patrolActive && (
           <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-4 md:w-64 bg-white/95 backdrop-blur p-4 rounded-xl shadow-2xl z-[400] border border-slate-200 flex flex-row md:flex-col justify-around md:gap-4 text-center">
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visitas Turno</p>
               <p className="font-bold text-2xl text-slate-800">
                 {nearbyVisits.filter(v => v.idViatura === viaturaId && v.timestamp > (activePatrolRef.current?.inicioTurno || 0)).length}
               </p>
             </div>
             <div className="w-px h-full bg-slate-200 md:w-full md:h-px"></div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tempo</p>
               <p className="font-bold text-2xl text-slate-800">
                 {Math.floor((Date.now() - (activePatrolRef.current?.inicioTurno || Date.now())) / 60000)} <span className="text-sm font-normal text-slate-500">min</span>
               </p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};