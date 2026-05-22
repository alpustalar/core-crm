import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';

export interface OccupiedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatusType;
}
