import { Appointment } from '@modules/appointment/domain/entities/appointment.entity';

export type PaginatedAppointments = Promise<{
  items: Appointment[];
  total: number;
}>;
