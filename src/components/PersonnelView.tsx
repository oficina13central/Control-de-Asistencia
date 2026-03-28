import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Shield, 
  QrCode, 
  Edit2, 
  Trash2, 
  Filter,
  UserCheck,
  UserX,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { Profile, Sector } from '../types';
import { personnelService } from '../services/personnelService';
import { sectorService } from '../services/sectorService';

interface PersonnelViewProps {
  employees: Profile[];
  setEmployees: React.Dispatch<React.SetStateAction<Profile[]>>;
  currentUser: Profile;
}

const PersonnelView: React.FC<PersonnelViewProps> = ({ employees, setEmployees, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({
    full_name: '',
    email: '',
    dni: '',
    role: 'empleado',
    sector_id: ''
  });

  React.useEffect(() => {
    sectorService.getAll().then(setSectors);
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = selectedSector === 'all' || emp.sector_id === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [employees, searchTerm, selectedSector]);

  const handleOpenModal = (emp: Profile | null = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        full_name: emp.full_name,
        email: emp.email,
        dni: emp.dni,
        role: emp.role,
        sector_id: emp.sector_id
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        full_name: '',
        email: '',
        dni: '',
        role: 'empleado',
        sector_id: sectors[0]?.id || ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEmployee) {
        const updated = await personnelService.update(editingEmployee.id, formData);
        if (updated) {
          setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
        }
      } else {
        const created = await personnelService.create(formData as Omit<Profile, 'id'>);
        if (created) {
          setEmployees(prev => [...prev, created]);
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving employee:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este empleado?')) return;
    try {
      const success = await personnelService.delete(id);
      if (success) {
        setEmployees(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center">
            Gestión de <span className="ml-2 text-indigo-600">Personal</span>
          </h2>
          <p className="text-slate-500 font-medium">Administre los perfiles y accesos de sus empleados.</p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Empleado</span>
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="pl-12 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold appearance-none cursor-pointer"
              >
                <option value="all">Todos los Sectores</option>
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {filteredEmployees.length} Empleados encontrados
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Empleado</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Sector</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">DNI</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Rol</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-400">No se encontraron empleados.</td></tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                        {emp.full_name.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-black text-slate-700">{emp.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {emp.email || 'Sin email'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {sectors.find(s => s.id === emp.sector_id)?.name || 'Sin Sector'}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-600">{emp.dni || '--'}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <Shield className={`w-3 h-3 ${emp.role === 'superusuario' ? 'text-purple-500' : 'text-indigo-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{emp.role}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(emp)}
                        className="p-2 hover:bg-white hover:text-indigo-600 rounded-xl transition-all text-slate-400 hover:shadow-sm border border-transparent hover:border-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="p-2 hover:bg-white hover:text-red-600 rounded-xl transition-all text-slate-400 hover:shadow-sm border border-transparent hover:border-slate-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Complete los datos del perfil</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">DNI / ID</label>
                  <input
                    type="text"
                    required
                    value={formData.dni}
                    onChange={e => setFormData({...formData, dni: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    placeholder="Ej: 35.123.456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  placeholder="juan.perez@empresa.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Sector</label>
                  <select
                    required
                    value={formData.sector_id}
                    onChange={e => setFormData({...formData, sector_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                  >
                    <option value="">Seleccionar Sector</option>
                    {sectors.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Rol</label>
                  <select
                    required
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                  >
                    <option value="empleado">Empleado</option>
                    <option value="encargado">Encargado</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingEmployee ? 'Guardar Cambios' : 'Crear Empleado'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelView;
