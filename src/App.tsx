import React, { useState, useEffect } from 'react';
import { Seller, DailyRecord, MonthlyGoal, Mission, MissionProgress } from './types';
import { 
  INITIAL_SELLERS, 
  INITIAL_GOALS, 
  INITIAL_RECORDS, 
  INITIAL_MISSIONS, 
  INITIAL_MISSION_PROGRESS 
} from './initialData';

// Component imports
import LeaderboardTrack from './components/LeaderboardTrack';
import StoreComparison from './components/StoreComparison';
import SideMissions from './components/SideMissions';
import ManagementLog from './components/ManagementLog';
import AdminPanel from './components/AdminPanel';

import { 
  Trophy, 
  Award, 
  Settings, 
  ShieldCheck, 
  Flame, 
  Volume2, 
  VolumeX, 
  Calendar,
  Layers,
  HelpCircle,
  Lock,
  KeyRound
} from 'lucide-react';

// Lightweight retro sound effects synthesizer using standard browser Web Audio API
const playSound = (type: 'coin' | 'levelUp' | 'click' | 'delete', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'coin') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.08); // G5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'levelUp') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.06); // E4
      osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.12); // G4
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.18); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.24); // E5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'delete') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (err) {
    // Web audio blocked by browser security policy until first interaction
  }
};

