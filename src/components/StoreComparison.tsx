import React from 'react';
import { DailyRecord } from '../types';
import { Award, ShieldAlert, Sparkles, UserCheck, Flame, TrendingUp } from 'lucide-react';

interface StoreComparisonProps {
  records: DailyRecord[];
  selectedMonth: string; // 'YYYY-MM'
}

export default function StoreComparison({ records, selectedMonth }: StoreComparisonProps) {
  // Filter records for the selected month
  const monthRecords = records.filter((rec) => rec.date.startsWith(selectedMonth));

  // Helper to compute stats for a store
  const getStoreStats = (storeId: string) => {
    const storeRecs = monthRecords.filter((rec) => rec.storeId === storeId);
    const totalSalesWithTax = storeRecs.reduce((sum, rec) => sum + rec.salesWithTax, 0);
    const totalSalesWithoutTax = storeRecs.reduce((sum, rec) => sum + rec.salesWithoutTax, 0);
    const totalProducts = storeRecs.reduce((sum, rec) => sum + rec.productsSold, 0);
    const totalClients = storeRecs.reduce((sum, rec) => sum + rec.clientsServed, 0);

    const totalDays = storeRecs.length;
    const cleanDays = storeRecs.filter((rec) => rec.cleanlinessPassed).length;
    const punctualDays = storeRecs.filter((rec) => rec.punctualityPassed).length;

    const cleanlinessRate = totalDays > 0 ? (cleanDays / totalDays) * 100 : 0;
    const punctualityRate = totalDays > 0 ? (punctualDays / totalDays) * 100 : 0;

    return {
      id: storeId,
      name: `Tienda ${storeId}`,
      totalSalesWithTax,
      totalSalesWithoutTax,
      totalProducts,
      totalClients,
      cleanlinessRate,
      punctualityRate,
      totalDays,
      cleanDays,
      punctualDays,
    };
  };

  const t102 = getStoreStats('102');
  const t218 = getStoreStats('218');

  // Determine winners for each subcategory
  const salesWinner = t102.totalSalesWithTax > t218.totalSalesWithTax ? '102' : t102.totalSalesWithTax < t218.totalSalesWithTax ? '218' : 'tie';
  const productsWinner = t102.totalProducts > t218.totalProducts ? '102' : t102.totalProducts < t218.totalProducts ? '218' : 'tie';
  const clientsWinner = t102.totalClients > t218.totalClients ? '102' : t102.totalClients < t218.totalClients ? '218' : 'tie';
  const cleanlinessWinner = t102.cleanlinessRate > t218.cleanlinessRate ? '102' : t102.cleanlinessRate < t218.cleanlinessRate ? '218' : 'tie';
  const punctualityWinner = t102.punctualityRate > t218.punctualityRate ? '102' : t102.punctualityRate < t218.punctualityRate ? '218' : 'tie';

  // Calculate overall score (count categories won)
  let score102 = 0;
  let score218 = 0;

  if (salesWinner === '102') score102++; else if (salesWinner === '218') score218++;
  if (productsWinner === '102') score102++; else if (productsWinner === '218') score218++;
  if (clientsWinner === '102') score102++; else if (clientsWinner === '218') score218++;
  if (cleanlinessWinner === '102') score102++; else if (cleanlinessWinner === '218') score218++;
  if (punctualityWinner === '102') score102++; else if (punctualityWinner === '218') score218++;

  const overallWinner = score102 > score218 ? '102' : score102 < score218 ? '218' : 'tie';

  // Progress bar percentages for comparison
  const getPercent = (valA: number, valB: number) => {
    const total = valA + valB;
    if (total === 0) return { a: 50, b: 50 };
    return {
      a: (valA / total) * 100,
      b: (valB / total) * 100,
    };
  };

  const salesComp = getPercent(t102.totalSalesWithTax, t218.totalSalesWithTax);
  const productsComp = getPercent(t102.totalProducts, t218.totalProducts);
  const clientsComp = getPercent(t102.totalClients, t218.totalClients);
  const cleanComp = getPercent(t102.cleanlinessRate, t218.cleanlinessRate);
  const punctComp = getPercent(t102.punctualityRate, t218.punctualityRate);

  return (
    <div className="space-y-8" id="competencia-tiendas-section">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <span className="text-red-500 animate-pulse font-mono">⚔️</span> ARENA DE DUELOS: COMPETENCIA ENTRE TIENDAS
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Enfrentamiento directo de indicadores claves de rendimiento (KPIs) entre las sucursales.
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span>
          MODO COMBATE ACTIVO
        </div>
      </div>

      {/* WINNER CHAMPIONSHIP CARD */}
      <div className="glass-panel p-6 relative overflow-hidden bg-gradient-to-r from-red-950/10 via-[#161b22] to-blue-950/10">
        {/* Glowing visual dividers */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-slate-700/50 via-slate-800/20 to-transparent hidden md:block"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Tienda 102 Banner */}
          <div className="text-center md:text-left flex-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/50 border border-emerald-900 px-2 py-0.5 rounded">
              GUERREROS DEL NORTE
            </span>
            <h3 className="text-3xl font-display font-black text-white mt-2">TIENDA 102</h3>
            <p className="text-slate-400 text-xs mt-1">Sedes Activas</p>
            <div className="mt-4 flex gap-3 justify-center md:justify-start">
              <div className="bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-lg text-center">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Victorias</span>
                <span className="text-base font-bold text-slate-100 font-mono">{score102}/5</span>
              </div>
              <div className="bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-lg text-center">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Ventas totales</span>
                <span className="text-base font-bold text-emerald-400 font-mono">S/ {t102.totalSalesWithTax.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* VS HUD INDICATOR */}
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-white/10 flex items-center justify-center shadow-lg relative">
              <span className="text-2xl font-black font-display text-red-500 tracking-wider animate-pulse">VS</span>
              <div className="absolute -top-1 -bottom-1 -left-1 -right-1 rounded-full border border-dashed border-red-500/30 animate-spin"></div>
            </div>
            
            {/* Overall Winner Declaration */}
            <div className="mt-4 text-center">
              {overallWinner === '102' ? (
                <div className="bg-emerald-950/60 border border-emerald-500 text-emerald-400 font-mono text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-emerald-500" /> TIENDA 102 DOMINA EL ARENA
                </div>
              ) : overallWinner === '218' ? (
                <div className="bg-blue-950/60 border border-blue-500 text-blue-400 font-mono text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-blue-500" /> TIENDA 218 DOMINA EL ARENA
                </div>
              ) : (
                <div className="bg-slate-950/80 border border-slate-700 text-slate-400 font-mono text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> ARENA EN EMPATE TOTAL
                </div>
              )}
            </div>
          </div>

          {/* Tienda 218 Banner */}
          <div className="text-center md:text-right flex-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-blue-400 bg-blue-950/50 border border-blue-900 px-2 py-0.5 rounded">
              GUERREROS DE LA COSTA
            </span>
            <h3 className="text-3xl font-display font-black text-white mt-2">TIENDA 218</h3>
            <p className="text-slate-400 text-xs mt-1 font-mono">Sedes Activas</p>
            <div className="mt-4 flex gap-3 justify-center md:justify-end">
              <div className="bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-lg text-center">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Victorias</span>
                <span className="text-base font-bold text-slate-100 font-mono">{score218}/5</span>
              </div>
              <div className="bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-lg text-center">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Ventas totales</span>
                <span className="text-base font-bold text-blue-400 font-mono">S/ {t218.totalSalesWithTax.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* COMPARISON BAR CHARTS */}
      <div className="glass-panel p-6 space-y-6">
        <h3 className="text-sm font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-slate-400" /> ENFRENTAMIENTO POR ATRIBUTOS (METRICAS)
        </h3>

        <div className="space-y-6">
          {/* 1. VENTAS CON IGV */}
          <div className="space-y-2">
            <div className="flex justify-between items-end text-xs font-mono">
              <div className="text-left">
                <span className={`font-bold ${salesWinner === '102' ? 'text-emerald-400 font-bold font-sans' : 'text-slate-400'}`}>
                  S/ {t102.totalSalesWithTax.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">Tienda 102</span>
              </div>
              <div className="text-center font-bold text-slate-300 uppercase tracking-widest text-[10px]">
                VENTAS ACUMULADAS (CON IGV) {salesWinner === '102' ? '🏆 T102' : salesWinner === '218' ? '🏆 T218' : '👔 EMPATE'}
              </div>
              <div className="text-right">
                <span className={`font-bold ${salesWinner === '218' ? 'text-blue-400 font-bold font-sans' : 'text-slate-400'}`}>
                  S/ {t218.totalSalesWithTax.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">Tienda 218</span>
              </div>
            </div>
            {/* Visual Dual progress bar */}
            <div className="h-3.5 bg-slate-900 rounded-full overflow-hidden flex p-[2px] border border-slate-800">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-l-full transition-all duration-1000 ease-out h-full"
                style={{ width: `${salesComp.a}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-r-full transition-all duration-1000 ease-out h-full ml-auto"
                style={{ width: `${salesComp.b}%` }}
              ></div>
            </div>
          </div>

          {/* 2. LIMPIEZA DE TIENDA */}
          <div className="space-y-2">
            <div className="flex justify-between items-end text-xs font-mono">
              <div className="text-left">
                <span className={`font-bold ${cleanlinessWinner === '102' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {t102.cleanlinessRate.toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 block">{t102.cleanDays} de {t102.totalDays} días</span>
              </div>
              <div className="text-center font-bold text-slate-300 uppercase tracking-widest text-[10px]">
                INDICE DE LIMPIEZA Y ORDEN {cleanlinessWinner === '102' ? '🧼 T102' : cleanlinessWinner === '218' ? '🧼 T218' : '👔 EMPATE'}
              </div>
              <div className="text-right">
                <span className={`font-bold ${cleanlinessWinner === '218' ? 'text-blue-400' : 'text-slate-400'}`}>
                  {t218.cleanlinessRate.toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 block">{t218.cleanDays} de {t218.totalDays} días</span>
              </div>
            </div>
            {/* Visual Dual progress bar */}
            <div className="h-3.5 bg-slate-900 rounded-full overflow-hidden flex p-[2px] border border-slate-800">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-l-full transition-all duration-1000 ease-out h-full"
                style={{ width: `${cleanComp.a}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-r-full transition-all duration-1000 ease-out h-full ml-auto"
                style={{ width: `${cleanComp.b}%` }}
              ></div>
            </div>
          </div>

          {/* 3. PUNTUALIDAD */}
          <div className="space-y-2">
            <div className="flex justify-between items-end text-xs font-mono">
              <div className="text-left">
                <span className={`font-bold ${punctualityWinner === '102' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {t102.punctualityRate.toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 block">{t102.punctualDays} de {t102.totalDays} días</span>
              </div>
              <div className="text-center font-bold text-slate-300 uppercase tracking-widest text-[10px]">
                INDICE DE PUNTUALIDAD GENERAL {punctualityWinner === '102' ? '⏰ T102' : punctualityWinner === '218' ? '⏰ T218' : '👔 EMPATE'}
              </div>
              <div className="text-right">
                <span className={`font-bold ${punctualityWinner === '218' ? 'text-blue-400' : 'text-slate-400'}`}>
                  {t218.punctualityRate.toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 block">{t218.punctualDays} de {t218.totalDays} días</span>
              </div>
            </div>
            {/* Visual Dual progress bar */}
            <div className="h-3.5 bg-slate-900 rounded-full overflow-hidden flex p-[2px] border border-slate-800">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-l-full transition-all duration-1000 ease-out h-full"
                style={{ width: `${punctComp.a}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-r-full transition-all duration-1000 ease-out h-full ml-auto"
                style={{ width: `${punctComp.b}%` }}
              ></div>
            </div>
          </div>

          {/* 4. CLIENTES ATENDIDOS */}
          <div className="space-y-2">
            <div className="flex justify-between items-end text-xs font-mono">
              <div className="text-left">
                <span className={`font-bold ${clientsWinner === '102' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {t102.totalClients}
                </span>
                <span className="text-[10px] text-slate-500 block">Clientes</span>
              </div>
              <div className="text-center font-bold text-slate-300 uppercase tracking-widest text-[10px]">
                CLIENTES TOTALES ATENDIDOS {clientsWinner === '102' ? '👥 T102' : clientsWinner === '218' ? '👥 T218' : '👔 EMPATE'}
              </div>
              <div className="text-right">
                <span className={`font-bold ${clientsWinner === '218' ? 'text-blue-400' : 'text-slate-400'}`}>
                  {t218.totalClients}
                </span>
                <span className="text-[10px] text-slate-500 block">Clientes</span>
              </div>
            </div>
            {/* Visual Dual progress bar */}
            <div className="h-3.5 bg-slate-900 rounded-full overflow-hidden flex p-[2px] border border-slate-800">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-l-full transition-all duration-1000 ease-out h-full"
                style={{ width: `${clientsComp.a}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-r-full transition-all duration-1000 ease-out h-full ml-auto"
                style={{ width: `${clientsComp.b}%` }}
              ></div>
            </div>
          </div>

          {/* 5. PRODUCTOS VENDIDOS */}
          <div className="space-y-2">
            <div className="flex justify-between items-end text-xs font-mono">
              <div className="text-left">
                <span className={`font-bold ${productsWinner === '102' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {t102.totalProducts}
                </span>
                <span className="text-[10px] text-slate-500 block">Productos</span>
              </div>
              <div className="text-center font-bold text-slate-300 uppercase tracking-widest text-[10px]">
                CANTIDAD DE PRODUCTOS VENDIDOS {productsWinner === '102' ? '📦 T102' : productsWinner === '218' ? '📦 T218' : '👔 EMPATE'}
              </div>
              <div className="text-right">
                <span className={`font-bold ${productsWinner === '218' ? 'text-blue-400' : 'text-slate-400'}`}>
                  {t218.totalProducts}
                </span>
                <span className="text-[10px] text-slate-500 block">Productos</span>
              </div>
            </div>
            {/* Visual Dual progress bar */}
            <div className="h-3.5 bg-slate-900 rounded-full overflow-hidden flex p-[2px] border border-slate-800">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-l-full transition-all duration-1000 ease-out h-full"
                style={{ width: `${productsComp.a}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-r-full transition-all duration-1000 ease-out h-full ml-auto"
                style={{ width: `${productsComp.b}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
