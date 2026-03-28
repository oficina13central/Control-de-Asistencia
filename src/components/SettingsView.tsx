import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Profile, Sector } from '../types';
import { settingsService, AttendanceRules } from '../services/settingsService';
import { sectorService } from '../services/sectorService';

interface SettingsViewProps {
  currentUser: Profile;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  const [rules, setRules] = useState<AttendanceRules>({ en_horario: 5, llego_tarde: 15 });
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [newSectorName, setNewSectorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingRules, setSavingRules] = useState(false);
  const [addingSector, setAddingSector] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesData, sectorsData] = await Promise.all([
        settingsService.getRules(),
        sectorService.getAll()
      ]);
      setRules(rulesData);
      setSectors(sectorsData);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRules = async () => {
    setSavingRules(true);
    setStatus(null);
    try {
      const success = await settingsService.updateRules(rules);
      if (success) {
        setStatus({ type: 'success', message: 'Reglas actualizadas correctamente' });
      } else {
        setStatus({ type: 'error', message: 'Error al actualizar las reglas' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Error de conexión' });
    } finally {
      setSavingRules(false);
    }
  };

  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectorName.trim()) return;
    setAddingSector(true);
    try {
      const success = await settingsService.addSector(newSectorName);
      if (success) {
        setNewSectorName('');
        const updatedSectors = await sectorService.getAll();
        setSectors(updatedSectors);
      }
    } catch (err) {
      console.error('Error adding sector:', err);
    } finally {
      setAddingSector(false);
    }
  };

  const handleDeleteSector = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este sector?')) return;
    try {
      const success = await settingsService.deleteSector(id);
      if (success) {
        setSectors(sectors.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting sector:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center">
          Configuración del <span className="ml-2 text-indigo-600">Sistema</span>
        </h2>
        <p className="text-slate-500 font-medium">Ajuste los parámetros globales y la estructura organizacional.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Rules */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center space-x-4 bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Reglas de Asistencia</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tolerancias y estados</p>
            </div>
          </div>

          <div className="p-8 space-y-8 flex-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tolerancia "En Horario" (minutos)</label>
                <input
                  type="number"
                  value={rules.en_horario}
                  onChange={e => setRules({...rules, en_horario: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
                <p className="text-[10px] text-slate-400 font-medium px-1 italic">Tiempo de gracia después de la hora de entrada para marcar como "En Horario".</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Límite "Tarde" (minutos)</label>
                <input
                  type="number"
                  value={rules.llego_tarde}
                  onChange={e => setRules({...rules, llego_tarde: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
                <p className="text-[10px] text-slate-400 font-medium px-1 italic">Después de este tiempo, la llegada se considera "Tarde" pero aún se permite el ingreso.</p>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {status && (
                <div className={`flex items-center space-x-2 text-xs font-bold ${
                  status.type === 'success' ? 'text-green-600' : 'text-red-600'
                } animate-in fade-in slide-in-from-left-2`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{status.message}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSaveRules}
              disabled={savingRules}
              className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {savingRules ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Reglas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sectors Management */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center space-x-4 bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Sectores / Departamentos</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Estructura organizacional</p>
            </div>
          </div>

          <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[400px]">
            <form onSubmit={handleAddSector} className="flex gap-4">
              <input
                type="text"
                placeholder="Nombre del nuevo sector..."
                value={newSectorName}
                onChange={e => setNewSectorName(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={addingSector || !newSectorName.trim()}
                className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                {addingSector ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </button>
            </form>

            <div className="space-y-2">
              {sectors.map(sector => (
                <div 
                  key={sector.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-indigo-100 transition-all"
                >
                  <span className="font-bold text-slate-700">{sector.name}</span>
                  <button
                    onClick={() => handleDeleteSector(sector.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
