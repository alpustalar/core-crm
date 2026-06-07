export interface CreateProviderShiftProps {
  providerId: string;
  date: Date;
  startMinute: number;
  endMinute: number;
  breakStartMinute?: number | null;
  breakEndMinute?: number | null;
}
