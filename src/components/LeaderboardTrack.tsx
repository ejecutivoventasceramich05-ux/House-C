import React from 'react';
import { Seller, DailyRecord, MonthlyGoal } from '../types';
import { Trophy, Users, ShoppingBag, Target, Milestone, ArrowRight, Gamepad2, Sparkles, Award } from 'lucide-react';
import { RaceCar, getCarStyle } from './RaceCar';

interface LevelInfo {
  levelNum: number;
  levelName: string;
  levelColor: string;
  nextLevel: string;
  levelIcon: string;
}

function getLevelInfo(sales: number): LevelInfo {
  if (sales >= 200000) {
    return {
      levelNum: 4,
      levelName: 'Leyenda',
      levelColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30',
      nextLevel: 'MÁXIMO ALCANZADO 🏆',
      levelIcon: '👑',
    };
  }
  if (sales >= 150000) {
    return {
      levelNum: 3,
      levelName: 'Súper Pro',
      levelColor: 'text-cyan-400 bg-cyan-950/50 border-cyan-500/30',
      nextLevel: 'SIGUIENTE: 200K 🏁',
      levelIcon: '🔥',
    };
  }
  if (sales >= 100000) {
    return {
      levelNum: 2,
      levelName: 'Corredor Pro',
      levelColor: 'text-yellow-400 bg-yellow-950/50 border-yellow-500/30',
      nextLevel: 'SIGUIENTE: 150K ⚡',
      levelIcon: '⚡',
    };
  }
  return {
    levelNum: 1,
    levelName: 'Novato',
    levelColor: 'text-orange-400 bg-orange-950/50 border-orange-500/30',
    nextLevel: 'SIGUIENTE: 100K 🏎️',
    levelIcon: '🏎️',
  };
}

interface LeaderboardTrackProps {
  sellers: Seller[];
  records: DailyRecord[];
  goals: MonthlyGoal[];
  selectedMonth: string; // 'YYYY-MM'
}

