import { supabase } from './supabaseClient';

export interface AttendanceRules {
  en_horario: number;
  llego_tarde: number;
}

export const settingsService = {
  async getRules(): Promise<AttendanceRules> {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'attendance_rules')
      .single();

    if (error || !data) {
      return { en_horario: 5, llego_tarde: 15 };
    }
    return data.value as AttendanceRules;
  },

  async updateRules(rules: AttendanceRules): Promise<boolean> {
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'attendance_rules', value: rules });

    if (error) {
      console.error('Error updating rules:', error);
      return false;
    }
    return true;
  },

  async addSector(name: string): Promise<boolean> {
    const { error } = await supabase
      .from('sectors')
      .insert([{ name }]);

    if (error) {
      console.error('Error adding sector:', error);
      return false;
    }
    return true;
  },

  async deleteSector(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sectors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sector:', error);
      return false;
    }
    return true;
  }
};
