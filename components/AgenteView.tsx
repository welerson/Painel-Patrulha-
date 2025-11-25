
import React, { useState, useEffect, useRef } from 'react';
import { MapComponent } from './MapComponent';
import { MOCK_PROPRIOS, REGIONALS, VISITING_RADIUS_METERS, DEBOUNCE_MINUTES, getSimulationRoute, REGIONAL_CENTERS } from '../constants';
import { ActivePatrol, Proprio, RoutePoint, Visit, UserSession } from '../types';
import { getDistanceFromLatLonInMeters, getStartOfDay, isQualitativeTarget, formatDate, formatTime } from '../utils/geo';
import { savePatrol, saveVisit, subscribeToVisits } from '../services/storage';

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
  
  // Camera States
  const [showCamera, setShowCamera] = useState(false);
  const [activeVisitForPhoto, setActiveVisitForPhoto] = useState<Visit | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // References for mutable state inside interval/geolocation callbacks
  const patrolPathRef = useRef<RoutePoint[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const simulationIntervalRef = useRef<any>(null);
  const activePatrolRef = useRef<ActivePatrol | null>(null);
  
  // Throttling ref to prevent flooding Firebase with route updates
  const lastSaveTimeRef = useRef<number>(0);
  
  // Local Debounce Map: Stores timestamp of last visit per proprio ID locally
  const lastVisitTimeRef = useRef<Record<string, number>>({});

  // Initialize with ALL proprios visible by default
  const [filteredProprios, setFilteredProprios] = useState<Proprio[]>(MOCK_PROPRIOS);
  
  // Map Center Control - Start at BH Center
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>([-19.9167, -43.9345]);
  const [mapZoom, setMapZoom] = useState<number>(12);

  useEffect(() => {
    // Inscrever para receber visitas em tempo real
    const unsubscribe = subscribeToVisits((visits) => {
      const sorted = visits.sort((a, b) => b.timestamp - a.timestamp);
      setNearbyVisits(sorted);
    }, (error) => {
       if (error.code !== 'permission-denied') {
           // Silently handle permission errors for cleaner UI
       }
    });
    return () => unsubscribe();
  }, []);

  // Filter Proprios and Update Map Center when Regional changes
  useEffect(() => {
    if (selectedRegional) {
      // Robust comparison: Trim and UpperCase
      const filtered = MOCK_PROPRIOS.filter(p => 
        p.regional && p.regional.toUpperCase().trim() === selectedRegional.toUpperCase().trim()
      );
      
      setFilteredProprios(filtered);
      
      // Auto-pan map to regional center
      const center = REGIONAL_CENTERS[selectedRegional];
      if (center) {
        setMapCenter([center.lat, center.lng]);
        setMapZoom(14); // Closer zoom to see points
      }
    } else {
      // Show ALL if no regional selected
      setFilteredProprios(MOCK_PROPRIOS);
      setMapCenter([-19.9167, -43.9345]); // Reset to BH Center
      setMapZoom(12);
    }
  }, [selectedRegional]);

  // --- Camera Logic ---
  const startCamera = async (visit: Visit) => {
    setActiveVisitForPhoto(visit);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Use back camera if available
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert("Erro ao acessar câmera: " + err);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
    setActiveVisitForPhoto(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !activeVisitForPhoto) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // --- Watermark Logic ---
    const fontSize = Math.max(16, canvas.width * 0.03); // Responsive font size
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = 'yellow';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    const now = Date.now();
    const dateStr = formatDate(now);
    const timeStr = formatTime(now);
    const coordsStr = `LAT: ${activeVisitForPhoto.lat.toFixed(5)} LNG: ${activeVisitForPhoto.lng.toFixed(5)}`;
    const locationStr = activeVisitForPhoto.nome_equipamento.substring(0, 30);
    // Informação de autoria
    const agentInfoStr = `Agente: ${user.name || 'N/A'} | ${viaturaId}`;

    const padding = 20;
    const lineHeight = fontSize * 1.2;

    // Draw Text with Shadow/Stroke for visibility
    const drawText = (text: string, x: number, y: number) => {
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    };

    // Bottom Left Positioning (Stacked upwards)
    drawText(agentInfoStr, padding, canvas.height - padding - lineHeight * 3);
    drawText(dateStr + ' ' + timeStr, padding, canvas.height - padding - lineHeight * 2);
    drawText(coordsStr, padding, canvas.height - padding - lineHeight);
    drawText(locationStr, padding, canvas.height - padding);

    // Save Image
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Compress quality 0.7
    
    // Calculate Duration
    const durationSeconds = Math.floor((now - activeVisitForPhoto.timestamp) / 1000);

    // Update Visit in Firebase
    const updatedVisit: Visit = { 
      ...activeVisitForPhoto, 
      photo: dataUrl,
      photoTimestamp: now,
      durationSeconds: durationSeconds
    };
    saveVisit(updatedVisit); // This will merge/update the existing visit

    stopCamera();
  };

  // --- Patrol Logic ---

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
    lastVisitTimeRef.current = {}; 
    lastSaveTimeRef.current = 0;
    
    setPatrolPath([]);
    setPatrolActive(true);
    setIsSimulating(simulate);

    // Salvar estado inicial
    savePatrol(newPatrol);

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
    const route = getSimulationRoute(selectedRegional);
    
    if (route.length === 0) {
      alert("Não foi possível gerar rota para esta regional.");
      stopPatrol();
      return;
    }

    let routeIndex = 0;
    let progress = 0;
    const steps = 60; 
    
    updatePosition(route[0].lat, route[0].lng);

    simulationIntervalRef.current = setInterval(() => {
      if (routeIndex >= route.length - 1) {
        routeIndex = 0;
      }

      const p1 = route[routeIndex];
      const p2 = route[routeIndex + 1];

      const lat = p1.lat + (p2.lat - p1.lat) * (progress / steps);
      const lng = p1.lng + (p2.lng - p1.lng) * (progress / steps);

      updatePosition(lat, lng);

      progress++;
      if (progress >= steps) {
        progress = 0;
        routeIndex++;
      }
    }, 100); 
  };

  const updatePosition = (lat: number, lng: number) => {
    const timestamp = Date.now();
    const point: RoutePoint = { lat, lng, timestamp };

    // Update UI State immediately for smooth animation
    setCurrentPos(point);
    patrolPathRef.current = [...patrolPathRef.current, point];
    setPatrolPath(patrolPathRef.current);

    // THROTTLING: Save to Firebase only every 10 seconds to avoid saturation/resource exhaustion
    if (activePatrolRef.current && (timestamp - lastSaveTimeRef.current > 10000)) {
      activePatrolRef.current.pontos = patrolPathRef.current;
      savePatrol(activePatrolRef.current);
      lastSaveTimeRef.current = timestamp;
    }

    // Check Proximity happens on every tick to ensure we don't miss a spot
    checkProximity(lat, lng, timestamp);
  };

  const stopPatrol = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    
    // Force final save when stopping to ensure complete data
    if (activePatrolRef.current) {
      activePatrolRef.current.fimTurno = Date.now();
      activePatrolRef.current.pontos = patrolPathRef.current; 
      savePatrol(activePatrolRef.current);
    }
    
    setPatrolActive(false);
    setIsSimulating(false);
    activePatrolRef.current = null;
  };

  const checkProximity = (lat: number, lng: number, timestamp: number) => {
    // Check against filtered proprios if regional is selected, otherwise check ALL
    // Use filteredProprios which is updated by the useEffect
    const propriosToCheck = filteredProprios.length > 0 ? filteredProprios : MOCK_PROPRIOS;

    propriosToCheck.forEach(proprio => {
      const dist = getDistanceFromLatLonInMeters(lat, lng, proprio.lat, proprio.lng);
      
      if (dist <= VISITING_RADIUS_METERS) {
        registerVisit(proprio, timestamp);
      }
    });
  };

  const registerVisit = (proprio: Proprio, timestamp: number) => {
    const lastVisit = lastVisitTimeRef.current[proprio.cod] || 0;
    const debounceMs = DEBOUNCE_MINUTES * 60 * 1000;

    if (timestamp - lastVisit < debounceMs) {
      return;
    }

    lastVisitTimeRef.current[proprio.cod] = timestamp;

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
      regional: selectedRegional || proprio.regional // Use proprio regional if patrol is global
    };

    // Save to Firebase (Optimistic Update is handled by the subscription)
    saveVisit(newVisit);
      
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  // Calculate today's visits for this specific vehicle
  const startOfToday = getStartOfDay();
  const visitsToday = nearbyVisits.filter(
    v => v.idViatura === viaturaId && v.timestamp >= startOfToday
  );
  const visitsTodayCount = visitsToday.length;

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
                  <option value="">Selecione a Regional (Todas)</option>
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
              <span className="text-xs text-slate-600 font-mono">{viaturaId} • {selectedRegional || 'Geral'}</span>
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
          center={mapCenter} 
          zoom={mapZoom}
        />
        
        {/* Visit Log Overlay (During Patrol) */}
        {patrolActive && (
           <div className="absolute top-4 right-4 w-72 bg-white/95 backdrop-blur p-3 rounded-xl shadow-xl z-[400] border border-slate-200 max-h-64 overflow-y-auto">
             <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 sticky top-0 bg-white/95 pb-1">Registro de Visitas (Ao Vivo)</h3>
             <div className="space-y-2">
                {visitsToday.slice(0, 10).map((visit) => {
                  const needsPhoto = isQualitativeTarget(visit.nome_equipamento);
                  const hasPhoto = !!visit.photo;
                  return (
                    <div key={visit.id} className="text-xs border-l-2 border-blue-500 pl-2 py-1 bg-blue-50 rounded-r relative">
                      <p className="font-bold text-slate-800">{visit.nome_equipamento}</p>
                      <p className="text-slate-500">{formatTime(visit.timestamp)}</p>
                      
                      {needsPhoto && !hasPhoto && (
                        <button 
                          onClick={() => startCamera(visit)}
                          className="mt-1 w-full bg-amber-500 text-white font-bold py-1 px-2 rounded flex items-center justify-center gap-1 hover:bg-amber-600 animate-pulse"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Registrar Foto
                        </button>
                      )}
                      {hasPhoto && (
                         <span className="mt-1 inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded border border-emerald-200">
                           ✓ Foto Registrada
                         </span>
                      )}
                    </div>
                  );
                })}
                {visitsToday.length === 0 && <p className="text-slate-400 text-xs italic text-center py-2">Nenhuma visita registrada ainda.</p>}
             </div>
           </div>
        )}

        {/* Stats Overlay */}
        {patrolActive && (
           <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-4 md:w-64 bg-white/95 backdrop-blur p-4 rounded-xl shadow-2xl z-[400] border border-slate-200 flex flex-row md:flex-col justify-around md:gap-4 text-center">
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visitas Hoje</p>
               <p className="font-bold text-2xl text-slate-800">
                 {visitsTodayCount}
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

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-[1000] flex flex-col">
          <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden">
             <video ref={videoRef} className="absolute w-full h-full object-cover" autoPlay playsInline muted></video>
             <canvas ref={canvasRef} className="hidden"></canvas>
             
             {/* Overlay Info */}
             <div className="absolute bottom-24 left-4 right-4 z-10 text-yellow-300 font-mono text-xs md:text-sm drop-shadow-md pointer-events-none">
               <p>{activeVisitForPhoto?.nome_equipamento}</p>
               <p>{formatDate(Date.now())} {formatTime(Date.now())}</p>
               <p>LAT: {activeVisitForPhoto?.lat.toFixed(5)} LNG: {activeVisitForPhoto?.lng.toFixed(5)}</p>
             </div>
          </div>
          
          <div className="h-24 bg-slate-900 flex items-center justify-around p-4">
             <button 
               onClick={stopCamera}
               className="text-white font-bold px-6 py-2 rounded border border-slate-600"
             >
               Cancelar
             </button>
             <button 
               onClick={capturePhoto}
               className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center active:bg-slate-200 active:scale-95 transition"
             >
               <div className="w-12 h-12 bg-slate-900 rounded-full"></div>
             </button>
             <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      )}
    </div>
  );
};
