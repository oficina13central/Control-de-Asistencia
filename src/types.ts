export interface Profile {
  id: string;
  full_name: string;
  role: string;
  dni?: string;
  sector_id?: string;
  email?: string;
  qr_token?: string;
  photo_url?: string;
  roles?: {
    name: string;
    permissions: string[];
  };
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'en_horario' | 'tarde' | 'sin_presentismo' | 'ausente' | 'descanso' | 'vacaciones' | 'manual' | 'presente';
  minutes_late: number;
}

export interface Sector {
  id: string;
  name: string;
}
