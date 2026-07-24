import { z } from 'zod';
import { SearchClinicAppointmentsSchema } from '../../schemas/queries/search-clinic-appointments.schema';

export type SearchClinicAppointments = z.infer<
  typeof SearchClinicAppointmentsSchema
>;
