import { supabase } from './supabaseClient';

export interface AuditLog {
  id: string;
  employee_id?: string;
  employee_name?: string;
  action: string;
  details?: string;
  old_value?: string;
  new_value?: string;
  reason?: string;
  created_at: string;
  performer_id?: string;
  performer_name?: string;
  manager_name?: string;
}

export const auditService = {
  async logAction(action: Omit<AuditLog, 'id' | 'created_at'>) {
    const { error } = await supabase
      .from('audit_logs')
      .insert([action]);
    
    if (error) {
      console.error('Error logging action:', error);
    }
  },

  async getByEmployee(employeeId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employee audit logs:', error);
      return [];
    }
    return data || [];
  },

  async getAll(): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all audit logs:', error);
      return [];
    }
    return data || [];
  }
};
