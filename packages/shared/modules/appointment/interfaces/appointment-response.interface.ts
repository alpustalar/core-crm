export interface ProviderCalendarOccupiedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

export interface ProviderCalendarProviderException {
  startTime: Date;
  endTime: Date;
  type: 'OFF' | 'ON';
  reason: string | null;
}

export interface ProviderCalendarWorkingHours {
  startMinute: number;
  endMinute: number;
  breakStartMinute: number | null;
  breakEndMinute: number | null;
}

export interface ProviderCalendarDayResponse {
  date: string; // 'YYYY-MM-DD'
  isWorkingDay: boolean;
  reason: string | null;
  workingHours: ProviderCalendarWorkingHours | null;
  providerExceptions: ProviderCalendarProviderException[];
  occupiedSlots: ProviderCalendarOccupiedSlot[];
}

export interface ProviderCalendarResponse {
  days: ProviderCalendarDayResponse[];
}
