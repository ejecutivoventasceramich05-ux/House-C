import React, { useState, useEffect } from 'react';
import { Seller, DailyRecord, MonthlyGoal, Mission, MissionProgress } from '../types';
import { RaceCar, getCarStyle } from './RaceCar';
import { 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  Settings, 
  Plus, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Check, 
  X, 
  Compass, 
  Target,
  Edit2,
  Trash2,
  Search
} from 'lucide-react';

interface AdminPanelProps {
  sellers: Seller[];
  records: DailyRecord[];
  goals: MonthlyGoal[];
  missions: Mission[];
  missionProgress: MissionProgress[];
  selectedMonth: string; // 'YYYY-MM'
  onAddRecord: (record: Omit<DailyRecord, 'id'>) => void;
  onUpdateRecord?: (id: string, record: Omit<DailyRecord, 'id'>) => void;
  onDeleteRecord?: (id: string) => void;
  onUpdateGoal: (sellerId: string, month: string, goalAmount: number) => void;
  onAddMission: (mission: Omit<Mission, 'id'>) => void;
  onUpdateMissionProgress: (missionId: string, sellerId: string, count: number) => void;
  onToggleMissionActive: (missionId: string) => void;
  onAddSeller: (seller: Omit<Seller, 'id'>) => void;
  onUpdateSeller: (id: string, seller: Omit<Seller, 'id'>) => void;
  onDeleteSeller: (id: string) => void;
  onToggleRecordStatus?: (date: string, sellerId: string, storeId: string, type: 'cleanliness' | 'punctuality') => void;
  adminPassword?: string;
  onUpdateAdminPassword?: (password: string) => void;
  onLogoutAdmin?: () => void;
}

