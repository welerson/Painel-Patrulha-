
import React, { useState, useEffect } from 'react';
import { MapComponent } from './MapComponent';
import { MOCK_PROPRIOS, REGIONALS } from '../constants';
import { Visit, ActivePatrol, UserSession } from '../types';
import { subscribeToPatrols, subscribeToVisits } from '../services/storage';
import { formatDate, formatTime, getStartOfDay, isQualitativeTarget } from '../utils/geo';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [filteredProprios, setFilteredProprios] = useState(MOCK_PROPRIOS);
  const [filteredRoutes, setFilteredRoutes] = useState<ActivePatrol[]>([]);

  // Selected photo to view large
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  useEffect(() => {
    // Reset error state on mount
    setPermissionError(false);

    const unsubscribePatrols = subscribeToPatrols(
      (data) => {
        // Sort client-side (Newest first)
        const sorted = data.sort((a, b) => b.inicioTurno - a.inicioTurno);
        setAllPatrols(sorted);
        setPermissionError(false); // Success clears error
      },
      (error) => {
        if (error.code === 'permission-denied') {
          setPermissionError(true);
        }
      }
    );

    const unsubscribeVisits = subscribeToVisits(
      (data) => {
        // Sort client-side (Newest first)
        const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
        setAllVisits(sorted);
      },
      (error) => {
         // Usually if one fails, both fail, handled by patrols sub
         console.error("Visit sub error", error);
      }
    );

    return () => {
      unsubscribePatrols();
      unsubscribeVisits();
    };
  }, []);

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

  // Daily Logic Calculations
  const startOfToday = getStartOfDay();
  const totalProprios = filteredProprios.length;
  
  // Visits relevant for display (filtered by date or today)
  const relevantVisits = filteredVisits.filter(v => 
    filterDate ? true : v.timestamp >= startOfToday
  );

  // Count locations visited TODAY/Selected Date
  const visitedTodayIds = new Set(relevantVisits.map(v => v.cod));
  
  const visitedCount = visitedTodayIds.size;
  const unvisitedCount = totalProprios - visitedCount;
  const totalPassagens = relevantVisits.length; 

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Relatório de Patrulhamento - GCM BH", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Filtros: Regional: ${filterRegional || 'Todas'}, Viatura: ${filterViatura || 'Todas'}, Data: ${filterDate || 'Hoje (00:00)'}`, 14, 35);

    doc.text(`Total de Próprios na área: ${totalProprios}`, 14, 45);
    doc.text(`Locais Visitados Hoje/Período: ${visitedCount} (${((visitedCount/totalProprios)*100 || 0).toFixed(1)}%)`, 14, 50);
    doc.text(`Total de Passagens: ${totalPassagens}`, 14, 55);
    doc.text(`Pendentes: ${unvisitedCount}`, 14, 60);

    const tableData = relevantVisits.map(v => [
      formatDate(v.timestamp),
      formatTime(v.timestamp),
      v.idViatura,
      v.agente,
      v.nome_equipamento.substring(0, 20) + '...',
      v.durationSeconds ? `${v.durationSeconds}s` : '-',
      '' // Placeholder for Image
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Data', 'Hora', 'Viatura', 'Agente', 'Local', 'Duração', 'Prova Visual']],
      body: tableData,
      bodyStyles: { minCellHeight: 15, valign: 'middle' },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const visitIndex = data.row.index;
          const visit = relevantVisits[visitIndex];
          
          if (visit && visit.photo) {
            try {
              // Add thumbnail image to PDF
              doc.addImage(visit.photo, 'JPEG', data.cell.x + 2, data.cell.y + 2, 10, 10);
            } catch (e) {
              // console.error("Erro ao adicionar imagem no PDF", e);
            }
          } else if (isQualitativeTarget(visit.nome_equipamento)) {
             doc.setTextColor(200, 0, 0);
             doc.setFontSize(8);
             doc.text("Pendente", data.cell.x + 2, data.cell.y + 8);
          }
        }
      }
    });

    doc.save("relatorio_patrulha_prova_social.pdf");
  };

  const chartData = [
    { name: 'Feito', value: visitedCount, fill: '#10b981' },
    { name: 'Pendente', value: unvisitedCount, fill: '#3b82f6' }
  ];

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}min`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
        <h1 className="font-bold text-lg">Painel do Gestor</h1>
        <div className="flex gap-4 items-center">
           <span className="text-sm hidden md:inline">{user.name}</span>
           <button onClick={onLogout} className="text-sm bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">Sair</button>
        </div>
      </header>

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 relative z-50 shrink-0">
          <p className="font-bold">Acesso Bloqueado pelo Firebase</p>
          <p className="text-sm">Como você ativou a Autenticação, atualize as regras em <strong>Firebase Console &gt; Firestore Database &gt; Rules</strong> para:</p>
          <pre className="bg-red-50 p-2 mt-1 rounded text-xs font-mono border border-red-200 overflow-x-auto">
            allow read, write: if request.auth != null;
          </pre>
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        
        {/* Sidebar / Filters */}
        <aside className="w-full md:w-72 bg-white p-4 border-r border-slate-200 overflow-y-auto shrink-0 flex flex-col">
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
              {!filterDate && <p className="text-[10px] text-slate-400 mt-1">Dados de HOJE (00:00+)</p>}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
             <h3 className="font-bold text-slate-700 mb-2">Indicadores</h3>
             
             <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-emerald-50 p-2 rounded text-center border border-emerald-200">
                  <p className="text-xs text-emerald-600">Visitados</p>
                  <p className="text-xl font-bold text-emerald-800">{visitedCount}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded text-center border border-blue-200">
                  <p className="text-xs text-blue-600">Pendentes</p>
                  <p className="text-xl font-bold text-blue-800">{unvisitedCount}</p>
                </div>
             </div>
             <div className="bg-slate-100 p-2 rounded text-center border border-slate-200 mb-4">
                  <p className="text-xs text-slate-600">Total de Passagens</p>
                  <p className="text-2xl font-bold text-slate-800">{totalPassagens}</p>
             </div>
             
             <div className="h-32 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{fontSize: 10}} />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
             </div>

             <button 
               onClick={generatePDF}
               className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 text-sm font-bold flex items-center justify-center gap-2"
             >
               Exportar PDF
             </button>
          </div>
        </aside>

        {/* Main Content Area - Split View */}
        <main className="flex-grow flex flex-col relative h-full overflow-hidden">
           
           {/* TOP: Map (60%) */}
           <div className="h-[60%] relative border-b-4 border-slate-200">
             <MapComponent 
               proprios={filteredProprios} 
               visits={allVisits} 
               routePath={filteredRoutes.length > 0 ? filteredRoutes[0].pontos : []}
               zoom={12}
             />
             
             <div className="absolute top-4 right-4 bg-white/90 p-2 rounded shadow-lg text-xs z-[400] border border-slate-200">
               <p className={`font-bold ${permissionError ? 'text-red-600' : 'text-emerald-600'}`}>
                 ● {permissionError ? 'Erro Permissão' : 'Online (Firebase)'}
               </p>
               <p className="text-[10px] text-slate-500">Viaturas Ativas: {filteredRoutes.length}</p>
             </div>
           </div>

           {/* BOTTOM: Detailed Visits Table (40%) */}
           <div className="h-[40%] bg-white flex flex-col">
             <div className="p-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                 Auditoria de Visitas Recentes
                 <span className="bg-slate-200 text-slate-600 px-2 rounded-full text-xs">{relevantVisits.length}</span>
               </h3>
               <span className="text-xs text-slate-400 italic">Mais recentes primeiro</span>
             </div>
             
             <div className="flex-grow overflow-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-100 text-slate-600 font-semibold text-xs uppercase sticky top-0 z-10">
                   <tr>
                     <th className="p-3 border-b">Hora</th>
                     <th className="p-3 border-b">Local / Código</th>
                     <th className="p-3 border-b">Viatura / Agente</th>
                     <th className="p-3 border-b text-center">Prova Visual</th>
                     <th className="p-3 border-b text-center">Permanência</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {relevantVisits.map((visit) => {
                     const isQualitative = isQualitativeTarget(visit.nome_equipamento);
                     const hasPhoto = !!visit.photo;
                     
                     return (
                       <tr key={visit.id} className="hover:bg-slate-50 transition-colors">
                         <td className="p-3 text-slate-500 font-mono whitespace-nowrap">
                           {formatTime(visit.timestamp)}
                           <span className="block text-[10px] text-slate-400">{formatDate(visit.timestamp)}</span>
                         </td>
                         <td className="p-3">
                           <div className="font-medium text-slate-800">{visit.nome_equipamento}</div>
                           <div className="text-xs text-slate-500">{visit.cod} • {visit.regional}</div>
                         </td>
                         <td className="p-3 text-slate-600">
                           <div className="font-bold text-xs bg-slate-200 inline-block px-1 rounded">{visit.idViatura}</div>
                           <div className="text-xs mt-0.5">{visit.agente}</div>
                         </td>
                         <td className="p-3 text-center align-middle">
                           {hasPhoto ? (
                             <button 
                               onClick={() => setPreviewPhoto(visit.photo!)}
                               className="group relative inline-flex items-center justify-center"
                             >
                               <div className="w-8 h-8 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 hover:bg-emerald-200">
                                 📷
                               </div>
                               <span className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                 Ver Foto
                               </span>
                             </button>
                           ) : (
                             isQualitative ? (
                               <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-600 text-[10px] font-bold border border-red-200">
                                 PENDENTE
                               </span>
                             ) : (
                               <span className="text-slate-300 text-xs">-</span>
                             )
                           )}
                         </td>
                         <td className="p-3 text-center text-slate-600 font-mono text-xs">
                           {visit.durationSeconds ? (
                             <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                               {formatDuration(visit.durationSeconds)}
                             </span>
                           ) : (
                             <span className="text-slate-400">-</span>
                           )}
                         </td>
                       </tr>
                     );
                   })}
                   {relevantVisits.length === 0 && (
                     <tr>
                       <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                         Nenhuma visita registrada para os filtros selecionados.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        </main>
      </div>

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-4xl w-full max-h-full">
            <img src={previewPhoto} alt="Prova Visual" className="w-full h-auto rounded shadow-2xl border-4 border-white" />
            <button 
              className="absolute -top-4 -right-4 bg-white text-black rounded-full w-8 h-8 font-bold flex items-center justify-center hover:bg-gray-200"
              onClick={() => setPreviewPhoto(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
