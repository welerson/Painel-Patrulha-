import React, { useState, useEffect } from 'react';
import { MapComponent } from './MapComponent';
import { MOCK_PROPRIOS, REGIONALS, mapRawToProprio } from '../constants';
import { Visit, ActivePatrol, UserSession, Proprio } from '../types';
import { subscribeToPatrols, subscribeToVisits } from '../services/storage';
import { formatDate, formatTime, getProprioStatus, isQualitativeTarget } from '../utils/geo';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ALL_PROPRIOS: Proprio[] = MOCK_PROPRIOS;

interface GestorViewProps {
  user: UserSession;
  onLogout: () => void;
}

export const GestorView: React.FC<GestorViewProps> = ({ user, onLogout }) => {
  const [allVisits, setAllVisits] = useState<Visit[]>([]);
  const [allPatrols, setAllPatrols] = useState<ActivePatrol[]>([]);
  const [filterRegional, setFilterRegional] = useState('');
  const [filterViatura, setFilterViatura] = useState('');
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [filteredProprios, setFilteredProprios] = useState(ALL_PROPRIOS);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Normalize helper
  const normalize = (str: string) => str.toUpperCase().replace(/[^A-Z0-9]/g, '');

  useEffect(() => {
    const unsubP = subscribeToPatrols(data => setAllPatrols(data));
    const unsubV = subscribeToVisits(data => setAllVisits(data.sort((a, b) => b.timestamp - a.timestamp)));
    return () => { unsubP(); unsubV(); };
  }, []);

  useEffect(() => {
    let v = allVisits;
    let p = ALL_PROPRIOS;

    if (filterRegional) {
      const target = normalize(filterRegional);
      v = v.filter(x => x.regional && normalize(x.regional) === target);
      p = p.filter(x => x.regional && normalize(x.regional) === target);
    }
    if (filterViatura) {
      v = v.filter(x => x.idViatura.toLowerCase().includes(filterViatura.toLowerCase()));
    }

    setFilteredVisits(v);
    setFilteredProprios(p);
  }, [filterRegional, filterViatura, allVisits]);

  // Stats
  let green=0, blue=0, red=0;
  filteredProprios.forEach(prop => {
     const visits = allVisits.filter(v => v.cod === prop.cod).sort((a,b) => b.timestamp - a.timestamp);
     const status = getProprioStatus(visits[0]?.timestamp, prop.prioridade);
     if (status === 'green') green++; else if (status === 'blue') blue++; else red++;
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório GCM BH", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Resumo: Verde ${green} | Azul ${blue} | Vermelho ${red}`, 14, 28);

    const data = filteredVisits.map(v => [
      `${formatDate(v.timestamp)} ${formatTime(v.timestamp)}`,
      v.idViatura,
      v.agente,
      v.nome_equipamento.substring(0, 25),
      v.photo ? '' : (isQualitativeTarget(v.nome_equipamento) ? 'PENDENTE' : '-')
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Data', 'VTR', 'Agente', 'Local', 'Foto']],
      body: data,
      didParseCell: (d) => {
        if (d.section === 'body' && d.column.index === 4 && d.cell.raw === 'PENDENTE') {
           d.cell.styles.textColor = [200, 0, 0];
           d.cell.styles.fontStyle = 'bold';
        }
      },
      didDrawCell: (d) => {
        if (d.section === 'body' && d.column.index === 4 && filteredVisits[d.row.index]?.photo) {
           try { doc.addImage(filteredVisits[d.row.index].photo!, 'JPEG', d.cell.x+2, d.cell.y+2, 8, 8); } catch(e){}
        }
      }
    });
    doc.save("relatorio.pdf");
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow shrink-0">
        <h1 className="font-bold">Painel Gestor</h1>
        <button onClick={onLogout} className="underline text-sm">Sair</button>
      </header>

      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        <aside className="w-full md:w-64 bg-white p-4 border-r overflow-y-auto shrink-0">
           <h2 className="font-bold mb-4">Filtros</h2>
           <select className="w-full border p-2 mb-2 rounded" value={filterRegional} onChange={e => setFilterRegional(e.target.value)}>
             <option value="">Todas Regionais</option>
             {REGIONALS.map(r => <option key={r} value={r}>{r}</option>)}
           </select>
           <input className="w-full border p-2 mb-4 rounded" placeholder="Viatura" value={filterViatura} onChange={e => setFilterViatura(e.target.value)} />
           
           <div className="grid grid-cols-3 gap-1 mb-4 text-center text-xs font-bold text-white">
              <div className="bg-emerald-500 p-2 rounded">{green}</div>
              <div className="bg-blue-500 p-2 rounded">{blue}</div>
              <div className="bg-red-500 p-2 rounded">{red}</div>
           </div>
           <button onClick={generatePDF} className="w-full bg-blue-600 text-white py-2 rounded font-bold">PDF</button>
        </aside>

        <main className="flex-grow flex flex-col h-full overflow-hidden">
           <div className="h-1/2 border-b-4 border-slate-200 relative">
              <MapComponent proprios={filteredProprios} visits={allVisits} zoom={12} />
           </div>
           <div className="h-1/2 overflow-auto bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 sticky top-0">
                  <tr><th className="p-3">Data</th><th className="p-3">VTR</th><th className="p-3">Local</th><th className="p-3">Foto</th></tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVisits.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-3">{formatDate(v.timestamp)} <span className="text-xs text-gray-500">{formatTime(v.timestamp)}</span></td>
                      <td className="p-3">{v.idViatura}</td>
                      <td className="p-3 truncate max-w-[200px]">{v.nome_equipamento}</td>
                      <td className="p-3">
                        {v.photo ? <button onClick={() => setPreviewPhoto(v.photo!)}>📷 Ver</button> : 
                         isQualitativeTarget(v.nome_equipamento) ? <span className="text-red-600 font-bold text-xs">PENDENTE</span> : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </main>
      </div>
      
      {previewPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
          <img src={previewPhoto} className="max-h-full rounded border-2 border-white" />
        </div>
      )}
    </div>
  );
};