export default function LeaderboardTrack({
  sellers,
  records,
  goals,
  selectedMonth,
}: LeaderboardTrackProps) {
  // Compute accumulated metrics for each seller for the selected month
  const sellerStats = sellers.map((seller) => {
    // Filter records for this seller in the selected month
    const monthRecords = records.filter(
      (rec) => rec.sellerId === seller.id && rec.date.startsWith(selectedMonth)
    );

    const totalSalesWithTax = monthRecords.reduce((sum, rec) => sum + rec.salesWithTax, 0);
    const totalSalesWithoutTax = monthRecords.reduce((sum, rec) => sum + rec.salesWithoutTax, 0);
    const totalProductsSold = monthRecords.reduce((sum, rec) => sum + rec.productsSold, 0);
    const totalClientsServed = monthRecords.reduce((sum, rec) => sum + rec.clientsServed, 0);

    // Get goal
    const goalObj = goals.find(
      (g) => g.sellerId === seller.id && g.month === selectedMonth
    );
    const goalAmount = goalObj ? goalObj.goalAmount : 100000; // Default fallback

    const percent = goalAmount > 0 ? (totalSalesWithTax / goalAmount) * 100 : 0;
    const remaining = Math.max(0, goalAmount - totalSalesWithTax);

    return {
      seller,
      totalSalesWithTax,
      totalSalesWithoutTax,
      totalProductsSold,
      totalClientsServed,
      goalAmount,
      percent,
      remaining,
    };
  });

  // Sort by sales with tax descending to establish rank
  const rankedStats = [...sellerStats].sort((a, b) => b.totalSalesWithTax - a.totalSalesWithTax);

  // Define scale maximum for the racetrack.
  // The milestones are 100k, 150k, 200k. We should set the track's maximum view to S/ 220,000 to show overshoot.
  const trackMax = 220000;

  // Function to map sales to a track percentage (0% to 100%)
  const getTrackPercentage = (sales: number) => {
    const percentage = (sales / trackMax) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  // --- VENDEDOR DEL DÍA COMPUTATION ---
  // Find the top seller of "today" (local timezone date), or the most recent day with active records
  const getVendedorDelDia = () => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // e.g. "2026-07-07"
    
    let dayRecords = records.filter(r => r.date === todayStr && r.salesWithTax > 0);
    let activeDate = todayStr;

    // Fallback: If today has no sales, find the most recent date in records that does
    if (dayRecords.length === 0 && records.length > 0) {
      const datesWithSales = [...new Set(records.filter(r => r.salesWithTax > 0).map(r => r.date))];
      if (datesWithSales.length > 0) {
        datesWithSales.sort((a, b) => b.localeCompare(a));
        activeDate = datesWithSales[0];
        dayRecords = records.filter(r => r.date === activeDate && r.salesWithTax > 0);
      }
    }

    if (dayRecords.length > 0) {
      const dailyStatsMap: Record<string, { sales: number; clients: number; products: number }> = {};
      dayRecords.forEach(r => {
        if (!dailyStatsMap[r.sellerId]) {
          dailyStatsMap[r.sellerId] = { sales: 0, clients: 0, products: 0 };
        }
        dailyStatsMap[r.sellerId].sales += r.salesWithTax;
        dailyStatsMap[r.sellerId].clients += r.clientsServed;
        dailyStatsMap[r.sellerId].products += r.productsSold;
      });

      let bestSellerId = '';
      let maxSales = -1;
      Object.entries(dailyStatsMap).forEach(([sid, stats]) => {
        if (stats.sales > maxSales) {
          maxSales = stats.sales;
          bestSellerId = sid;
        }
      });

      const foundSeller = sellers.find(s => s.id === bestSellerId);
      if (foundSeller) {
        return {
          seller: foundSeller,
          sales: maxSales,
          clients: dailyStatsMap[bestSellerId].clients,
          products: dailyStatsMap[bestSellerId].products,
          date: activeDate
        };
      }
    }
    return null;
  };

  const topSellerDay = getVendedorDelDia();

  return (
    <div className="space-y-8" id="tablero-lideres-section">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <span className="text-orange-500 animate-pulse font-mono">🏎️</span> GRAND PRIX: TABLERO DE LÍDERES
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Visualización en tiempo real del progreso mensual hacia las metas de ventas (con IGV).
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          TEMPORADA: {selectedMonth}
        </div>
      </div>

      {/* RACETRACK ARENA */}
      <div className="glass-panel overflow-hidden p-6 relative">
        {/* Neon decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

        {/* RETRO ARCADE SCENERY HEADER */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-4 h-32 flex items-center justify-between shadow-[inset_0_4px_24px_rgba(0,0,0,0.9)]">
          {/* Grid lines moving into perspective */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(236,72,153,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] [transform:perspective(120px)_rotateX(65deg)] [transform-origin:top_center] opacity-30 pointer-events-none"></div>
          
          {/* Neon Retro Sun in center/background */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-t from-pink-500/20 to-yellow-500/10 blur-[2px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]"></div>
          {/* Scanline splits on the Sun */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2 w-48 h-48 pointer-events-none flex flex-col justify-between py-1 opacity-25">
            <div className="h-0.5 bg-slate-950 w-full"></div>
            <div className="h-1 bg-slate-950 w-full"></div>
            <div className="h-1.5 bg-slate-950 w-full"></div>
            <div className="h-2 bg-slate-950 w-full"></div>
            <div className="h-3 bg-slate-950 w-full"></div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-950 font-extrabold text-xl animate-bounce shadow-[0_0_15px_rgba(234,179,8,0.4)]">
              🕹️
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-pink-500 uppercase tracking-widest animate-pulse">STAGE 01: CAMPEONATO DE VENTAS</div>
              <h3 className="text-base md:text-lg font-bold font-display tracking-tight text-white uppercase flex items-center gap-2">
                SÚPER RETRO RACER <span className="text-xs bg-pink-500/20 text-pink-400 border border-pink-500/30 px-1.5 py-0.5 rounded font-mono font-normal tracking-normal lowercase">v1.2</span>
              </h3>
              <p className="text-[10px] font-mono text-slate-400 hidden md:block">Supera los niveles de 100K, 150K y 200K para desbloquear rangos de piloto.</p>
            </div>
          </div>

          <div className="relative z-10 text-right font-mono text-[10px] space-y-1">
            <div className="text-yellow-500 font-bold animate-pulse">INSERT COIN 🪙</div>
            <div className="text-slate-400">HIGH SCORE: <span className="text-white font-bold">S/ 200,000</span></div>
            <div className="text-cyan-400">STATUS: <span className="text-white font-bold">1P READY</span></div>
          </div>
        </div>

        {/* VENDEDOR DEL DÍA SPOTLIGHT CARD */}
        {topSellerDay ? (
          <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/35 rounded-2xl p-4 md:p-5 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.08)]">
            {/* Decorative neon backlights */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none rounded-full"></div>
            <div className="absolute left-10 bottom-0 w-24 h-24 bg-yellow-500/5 blur-2xl pointer-events-none rounded-full"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
              {/* Left side: Avatar, Name, Title */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full md:w-auto">
                <div className="relative flex-shrink-0">
                  {/* Crown decoration */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-bounce duration-1000">
                    👑
                  </div>
                  {/* Circular neon frame */}
                  <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-gradient-to-b from-amber-500/15 to-transparent">
                    {topSellerDay.seller.carImage}
                  </div>
                  {/* Ranking mini tag */}
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow">
                    #1
                  </span>
                </div>

                <div>
                  <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                    🏆 PILOTO DEL DÍA
                  </span>
                  <h3 className="text-base md:text-lg font-bold font-display text-white mt-1 uppercase tracking-wide flex items-center justify-center sm:justify-start gap-2">
                    {topSellerDay.seller.name}
                    <span className="text-slate-500 text-xs font-mono font-normal">
                      ({topSellerDay.seller.storeId === '102' ? 'Tienda 102' : 'Tienda 218'})
                    </span>
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-wide">
                    Récord de pista establecido el <span className="text-amber-300 font-bold">{topSellerDay.date.split('-').reverse().join('/')}</span>
                  </p>
                </div>
              </div>

              {/* Right side: Sales volume & motivation stats */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3.5 w-full md:w-auto">
                {/* Sales value bubble */}
                <div className="bg-[#0b0e14]/90 border border-amber-500/20 rounded-xl py-2 px-4 text-center shadow-lg">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MONTO VENDIDO</div>
                  <div className="text-amber-400 font-mono text-base md:text-lg font-extrabold tracking-wide mt-0.5">
                    S/ {topSellerDay.sales.toLocaleString()}
                  </div>
                </div>

                {/* Clients & Products detailed bubbles */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/60 border border-slate-900 rounded-lg py-1.5 px-3.5 text-center min-w-[75px]">
                    <div className="text-[8px] font-mono text-slate-500 uppercase">Clientes</div>
                    <div className="text-slate-200 text-xs font-mono font-bold mt-0.5">
                      {topSellerDay.clients}
                    </div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-900 rounded-lg py-1.5 px-3.5 text-center min-w-[75px]">
                    <div className="text-[8px] font-mono text-slate-500 uppercase">Productos</div>
                    <div className="text-slate-200 text-xs font-mono font-bold mt-0.5">
                      {topSellerDay.products}
                    </div>
                  </div>
                </div>

                {/* Motivational Tag */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider animate-pulse text-center w-full sm:w-auto">
                  ⚡ ¡MÁXIMA VELOCIDAD! ⚡
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-slate-950/40 border border-slate-900/60 rounded-2xl p-4 text-center">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              🏁 ¡COMIENZA LA CARRERA! NO HAY REGISTROS DE VENTAS EN LA FECHA ACTIVA.
            </p>
          </div>
        )}

        <div className="relative z-10">
          {/* TRACK LABELS / HEADER */}
          <div className="flex justify-between items-center mb-5 text-xs font-mono font-bold text-slate-500">
            <div className="w-24 md:w-32">PILOTO / TIENDA</div>
            <div className="flex-1 relative h-6">
              {/* Milestone indicators */}
              <div 
                className="absolute text-center -translate-x-1/2 flex flex-col items-center" 
                style={{ left: `${(100000 / trackMax) * 100}%` }}
              >
                <span className="text-yellow-500 font-bold bg-yellow-950/40 border border-yellow-800/50 px-1.5 py-0.5 rounded text-[10px] tracking-wide">100K (Meta 1)</span>
                <span className="w-[1px] h-3 bg-yellow-500/50 mt-1"></span>
              </div>

              <div 
                className="absolute text-center -translate-x-1/2 flex flex-col items-center" 
                style={{ left: `${(150000 / trackMax) * 100}%` }}
              >
                <span className="text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/50 px-1.5 py-0.5 rounded text-[10px] tracking-wide">150K (Meta 2)</span>
                <span className="w-[1px] h-3 bg-cyan-500/50 mt-1"></span>
              </div>

              <div 
                className="absolute text-center -translate-x-1/2 flex flex-col items-center" 
                style={{ left: `${(200000 / trackMax) * 100}%` }}
              >
                <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/50 px-1.5 py-0.5 rounded text-[10px] tracking-wide animate-pulse">200K (Meta 3)</span>
                <span className="w-[1px] h-3 bg-emerald-500/50 mt-1"></span>
              </div>
            </div>
            <div className="w-28 md:w-36 pl-3 text-right">MARCADOR</div>
          </div>

          {/* THE ASPHALT ROAD */}
          <div className="bg-[#0b0e14] border-y border-white/5 rounded-2xl p-4 md:p-6 space-y-7 relative">
            
            {/* SELLER LANES */}
            {sellerStats.map(({ seller, totalSalesWithTax, goalAmount, percent, remaining }) => {
              const posPercent = getTrackPercentage(totalSalesWithTax);
              const isOverGoal = totalSalesWithTax >= goalAmount;
              const level = getLevelInfo(totalSalesWithTax);

              return (
                <div key={seller.id} className="relative z-10 flex items-center group">
                  {/* Driver Name Tag */}
                  <div className="w-24 md:w-32 flex-shrink-0 pr-2">
                    <div className="font-display font-bold text-sm text-slate-100 flex items-center gap-2">
                      <RaceCar 
                        styleName={getCarStyle(seller.carImage)} 
                        avatarColor={seller.avatarColor} 
                        className="w-8 h-4 inline-block flex-shrink-0" 
                      />
                      <span className="truncate">{seller.name}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>T.{seller.storeId}</span>
                      <span className="text-slate-800">•</span>
                      <span className="font-extrabold text-[#00d2ff]">Lvl {level.levelNum}</span>
                    </div>
                  </div>

                  {/* Lane and Car progression (Retro Video Game Style) */}
                  <div className="flex-1 bg-[#121620] h-16 rounded-lg relative flex items-center px-4 overflow-visible border border-white/5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]">
                    
                    {/* Retro Rumble Strips (Curbs/Pianos) top & bottom */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#ef4444,#ef4444_12px,#f8fafc_12px,#f8fafc_24px)] rounded-t-lg opacity-90"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#ef4444,#ef4444_12px,#f8fafc_12px,#f8fafc_24px)] rounded-b-lg opacity-90"></div>

                    {/* Asphalt lane markings (center dashed lines in retro yellow) */}
                    <div className="absolute left-0 right-0 h-[2px] bg-[repeating-linear-gradient(90deg,#eab308,#eab308_12px,transparent_12px,transparent_24px)] opacity-40 pointer-events-none top-1/2 -translate-y-1/2"></div>
                    
                    {/* Start Grid Checkered line (Left side) */}
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[repeating-conic-gradient(#1e293b_0_25%,#e2e8f0_0_50%)] bg-[size:4px_4px] opacity-30"></div>

                    {/* Finish Checkered line (Right side) */}
                    <div className="absolute right-0 top-1.5 bottom-1.5 w-3 bg-[repeating-conic-gradient(#1e293b_0_25%,#e2e8f0_0_50%)] bg-[size:6px_6px] opacity-70 rounded-r-sm"></div>

                    {/* Dynamic Retro Checkpoints within the individual lanes */}
                    {/* Checkpoint 1 (100K) */}
                    <div 
                      className={`absolute top-1.5 bottom-1.5 border-l border-dashed z-10 pointer-events-none transition-colors duration-500 ${
                        totalSalesWithTax >= 100000 ? 'border-yellow-500/40' : 'border-yellow-500/10'
                      }`}
                      style={{ left: `${(100000 / trackMax) * 100}%` }}
                    >
                      <div className={`absolute -top-3.5 -translate-x-1/2 text-[8px] font-mono font-extrabold px-1 rounded transition-all whitespace-nowrap ${
                        totalSalesWithTax >= 100000 ? 'text-yellow-400 bg-yellow-950/80 border border-yellow-800/40 shadow-[0_0_8px_rgba(234,179,8,0.2)]' : 'text-slate-700'
                      }`}>
                        LVL 2
                      </div>
                    </div>

                    {/* Checkpoint 2 (150K) */}
                    <div 
                      className={`absolute top-1.5 bottom-1.5 border-l border-dashed z-10 pointer-events-none transition-colors duration-500 ${
                        totalSalesWithTax >= 150000 ? 'border-cyan-400/40' : 'border-cyan-400/10'
                      }`}
                      style={{ left: `${(150000 / trackMax) * 100}%` }}
                    >
                      <div className={`absolute -top-3.5 -translate-x-1/2 text-[8px] font-mono font-extrabold px-1 rounded transition-all whitespace-nowrap ${
                        totalSalesWithTax >= 150000 ? 'text-cyan-400 bg-cyan-950/80 border border-cyan-800/40 shadow-[0_0_8px_rgba(34,211,238,0.2)]' : 'text-slate-700'
                      }`}>
                        LVL 3
                      </div>
                    </div>

                    {/* Checkpoint 3 (200K) */}
                    <div 
                      className={`absolute top-1.5 bottom-1.5 border-l border-dashed z-10 pointer-events-none transition-colors duration-500 ${
                        totalSalesWithTax >= 200000 ? 'border-emerald-400/40' : 'border-emerald-400/10'
                      }`}
                      style={{ left: `${(200000 / trackMax) * 100}%` }}
                    >
                      <div className={`absolute -top-3.5 -translate-x-1/2 text-[8px] font-mono font-extrabold px-1 rounded transition-all whitespace-nowrap ${
                        totalSalesWithTax >= 200000 ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 shadow-[0_0_8px_rgba(16,185,129,0.2)] animate-pulse' : 'text-slate-700'
                      }`}>
                        FINISH 🏁
                      </div>
                    </div>

                    {/* Progress Fill Bar (Tire tracks/Asphalt shadow) */}
                    <div 
                      className="absolute left-0 top-1.5 bottom-1.5 bg-gradient-to-r from-[#00d2ff]/5 to-[#9d50bb]/10 border-r border-[#00d2ff]/30 transition-all duration-1000 ease-out pointer-events-none"
                      style={{ width: `${posPercent}%` }}
                    ></div>

                    {/* Milestone Progress Indicators nested in track */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 font-mono text-[10px] z-20 bg-[#121620]/85 px-2 py-0.5 rounded border border-white/5">
                      <span className="text-[#00d2ff] font-bold">
                        S/ {totalSalesWithTax.toLocaleString()}
                      </span>
                      <span className="text-slate-600">/</span>
                      <span className="text-slate-400">
                        S/ {(goalAmount / 1000).toFixed(0)}k
                      </span>
                    </div>

                    {/* CAR ICON / VEHICLE */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
                      style={{ 
                        left: `calc(${posPercent}% - 35px)`,
                        transform: 'translateY(-50%)',
                        zIndex: 10
                      }}
                    >
                      <div className="flex flex-col items-center">
                        {/* Hover mini-card with quick stats */}
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-11 bg-slate-950 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap">
                          <span className="font-bold text-yellow-400">{percent.toFixed(1)}%</span> de la meta (Lvl {level.levelNum})
                        </div>

                        {/* Real Race Car SVG in place of the bubble */}
                        <RaceCar 
                          styleName={getCarStyle(seller.carImage)} 
                          avatarColor={seller.avatarColor} 
                          className="w-14 h-7 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] hover:scale-115 transition-transform duration-200 cursor-pointer"
                        />

                        {/* Animated Flame effect if going fast (above 70%) or sparks */}
                        {percent > 70 && (
                          <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex gap-0.5 pointer-events-none">
                            <span className="w-2 h-1 bg-amber-500 rounded-full animate-ping"></span>
                            <span className="w-3 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Speedometer Percentage Widget (Gamified Arcade style) */}
                  <div className="w-28 md:w-36 flex-shrink-0 pl-3 text-right flex flex-col justify-center">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${level.levelColor}`}>
                        Lvl {level.levelNum}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#00d2ff]">
                        {percent.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="text-[9px] font-mono mt-1">
                      {isOverGoal ? (
                        <span className="text-[#00ff87] font-bold uppercase tracking-wider">META OK 🏆</span>
                      ) : (
                        <span className="text-slate-500 font-medium">Falta S/ {remaining.toLocaleString()}</span>
                      )}
                    </div>
                    
                    <div className="text-[8px] font-mono text-slate-600 mt-0.5 uppercase tracking-tight">
                      {level.nextLevel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUB-INFO (TOTAL PRODUCTS AND CLIENTS SERVED) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {sellerStats.map(({ seller, totalProductsSold, totalClientsServed, percent, totalSalesWithTax }) => (
              <div 
                key={seller.id} 
                className="glass-panel p-3.5 flex flex-col justify-between transition-transform duration-200 hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RaceCar 
                      styleName={getCarStyle(seller.carImage)} 
                      avatarColor={seller.avatarColor} 
                      className="w-8 h-4" 
                    />
                    <span className="text-xs font-bold text-slate-300">{seller.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    percent >= 100 
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
                      : percent >= 50 
                        ? 'bg-blue-950/80 text-blue-400 border border-blue-800' 
                        : 'bg-slate-950/80 text-slate-500 border border-slate-800'
                  }`}>
                    LVL {Math.floor(percent / 20) + 1}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  {/* Top: Ventas (Monto vendido) */}
                  <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-lg py-1.5 px-3 flex items-center justify-between">
                    <span className="text-slate-500 text-[9px] font-mono uppercase flex items-center gap-1">
                      <span className="text-emerald-400">💰</span> VENTAS
                    </span>
                    <span className="text-emerald-400 text-xs font-mono font-extrabold" title={`S/ ${totalSalesWithTax.toLocaleString()}`}>
                      S/ {totalSalesWithTax.toLocaleString()}
                    </span>
                  </div>

                  {/* Bottom: Clientes & Prods in 2-column grid */}
                  <div className="grid grid-cols-2 gap-1 bg-slate-950/50 py-1.5 px-1 rounded-lg border border-slate-900/60 text-center">
                    <div>
                      <div className="text-slate-500 text-[8px] font-mono uppercase flex items-center justify-center gap-0.5">
                        <Users className="w-2.5 h-2.5 text-slate-400" /> Clientes
                      </div>
                      <div className="text-slate-200 text-xs font-mono font-bold mt-0.5">
                        {totalClientsServed}
                      </div>
                    </div>
                    <div className="border-l border-slate-800/80">
                      <div className="text-slate-500 text-[8px] font-mono uppercase flex items-center justify-center gap-0.5">
                        <ShoppingBag className="w-2.5 h-2.5 text-slate-400" /> Prods
                      </div>
                      <div className="text-slate-200 text-xs font-mono font-bold mt-0.5">
                        {totalProductsSold}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RETAIL PODIUM & LEADER LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PODIUM VISUALIZER (Bento Card 1) */}
        <div className="lg:col-span-1 glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-4">
              <Trophy className="w-4 h-4 text-yellow-500" /> PODIO DEL MES
            </h3>
            <p className="text-slate-500 text-xs mb-6">El estante de honor para los guerreros de House Ceramic.</p>
          </div>

          {/* Retro podium bars with heights */}
          <div className="flex items-end justify-center gap-3 h-32 pt-2">
            
            {/* 2nd Place */}
            {rankedStats[1] && (
              <div className="flex flex-col items-center flex-1">
                <RaceCar 
                  styleName={getCarStyle(rankedStats[1].seller.carImage)} 
                  avatarColor={rankedStats[1].seller.avatarColor} 
                  className="w-10 h-5 mb-1" 
                />
                <span className="text-[10px] font-bold text-slate-300 mt-1 truncate max-w-[80px]">{rankedStats[1].seller.name}</span>
                <span className="text-[9px] font-mono text-slate-500">S/ {(rankedStats[1].totalSalesWithTax / 1000).toFixed(1)}k</span>
                <div className="w-full bg-slate-800 border-t-2 border-slate-400 h-12 mt-1 rounded-t-md flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-400">2°</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {rankedStats[0] && (
              <div className="flex flex-col items-center flex-1">
                <span className="text-2xl animate-bounce">👑</span>
                <RaceCar 
                  styleName={getCarStyle(rankedStats[0].seller.carImage)} 
                  avatarColor={rankedStats[0].seller.avatarColor} 
                  className="w-12 h-6 -mt-1 mb-1" 
                />
                <span className="text-xs font-bold text-yellow-400 mt-1 truncate max-w-[80px]">{rankedStats[0].seller.name}</span>
                <span className="text-[10px] font-mono text-yellow-500/80 font-bold">S/ {(rankedStats[0].totalSalesWithTax / 1000).toFixed(1)}k</span>
                <div className="w-full bg-gradient-to-t from-yellow-950/60 to-yellow-900/50 border-t-4 border-yellow-500 h-20 mt-1 rounded-t-lg flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <span className="text-base font-bold text-yellow-400">1°</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {rankedStats[2] && (
              <div className="flex flex-col items-center flex-1">
                <RaceCar 
                  styleName={getCarStyle(rankedStats[2].seller.carImage)} 
                  avatarColor={rankedStats[2].seller.avatarColor} 
                  className="w-10 h-5 mb-1" 
                />
                <span className="text-[10px] font-bold text-slate-300 mt-1 truncate max-w-[80px]">{rankedStats[2].seller.name}</span>
                <span className="text-[9px] font-mono text-slate-500">S/ {(rankedStats[2].totalSalesWithTax / 1000).toFixed(1)}k</span>
                <div className="w-full bg-slate-900 border-t-2 border-amber-700 h-8 mt-1 rounded-t-md flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-600">3°</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RANKED LIST DETAILS (Bento Card 2 & 3) */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between">
          <div className="w-full">
            <h3 className="text-sm font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-4">
              <Milestone className="w-4 h-4 text-emerald-400" /> DETALLE DE COMPETENCIA INDIVIDUAL
            </h3>
            
            <div className="space-y-3">
              {rankedStats.map((stat, index) => {
                const getRankBadge = (idx: number) => {
                  switch (idx) {
                    case 0: return 'bg-yellow-950/80 text-yellow-400 border-yellow-800';
                    case 1: return 'bg-slate-800 text-slate-300 border-slate-700';
                    case 2: return 'bg-amber-950/80 text-amber-500 border-amber-900';
                    default: return 'bg-slate-950 text-slate-500 border-slate-900';
                  }
                };

                return (
                  <div 
                    key={stat.seller.id} 
                    className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Indicator */}
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-xs font-bold ${getRankBadge(index)}`}>
                        {index + 1}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-200">{stat.seller.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-800 px-1.5 py-0.2 rounded">
                            Tienda {stat.seller.storeId}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex flex-wrap gap-x-3">
                          <span>Con IGV: <strong className="text-slate-200">S/ {stat.totalSalesWithTax.toLocaleString()}</strong></span>
                          <span>Sin IGV: <strong className="text-slate-400">S/ {stat.totalSalesWithoutTax.toLocaleString()}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-800/50 sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-left sm:text-right font-mono">
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-1 sm:justify-end">
                          <Target className="w-3.5 h-3.5 text-slate-500" />
                          <span>{stat.percent.toFixed(1)}%</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {stat.remaining > 0 ? `Falta S/ ${stat.remaining.toLocaleString()}` : '¡Meta lograda! 🎉'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono mt-4 text-right">
            * El impuesto general a las ventas (IGV) equivale al 18%.
          </div>
        </div>
      </div>
    </div>
  );
}
