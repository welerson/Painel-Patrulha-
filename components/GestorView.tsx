import React, { useState, useEffect } from 'react';
import { MapComponent } from './MapComponent';
import { MOCK_PROPRIOS, REGIONALS, mapRawToProprio } from '../constants';
import { Visit, ActivePatrol, UserSession, Proprio } from '../types';
import { subscribeToPatrols, subscribeToVisits } from '../services/storage';
import { formatDate, formatTime, getProprioStatus, isQualitativeTarget } from '../utils/geo';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Re-construct MOCK_PROPRIOS locally if not imported correctly due to the complex constant file structure
// In a real app, this would be a clean import.
const ALL_PROPRIOS: Proprio[] = (window as any).RAW_DATA_FULL ? (window as any).RAW_DATA_FULL.map(mapRawToProprio) : MOCK_PROPRIOS;

interface GestorViewProps {
  user: UserSession;
  onLogout: () => void;
}

export const GestorView: React.FC<GestorViewProps> = ({ user, onLogout }) => {
  const [allVisits, setAllVisits] = useState<Visit[]>([]);
  const [allPatrols, setAllPatrols] = useState<ActivePatrol[]>([]);
  const [permissionError, setPermissionError] = useState(false);
  
  const [filterRegional, setFilterRegional] = useState('');
  const [filterViatura, setFilterViatura] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [filteredProprios, setFilteredProprios] = useState(ALL_PROPRIOS);
  const [filteredRoutes, setFilteredRoutes] = useState<ActivePatrol[]>([]);

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  useEffect(() => {
    setPermissionError(false);

    const unsubscribePatrols = subscribeToPatrols(
      (data) => {
        const sorted = data.sort((a, b) => b.inicioTurno - a.inicioTurno);
        setAllPatrols(sorted);
        setPermissionError(false);
      },
      (error) => {
        if (error.code === 'permission-denied') {
          setPermissionError(true);
        }
      }
    );

    const unsubscribeVisits = subscribeToVisits(
      (data) => {
        const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
        setAllVisits(sorted);
      }
    );

    return () => {
      unsubscribePatrols();
      unsubscribeVisits();
    };
  }, []);

  useEffect(() => {
    let v = allVisits;
    let p = ALL_PROPRIOS; // Use full list
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

  // Stats Calculation based on Hybrid Logic
  const totalProprios = filteredProprios.length;
  
  // Logic to count Status
  let statusGreen = 0;
  let statusOrange = 0;
  let statusRed = 0;

  filteredProprios.forEach(prop => {
    // Find LAST visit for this prop (regardless of filters, we want current status)
    // Unless date filter is applied, then we look at status AT that date (simplified to current for now)
    const propVisits = allVisits.filter(v => v.cod === prop.cod).sort((a, b) => b.timestamp - a.timestamp);
    const lastVisit = propVisits[0];
    
    const status = getProprioStatus(lastVisit?.timestamp, prop.prioridade);
    
    if (status === 'green') statusGreen++;
    else if (status === 'orange') statusOrange++;
    else statusRed++;
  });

  const totalPassagens = filteredVisits.length; // Total raw visits in period

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} min`;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Patrulhamento - GCM BH", 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Filtros: Reg: ${filterRegional || 'Todas'}, VTR: ${filterViatura || 'Todas'}`, 14, 35);

    doc.text(`Total Próprios: ${totalProprios}`, 14, 45);
    doc.text(`Em Dia (Verde): ${statusGreen}`, 14, 50);
    doc.text(`Atenção (Azul): ${statusOrange}`, 14, 55);
    doc.text(`Crítico/Pendente (Vermelho): ${statusRed}`, 14, 60);

    const tableData = filteredVisits.map(v => [
      formatDate(v.timestamp),
      formatTime(v.timestamp),
      v.idViatura,
      v.agente,
      v.nome_equipamento.substring(0, 20),
      formatDuration(v.durationSeconds),
      ''
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Data', 'Hora', 'Viatura', 'Agente', 'Local', 'Duração', 'Foto']],
      body: tableData,
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const visit = filteredVisits[data.row.index];
          if (visit && visit.photo) {
            try {
              doc.addImage(visit.photo, 'JPEG', data.cell.x + 2, data.cell.y + 2, 10, 10);
            } catch (e) {}
          }
        }
      }
    });

    doc.save("relatorio_patrulha.pdf");
  };

  const chartData = [
    { name: 'Em Dia', value: statusGreen, fill: '#10b981' },
    { name: 'Atenção', value: statusOrange, fill: '#3b82f6' }, // Changed to Blue
    { name: 'Pendente', value: statusRed, fill: '#ef4444' }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
        <h1 className="font-bold text-lg">Painel do Gestor</h1>
        <div className="flex gap-4 items-center">
           <span className="text-sm hidden md:inline">{user.name}</span>
           <button onClick={onLogout} className="text-sm bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">Sair</button>
        </div>
      </header>

      {permissionError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shrink-0">
          <p className="font-bold">Acesso Bloqueado pelo Firebase</p>
          <p className="text-sm mt-1">Para corrigir, acesse o <strong>Firebase Console > Firestore Database > Rules</strong> e altere para:</p>
          <pre className="bg-red-50 p-2 mt-2 rounded text-xs font-mono select-all border border-red-200">
{`allow read, write: if request.auth != null;`}
          </pre>
          <p className="text-xs mt-1">(Ou ative a "Autenticação Anônima" no menu Authentication > Sign-in method)</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        
        <aside className="w-full md:w-72 bg-white p-4 border-r border-slate-200 overflow-y-auto shrink-0 flex flex-col">
          <h2 className="font-bold text-slate-800 mb-4">Filtros e Relatórios</h2>
          
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Regional</label>
              <select 
                className="w-full border border-slate-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={filterRegional}
                onChange={e => setFilterRegional(e.target.value)}
              >
                <option value="">Todas</option>
                {REGIONALS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Viatura</label>
              <input 
                type="text" 
                placeholder="Ex: VTR 01" 
                className="w-full border border-slate-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={filterViatura}
                onChange={e => setFilterViatura(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
              <input 
                type="date" 
                className="w-full border border-slate-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
              />
              {!filterDate && <span className="text-[10px] text-slate-400">Dados de HOJE (00:00+)</span>}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
             <h3 className="font-bold text-slate-700 mb-4">Estatísticas</h3>
             
             <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-emerald-50 p-2 rounded border border-emerald-100 text-center">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Locais Visitados</p>
                  <p className="text-xl font-bold text-emerald-700">{statusGreen}</p>
                </div>
                <div className="flex-1 bg-blue-50 p-2 rounded border border-blue-100 text-center">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Locais Pendentes</p>
                  <p className="text-xl font-bold text-blue-700">{statusRed + statusOrange}</p>
                </div>
             </div>

             <div className="bg-slate-50 p-3 rounded text-center border border-slate-200 mb-6">
                  <p className="text-xs font-bold text-slate-500 uppercase">Total de Passagens</p>
                  <p className="text-2xl font-bold text-slate-800">{totalPassagens}</p>
             </div>
             
             <div className="h-40 mb-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '12px'}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
             </div>

             <button 
               onClick={generatePDF} 
               className="w-full bg-blue-600 text-white py-2.5 rounded shadow-sm hover:bg-blue-700 text-sm font-bold transition-colors flex items-center justify-center gap-2"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               Exportar PDF
             </button>
          </div>
        </aside>

        <main className="flex-grow flex flex-col relative h-full overflow-hidden">
           <div className="h-[60%] relative border-b-4 border-slate-200">
             <MapComponent 
               proprios={filteredProprios} 
               visits={allVisits} 
               routePath={filteredRoutes.length > 0 ? filteredRoutes[0].pontos : []}
               zoom={12}
             />
             
             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded shadow-lg z-[1000] border border-slate-200 text-xs">
                <h4 className="font-bold mb-2 text-slate-700">Monitoramento em Tempo Real</h4>
                <div className="flex flex-col gap-1">
                   <span className="text-slate-600">Viaturas Ativas (Total): {allPatrols.length}</span>
                   {permissionError ? (
                     <span className="text-red-600 font-bold flex items-center gap-1">● Erro de Permissão</span>
                   ) : (
                     <span className="text-emerald-600 font-bold flex items-center gap-1">● Online (Firebase)</span>
                   )}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                   {filteredRoutes.slice(0, 3).map(r => (
                     <div key={r.id} className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {r.idViatura} - {r.regional}
                     </div>
                   ))}
                </div>
             </div>
           </div>

           <div className="h-[40%] bg-white flex flex-col">
             <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
               <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                 <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                 Auditoria de Visitas
               </h3>
               <span className="text-xs text-slate-400 italic">
                 {filteredVisits.length} registros encontrados
               </span>
             </div>
             
             <div className="flex-grow overflow-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-100 text-slate-600 font-semibold text-xs uppercase sticky top-0 z-10 shadow-sm">
                   <tr>
                     <th className="p-3 border-b w-32">Data / Hora</th>
                     <th className="p-3 border-b">Agente / Viatura</th>
                     <th className="p-3 border-b">Local Visitado</th>
                     <th className="p-3 border-b text-center w-20">Duração</th>
                     <th className="p-3 border-b text-center w-20">Foto</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredVisits.map((visit) => {
                     const hasPhoto = !!visit.photo;
                     return (
                       <tr key={visit.id} className="hover:bg-slate-50 transition-colors">
                         <td className="p-3 text-slate-500 font-mono whitespace-nowrap">
                           <div className="text-slate-800 font-bold">{formatDate(visit.timestamp)}</div>
                           <div className="text-xs">{formatTime(visit.timestamp)}</div>
                         </td>
                         <td className="p-3">
                           <div className="font-medium text-slate-800">{visit.agente}</div>
                           <div className="text-xs text-slate-500 bg-slate-200 inline-block px-1.5 py-0.5 rounded mt-1">{visit.idViatura}</div>
                         </td>
                         <td className="p-3">
                           <div className="font-medium text-slate-800 text-sm">{visit.nome_equipamento}</div>
                           <div className="text-xs text-slate-400">{visit.cod} • {visit.regional}</div>
                         </td>
                         <td className="p-3 text-center text-slate-600 font-mono text-xs">
                           {formatDuration(visit.durationSeconds)}
                         </td>
                         <td className="p-3 text-center align-middle">
                           {hasPhoto ? (
                             <button 
                               onClick={() => setPreviewPhoto(visit.photo!)} 
                               className="group relative inline-block"
                             >
                               <img 
                                 src={visit.photo} 
                                 className="w-8 h-8 rounded object-cover border border-slate-300 hover:scale-150 transition-transform shadow-sm" 
                                 alt="Thumb" 
                               />
                             </button>
                           ) : <span className="text-slate-300 text-xs">-</span>}
                         </td>
                       </tr>
                     );
                   })}
                   {filteredVisits.length === 0 && (
                     <tr>
                       <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                         Nenhum registro encontrado para os filtros selecionados.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        </main>
      </div>

      {previewPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-5xl w-full animate-in fade-in zoom-in duration-200">
            <img src={previewPhoto} alt="Prova Ampliada" className="w-full h-auto rounded-lg shadow-2xl border border-slate-700" />
            <button className="absolute -top-10 right-0 text-white hover:text-gray-300 font-bold text-xl flex items-center gap-2">
              <span>Fechar</span> ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};