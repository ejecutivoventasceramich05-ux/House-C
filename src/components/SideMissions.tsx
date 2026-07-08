import React from 'react';
import { Mission, MissionProgress, Seller } from '../types';
import { ShieldCheck, Flame, Gift, Calendar, Sparkles } from 'lucide-react';

interface SideMissionsProps {
  sellers: Seller[];
  missions: Mission[];
  missionProgress: MissionProgress[];
}

export default function SideMissions({
  sellers,
  missions,
  missionProgress,
}: SideMissionsProps) {
  const activeMissions = missions.filter((m) => m.active);

  return (
    <div className="space-y-8" id="misiones-secundarias-section">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <span className="text-purple-500 animate-pulse font-mono">🎯</span> TABLÓN DE MISIONES SECUNDARIAS
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Misiones especiales activadas por el administrador para ganar recompensas y bonos extra.
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block animate-pulse"></span>
          RECOMPENSAS ACTIVAS
        </div>
      </div>

      {activeMissions.length === 0 ? (
        <div className="glass-panel p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-display text-slate-300">No hay misiones secundarias activas</h3>
          <p className="text-slate-500 text-sm mt-2">
            El administrador puede crear y activar nuevas misiones desde el panel de control para que aparezcan aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeMissions.map((mission) => {
            return (
              <div 
                key={mission.id} 
                className="glass-panel overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-colors duration-200"
              >
                {/* Header card banner */}
                <div className="bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 border-b border-slate-800/80 p-5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-400 border border-purple-800 px-2.5 py-0.5 rounded-full font-bold">
                      MISIÓN SECUNDARIA
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-950/50 border border-amber-900 px-2 py-0.5 rounded">
                      <Gift className="w-3.5 h-3.5" />
                      <span>Bono: S/ {mission.rewardBono}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white mt-3 group-hover:text-purple-400 transition-colors">
                    {mission.title}
                  </h3>
                  
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    {mission.description}
                  </p>
                </div>

                {/* Progress bars for sellers */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Período: {mission.startDate} al {mission.endDate}</span>
                  </div>

                  <div className="space-y-3.5">
                    {sellers.map((seller) => {
                      // Find progress
                      const prog = missionProgress.find(
                        (p) => p.missionId === mission.id && p.sellerId === seller.id
                      );
                      const currentCount = prog ? prog.progressCount : 0;
                      const percent = Math.min(100, (currentCount / mission.targetQuantity) * 100);
                      const isCompleted = currentCount >= mission.targetQuantity;

                      return (
                        <div key={seller.id} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                              <span>{seller.carImage}</span>
                              <span>{seller.name}</span>
                            </span>
                            
                            <span className="font-mono text-slate-400">
                              {isCompleted ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" /> ¡COMPLETADA! ({currentCount}/{mission.targetQuantity})
                                </span>
                              ) : (
                                <span>{currentCount} / {mission.targetQuantity} {mission.targetProduct.split(' ')[0]}s</span>
                              )}
                            </span>
                          </div>

                          {/* XP-like Progress Bar */}
                          <div className="h-3 bg-slate-900 border border-slate-800 rounded-full p-[1px] overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>

                            {/* Flash shine animation when completed */}
                            {isCompleted && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer reward guidelines */}
                <div className="bg-slate-900/40 p-4 border-t border-slate-800/60 text-[11px] font-mono text-slate-500 flex justify-between items-center">
                  <span>Meta: {mission.targetQuantity} unid. de {mission.targetProduct}</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Reclama con el admin
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
