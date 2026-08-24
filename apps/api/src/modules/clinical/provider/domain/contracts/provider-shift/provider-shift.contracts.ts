export interface CreateShiftProps {
  id?: string;
  providerId: string;
  date: Date;
  startMinute: number;
  endMinute: number;
  breakStartMinute?: number | null;
  breakEndMinute?: number | null;
}

export interface UpdateHoursAndDateProps {
  date?: Date;
  startMinute?: number;
  endMinute?: number;
  breakStartMinute?: number | null;
  breakEndMinute?: number | null;
}