export default function AdminPanel({
  sellers,
  records,
  goals,
  missions,
  missionProgress,
  selectedMonth,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onUpdateGoal,
  onAddMission,
  onUpdateMissionProgress,
  onToggleMissionActive,
  onAddSeller,
  onUpdateSeller,
  onDeleteSeller,
  onToggleRecordStatus,
  adminPassword,
  onUpdateAdminPassword,
  onLogoutAdmin,
}: AdminPanelProps) {
  // 1. STATE FOR DAILY SALES FORM
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>(sellers[0]?.id || '');
  const [salesWithTax, setSalesWithTax] = useState<string>('');
  const [salesWithoutTax, setSalesWithoutTax] = useState<string>('');
  const [productsSold, setProductsSold] = useState<string>('');
  const [clientsServed, setClientsServed] = useState<string>('');
  const [cleanlinessPassed, setCleanlinessPassed] = useState<boolean>(true);
  const [punctualityPassed, setPunctualityPassed] = useState<boolean>(true);

  // Editing state for daily record
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Filter state for logs history
  const [historyFilterDate, setHistoryFilterDate] = useState<string>('');
  const [historyFilterSellerId, setHistoryFilterSellerId] = useState<string>('');

  // Quick log date defaults to today
  const [logDate, setLogDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Status message
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Security and password change states
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [newPasswordValue, setNewPasswordValue] = useState<string>('');
  const [passwordFeedback, setPasswordFeedback] = useState<string>('');

  // Sync selected seller if list changes or selected ID becomes invalid
  useEffect(() => {
    if (sellers.length > 0 && (!selectedSellerId || !sellers.some(s => s.id === selectedSellerId))) {
      setSelectedSellerId(sellers[0].id);
    } else if (sellers.length === 0) {
      setSelectedSellerId('');
    }
  }, [sellers, selectedSellerId]);

  // Auto calculate Sin IGV (dividing by 1.18) when Con IGV changes
  const handleSalesWithTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSalesWithTax(val);
    if (!isNaN(Number(val)) && val !== '') {
      const computed = (Number(val) / 1.18).toFixed(2);
      setSalesWithoutTax(computed);
    } else {
      setSalesWithoutTax('');
    }
  };

  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSellerId || !salesWithTax || !salesWithoutTax || !productsSold || !clientsServed) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    // Identify store of seller
    const sellerObj = sellers.find((s) => s.id === selectedSellerId);
    const storeId = sellerObj ? sellerObj.storeId : '102';

    if (editingRecordId && onUpdateRecord) {
      onUpdateRecord(editingRecordId, {
        date,
        sellerId: selectedSellerId,
        storeId,
        salesWithTax: Number(salesWithTax),
        salesWithoutTax: Number(salesWithoutTax),
        productsSold: Number(productsSold),
        clientsServed: Number(clientsServed),
        cleanlinessPassed,
        punctualityPassed,
      });
      setEditingRecordId(null);
    } else {
      onAddRecord({
        date,
        sellerId: selectedSellerId,
        storeId,
        salesWithTax: Number(salesWithTax),
        salesWithoutTax: Number(salesWithoutTax),
        productsSold: Number(productsSold),
        clientsServed: Number(clientsServed),
        cleanlinessPassed,
        punctualityPassed,
      });
    }

    // Clear inputs and flash success
    setSalesWithTax('');
    setSalesWithoutTax('');
    setProductsSold('');
    setClientsServed('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  // 2. STATE FOR GOAL EDITOR
  const [editingGoals, setEditingGoals] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialEditingGoals: Record<string, string> = {};
    sellers.forEach((seller) => {
      const goalObj = goals.find((g) => g.sellerId === seller.id && g.month === selectedMonth);
      initialEditingGoals[seller.id] = goalObj ? goalObj.goalAmount.toString() : '100000';
    });
    setEditingGoals(initialEditingGoals);
  }, [goals, sellers, selectedMonth]);

  const handleGoalChange = (sellerId: string, val: string) => {
    setEditingGoals({
      ...editingGoals,
      [sellerId]: val,
    });
  };

  const handleSaveGoal = (sellerId: string) => {
    const amount = Number(editingGoals[sellerId]);
    if (isNaN(amount) || amount <= 0) {
      alert('Ingresa una meta válida');
      return;
    }
    onUpdateGoal(sellerId, selectedMonth, amount);
    alert(`Meta mensual de ${sellers.find(s => s.id === sellerId)?.name} actualizada.`);
  };

  // 3. STATE FOR MISSION CREATION
  const [missionTitle, setMissionTitle] = useState<string>('');
  const [missionDesc, setMissionDesc] = useState<string>('');
  const [missionStart, setMissionStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [missionEnd, setMissionEnd] = useState<string>(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [missionBono, setMissionBono] = useState<string>('50');
  const [missionProduct, setMissionProduct] = useState<string>('');
  const [missionQty, setMissionQty] = useState<string>('10');

  const handleMissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionTitle || !missionDesc || !missionProduct || !missionQty || !missionBono) {
      alert('Por favor completa todos los campos de la misión.');
      return;
    }

    onAddMission({
      title: missionTitle,
      description: missionDesc,
      startDate: missionStart,
      endDate: missionEnd,
      rewardBono: Number(missionBono),
      targetProduct: missionProduct,
      targetQuantity: Number(missionQty),
      active: true,
    });

    setMissionTitle('');
    setMissionDesc('');
    setMissionProduct('');
    setMissionQty('10');
    setMissionBono('50');
    alert('¡Nueva misión creada y activada!');
  };

  // 4. STATE AND HANDLERS FOR SELLER MANAGEMENT
  const [newSellerName, setNewSellerName] = useState<string>('');
  const [newSellerStore, setNewSellerStore] = useState<string>('102');
  const [newSellerColor, setNewSellerColor] = useState<string>('from-orange-500 to-red-600');
  const [newSellerCar, setNewSellerCar] = useState<string>('formula');

  // State for editing an existing seller
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [editSellerName, setEditSellerName] = useState<string>('');
  const [editSellerStore, setEditSellerStore] = useState<string>('102');
  const [editSellerColor, setEditSellerColor] = useState<string>('from-orange-500 to-red-600');
  const [editSellerCar, setEditSellerCar] = useState<string>('formula');

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerName.trim()) {
      alert('Ingresa el nombre del vendedor.');
      return;
    }
    onAddSeller({
      name: newSellerName.trim(),
      storeId: newSellerStore,
      avatarColor: newSellerColor,
      carImage: newSellerCar,
    });
    setNewSellerName('');
    alert(`¡Vendedor "${newSellerName}" agregado exitosamente!`);
  };

  const startEditingSeller = (seller: Seller) => {
    setEditingSellerId(seller.id);
    setEditSellerName(seller.name);
    setEditSellerStore(seller.storeId);
    setEditSellerColor(seller.avatarColor);
    setEditSellerCar(seller.carImage);
  };

  const handleSaveSellerEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSellerId) return;
    if (!editSellerName.trim()) {
      alert('Ingresa el nombre del vendedor.');
      return;
    }
    onUpdateSeller(editingSellerId, {
      name: editSellerName.trim(),
      storeId: editSellerStore,
      avatarColor: editSellerColor,
      carImage: editSellerCar,
    });
    setEditingSellerId(null);
    alert('Vendedor actualizado correctamente.');
  };

  const cancelEditingSeller = () => {
    setEditingSellerId(null);
  };

  return (
    <div className="space-y-8" id="panel-admin-section">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <span className="text-emerald-400 animate-pulse font-mono">👑</span> PANEL DE ADMINISTRACIÓN (SOLO PARA MÍ)
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Centro de comando del director para registrar las ventas del día, ajustar las metas mensuales y activar misiones.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          {isChangingPassword ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPasswordValue.trim()) {
                  setPasswordFeedback('No puede estar vacía');
                  return;
                }
                if (onUpdateAdminPassword) {
                  onUpdateAdminPassword(newPasswordValue.trim());
                  setPasswordFeedback('¡Actualizada!');
                  setTimeout(() => {
                    setIsChangingPassword(false);
                    setPasswordFeedback('');
                    setNewPasswordValue('');
                  }, 1500);
                }
              }}
              className="flex items-center gap-2 bg-slate-900 border border-slate-850 rounded-lg p-1.5"
            >
              <input 
                type="text" 
                placeholder="Nueva clave..." 
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                className="bg-transparent border-none text-white text-xs font-mono font-bold focus:outline-none w-32 px-2"
                maxLength={20}
                autoFocus
              />
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black font-mono text-[10px] px-2.5 py-1 rounded cursor-pointer"
              >
                GUARDAR
              </button>
              <button 
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordFeedback('');
                  setNewPasswordValue('');
                }}
                className="text-slate-400 hover:text-white font-mono text-[10px] px-1.5 cursor-pointer"
              >
                ✕
              </button>
              {passwordFeedback && (
                <span className="text-[10px] text-emerald-400 font-mono px-2 animate-pulse">{passwordFeedback}</span>
              )}
            </form>
          ) : (
            <div className="flex items-center gap-2">
              {onUpdateAdminPassword && (
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-300 transition-colors cursor-pointer"
                  title="Cambiar contraseña de administración"
                >
                  🔑 Cambiar Clave
                </button>
              )}
              {onLogoutAdmin && (
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase rounded-lg border border-red-950 bg-red-950/20 hover:bg-red-950/40 text-red-400 transition-all cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.1)]"
                  title="Bloquear panel de administración y salir"
                >
                  🔒 Cerrar Sesión
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs font-mono bg-emerald-950/20 border border-emerald-900/40 rounded-lg py-2 px-3 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
                <span>DM ADMIN</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK LOG CHECK-IN COMPONENT */}
      {onToggleRecordStatus && (
        <div className="glass-panel p-6 relative overflow-hidden border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          {/* Retro accent glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4 mb-6">
            <div>
              <h3 className="text-sm font-bold font-mono uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse text-emerald-400" /> REGISTRO RÁPIDO DE ASISTENCIA Y LIMPIEZA
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Selecciona la fecha y haz clic sobre los botones para registrar la puntualidad o limpieza de cada piloto de forma instantánea.
              </p>
            </div>
            
            {/* Date selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-500 font-bold">FECHA:</span>
              <input 
                type="date" 
                value={logDate} 
                onChange={(e) => setLogDate(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-none font-bold" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TIENDA 102 */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-4">
                <span className="text-xs font-bold font-mono text-[#00d2ff]">SUCURSAL TIENDA 102</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {sellers.filter(s => s.storeId === '102').length} Pilotos
                </span>
              </div>
              
              <div className="space-y-3">
                {sellers.filter(s => s.storeId === '102').length === 0 ? (
                  <p className="text-xs text-slate-600 font-mono py-2 text-center">No hay vendedores registrados en esta tienda.</p>
                ) : (
                  sellers.filter(s => s.storeId === '102').map((seller) => {
                    const record = records.find(r => r.date === logDate && r.sellerId === seller.id);
                    const isPunctual = record?.punctualityPassed ?? false;
                    const isClean = record?.cleanlinessPassed ?? false;
                    const hasRecord = !!record;

                    return (
                      <div key={seller.id} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-850/60 hover:border-slate-800 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{seller.carImage}</span>
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">{seller.name}</div>
                            {hasRecord && (record.salesWithTax > 0) && (
                              <div className="text-[9px] text-emerald-400 font-mono mt-0.5">Ventas: S/ {record.salesWithTax.toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Punctuality toggle */}
                          <button
                            type="button"
                            onClick={() => onToggleRecordStatus(logDate, seller.id, '102', 'punctuality')}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 border cursor-pointer ${
                              isPunctual 
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-black' 
                                : 'bg-slate-900 text-slate-500 border-slate-800/80 hover:border-slate-700 hover:text-slate-400'
                            }`}
                            title="Alternar asistencia puntual"
                          >
                            <span>⏰</span> {isPunctual ? 'Temprano' : 'Tardanza'}
                          </button>

                          {/* Cleanliness toggle */}
                          <button
                            type="button"
                            onClick={() => onToggleRecordStatus(logDate, seller.id, '102', 'cleanliness')}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 border cursor-pointer ${
                              isClean 
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-black' 
                                : 'bg-slate-900 text-slate-500 border-slate-800/80 hover:border-slate-700 hover:text-slate-400'
                            }`}
                            title="Alternar limpieza realizada"
                          >
                            <span>🧼</span> {isClean ? 'Limpio' : 'Faltó'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* TIENDA 218 */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-4">
                <span className="text-xs font-bold font-mono text-pink-400">SUCURSAL TIENDA 218</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {sellers.filter(s => s.storeId === '218').length} Pilotos
                </span>
              </div>
              
              <div className="space-y-3">
                {sellers.filter(s => s.storeId === '218').length === 0 ? (
                  <p className="text-xs text-slate-600 font-mono py-2 text-center">No hay vendedores registrados en esta tienda.</p>
                ) : (
                  sellers.filter(s => s.storeId === '218').map((seller) => {
                    const record = records.find(r => r.date === logDate && r.sellerId === seller.id);
                    const isPunctual = record?.punctualityPassed ?? false;
                    const isClean = record?.cleanlinessPassed ?? false;
                    const hasRecord = !!record;

                    return (
                      <div key={seller.id} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-850/60 hover:border-slate-800 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{seller.carImage}</span>
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">{seller.name}</div>
                            {hasRecord && (record.salesWithTax > 0) && (
                              <div className="text-[9px] text-emerald-400 font-mono mt-0.5">Ventas: S/ {record.salesWithTax.toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Punctuality toggle */}
                          <button
                            type="button"
                            onClick={() => onToggleRecordStatus(logDate, seller.id, '218', 'punctuality')}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 border cursor-pointer ${
                              isPunctual 
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-black' 
                                : 'bg-slate-900 text-slate-500 border-slate-800/80 hover:border-slate-700 hover:text-slate-400'
                            }`}
                            title="Alternar asistencia puntual"
                          >
                            <span>⏰</span> {isPunctual ? 'Temprano' : 'Tardanza'}
                          </button>

                          {/* Cleanliness toggle */}
                          <button
                            type="button"
                            onClick={() => onToggleRecordStatus(logDate, seller.id, '218', 'cleanliness')}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 border cursor-pointer ${
                              isClean 
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-black' 
                                : 'bg-slate-900 text-slate-500 border-slate-800/80 hover:border-slate-700 hover:text-slate-400'
                            }`}
                            title="Alternar limpieza realizada"
                          >
                            <span>🧼</span> {isClean ? 'Limpio' : 'Faltó'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SUB-PANEL 1: ENTER DAILY SALES RECORD */}
        <div id="registrar-ventas-form" className={`glass-panel p-6 relative transition-all duration-300 ${
          editingRecordId 
            ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-950/5' 
            : 'border-emerald-500/15'
        }`}>
          {editingRecordId && (
            <div className="mb-4 bg-amber-500/20 border border-amber-500/40 text-amber-200 font-mono text-[11px] p-3 rounded-lg flex items-center justify-between animate-pulse">
              <span>
                ⚠️ <strong>MODO EDICIÓN ACTIVO:</strong> Modificando reporte del piloto <strong>{sellers.find(s => s.id === selectedSellerId)?.name}</strong> para la fecha <strong>{date.split('-').reverse().join('/')}</strong>.
              </span>
              <button 
                type="button"
                onClick={() => {
                  setEditingRecordId(null);
                  setDate(new Date().toISOString().split('T')[0]);
                  setSalesWithTax('');
                  setSalesWithoutTax('');
                  setProductsSold('');
                  setClientsServed('');
                  setCleanlinessPassed(true);
                  setPunctualityPassed(true);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[9px] font-bold font-mono cursor-pointer transition-colors"
              >
                ✕ CANCELAR
              </button>
            </div>
          )}

          <h3 className="text-sm font-bold font-mono uppercase text-slate-300 tracking-wider flex items-center gap-2 mb-6">
            <Settings className={`w-4 h-4 ${editingRecordId ? 'text-amber-500 animate-spin' : 'text-emerald-400'}`} /> 
            {editingRecordId ? 'EDITAR REPORTE DIARIO DE VENTAS' : 'REGISTRAR VENTAS DIARIAS'}
          </h3>

          <form onSubmit={handleSalesSubmit} className="space-y-4">
            {/* Date and Seller select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Fecha del reporte</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" 
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Vendedor (Piloto)</label>
                <select 
                  value={selectedSellerId}
                  onChange={(e) => setSelectedSellerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                >
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.carImage} {s.name} - Tienda {s.storeId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sales values (Con and Sin IGV) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">
                  Ventas del Día (CON IGV)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">S/</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    value={salesWithTax}
                    onChange={handleSalesWithTaxChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" 
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">
                  Ventas del Día (SIN IGV)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">S/</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    value={salesWithoutTax}
                    onChange={(e) => setSalesWithoutTax(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" 
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  * Autocalculado al ingresar el total con IGV (18%)
                </span>
              </div>
            </div>

            {/* Products and Customers count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" /> Cantidad Productos Vendidos
                </label>
                <input 
                  type="number" 
                  placeholder="Ej. 15"
                  value={productsSold}
                  onChange={(e) => setProductsSold(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" 
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Clientes Atendidos
                </label>
                <input 
                  type="number" 
                  placeholder="Ej. 8"
                  value={clientsServed}
                  onChange={(e) => setClientsServed(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono" 
                  required
                />
              </div>
            </div>

            {/* Toggle Cleanliness & Punctuality */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">¿Limpieza de Tienda?</span>
                  <span className="text-[9px] text-slate-500 font-mono">Cumple con la bitácora</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCleanlinessPassed(!cleanlinessPassed)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    cleanlinessPassed ? 'bg-emerald-500' : 'bg-red-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 flex items-center justify-center text-[10px] ${
                    cleanlinessPassed ? 'translate-x-5' : 'translate-x-0'
                  }`}>
                    {cleanlinessPassed ? 'Sí' : 'No'}
                  </div>
                </button>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">¿Puntualidad del Equipo?</span>
                  <span className="text-[9px] text-slate-500 font-mono">Llegó a tiempo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPunctualityPassed(!punctualityPassed)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    punctualityPassed ? 'bg-emerald-500' : 'bg-red-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 flex items-center justify-center text-[10px] ${
                    punctualityPassed ? 'translate-x-5' : 'translate-x-0'
                  }`}>
                    {punctualityPassed ? 'Sí' : 'No'}
                  </div>
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className={`w-full mt-4 font-bold font-display tracking-tight text-sm py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                editingRecordId 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
              }`}
            >
              {editingRecordId ? (
                <>
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> GUARDAR CAMBIOS
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-slate-950 stroke-[3]" /> REGISTRAR REPORTE DIARIO
                </>
              )}
            </button>

            {submitSuccess && (
              <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-400 font-mono text-xs p-3 rounded-lg text-center animate-bounce mt-2">
                {editingRecordId 
                  ? '¡CAMBIOS GUARDADOS CON ÉXITO! El tablero de control se ha actualizado. 🔄🏁'
                  : '¡REPORTE GUARDADO CON ÉXITO! Los autos han avanzado en la pista. 🏎️💨'
                }
              </div>
            )}
          </form>
        </div>

        {/* SUB-PANEL 2: EDIT MONTHLY GOALS */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold font-mono uppercase text-slate-300 tracking-wider flex items-center gap-2 mb-4">
              <Edit2 className="w-4 h-4 text-yellow-500" /> EDITAR METAS MENSUALES ({selectedMonth})
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Establece las metas mensuales para cada vendedor. Los cambios se actualizan de inmediato en la pista de carreras.
            </p>

            <div className="space-y-3">
              {sellers.map((seller) => {
                const currentGoalAmount = goals.find((g) => g.sellerId === seller.id && g.month === selectedMonth)?.goalAmount || 100000;
                return (
                  <div key={seller.id} className="bg-slate-900/50 border border-slate-850 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{seller.carImage}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{seller.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">Actual: S/ {currentGoalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-500">S/</span>
                        <input 
                          type="number"
                          value={editingGoals[seller.id] || ''}
                          onChange={(e) => handleGoalChange(seller.id, e.target.value)}
                          className="w-32 bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-100 rounded pl-7 pr-2 py-1.5 font-mono"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveGoal(seller.id)}
                        className="bg-emerald-950/60 border border-emerald-800 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold font-mono text-[11px] px-2.5 py-1.5 rounded transition-all duration-150"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE MISSION PROGRESS EDITOR */}
          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold font-mono uppercase text-slate-300 tracking-wider flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-purple-400" /> CONTROL DE PROGRESO DE MISIONES
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Incrementa o disminuye el recuento de unidades vendidas de cada vendedor en las misiones secundarias activas.
            </p>

            {missions.filter(m => m.active).length === 0 ? (
              <p className="text-slate-500 text-xs font-mono text-center py-4 bg-slate-900/30 rounded-lg">No hay misiones activas para gestionar.</p>
            ) : (
              <div className="space-y-4">
                {missions.filter(m => m.active).map((mission) => (
                  <div key={mission.id} className="border-b border-slate-900 pb-4 last:border-b-0 last:pb-0">
                    <span className="text-[10px] font-mono text-purple-400 font-bold block mb-2">{mission.title}</span>
                    <div className="grid grid-cols-2 gap-2">
                      {sellers.map((seller) => {
                        const currentProg = missionProgress.find(p => p.missionId === mission.id && p.sellerId === seller.id)?.progressCount || 0;
                        return (
                          <div key={seller.id} className="bg-slate-900/30 border border-slate-850 px-2.5 py-1.5 rounded flex items-center justify-between text-xs">
                            <span className="text-slate-300 truncate">{seller.name}</span>
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => onUpdateMissionProgress(mission.id, seller.id, Math.max(0, currentProg - 1))}
                                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 font-bold flex items-center justify-center font-mono text-slate-400"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-white w-6 text-center">{currentProg}</span>
                              <button 
                                onClick={() => onUpdateMissionProgress(mission.id, seller.id, currentProg + 1)}
                                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 font-bold flex items-center justify-center font-mono text-slate-400"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* CREATE NEW SECONDARY MISSION FORM */}
      <div className="glass-panel p-6">
        <h3 className="text-sm font-bold font-mono uppercase text-slate-300 tracking-wider flex items-center gap-2 mb-4">
          <Compass className="w-4 h-4 text-purple-400" /> DISEÑAR NUEVA MISIÓN SECUNDARIA
        </h3>
        <p className="text-slate-500 text-xs mb-6">
          Genera un nuevo desafío o campaña temporal para el equipo de ventas. Los ganadores serán recompensados con el bono indicado.
        </p>

        <form onSubmit={handleMissionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Título de la Misión</label>
              <input 
                type="text" 
                placeholder="Ej. Misión: Vender 10 unidades de Porcelanato X"
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500" 
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Descripción o Instrucciones</label>
              <textarea 
                placeholder="Detalla las reglas de la misión y el incentivo para los vendedores"
                rows={3}
                value={missionDesc}
                onChange={(e) => setMissionDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500" 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Fecha de Inicio</label>
                <input 
                  type="date" 
                  value={missionStart}
                  onChange={(e) => setMissionStart(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Fecha de Fin</label>
                <input 
                  type="date" 
                  value={missionEnd}
                  onChange={(e) => setMissionEnd(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Producto Objetivo</label>
              <input 
                type="text" 
                placeholder="Ej. Porcelanato Carrara Pulido"
                value={missionProduct}
                onChange={(e) => setMissionProduct(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500" 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Cantidad Requerida</label>
                <input 
                  type="number" 
                  placeholder="Ej. 10"
                  value={missionQty}
                  onChange={(e) => setMissionQty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono" 
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Recompensa (Bono S/)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-500 font-bold">S/</span>
                  <input 
                    type="number" 
                    placeholder="50"
                    value={missionBono}
                    onChange={(e) => setMissionBono(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono" 
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold font-display tracking-tight text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <Plus className="w-4 h-4 text-white" /> ACTIVAR NUEVA MISIÓN
            </button>
          </div>
        </form>

        {/* LIST OF HISTORICAL/ACTIVE MISSIONS TOGGLE STATUS */}
        {missions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-900">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-400 mb-3">LISTADO COMPLETO DE MISIONES CREADAS</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {missions.map((m) => (
                <div key={m.id} className="bg-slate-900/40 border border-slate-850 p-3 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{m.title}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">Bono: S/ {m.rewardBono} | Producto: {m.targetProduct}</span>
                  </div>
                  <button
                    onClick={() => onToggleMissionActive(m.id)}
                    className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${
                      m.active 
                        ? 'bg-purple-950/80 text-purple-400 border border-purple-800 hover:bg-purple-900' 
                        : 'bg-slate-950 text-slate-500 border border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    {m.active ? 'Activa 🟢' : 'Inactiva 🔴'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN DE GESTIÓN DE VENDEDORES (PILOTOS) */}
      <div className="glass-panel p-6">
        <h3 className="text-sm font-bold font-mono uppercase text-slate-300 tracking-wider flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-cyan-400" /> TABLERO DE GESTIÓN DE VENDEDORES (PILOTOS)
        </h3>
        <p className="text-slate-500 text-xs mb-6">
          Registra nuevos pilotos en el sistema o modifica la tienda de los actuales para que sus resultados sumen al marcador correcto en tiempo real.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COL 1: CREATE OR EDIT SELLER FORM */}
          <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-xl p-4">
            {editingSellerId ? (
              <form onSubmit={handleSaveSellerEdit} className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase">EDITAR VENDEDOR</h4>
                  <button 
                    type="button" 
                    onClick={cancelEditingSeller}
                    className="text-[10px] text-slate-400 hover:text-slate-200 uppercase font-mono"
                  >
                    Cancelar
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nombre</label>
                  <input 
                    type="text" 
                    value={editSellerName}
                    onChange={(e) => setEditSellerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Tienda Asignada</label>
                  <select 
                    value={editSellerStore}
                    onChange={(e) => setEditSellerStore(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="102">Tienda 102</option>
                    <option value="218">Tienda 218</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Color de Vehículo (Degradado)</label>
                  <select 
                    value={editSellerColor}
                    onChange={(e) => setEditSellerColor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="from-orange-500 to-red-600">Naranja / Rojo</option>
                    <option value="from-emerald-400 to-green-600">Esmeralda / Verde</option>
                    <option value="from-blue-400 to-indigo-600">Celeste / Indigo</option>
                    <option value="from-pink-400 to-purple-600">Rosa / Púrpura</option>
                    <option value="from-yellow-400 to-amber-600">Amarillo / Ámbar</option>
                    <option value="from-cyan-400 to-blue-500">Cian / Azul</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Modelo de Vehículo (Retro Racer)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'formula', label: 'Formula' },
                      { key: 'gt', label: 'Turbo GT' },
                      { key: 'cyber', label: 'Cyber' },
                      { key: 'kart', label: 'Kart' }
                    ].map((model) => (
                      <button
                        key={model.key}
                        type="button"
                        onClick={() => setEditSellerCar(model.key)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          editSellerCar === model.key 
                            ? 'bg-slate-800 border-cyan-400 scale-105 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <RaceCar 
                          styleName={model.key} 
                          avatarColor={editSellerColor} 
                          className="w-10 h-5" 
                        />
                        <span className="text-[9px] font-mono font-medium text-slate-400">{model.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold font-mono text-xs rounded transition-all uppercase"
                >
                  Guardar Cambios
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateSeller} className="space-y-4">
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase pb-2 border-b border-slate-800">REGISTRAR NUEVO PILOTO</h4>
                
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Carlos"
                    value={newSellerName}
                    onChange={(e) => setNewSellerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Tienda Asignada</label>
                  <select 
                    value={newSellerStore}
                    onChange={(e) => setNewSellerStore(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="102">Tienda 102</option>
                    <option value="218">Tienda 218</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Color de Vehículo (Degradado)</label>
                  <select 
                    value={newSellerColor}
                    onChange={(e) => setNewSellerColor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="from-orange-500 to-red-600">Naranja / Rojo</option>
                    <option value="from-emerald-400 to-green-600">Esmeralda / Verde</option>
                    <option value="from-blue-400 to-indigo-600">Celeste / Indigo</option>
                    <option value="from-pink-400 to-purple-600">Rosa / Púrpura</option>
                    <option value="from-yellow-400 to-amber-600">Amarillo / Ámbar</option>
                    <option value="from-cyan-400 to-blue-500">Cian / Azul</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Modelo de Vehículo (Retro Racer)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'formula', label: 'Formula' },
                      { key: 'gt', label: 'Turbo GT' },
                      { key: 'cyber', label: 'Cyber' },
                      { key: 'kart', label: 'Kart' }
                    ].map((model) => (
                      <button
                        key={model.key}
                        type="button"
                        onClick={() => setNewSellerCar(model.key)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          newSellerCar === model.key 
                            ? 'bg-slate-800 border-emerald-500 scale-105 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <RaceCar 
                          styleName={model.key} 
                          avatarColor={newSellerColor} 
                          className="w-10 h-5" 
                        />
                        <span className="text-[9px] font-mono font-medium text-slate-400">{model.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs rounded transition-all uppercase"
                >
                  Agregar Piloto
                </button>
              </form>
            )}
          </div>

          {/* COL 2 & 3: LIST OF CURRENT SELLERS */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold font-mono text-slate-300 uppercase pb-2 border-b border-slate-800 flex justify-between items-center">
              <span>PILOTOS EN COMPETENCIA ({sellers.length})</span>
              <span className="text-[10px] text-slate-500 lowercase">Clic para editar o remover</span>
            </h4>

            {sellers.length === 0 ? (
              <p className="text-center py-10 bg-slate-900/10 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-mono">
                No hay vendedores registrados en el sistema. Agrega uno usando el formulario.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sellers.map((seller) => (
                  <div 
                    key={seller.id}
                    className="bg-[#161b22]/40 border border-white/5 hover:border-white/15 p-3 rounded-xl flex items-center justify-between transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1">
                        <RaceCar 
                          styleName={getCarStyle(seller.carImage)} 
                          avatarColor={seller.avatarColor} 
                          className="w-10 h-5" 
                        />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-white block">{seller.name}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-slate-400">
                          Sede: Tienda {seller.storeId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditingSeller(seller)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                        title="Editar piloto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSeller(seller.id)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition-colors"
                        title="Eliminar piloto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* HISTORIAL DÍA A DÍA - CONTROL DE REPORTES */}
        <div className="glass-panel p-6 mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
            <div>
              <h3 className="text-sm font-bold font-mono uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" /> HISTORIAL DÍA A DÍA - CONTROL DE REPORTES
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Aquí puedes ver de forma cronológica la información diaria que se sube al sistema. Si hay algún error, utiliza los botones de editar o borrar.
              </p>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={historyFilterSellerId}
                  onChange={(e) => setHistoryFilterSellerId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">Todos los pilotos</option>
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={historyFilterDate}
                  onChange={(e) => setHistoryFilterDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                />
              </div>

              {(historyFilterSellerId || historyFilterDate) && (
                <button
                  onClick={() => {
                    setHistoryFilterSellerId('');
                    setHistoryFilterDate('');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors cursor-pointer"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>

          {(() => {
            const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
            const filteredRecords = sortedRecords.filter((rec) => {
              const matchesSeller = !historyFilterSellerId || rec.sellerId === historyFilterSellerId;
              const matchesDate = !historyFilterDate || rec.date === historyFilterDate;
              return matchesSeller && matchesDate;
            });

            if (filteredRecords.length === 0) {
              return (
                <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 font-mono">
                    No se encontraron reportes que coincidan con los filtros aplicados.
                  </p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">Fecha</th>
                      <th className="py-3 px-4 font-bold">Piloto</th>
                      <th className="py-3 px-4 font-bold">Sede</th>
                      <th className="py-3 px-4 font-bold text-right">Ventas Con IGV</th>
                      <th className="py-3 px-4 font-bold text-right">Ventas Sin IGV</th>
                      <th className="py-3 px-4 font-bold text-center">Productos</th>
                      <th className="py-3 px-4 font-bold text-center">Clientes</th>
                      <th className="py-3 px-4 font-bold text-center">Limpieza</th>
                      <th className="py-3 px-4 font-bold text-center">Puntualidad</th>
                      <th className="py-3 px-4 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs">
                    {filteredRecords.map((rec) => {
                      const s = sellers.find((seller) => seller.id === rec.sellerId);
                      const sellerName = s ? s.name : 'Piloto Desconocido';
                      const carColor = s ? s.avatarColor : 'from-slate-500 to-slate-600';
                      const carStyle = s ? getCarStyle(s.carImage) : 'formula';

                      // Formatear fecha a DD/MM/YYYY
                      const formattedDate = rec.date.split('-').reverse().join('/');

                      return (
                        <tr 
                          key={rec.id} 
                          className={`hover:bg-slate-900/20 transition-all ${
                            editingRecordId === rec.id ? 'bg-amber-950/20 border-l-2 border-l-amber-500' : ''
                          }`}
                        >
                          {/* Fecha */}
                          <td className="py-3 px-4 font-mono text-slate-300 font-bold">
                            {formattedDate}
                          </td>
                          {/* Piloto */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-6 rounded bg-slate-950 border border-slate-800 flex items-center justify-center p-0.5">
                                <RaceCar 
                                  styleName={carStyle} 
                                  avatarColor={carColor} 
                                  className="w-7 h-3.5" 
                                />
                              </div>
                              <span className="font-bold text-white">{sellerName}</span>
                            </div>
                          </td>
                          {/* Sede */}
                          <td className="py-3 px-4 font-mono text-slate-400">
                            Tienda {rec.storeId}
                          </td>
                          {/* Ventas Con IGV */}
                          <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                            S/ {rec.salesWithTax.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          {/* Ventas Sin IGV */}
                          <td className="py-3 px-4 text-right font-mono text-slate-400 font-medium">
                            S/ {rec.salesWithoutTax.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          {/* Productos */}
                          <td className="py-3 px-4 text-center font-mono text-slate-300">
                            {rec.productsSold}
                          </td>
                          {/* Clientes */}
                          <td className="py-3 px-4 text-center font-mono text-slate-300">
                            {rec.clientsServed}
                          </td>
                          {/* Limpieza */}
                          <td className="py-3 px-4 text-center">
                            <span 
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                rec.cleanlinessPassed 
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
                                  : 'bg-red-950/60 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {rec.cleanlinessPassed ? 'Sí 🧼' : 'Faltó ❌'}
                            </span>
                          </td>
                          {/* Puntualidad */}
                          <td className="py-3 px-4 text-center">
                            <span 
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                rec.punctualityPassed 
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
                                  : 'bg-red-950/60 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {rec.punctualityPassed ? 'Temprano ⏰' : 'Tarde ❌'}
                            </span>
                          </td>
                          {/* Acciones */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingRecordId(rec.id);
                                  setDate(rec.date);
                                  setSelectedSellerId(rec.sellerId);
                                  setSalesWithTax(rec.salesWithTax.toString());
                                  setSalesWithoutTax(rec.salesWithoutTax.toString());
                                  setProductsSold(rec.productsSold.toString());
                                  setClientsServed(rec.clientsServed.toString());
                                  setCleanlinessPassed(rec.cleanlinessPassed);
                                  setPunctualityPassed(rec.punctualityPassed);
                                  document.getElementById('registrar-ventas-form')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
                                title="Editar reporte"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {onDeleteRecord && (
                                <button
                                  onClick={() => onDeleteRecord(rec.id)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar reporte"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
