import React, { useState } from 'react';
import { DailyRecord, Seller } from '../types';
import { Calendar, CheckCircle, XCircle, Info, Filter, ArrowUpDown } from 'lucide-react';

interface ManagementLogProps {
  records: DailyRecord[];
  sellers: Seller[];
}

export default function ManagementLog({ records, sellers }: ManagementLogProps) {
  const [filterStore, setFilterStore] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Group records by Date and Store to calculate store-wide status
  // Get all unique dates
  const uniqueDates = Array.from(new Set(records.map((r) => r.date))).sort((a, b) => {
    return sortOrder === 'desc' 
      ? b.localeCompare(a) 
      : a.localeCompare(b);
  });

  // Calculate aggregated status for each store on a specific date
  const getStoreStatusForDate = (date: string, storeId: string) => {
    const storeRecords = records.filter((r) => r.date === date && r.storeId === storeId);
    
    if (storeRecords.length === 0) {
      return {
        hasData: false,
        cleanliness: false,
        punctuality: false,
        details: []
      };
    }

    // Cleanliness passes if all records on that day for that store are clean (or if there's an entry that says yes)
    // Let's take the consensus: if at least one says YES, it's YES (or average)
    const cleanliness = storeRecords.some((r) => r.cleanlinessPassed);
    const punctuality = storeRecords.some((r) => r.punctualityPassed);

    return {
      hasData: true,
      cleanliness,
      punctuality,
      details: storeRecords
    };
  };

  const getSellerName = (id: string) => {
    return sellers.find((s) => s.id === id)?.name || id;
  };

  return (
    <div className="space-y-8" id="control-gestion-section">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <span className="text-emerald-500 animate-pulse font-mono">📋</span> BITÁCORA DE CONTROL Y GESTIÓN
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Historial diario de limpieza, mantenimiento de estantería y puntualidad por sucursal.
          </p>
        </div>
        
        {/* FILTERS & SORT */}
        <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Fecha: {sortOrder === 'desc' ? 'Recientes Primero' : 'Antiguos Primero'}</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW TABLE FOR STORES */}
      <div className="glass-panel overflow-hidden p-6">
        <h3 className="text-sm font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-4">
          <Calendar className="w-4 h-4 text-slate-500" /> HISTORIAL DIARIO CONSOLIDADO
        </h3>

        {uniqueDates.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-sm">
            No hay registros de control ingresados todavía. ¡Ingresa datos en el Panel de Administración!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Fecha de Control</th>
                  <th className="py-3 px-4 font-bold text-center border-l border-slate-900" colSpan={2}>Tienda 102</th>
                  <th className="py-3 px-4 font-bold text-center border-l border-slate-900" colSpan={2}>Tienda 218</th>
                </tr>
                <tr className="border-b border-slate-850 text-slate-500 font-mono text-[10px] uppercase">
                  <th className="py-2 px-4"></th>
                  <th className="py-2 px-4 text-center border-l border-slate-900">Limpieza 🧼</th>
                  <th className="py-2 px-4 text-center">Puntualidad ⏰</th>
                  <th className="py-2 px-4 text-center border-l border-slate-900">Limpieza 🧼</th>
                  <th className="py-2 px-4 text-center">Puntualidad ⏰</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {uniqueDates.map((date) => {
                  const s102 = getStoreStatusForDate(date, '102');
                  const s218 = getStoreStatusForDate(date, '218');

                  return (
                    <tr key={date} className="hover:bg-slate-900/40 transition-colors duration-150">
                      <td className="py-3.5 px-4 font-mono text-sm font-bold text-slate-300">
                        {date}
                      </td>
                      
                      {/* Tienda 102 Status */}
                      <td className="py-3.5 px-4 text-center border-l border-slate-900">
                        {s102.hasData ? (
                          s102.cleanliness ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-xs bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-md">
                              ✔️ Cumplido
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 font-mono text-xs bg-red-950/40 border border-red-900 px-2 py-0.5 rounded-md">
                              ❌ Faltó
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600 text-xs font-mono">S/D</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {s102.hasData ? (
                          s102.punctuality ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-xs bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-md">
                              ✔️ Puntual
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 font-mono text-xs bg-red-950/40 border border-red-900 px-2 py-0.5 rounded-md">
                              ❌ Tardanza
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600 text-xs font-mono">S/D</span>
                        )}
                      </td>

                      {/* Tienda 218 Status */}
                      <td className="py-3.5 px-4 text-center border-l border-slate-900">
                        {s218.hasData ? (
                          s218.cleanliness ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-xs bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-md">
                              ✔️ Cumplido
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 font-mono text-xs bg-red-950/40 border border-red-900 px-2 py-0.5 rounded-md">
                              ❌ Faltó
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600 text-xs font-mono">S/D</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {s218.hasData ? (
                          s218.punctuality ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-xs bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-md">
                              ✔️ Puntual
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 font-mono text-xs bg-red-950/40 border border-red-900 px-2 py-0.5 rounded-md">
                              ❌ Tardanza
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600 text-xs font-mono">S/D</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED INDIVIDUAL RECORDS LOG (With delete action if needed) */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-500" /> AUDITORÍA DE REPORTES DIARIOS POR VENDEDOR
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            TOTAL ENTRADAS: {records.length}
          </span>
        </div>

        {records.length === 0 ? (
          <p className="text-slate-500 text-xs font-mono py-4 text-center">No hay registros detallados.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {records.map((rec) => (
              <div 
                key={rec.id} 
                className="bg-slate-900/30 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-4 hover:border-slate-800 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  {/* Date Badge */}
                  <div className="font-mono text-xs font-bold text-slate-300">
                    {rec.date}
                  </div>
                  
                  {/* Seller details */}
                  <div>
                    <div className="text-xs font-bold text-white">
                      {getSellerName(rec.sellerId)} 
                      <span className="text-[10px] font-mono text-slate-500 ml-2">
                        (Tienda {rec.storeId})
                      </span>
                    </div>
                    
                    {/* Key stats entered */}
                    <div className="text-[11px] font-mono text-slate-400 mt-1 flex flex-wrap gap-x-3">
                      <span>Ventas: <strong className="text-emerald-400">S/ {rec.salesWithTax.toLocaleString()}</strong></span>
                      <span>Clientes: <strong className="text-slate-200">{rec.clientsServed}</strong></span>
                      <span>Productos: <strong className="text-slate-200">{rec.productsSold}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Checklist summary */}
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <span className={`px-1.5 py-0.5 rounded ${rec.cleanlinessPassed ? 'bg-emerald-950/80 text-emerald-400' : 'bg-red-950/80 text-red-400'}`}>
                      🧼 {rec.cleanlinessPassed ? 'OK' : 'X'}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${rec.punctualityPassed ? 'bg-emerald-950/80 text-emerald-400' : 'bg-red-950/80 text-red-400'}`}>
                      ⏰ {rec.punctualityPassed ? 'OK' : 'X'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
