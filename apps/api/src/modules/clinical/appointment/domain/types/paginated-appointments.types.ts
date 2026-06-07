import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';

export type PaginatedAppointments = Promise<{
  items: Appointment[];
  total: number;
}>;
