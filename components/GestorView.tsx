
import React, { useState, useEffect } from 'react';
import { MapComponent } from './MapComponent';
import { MOCK_PROPRIOS, REGIONALS, mapRawToProprio } from '../constants';
import { Visit, ActivePatrol, UserSession, Proprio } from '../types';
import { subscribeToPatrols, subscribeToVisits } from '../services/storage';
import { formatDate, formatTime, getProprioStatus, isQualitativeTarget } from '../utils/geo';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Usar sempre o MOCK_PROPRIOS direto, pois ele contém a base de dados completa
const ALL_PROPRIOS: Proprio[] = MOCK_PROPRIOS;

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

  // Normaliza strings para comparação (remove acentos, espaços, traços)
  const normalize = (str: string) => str.toUpperCase().replace(/[^A-Z0-9]/g, '');

  useEffect(() => {
    setPermissionError(false);

    const unsubscribePatrols = subscribeToPatrols(
      (data) => {
        const sorted = data.sort((a, b) => b.inicioTurno - a.inicioTurno);
        setAllPatrols(sorted);
        setPermissionError(false);
      },
      (error) => {
        if (error.code === 'permission-denied') setPermissionError(true);
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
    let p = ALL_PROPRIOS;
    let r = allPatrols;

    if (filterRegional) {
      const target = normalize(filterRegional);
      v = v.filter(visit => visit.regional && normalize(visit.regional) === target);
      p = p.filter(prop => prop.regional && normalize(prop.regional) === target);
      r = r.filter(route => route.regional && normalize(route.regional) === target);
    }

    if (filterViatura) {
      const target = filterViatura.toLowerCase();
      v = v.filter(visit => visit.idViatura.toLowerCase().includes(target));
      r = r.filter(route => route.idViatura.toLowerCase().includes(target));
    }

    if (filterDate) {
      v = v.filter(visit => new Date(visit.timestamp).toISOString().split('T')[0] === filterDate);
      r = r.filter(route => new Date(route.inicioTurno).toISOString().split('T')[0] === filterDate);
    }

    setFilteredVisits(v);
    setFilteredProprios(p);
    setFilteredRoutes(r);

  }, [filterRegional, filterViatura, filterDate, allVisits, allPatrols]);

  // Stats
  const totalProprios = filteredProprios.length;
  let statusGreen = 0;
  let statusBlue = 0; 
  let statusRed = 0;

  filteredProprios.forEach(prop => {
    const propVisits = allVisits.filter(v => v.cod === prop.cod).sort((a, b) => b.timestamp - a.timestamp);
    const lastVisit = propVisits[0];
    const status = getProprioStatus(lastVisit?.timestamp, prop.prioridade);
    
    if (status === 'green') statusGreen++;
    else if (status === 'blue') statusBlue++;
    else statusRed++;
  });

  const totalPassagens = filteredVisits.length;

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
    doc.text(`Planejamento/Atenção (Azul): ${statusBlue}`, 14, 55);
    doc.text(`Crítico/Atrasado (Vermelho): ${statusRed}`, 14, 60);

    const tableData = filteredVisits.map(v => {
      const isQualitative = isQualitativeTarget(v.nome_equipamento || '');
      let photoStatus = '-';
      
      if (v.photo) {
        photoStatus = ''; // Deixa vazio para a imagem entrar via didDrawCell
      } else if (isQualitative) {
        photoStatus = 'PENDENTE'; // Texto que será pintado de vermelho
      }

      return [
        formatDate(v.timestamp),
        formatTime(v.timestamp),
        v.idViatura,
        v.agente,
        (v.nome_equipamento || '').substring(0, 20),
        formatDuration(v.durationSeconds),
        photoStatus
      ];
    });

    autoTable(doc, {
      startY: 70,
      head: [['Data', 'Hora', 'Viatura', 'Agente', 'Local', 'Duração', 'Foto']],
      body: tableData,
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          // Pinta PENDENTE de vermelho
          if (data.cell.raw === 'PENDENTE') {
            data.cell.styles.textColor = [220, 38, 38]; 
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
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
    { name: 'Atenção', value: statusBlue, fill: '#3b82f6' }, 
    { name: 'Crítico', value: statusRed, fill: '#ef4444' }
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
          <p className="text-sm mt-1">Acesse Firebase Console e cole a regra abaixo:</p>
          <pre className="bg-red-50 p-2 mt-2 rounded text-xs font-mono select-all border border-red-200">
{`allow read, write: if request.auth != null;`}
          </pre>
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        
        <aside className="w-full md:w-72 bg-white p-4 border-r border-slate-200 overflow-y-auto shrink-0 flex flex-col">
          <h2 className="font-bold text-slate-800 mb-4">Filtros e Relatórios</h2>
          
          <div className="space-y-3">
            <select className="w-full border p-2 rounded text-sm" value={filterRegional} onChange={e => setFilterRegional(e.target.value)}>
              <option value="">Regional: Todas</option>
              {REGIONALS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input type="text" placeholder="Viatura" className="w-full border p-2 rounded text-sm" value={filterViatura} onChange={e => setFilterViatura(e.target.value)} />
            <input type="date" className="w-full border p-2 rounded text-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
             <h3 className="font-bold text-slate-700 mb-4">Situação Real</h3>
             
             <div className="grid grid-cols-3 gap-1 mb-4 text-center">
                <div className="bg-emerald-50 p-1 rounded border border-emerald-100">
                  <p className="text-[9px] font-bold text-emerald-600">OK</p>
                  <p className="text-lg font-bold text-emerald-700">{statusGreen}</p>
                </div>
                <div className="bg-blue-50 p-1 rounded border border-blue-100">
                  <p className="text-[9px] font-bold text-blue-600">HOJE</p>
                  <p className="text-lg font-bold text-blue-700">{statusBlue}</p>
                </div>
                <div className="bg-red-50 p-1 rounded border border-red-100">
                  <p className="text-[9px] font-bold text-red-600">CRÍTICO</p>
                  <p className="text-lg font-bold text-red-700">{statusRed}</p>
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
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
             </div>

             <button 
               onClick={generatePDF} 
               className="w-full bg-blue-600 text-white py-2.5 rounded shadow-sm hover:bg-blue-700 text-sm font-bold flex items-center justify-center gap-2"
             >
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
           </div>

           <div className="h-[40%] bg-white flex flex-col">
             <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
               <h3 className="font-bold text-slate-700 text-sm">Auditoria de Visitas</h3>
               <span className="text-xs text-slate-400 italic">{filteredVisits.length} registros</span>
             </div>
             
             <div className="flex-grow overflow-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-100 text-slate-600 font-semibold text-xs uppercase sticky top-0 z-10">
                   <tr>
                     <th className="p-3 border-b w-32">Data / Hora</th>
                     <th className="p-3 border-b">Agente / Viatura</th>
                     <th className="p-3 border-b">Local</th>
                     <th className="p-3 border-b text-center">Duração</th>
                     <th className="p-3 border-b text-center">Foto</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredVisits.map((visit) => {
                       const isQualitative = isQualitativeTarget(visit.nome_equipamento || '');
                       
                       return (
                         <tr key={visit.id} className="hover:bg-slate-50">
                           <td className="p-3 text-slate-500 font-mono whitespace-nowrap">
                             <div className="text-slate-800 font-bold">{formatDate(visit.timestamp)}</div>
                             <div className="text-xs">{formatTime(visit.timestamp)}</div>
                           </td>
                           <td className="p-3">
                             <div className="font-medium text-slate-800">{visit.agente}</div>
                             <div className="text-xs text-slate-500 bg-slate-200 inline-block px-1 rounded mt-1">{visit.idViatura}</div>
                           </td>
                           <td className="p-3 text-sm">{visit.nome_equipamento}</td>
                           <td className="p-3 text-center text-slate-600 font-mono text-xs">
                             {formatDuration(visit.durationSeconds)}
                           </td>
                           <td className="p-3 text-center align-middle">
                             {visit.photo ? (
                               <div className="flex justify-center">
                                 <button 
                                    onClick={() => setPreviewPhoto(visit.photo!)} 
                                    className="relative group"
                                    title="Ver Foto"
                                  >
                                   <img 
                                      src={visit.photo} 
                                      className="w-10 h-10 rounded object-cover border-2 border-emerald-500 shadow-sm group-hover:scale-110 transition" 
                                   />
                                   <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                                     <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                                   </div>
                                 </button>
                               </div>
                             ) : isQualitative ? (
                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                 PENDENTE
                               </span>
                             ) : (
                               <span className="text-slate-300 font-mono">-</span>
                             )}
                           </td>
                         </tr>
                       );
                   })}
                 </tbody>
               </table>
             </div>
           </div>
        </main>
      </div>

      {previewPhoto && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
          <img src={previewPhoto} className="max-w-full max-h-full rounded shadow-2xl border-4 border-white" />
        </div>
      )}
    </div>
  );
};
