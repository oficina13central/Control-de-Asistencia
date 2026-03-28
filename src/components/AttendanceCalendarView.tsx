import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { AttendanceRecord, Profile } from '../types';
import { attendanceService } from '../services/attendanceService';
import { personnelService } from '../services/personnelService';

const AttendanceCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
      
      const [recordsData, employeesData] = await Promise.all([
        attendanceService.getByDateRange(startDate, endDate),
        personnelService.getAll()
      ]);
      setRecords(recordsData);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error loading calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  const getDayStatus = (day: number) => {
    if (!day) return null;
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayRecords = records.filter(r => r.date === dateStr && (selectedEmployeeId === 'all' || r.employee_id === selectedEmployeeId));
    
    if (dayRecords.length === 0) return 'none';
    
    const hasAbsence = dayRecords.some(r => r.status === 'ausente');
    const hasLate = dayRecords.some(r => r.status === 'tarde');
    const allPresent = dayRecords.every(r => r.status === 'en_horario' || r.status === 'presente');
    
    if (hasAbsence) return 'absent';
    if (hasLate) return 'late';
    if (allPresent) return 'present';
    return 'mixed';
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthName = currentDate.toLocaleString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center">
            Calendario de <span className="ml-2 text-indigo-600">Asistencias</span>
          </h2>
          <p className="text-slate-500 font-medium">Visualización mensual del presentismo y puntualidad.</p>
        </div>

        <div className="flex items-center space-x-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-indigo-600">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-sm font-black uppercase tracking-widest text-slate-700 min-w-[150px] text-center">
            {monthName}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-indigo-600">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8 h-fit">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Filtrar por Empleado</h4>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer"
              >
                <option value="all">Todos los Empleados</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Referencias</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-slate-600">Presente / En Horario</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-600">Llegada Tarde</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-slate-600">Ausente</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-slate-200" />
                <span className="text-xs font-bold text-slate-600">Sin Registros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          {loading ? (
            <div className="h-[500px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cargando calendario...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {day}
                </div>
              ))}
              {daysInMonth.map((day, index) => {
                const status = day ? getDayStatus(day) : null;
                return (
                  <div 
                    key={index} 
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group ${
                      !day ? 'bg-transparent' : 'bg-slate-50 hover:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    {day && (
                      <>
                        <span className="text-sm font-black text-slate-700">{day}</span>
                        {status !== 'none' && (
                          <div className={`mt-2 w-2 h-2 rounded-full ${
                            status === 'present' ? 'bg-green-500 shadow-lg shadow-green-500/50' :
                            status === 'late' ? 'bg-amber-500 shadow-lg shadow-amber-500/50' :
                            status === 'absent' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                            'bg-indigo-500'
                          }`} />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendarView;
