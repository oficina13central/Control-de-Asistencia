import { supabase } from './supabaseClient';

export interface ScheduleSegment {
  id: string;
  employee_id: string;
  day_of_week: number; // 0-6
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export const scheduleService = {
  async getByEmployee(employeeId: string): Promise<ScheduleSegment[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('employee_id', employeeId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching schedules:', error);
      return [];
    }
    return data || [];
  },

  async update(employeeId: string, segments: Omit<ScheduleSegment, 'id' | 'employee_id'>[]): Promise<boolean> {
    // Delete existing segments
    const { error: deleteError } = await supabase
      .from('schedules')
      .delete()
      .eq('employee_id', employeeId);

    if (deleteError) {
      console.error('Error deleting old schedules:', deleteError);
      return false;
    }

    if (segments.length === 0) return true;

    // Insert new segments
    const { error: insertError } = await supabase
      .from('schedules')
      .insert(segments.map(s => ({ ...s, employee_id: employeeId })));

    if (insertError) {
      console.error('Error inserting new schedules:', insertError);
      return false;
    }

    return true;
  }
};
