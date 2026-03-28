import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Loader2, 
  Clock, 
  User, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { auditService, AuditLog } from '../services/auditService';

const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await auditService.getAll();
      setLogs(data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.performer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const actions = Array.from(new Set(logs.map(l => l.action)));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExport = () => {
    const headers = ['Fecha', 'Acción', 'Detalles', 'Realizado por'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        `"${formatDate(log.created_at)}"`,
        `"${log.action}"`,
        `"${log.details.replace(/"/g, '""')}"`,
        `"${log.performer_name}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_sistema_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center">
            Auditoría del <span className="ml-2 text-indigo-600">Sistema</span>
          </h2>
          <p className="text-slate-500 font-medium">Monitoreo completo de acciones administrativas y eventos críticos.</p>
        </div>

        <button 
          onClick={handleExport}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition-all shadow-lg shadow-slate-800/20 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="pl-12 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold appearance-none cursor-pointer"
              >
                <option value="all">Todas las Acciones</option>
                {actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {filteredLogs.length} Eventos registrados
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cargando registros...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
              No se encontraron registros de auditoría.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Fecha y Hora</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Acción</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Detalles</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2 text-slate-500 font-bold text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(log.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-600 font-medium max-w-md truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:max-w-none transition-all">
                        {log.details}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{log.performer_name}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditView;