export default function App() {
  // 1. GLOBAL STATES (PERSISTED TO LOCALSTORAGE)
  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = localStorage.getItem('hc_sellers');
    return saved ? JSON.parse(saved) : INITIAL_SELLERS;
  });
  
  const [records, setRecords] = useState<DailyRecord[]>(() => {
    const saved = localStorage.getItem('hc_records');
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [goals, setGoals] = useState<MonthlyGoal[]>(() => {
    const saved = localStorage.getItem('hc_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem('hc_missions');
    return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  const [missionProgress, setMissionProgress] = useState<MissionProgress[]>(() => {
    const saved = localStorage.getItem('hc_mission_progress');
    return saved ? JSON.parse(saved) : INITIAL_MISSION_PROGRESS;
  });

  // UI States
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [activeTab, setActiveTab] = useState<string>('track'); // 'track' | 'vs' | 'missions' | 'management' | 'admin'
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Admin password states
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('hc_admin_password') || 'admin123';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('hc_admin_auth') === 'true';
  });
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Sync state to local storage when state changes
  useEffect(() => {
    localStorage.setItem('hc_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('hc_sellers', JSON.stringify(sellers));
  }, [sellers]);

  useEffect(() => {
    localStorage.setItem('hc_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('hc_missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('hc_mission_progress', JSON.stringify(missionProgress));
  }, [missionProgress]);

  // 2. STATE HANDLERS
  const handleAddSeller = (newSeller: Omit<Seller, 'id'>) => {
    const sellerId = `seller-${Date.now()}`;
    const seller: Seller = {
      ...newSeller,
      id: sellerId,
    };
    setSellers((prev) => [...prev, seller]);

    // Initialize progress at 0 for all active missions for the new seller
    setMissionProgress((prev) => {
      const activeMissions = missions.filter(m => m.active);
      const newProgress = activeMissions.map((m) => ({
        missionId: m.id,
        sellerId,
        progressCount: 0,
      }));
      return [...prev, ...newProgress];
    });

    // Create a monthly goal of S/ 100,000 for this seller
    setGoals((prev) => {
      const exists = prev.some((g) => g.sellerId === sellerId && g.month === selectedMonth);
      if (exists) return prev;
      return [...prev, { sellerId, month: selectedMonth, goalAmount: 100000 }];
    });

    playSound('levelUp', isMuted);
  };

  const handleUpdateSeller = (id: string, updatedSeller: Omit<Seller, 'id'>) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedSeller } : s))
    );
    playSound('coin', isMuted);
  };

  const handleDeleteSeller = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar a este vendedor? Sus registros históricos se mantendrán pero ya no aparecerá en el circuito.')) {
      setSellers((prev) => prev.filter((s) => s.id !== id));
      playSound('delete', isMuted);
    }
  };

  const handleAddRecord = (newRec: Omit<DailyRecord, 'id'>) => {
    setRecords((prev) => {
      const existingIndex = prev.findIndex((r) => r.date === newRec.date && r.sellerId === newRec.sellerId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          salesWithTax: newRec.salesWithTax,
          salesWithoutTax: newRec.salesWithoutTax,
          productsSold: newRec.productsSold,
          clientsServed: newRec.clientsServed,
          cleanlinessPassed: newRec.cleanlinessPassed,
          punctualityPassed: newRec.punctualityPassed,
        };
        return updated;
      } else {
        const record: DailyRecord = {
          ...newRec,
          id: `rec-${Date.now()}`,
        };
        return [record, ...prev];
      }
    });
    playSound('coin', isMuted);
  };

  const handleToggleRecordStatus = (dateStr: string, sellerId: string, storeId: string, type: 'cleanliness' | 'punctuality') => {
    setRecords((prev) => {
      const existingIndex = prev.findIndex((r) => r.date === dateStr && r.sellerId === sellerId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const record = { ...updated[existingIndex] };
        if (type === 'cleanliness') {
          record.cleanlinessPassed = !record.cleanlinessPassed;
        } else {
          record.punctualityPassed = !record.punctualityPassed;
        }
        updated[existingIndex] = record;
        return updated;
      } else {
        const record: DailyRecord = {
          id: `rec-${Date.now()}`,
          date: dateStr,
          sellerId,
          storeId,
          salesWithTax: 0,
          salesWithoutTax: 0,
          productsSold: 0,
          clientsServed: 0,
          cleanlinessPassed: type === 'cleanliness',
          punctualityPassed: type === 'punctuality',
        };
        return [record, ...prev];
      }
    });
    playSound('click', isMuted);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este reporte diario? Los autos retrocederán.')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      playSound('delete', isMuted);
    }
  };

  const handleUpdateGoal = (sellerId: string, month: string, goalAmount: number) => {
    setGoals((prev) => {
      // Check if goal for seller + month already exists
      const exists = prev.some((g) => g.sellerId === sellerId && g.month === month);
      if (exists) {
        return prev.map((g) => 
          g.sellerId === sellerId && g.month === month ? { ...g, goalAmount } : g
        );
      } else {
        return [...prev, { sellerId, month, goalAmount }];
      }
    });
    playSound('levelUp', isMuted);
  };

  const handleAddMission = (newMission: Omit<Mission, 'id'>) => {
    const missionId = `mission-${Date.now()}`;
    const mission: Mission = {
      ...newMission,
      id: missionId,
    };
    setMissions((prev) => [...prev, mission]);

    // Initialize progress at 0 for all sellers
    const newProgresses = sellers.map((seller) => ({
      missionId,
      sellerId: seller.id,
      progressCount: 0,
    }));
    setMissionProgress((prev) => [...prev, ...newProgresses]);
    playSound('levelUp', isMuted);
  };

  const handleUpdateMissionProgress = (missionId: string, sellerId: string, count: number) => {
    setMissionProgress((prev) => {
      const exists = prev.some((p) => p.missionId === missionId && p.sellerId === sellerId);
      if (exists) {
        return prev.map((p) => 
          p.missionId === missionId && p.sellerId === sellerId 
            ? { ...p, progressCount: count } 
            : p
        );
      } else {
        return [...prev, { missionId, sellerId, progressCount: count }];
      }
    });
    playSound('coin', isMuted);
  };

  const handleToggleMissionActive = (missionId: string) => {
    setMissions((prev) => 
      prev.map((m) => m.id === missionId ? { ...m, active: !m.active } : m)
    );
    playSound('click', isMuted);
  };

  const handleSaveAdminPassword = (newPassword: string) => {
    setAdminPassword(newPassword);
    localStorage.setItem('hc_admin_password', newPassword);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'admin' && !isAdminAuthenticated) {
      setShowPasswordModal(true);
      setPasswordInput('');
      setPasswordError('');
      playSound('click', isMuted);
    } else {
      setActiveTab(tabId);
      playSound('click', isMuted);
    }
  };

  // 3. COMPUTED ARENA STATISTICS (HEADER STATS)
  const monthRecords = records.filter((rec) => rec.date.startsWith(selectedMonth));
  const totalSalesWithTax = monthRecords.reduce((sum, rec) => sum + rec.salesWithTax, 0);
  const totalSalesWithoutTax = monthRecords.reduce((sum, rec) => sum + rec.salesWithoutTax, 0);

  // Compute best seller
  const sellerSales = sellers.map((s) => {
    const sales = monthRecords
      .filter((r) => r.sellerId === s.id)
      .reduce((sum, r) => sum + r.salesWithTax, 0);
    return { name: s.name, avatar: s.carImage, sales };
  });
  const bestSeller = [...sellerSales].sort((a, b) => b.sales - a.sales)[0];

  // Compute dominating store
  const t102Sales = monthRecords.filter((r) => r.storeId === '102').reduce((sum, r) => sum + r.salesWithTax, 0);
  const t218Sales = monthRecords.filter((r) => r.storeId === '218').reduce((sum, r) => sum + r.salesWithTax, 0);
  const winningStoreName = t102Sales > t218Sales ? 'Tienda 102' : t102Sales < t218Sales ? 'Tienda 218' : 'Empate';

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e6edf3] flex flex-col selection:bg-purple-600 selection:text-white">
      {/* GLOWING AMBIENCE TOP DECOR */}
      <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* HEADER SECTION */}
      <header className="bg-[#161b22]/85 border-b border-white/10 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d2ff] via-[#9d50bb] to-[#00ff87] flex items-center justify-center shadow-lg relative overflow-hidden group">
              <span className="text-xl font-bold font-mono text-slate-950 group-hover:scale-110 transition-transform">H</span>
              <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#9d50bb] to-[#ffd700] flex items-center gap-2">
                HOUSE CERAMIC <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-[#00d2ff] font-mono">COMMAND</span>
              </h1>
              <p className="text-[11px] text-[#8b949e] font-mono tracking-widest uppercase">ZONA TIENDA 102 / 218 • SISTEMA ONLINE</p>
            </div>
          </div>

          {/* Global config bar */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Month Filter */}
            <div className="flex items-center gap-1.5 bg-[#161b22] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">MES:</span>
              <select 
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  playSound('click', isMuted);
                }}
                className="bg-transparent border-none text-[#e6edf3] focus:outline-none font-bold"
              >
                <option value="2026-07" className="bg-[#161b22]">Julio 2026</option>
                <option value="2026-06" className="bg-[#161b22]">Junio 2026</option>
                <option value="2026-08" className="bg-[#161b22]">Agosto 2026</option>
              </select>
            </div>

            {/* Mute toggle */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-[#161b22] border border-white/10 hover:border-white/20 text-[#8b949e] hover:text-[#e6edf3] rounded-lg transition-colors"
              title={isMuted ? "Activar efectos de sonido" : "Silenciar efectos de sonido"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00ff87] animate-pulse" />}
            </button>
          </div>

        </div>
      </header>

      {/* HERO / STATS GRID (The Arena HUD) */}
      <section className="bg-[#0b0e14] border-b border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stat 1: Month Sales con IGV */}
          <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden group">
            <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest">VENTAS ACUMULADAS (CON IGV)</span>
            <div className="text-lg md:text-2xl font-mono font-bold text-[#00ff87] mt-2 filter drop-shadow">
              S/ {totalSalesWithTax.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#8b949e] mt-1">Sueldo Base asegurado</div>
            <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-12 h-12 text-[#00ff87]" />
            </div>
          </div>

          {/* Stat 2: Month Sales sin IGV */}
          <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden group">
            <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest">VENTAS NETAS (SIN IGV)</span>
            <div className="text-lg md:text-2xl font-mono font-bold text-[#e6edf3] mt-2">
              S/ {totalSalesWithoutTax.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#8b949e] mt-1">Impuesto deducido del 18%</div>
            <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layers className="w-12 h-12 text-slate-300" />
            </div>
          </div>

          {/* Stat 3: Best Seller */}
          <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden group">
            <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest">PILOTO LÍDER DE LA ARENA</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg md:text-2xl">{bestSeller && bestSeller.sales > 0 ? bestSeller.avatar : '🏎️'}</span>
              <div className="text-sm md:text-base font-bold text-[#ffd700] truncate max-w-[150px]">
                {bestSeller && bestSeller.sales > 0 ? bestSeller.name : 'Nadie aún'}
              </div>
            </div>
            <div className="text-[10px] text-[#8b949e] mt-1">
              {bestSeller && bestSeller.sales > 0 ? `S/ ${bestSeller.sales.toLocaleString()} con IGV` : 'Registra datos'}
            </div>
            <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Award className="w-12 h-12 text-[#ffd700]" />
            </div>
          </div>

          {/* Stat 4: Dominated Store */}
          <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden group">
            <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest">TIENDA DOMINADORA (VS)</span>
            <div className="text-lg md:text-xl font-bold text-[#00d2ff] mt-2 flex items-center gap-1.5">
              <span className="animate-pulse text-red-500 font-mono text-xs">⚡</span>
              {winningStoreName}
            </div>
            <div className="text-[10px] text-[#8b949e] mt-1">
              {t102Sales === t218Sales ? 'Marcadores igualados' : `T102: S/ ${(t102Sales/1000).toFixed(0)}k | T218: S/ ${(t218Sales/1000).toFixed(0)}k`}
            </div>
            <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Flame className="w-12 h-12 text-[#00d2ff]" />
            </div>
          </div>

        </div>
      </section>

      {/* GAMING TAB PANEL */}
      <section className="bg-slate-900 border-b border-slate-800/80 sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex gap-2 py-3.5">
          {/* Tab 1: Pista de Carreras */}
          <button 
            onClick={() => handleTabChange('track')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase font-bold rounded-lg border transition-all whitespace-nowrap ${
              activeTab === 'track' 
                ? 'bg-slate-950 text-white border-orange-500/80 shadow-[0_0_10px_rgba(249,115,22,0.15)] font-black' 
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>🏎️</span> Pista de Carreras
          </button>

          {/* Tab 2: Duelo de Tiendas */}
          <button 
            onClick={() => handleTabChange('vs')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase font-bold rounded-lg border transition-all whitespace-nowrap ${
              activeTab === 'vs' 
                ? 'bg-slate-950 text-white border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.15)] font-black' 
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>⚔️</span> Arena vs Tiendas
          </button>

          {/* Tab 3: Misiones secundarias */}
          <button 
            onClick={() => handleTabChange('missions')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase font-bold rounded-lg border transition-all whitespace-nowrap ${
              activeTab === 'missions' 
                ? 'bg-slate-950 text-white border-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.15)] font-black' 
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>🎯</span> Misiones Secundarias
          </button>

          {/* Tab 4: Control de gestión */}
          <button 
            onClick={() => handleTabChange('management')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase font-bold rounded-lg border transition-all whitespace-nowrap ${
              activeTab === 'management' 
                ? 'bg-slate-950 text-white border-emerald-500/80 shadow-[0_0_10px_rgba(34,197,94,0.15)] font-black' 
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>📋</span> Bitácora de Gestión
          </button>

          {/* Divider */}
          <div className="w-[1px] bg-slate-800 mx-2 self-stretch"></div>

          {/* Tab 5: Admin Panel */}
          <button 
            onClick={() => handleTabChange('admin')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase font-bold rounded-lg border transition-all whitespace-nowrap ${
              activeTab === 'admin' 
                ? 'bg-slate-950 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-black' 
                : 'bg-emerald-950/20 text-emerald-400 border-emerald-950/50 hover:bg-emerald-950/30'
            }`}
          >
            <span>👑</span> Guild de Admin (Solo yo)
          </button>
        </div>
      </section>

      {/* MAIN CONTAINER SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {/* VIEW ROUTING (TABS) */}
        {activeTab === 'track' && (
          <LeaderboardTrack 
            sellers={sellers}
            records={records}
            goals={goals}
            selectedMonth={selectedMonth}
          />
        )}

        {activeTab === 'vs' && (
          <StoreComparison 
            records={records}
            selectedMonth={selectedMonth}
          />
        )}

        {activeTab === 'missions' && (
          <SideMissions 
            sellers={sellers}
            missions={missions}
            missionProgress={missionProgress}
          />
        )}

        {activeTab === 'management' && (
          <ManagementLog 
            records={records}
            sellers={sellers}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel 
            sellers={sellers}
            records={records}
            goals={goals}
            missions={missions}
            missionProgress={missionProgress}
            selectedMonth={selectedMonth}
            onAddRecord={handleAddRecord}
            onUpdateGoal={handleUpdateGoal}
            onAddMission={handleAddMission}
            onUpdateMissionProgress={handleUpdateMissionProgress}
            onToggleMissionActive={handleToggleMissionActive}
            onAddSeller={handleAddSeller}
            onUpdateSeller={handleUpdateSeller}
            onDeleteSeller={handleDeleteSeller}
            onToggleRecordStatus={handleToggleRecordStatus}
            adminPassword={adminPassword}
            onUpdateAdminPassword={handleSaveAdminPassword}
            onLogoutAdmin={() => {
              setIsAdminAuthenticated(false);
              sessionStorage.removeItem('hc_admin_auth');
              setActiveTab('track');
              playSound('click', isMuted);
            }}
          />
        )}

      </main>

      {/* FOOTER AREA */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 mt-12 text-slate-500 text-xs text-center font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div>HOUSE CERAMIC © 2026. Todos los derechos reservados.</div>
          <div className="text-[10px] text-slate-600">
            Diseñado como un entorno de videojuegos interactivo. Persistencia local mediante LocalStorage del navegador.
          </div>
        </div>
      </footer>

      {/* PASSWORD PROTECTION MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)] rounded-2xl max-w-md w-full p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
            
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                playSound('click', isMuted);
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors text-xs font-mono cursor-pointer"
            >
              ✕ CERRAR
            </button>

            <div className="text-center mt-3">
              <div className="w-12 h-12 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
                👑
              </div>
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-widest flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-red-500" /> ACCESO CONTROLADO
              </h3>
              <p className="text-slate-400 text-xs mt-2 font-mono">
                Solo el administrador de House Ceramic puede acceder a esta área para editar pilotos y configurar misiones.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (passwordInput === adminPassword) {
                setIsAdminAuthenticated(true);
                sessionStorage.setItem('hc_admin_auth', 'true');
                setShowPasswordModal(false);
                setActiveTab('admin');
                playSound('levelUp', isMuted);
              } else {
                setPasswordError('Código de acceso incorrecto. Inténtalo de nuevo.');
                playSound('delete', isMuted);
              }
            }} className="mt-6 space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">CONTRASEÑA DEL GREMIO</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono">🔑</span>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg pl-9 pr-3 py-2.5 text-center text-white placeholder-slate-700 focus:outline-none font-mono tracking-widest transition-colors"
                    autoFocus
                  />
                </div>
                {passwordError && (
                  <p className="text-[10px] text-red-400 font-mono mt-2 text-center animate-pulse">
                    ⚠ {passwordError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    playSound('click', isMuted);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-slate-950 font-black text-xs font-mono py-2.5 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.25)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  VALIDAR
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-900 text-center">
              <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
                CONTRASEÑA POR DEFECTO: admin123
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
