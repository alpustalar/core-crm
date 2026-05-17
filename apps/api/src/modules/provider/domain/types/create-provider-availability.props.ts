export interface CreateProviderAvailabilityProps {
  id?: string;
  providerId: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  breakStartMinute?: number | null;
  breakEndMinute?: number | null;
}
