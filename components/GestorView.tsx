import React, { useState, useEffect } from 'react';
import { MapComponent } from './MapComponent';
import { MOCK_PROPRIOS, REGIONALS } from '../constants';
import { Visit, ActivePatrol, UserSession } from '../types';
import { getVisits, getPatrols } from '../services/storage';
import { formatDate, formatTime } from '../utils/geo';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GestorViewProps {
  user: UserSession;
  onLogout: () => void;
}

export const GestorView: React.FC<GestorViewProps> = ({ user, onLogout }) => {
  // Data state
  const [allVisits, setAllVisits] = useState<Visit[]>([]);
  const [allPatrols, setAllPatrols] = useState<ActivePatrol[]>([]);
  
  // Filters
  const [filterRegional, setFilterRegional] = useState('');
  const [filterViatura, setFilterViatura] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Derived state
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [filteredProprios, setFilteredProprios] = useState(MOCK_PROPRIOS);
  const [filteredRoutes, setFilteredRoutes] = useState<ActivePatrol[]>([]);

  useEffect(() => {
    // Initial Load
    loadData();

    // Polling for real-time updates from simulations in other tabs
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setAllVisits(getVisits());
    setAllPatrols(getPatrols());
  };

  useEffect(() => {
    let v = allVisits;
    let p = MOCK_PROPRIOS;
    let r = allPatrols;

    if (filterRegional) {
      v = v.filter(visit => visit.regional === filterRegional);
      p = p.filter(prop => prop.regional === filterRegional);
      r = r.filter(route => route.regional === filterRegional);
    }

    if (filterViatura) {
      v = v.filter(visit => visit.idViatura.includes(filterViatura));
      r = r.filter(route => route.idViatura.includes(filterViatura));
    }

    if (filterDate) {
      // Simple day check
      v = v.filter(visit => {
        const visitDate = new Date(visit.timestamp);
        return visitDate.toISOString().split('T')[0] === filterDate;
      });
      r = r.filter(route => {
        const routeDate = new Date(route.inicioTurno);
        return routeDate.toISOString().split('T')[0] === filterDate;
      });
    }

    setFilteredVisits(v);
    setFilteredProprios(p);
    setFilteredRoutes(r);

  }, [filterRegional, filterViatura, filterDate, allVisits, allPatrols]);

  // Statistics
  const totalProprios = filteredProprios.length;
  const visitedPropriosIds = new Set(filteredVisits.map(v => v.cod));
  const visitedCount = visitedPropriosIds.size;
  const unvisitedCount = totalProprios - visitedCount;
  const totalPassagens = filteredVisits.length; // Total raw visits

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Relatório de Patrulhamento - GCM BH", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Filtros: Regional: ${filterRegional || 'Todas'}, Viatura: ${filterViatura || 'Todas'}, Data: ${filterDate || 'Todas'}`, 14, 35);

    doc.text(`Total de Próprios na área: ${totalProprios}`, 14, 45);
    doc.text(`Locais Distintos Visitados: ${visitedCount} (${((visitedCount/totalProprios)*100 || 0).toFixed(1)}%)`, 14, 50);
    doc.text(`Total de Passagens/Visitas: ${totalPassagens}`, 14, 55);
    doc.text(`Não Visitados: ${unvisitedCount}`, 14, 60);

    const tableData = filteredVisits.map(v => [
      formatDate(v.timestamp),
      formatTime(v.timestamp),
      v.idViatura,
      v.agente,
      v.nome_equipamento.substring(0, 20) + '...'
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Data', 'Hora', 'Viatura', 'Agente', 'Local']],
      body: tableData,
    });

    doc.save("relatorio_patrulha.pdf");
  };

  // Chart Data
  const chartData = [
    { name: 'Visitados', value: visitedCount, fill: '#10b981' },
    { name: 'Pendentes', value: unvisitedCount, fill: '#3b82f6' }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
        <h1 className="font-bold text-lg">Painel do Gestor</h1>
        <div className="flex gap-4 items-center">
           <span className="text-sm hidden md:inline">{user.name}</span>
           <button onClick={onLogout} className="text-sm bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">Sair</button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        
        {/* Sidebar / Filters */}
        <aside className="w-full md:w-80 bg-white p-4 border-r border-slate-200 overflow-y-auto shrink-0">
          <h2 className="font-bold text-slate-800 mb-4">Filtros e Relatórios</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Regional</label>
              <select 
                className="w-full border p-2 rounded text-sm"
                value={filterRegional}
                onChange={e => setFilterRegional(e.target.value)}
              >
                <option value="">Todas</option>
                {REGIONALS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Viatura</label>
              <input 
                type="text" 
                placeholder="Ex: VTR 01" 
                className="w-full border p-2 rounded text-sm"
                value={filterViatura}
                onChange={e => setFilterViatura(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Data</label>
              <input 
                type="date" 
                className="w-full border p-2 rounded text-sm"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
             <h3 className="font-bold text-slate-700 mb-2">Estatísticas</h3>
             <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-emerald-50 p-2 rounded text-center border border-emerald-200">
                  <p className="text-xs text-emerald-600">Locais Visitados</p>
                  <p className="text-xl font-bold text-emerald-800">{visitedCount}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded text-center border border-blue-200">
                  <p className="text-xs text-blue-600">Locais Pendentes</p>
                  <p className="text-xl font-bold text-blue-800">{unvisitedCount}</p>
                </div>
             </div>
             <div className="bg-slate-100 p-2 rounded text-center border border-slate-200 mb-4">
                  <p className="text-xs text-slate-600">Total de Passagens</p>
                  <p className="text-2xl font-bold text-slate-800">{totalPassagens}</p>
             </div>
             
             <div className="h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{fontSize: 10}} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
             </div>

             <button 
               onClick={generatePDF}
               className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 text-sm font-bold flex items-center justify-center gap-2"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               Exportar PDF
             </button>
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-grow relative h-96 md:h-auto">
           <MapComponent 
             proprios={filteredProprios} 
             visits={filteredVisits}
             routePath={filteredRoutes.length > 0 ? filteredRoutes[filteredRoutes.length - 1].pontos : []}
             zoom={12}
           />
           
           <div className="absolute top-4 right-4 bg-white/90 p-3 rounded shadow-lg text-xs z-[400] border border-slate-200">
             <p className="font-bold mb-1">Monitoramento em Tempo Real</p>
             <p>Viaturas Ativas (Total): {filteredRoutes.length}</p>
             <p className="text-slate-500 italic mt-1">Atualizando a cada 5s...</p>
             <div className="mt-2 max-h-24 overflow-y-auto">
                {filteredRoutes.slice(-3).map(r => (
                  <div key={r.id} className="border-t pt-1 mt-1 text-[10px] text-slate-600">
                    VTR: {r.idViatura} - {r.regional}
                  </div>
                ))}
             </div>
           </div>
        </main>

      </div>
    </div>
  );
};