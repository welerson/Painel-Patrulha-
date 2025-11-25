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
  
  const patrolPathRef = useRef<RoutePoint[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const simulationIntervalRef = useRef<any>(null);
  const activePatrolRef = useRef<ActivePatrol | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const lastVisitTimeRef = useRef<Record<string, number>>({});

  // Initialize with ALL proprios
  const [filteredProprios, setFilteredProprios] = useState<Proprio[]>(MOCK_PROPRIOS);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>([-19.9167, -43.9345]);
  const [mapZoom, setMapZoom] = useState<number>(12);

  // Função para normalizar strings (remove acentos, espaços, traços)
  // Isso resolve o problema de "CENTRO-SUL" vs "CENTRO SUL"
  const normalize = (str: string) => str.toUpperCase().replace(/[^A-Z0-9]/g, '');

  useEffect(() => {
    const unsubscribe = subscribeToVisits((visits) => {
      const sorted = visits.sort((a, b) => b.timestamp - a.timestamp);
      setNearbyVisits(sorted);
    });
    return () => unsubscribe();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (selectedRegional) {
      const target = normalize(selectedRegional);
      
      const filtered = MOCK_PROPRIOS.filter(p => {
        if (!p.regional) return false;
        return normalize(p.regional) === target;
      });
      
      setFilteredProprios(filtered);
      
      // Find center using normalized key match
      const centerKey = Object.keys(REGIONAL_CENTERS).find(k => normalize(k) === target);
      if (centerKey) {
        const c = REGIONAL_CENTERS[centerKey];
        setMapCenter([c.lat, c.lng]);
        setMapZoom(14);
      }
    } else {
      setFilteredProprios(MOCK_PROPRIOS);
      setMapCenter([-19.9167, -43.9345]);
      setMapZoom(12);
    }
    
    // Force map resize fix
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
  }, [selectedRegional]);

  const startCamera = async (visit: Visit) => {
    setActiveVisitForPhoto(visit);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Watermark
    const fontSize = Math.max(16, canvas.width * 0.03);
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = 'yellow';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    const now = Date.now();
    const agentInfoStr = `Agente: ${user.name || 'N/A'} | ${viaturaId}`;
    const dateStr = formatDate(now) + ' ' + formatTime(now);
    const locationStr = activeVisitForPhoto.nome_equipamento.substring(0, 30);
    
    const padding = 20;
    const lh = fontSize * 1.2;
    
    const drawText = (t: string, x: number, y: number) => { ctx.strokeText(t,x,y); ctx.fillText(t,x,y); };
    
    drawText(agentInfoStr, padding, canvas.height - padding - lh * 2);
    drawText(dateStr, padding, canvas.height - padding - lh);
    drawText(locationStr, padding, canvas.height - padding);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    const duration = Math.floor((now - activeVisitForPhoto.timestamp) / 1000);
    
    saveVisit({ ...activeVisitForPhoto, photo: dataUrl, photoTimestamp: now, durationSeconds: duration });
    stopCamera();
  };

  const startPatrol = (simulate = false) => {
    if (!viaturaId || !selectedRegional) {
      alert('Informe Viatura e Regional.');
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
    setPatrolPath([]);
    setPatrolActive(true);
    setIsSimulating(simulate);
    savePatrol(newPatrol);
    
    if (simulate) startSimulation();
    else startRealGps();
  };

  const startRealGps = () => {
     if (!navigator.geolocation) return alert('GPS não suportado');
     watchIdRef.current = navigator.geolocation.watchPosition(
       pos => updatePosition(pos.coords.latitude, pos.coords.longitude),
       err => alert('Erro GPS: ' + err.message),
       { enableHighAccuracy: true }
     );
  };

  const startSimulation = () => {
    const route = getSimulationRoute(selectedRegional);
    if (route.length === 0) { alert("Rota não encontrada"); stopPatrol(); return; }
    let idx = 0;
    
    updatePosition(route[0].lat, route[0].lng);
    simulationIntervalRef.current = setInterval(() => {
       const next = (idx + 1) % route.length;
       updatePosition(route[idx].lat, route[idx].lng);
       idx = next;
    }, 2000);
  };

  const updatePosition = (lat: number, lng: number) => {
    const now = Date.now();
    const p: RoutePoint = { lat, lng, timestamp: now };
    setCurrentPos(p);
    patrolPathRef.current = [...patrolPathRef.current, p];
    setPatrolPath(patrolPathRef.current);
    
    if (activePatrolRef.current && (now - lastSaveTimeRef.current > 10000)) {
       activePatrolRef.current.pontos = patrolPathRef.current;
       savePatrol(activePatrolRef.current);
       lastSaveTimeRef.current = now;
    }
    checkProximity(lat, lng, now);
  };

  const checkProximity = (lat: number, lng: number, ts: number) => {
    const list = filteredProprios.length > 0 ? filteredProprios : MOCK_PROPRIOS;
    list.forEach(p => {
       if (getDistanceFromLatLonInMeters(lat, lng, p.lat, p.lng) <= VISITING_RADIUS_METERS) {
         registerVisit(p, ts);
       }
    });
  };

  const registerVisit = (p: Proprio, ts: number) => {
     const last = lastVisitTimeRef.current[p.cod] || 0;
     if (ts - last < DEBOUNCE_MINUTES * 60000) return;
     lastVisitTimeRef.current[p.cod] = ts;
     saveVisit({
       id: `${p.cod}-${ts}`,
       proprioId: p.cod,
       cod: p.cod,
       nome_equipamento: p.nome_equipamento,
       lat: p.lat,
       lng: p.lng,
       timestamp: ts,
       idViatura: viaturaId,
       agente: user.name || '',
       regional: selectedRegional || p.regional // Use selected if available or proprio's
     });
     if (navigator.vibrate) navigator.vibrate(200);
  };

  const stopPatrol = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    if (activePatrolRef.current) {
       activePatrolRef.current.fimTurno = Date.now();
       activePatrolRef.current.pontos = patrolPathRef.current;
       savePatrol(activePatrolRef.current);
    }
    setPatrolActive(false);
    setIsSimulating(false);
  };

  const startOfToday = getStartOfDay();
  const visitsTodayCount = nearbyVisits.filter(v => v.idViatura === viaturaId && v.timestamp >= startOfToday).length;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <header className="bg-slate-900 text-white p-4 shadow-md z-20 flex justify-between items-center shrink-0">
        <div><h1 className="font-bold text-lg">Patrulha PBH</h1><p className="text-xs text-slate-400">Agente: {user.name}</p></div>
        <button onClick={onLogout} className="text-sm underline">Sair</button>
      </header>

      <div className="bg-white shadow-md border-b border-slate-200 z-10 shrink-0 p-4">
        {!patrolActive ? (
          <div className="flex flex-col gap-3">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="border p-2 rounded" placeholder="Viatura" value={viaturaId} onChange={e => setViaturaId(e.target.value)} />
                <select className="border p-2 rounded" value={selectedRegional} onChange={e => setSelectedRegional(e.target.value)}>
                  <option value="">Todas as Regionais</option>
                  {REGIONALS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startPatrol(false)} className="flex-1 bg-blue-700 text-white font-bold py-3 rounded">Iniciar GPS</button>
              <button onClick={() => startPatrol(true)} className="flex-1 bg-amber-600 text-white font-bold py-3 rounded">Simulação</button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div className="text-emerald-700 font-bold">Patrulhamento Ativo ({viaturaId})</div>
            <button onClick={stopPatrol} className="bg-red-600 text-white font-bold py-2 px-4 rounded">Encerrar</button>
          </div>
        )}
      </div>

      <div className="flex-grow relative z-0 h-full">
        <MapComponent proprios={filteredProprios} visits={nearbyVisits} currentPosition={currentPos} routePath={patrolPath} center={mapCenter} zoom={mapZoom} />
        
        {patrolActive && (
           <div className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg z-[400] text-center border border-slate-300">
             <p className="text-xs font-bold text-slate-500 uppercase">Visitas Hoje</p>
             <p className="text-3xl font-bold text-slate-800">{visitsTodayCount}</p>
             {nearbyVisits.length > 0 && isQualitativeTarget(nearbyVisits[nearbyVisits.length-1].nome_equipamento) && !nearbyVisits[nearbyVisits.length-1].photo && (
                 <button onClick={() => startCamera(nearbyVisits[nearbyVisits.length-1])} className="mt-2 bg-amber-500 text-white px-4 py-2 rounded font-bold animate-pulse">📸 Registrar Foto</button>
             )}
           </div>
        )}
      </div>

      {showCamera && (
        <div className="fixed inset-0 bg-black z-[1000] flex flex-col">
          <div className="flex-grow relative"><video ref={videoRef} className="w-full h-full object-cover" autoPlay muted /><canvas ref={canvasRef} className="hidden" /></div>
          <div className="h-24 bg-slate-900 flex items-center justify-around">
             <button onClick={stopCamera} className="text-white font-bold">Cancelar</button>
             <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-slate-300"></button>
             <div className="w-16"></div>
          </div>
        </div>
      )}
    </div>
  );
};