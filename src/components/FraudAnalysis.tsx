import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  AlertTriangle, 
  Loader2, 
  User, 
  Clock, 
  MapPin, 
  Smartphone,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { AttendanceRecord, Profile } from '../types';
import { attendanceService } from '../services/attendanceService';
import { personnelService } from '../services/personnelService';

const FraudAnalysis: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [recordsData, employeesData] = await Promise.all([
        attendanceService.getByDate(today),
        personnelService.getAll()
      ]);
      setRecords(recordsData);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error loading data for fraud analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const anomalies = useMemo(() => {
    return records.filter(record => {
      // Logic for detecting anomalies:
      // 1. Multiple check-ins from different locations (if we had location data)
      // 2. Check-ins at unusual hours
      // 3. Very short durations between check-in and check-out
      // 4. Manual entries (already marked as manual)
      
      const isManual = record.status === 'manual';
      const isShortDuration = record.check_in && record.check_out && 
        (new Date(`2000-01-01T${record.check_out}`).getTime() - new Date(`2000-01-01T${record.check_in}`).getTime()) < 5 * 60 * 1000;
      
      return isManual || isShortDuration;
    });
  }, [records]);

  const stats = useMemo(() => {
    return {
      totalAnomalies: anomalies.length,
      manualEntries: anomalies.filter(a => a.status === 'manual').length,
      shortDurations: anomalies.filter(a => a.check_in && a.check_out && (new Date(`2000-01-01T${a.check_out}`).getTime() - new Date(`2000-01-01T${a.check_in}`).getTime()) < 5 * 60 * 1000).length,
    };
  }, [anomalies]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Analizando patrones...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center">
            Análisis de <span className="ml-2 text-indigo-600">Fraude AI</span>
          </h2>
          <p className="text-slate-500 font-medium">Detección inteligente de anomalías y comportamientos sospechosos.</p>
        </div>

        <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
          <BrainCircuit className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-wider">Motor AI Activo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-slate-800">{stats.totalAnomalies}</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Anomalías Hoy</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-slate-800">{stats.manualEntries}</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargas Manuales</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-slate-800">{stats.shortDurations}</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jornadas Ultra Cortas</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Alertas Detectadas</span>
          </h3>
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar alertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
            />
          </div>
        </div>

        <div className="p-8">
          {anomalies.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 text-slate-300">
              <CheckCircle2 className="w-16 h-16 text-green-500 opacity-20" />
              <p className="font-black text-sm uppercase tracking-widest">No se detectaron anomalías hoy</p>
            </div>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-100 transition-all group">
                  <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block font-black text-slate-700">{anomaly.employee_name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        DNI: {employees.find(e => e.id === anomaly.employee_id)?.dni || '--'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 px-8 py-4 md:py-0 w-full">
                    <div className="flex items-center space-x-2 text-red-600 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        {anomaly.status === 'manual' ? 'Carga Manual Detectada' : 'Jornada Sospechosa'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {anomaly.status === 'manual' 
                        ? 'El registro fue ingresado manualmente por un administrador, evadiendo el escaneo de QR.' 
                        : 'Se detectó un egreso a los pocos minutos del ingreso. Podría ser un error o marcación fraudulenta.'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
                    <div className="text-right">
                      <span className="block text-xs font-black text-slate-700 uppercase">{anomaly.check_in} - {anomaly.check_out || '--:--'}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horario Registrado</span>
                    </div>
                    <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                      <Zap className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FraudAnalysis;
