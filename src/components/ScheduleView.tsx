import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  Search, 
  ChevronRight, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Profile } from '../types';
import { scheduleService, ScheduleSegment } from '../services/scheduleService';

interface ScheduleViewProps {
  employees: Profile[];
  currentUser: Profile;
}

const DAYS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

const ScheduleView: React.FC<ScheduleViewProps> = ({ employees, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  const [segments, setSegments] = useState<Partial<ScheduleSegment>[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.dni?.includes(searchTerm)
  );

  useEffect(() => {
    if (selectedEmployee) {
      loadSchedule(selectedEmployee.id);
    }
  }, [selectedEmployee]);

  const loadSchedule = async (id: string) => {
    setLoading(true);
    try {
      const data = await scheduleService.getByEmployee(id);
      setSegments(data);
    } catch (err) {
      console.error('Error loading schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSegment = () => {
    setSegments([...segments, {
      day_of_week: 1,
      start_time: '08:00',
      end_time: '17:00',
      is_active: true
    }]);
  };

  const handleRemoveSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const handleUpdateSegment = (index: number, field: keyof ScheduleSegment, value: any) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSegments(newSegments);
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;
    setSaving(true);
    setStatus(null);
    try {
      const success = await scheduleService.update(selectedEmployee.id, segments as any);
      if (success) {
        setStatus({ type: 'success', message: 'Horario guardado correctamente' });
      } else {
        setStatus({ type: 'error', message: 'Error al guardar el horario' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center">
          Gestión de <span className="ml-2 text-indigo-600">Horarios</span>
        </h2>
        <p className="text-slate-500 font-medium">Defina los turnos y jornadas laborales de su personal.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee List */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
          <div className="p-6 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredEmployees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  selectedEmployee?.id === emp.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                    selectedEmployee?.id === emp.id ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {emp.full_name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-sm">{emp.full_name}</span>
                    <span className={`text-[10px] font-bold uppercase ${
                      selectedEmployee?.id === emp.id ? 'text-indigo-100' : 'text-slate-400'
                    }`}>
                      DNI: {emp.dni || '--'}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${
                  selectedEmployee?.id === emp.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Editor */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
          {selectedEmployee ? (
            <>
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      Horario de {selectedEmployee.full_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Configure los segmentos de trabajo</p>
                  </div>
                </div>
                <button
                  onClick={handleAddSegment}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Agregar Turno</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cargando horario...</p>
                  </div>
                ) : segments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-300">
                    <Clock className="w-16 h-16 opacity-20" />
                    <p className="font-black text-sm uppercase tracking-widest">No hay horarios definidos</p>
                    <button 
                      onClick={handleAddSegment}
                      className="text-indigo-600 font-black text-xs uppercase hover:underline"
                    >
                      Empezar a configurar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {segments.map((segment, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col md:flex-row items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 group animate-in slide-in-from-bottom-2 duration-300"
                      >
                        <div className="w-full md:w-48">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Día</label>
                          <select
                            value={segment.day_of_week}
                            onChange={(e) => handleUpdateSegment(index, 'day_of_week', parseInt(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer"
                          >
                            {DAYS.map((day, i) => (
                              <option key={i} value={i}>{day}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Entrada</label>
                            <input
                              type="time"
                              value={segment.start_time}
                              onChange={(e) => handleUpdateSegment(index, 'start_time', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Salida</label>
                            <input
                              type="time"
                              value={segment.end_time}
                              onChange={(e) => handleUpdateSegment(index, 'end_time', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                            />
                          </div>
                        </div>
                        <div className="flex items-end h-full pt-6">
                          <button
                            onClick={() => handleRemoveSegment(index)}
                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-6 text-slate-300 p-12 text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center">
                <Calendar className="w-12 h-12 opacity-20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Seleccione un empleado</h3>
                <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">
                  Elija un miembro del personal de la lista de la izquierda para ver y editar su horario de trabajo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
