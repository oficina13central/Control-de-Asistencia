import { supabase } from './supabaseClient';
import { Sector } from '../types';

export const sectorService = {
  async getAll(): Promise<Sector[]> {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching sectors:', error);
      return [];
    }
    return data || [];
  }
};
