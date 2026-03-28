import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  ChevronRight, 
  Loader2, 
  User, 
  Calendar, 
  Activity,
  ArrowRight,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { Profile } from '../types';
import { auditService, AuditLog } from '../services/auditService';

interface PersonnelAuditProps {
  employees: Profile[];
  currentUser: Profile;
}

const PersonnelAudit: React.FC<PersonnelAuditProps> = ({ employees, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.dni?.includes(searchTerm)
  );

  useEffect(() => {
    if (selectedEmployee) {
      loadLogs(selectedEmployee.id);
    }
  }, [selectedEmployee]);

  const loadLogs = async (id: string) => {
    setLoading(true);
    try {
      const data = await auditService.getByEmployee(id);
      setLogs(data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center">
          Auditoría de <span className="ml-2 text-indigo-600">Personal</span>
        </h2>
        <p className="text-slate-500 font-medium">Historial detallado de acciones y cambios por empleado.</p>
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

        {/* Audit Logs */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
          {selectedEmployee ? (
            <>
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      Historial de {selectedEmployee.full_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Registro cronológico de actividades</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cargando historial...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-300">
                    <Activity className="w-16 h-16 opacity-20" />
                    <p className="font-black text-sm uppercase tracking-widest">Sin registros de auditoría</p>
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                    {logs.map((log, index) => (
                      <div key={log.id} className="relative pl-12 group animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center z-10 shadow-sm group-hover:border-indigo-50 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 group-hover:border-indigo-100 transition-all group-hover:shadow-md group-hover:shadow-indigo-500/5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                {log.action}
                              </span>
                              <span className="text-xs text-slate-400 font-bold flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(log.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <User className="w-3 h-3" />
                              <span>Por: {log.performer_name}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            {log.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-6 text-slate-300 p-12 text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center">
                <History className="w-12 h-12 opacity-20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Seleccione un empleado</h3>
                <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">
                  Elija un miembro del personal para consultar su historial completo de auditoría.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonnelAudit;
